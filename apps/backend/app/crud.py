"""
CRUD operations module.
Database operations for User, Category, and Transaction models.
"""
from datetime import datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from . import models, schemas
from .auth import get_password_hash


# ============== User CRUD ==============

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get user by email address."""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Create a new user with hashed password.
    
    Args:
        db: Database session.
        user: UserCreate schema with email and password.
    
    Returns:
        Created User model instance.
    """
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        oauth_provider=models.OAuthProvider.LOCAL,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# ============== Category CRUD ==============

def get_categories(
    db: Session,
    user_id: int,
    category_type: Optional[models.TransactionType] = None
) -> List[models.Category]:
    """
    Get all categories for a user, optionally filtered by type.
    
    Args:
        db: Database session.
        user_id: User ID to filter by.
        category_type: Optional type filter (income/expense).
    
    Returns:
        List of Category model instances.
    """
    query = db.query(models.Category).filter(models.Category.user_id == user_id)
    
    if category_type:
        query = query.filter(models.Category.type == category_type)
    
    return query.order_by(models.Category.name).all()


def get_category(db: Session, category_id: int, user_id: int) -> Optional[models.Category]:
    """Get a specific category by ID, ensuring it belongs to the user."""
    return db.query(models.Category).filter(
        models.Category.id == category_id,
        models.Category.user_id == user_id
    ).first()


def create_category(
    db: Session,
    category: schemas.CategoryCreate,
    user_id: int
) -> models.Category:
    """Create a new category for a user."""
    db_category = models.Category(
        name=category.name,
        type=models.TransactionType(category.type.value),
        user_id=user_id,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(
    db: Session,
    category_id: int,
    user_id: int,
    category_update: schemas.CategoryUpdate
) -> Optional[models.Category]:
    """Update a category."""
    db_category = get_category(db, category_id, user_id)
    if not db_category:
        return None
    
    update_data = category_update.model_dump(exclude_unset=True)
    
    if "type" in update_data:
         update_data["type"] = models.TransactionType(update_data["type"].value)

    for key, value in update_data.items():
        setattr(db_category, key, value)
        
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int, user_id: int) -> bool:
    """
    Delete a category by ID.
    
    Returns:
        True if deleted, False if not found.
    """
    category = get_category(db, category_id, user_id)
    if not category:
        return False
    
    db.delete(category)
    db.commit()
    return True


# ============== Transaction CRUD ==============

def get_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    transaction_type: Optional[str] = None,
) -> Tuple[List[models.Transaction], int]:
    """
    Get paginated transactions for a user with optional filters.
    
    Args:
        db: Database session.
        user_id: User ID to filter by.
        skip: Number of records to skip (pagination).
        limit: Maximum records to return.
        category_id: Optional category filter.
        start_date: Optional start date filter.
        end_date: Optional end date filter.
        transaction_type: Optional type filter (income/expense).
    
    Returns:
        Tuple of (list of transactions, total count).
    """
    query = db.query(models.Transaction).filter(models.Transaction.user_id == user_id)
    
    if category_id:
        query = query.filter(models.Transaction.category_id == category_id)
    
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    
    if transaction_type:
        # Filter by category type
        query = query.join(models.Category).filter(
            models.Category.type == models.TransactionType(transaction_type)
        )
    
    total = query.count()
    transactions = query.order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()
    
    return transactions, total


def get_transaction(db: Session, transaction_id: int, user_id: int) -> Optional[models.Transaction]:
    """Get a specific transaction by ID, ensuring it belongs to the user."""
    return db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id,
        models.Transaction.user_id == user_id
    ).first()


def create_transaction(
    db: Session,
    transaction: schemas.TransactionCreate,
    user_id: int
) -> Optional[models.Transaction]:
    """
    Create a new transaction.
    
    Returns:
        Created Transaction or None if category doesn't exist.
    """
    # Verify category exists and belongs to user
    category = get_category(db, transaction.category_id, user_id)
    if not category:
        return None
    
    db_transaction = models.Transaction(
        amount=transaction.amount,
        description=transaction.description,
        date=transaction.date,
        category_id=transaction.category_id,
        user_id=user_id,
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(
    db: Session,
    transaction_id: int,
    user_id: int,
    transaction_update: schemas.TransactionUpdate
) -> Optional[models.Transaction]:
    """
    Update an existing transaction.
    
    Returns:
        Updated Transaction or None if not found.
    """
    db_transaction = get_transaction(db, transaction_id, user_id)
    if not db_transaction:
        return None
    
    update_data = transaction_update.model_dump(exclude_unset=True)
    
    # Verify new category if provided
    if "category_id" in update_data:
        category = get_category(db, update_data["category_id"], user_id)
        if not category:
            return None
    
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int, user_id: int) -> bool:
    """
    Delete a transaction by ID.
    
    Returns:
        True if deleted, False if not found.
    """
    transaction = get_transaction(db, transaction_id, user_id)
    if not transaction:
        return False
    
    db.delete(transaction)
    db.commit()
    return True


# ============== Report CRUD ==============

def get_summary(
    db: Session,
    user_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> schemas.ReportSummary:
    """
    Get overall financial summary for a user.
    
    Returns:
        ReportSummary with income, expense, and balance totals.
    """
    query = db.query(
        models.Transaction.id,
        models.Transaction.amount,
        models.Category.type
    ).join(models.Category).filter(models.Transaction.user_id == user_id)
    
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    
    results = query.all()
    
    total_income = sum(r.amount for r in results if r.type == models.TransactionType.INCOME)
    total_expense = sum(r.amount for r in results if r.type == models.TransactionType.EXPENSE)
    
    return schemas.ReportSummary(
        total_income=total_income,
        total_expense=total_expense,
        balance=total_income - total_expense,
        period_start=start_date,
        period_end=end_date,
    )


def get_by_category(
    db: Session,
    user_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> schemas.ReportByCategory:
    """
    Get spending breakdown by category.
    
    Returns:
        ReportByCategory with income and expense category summaries.
    """
    query = db.query(
        models.Category.id,
        models.Category.name,
        models.Category.type,
        func.sum(models.Transaction.amount).label("total"),
        func.count(models.Transaction.id).label("count")
    ).join(
        models.Transaction, models.Transaction.category_id == models.Category.id
    ).filter(
        models.Transaction.user_id == user_id
    ).group_by(models.Category.id)
    
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    
    results = query.all()
    
    income_categories = []
    expense_categories = []
    total_income = 0
    total_expense = 0
    
    for r in results:
        if r.type == models.TransactionType.INCOME:
            total_income += r.total
        else:
            total_expense += r.total
    
    for r in results:
        summary = schemas.CategorySummary(
            category_id=r.id,
            category_name=r.name,
            category_type=schemas.TransactionType(r.type.value),
            total=r.total,
            percentage=(r.total / total_income * 100) if r.type == models.TransactionType.INCOME and total_income > 0
                else (r.total / total_expense * 100) if total_expense > 0 else 0,
            transaction_count=r.count,
        )
        
        if r.type == models.TransactionType.INCOME:
            income_categories.append(summary)
        else:
            expense_categories.append(summary)
    
    return schemas.ReportByCategory(
        income_categories=income_categories,
        expense_categories=expense_categories,
        summary=schemas.ReportSummary(
            total_income=total_income,
            total_expense=total_expense,
            balance=total_income - total_expense,
            period_start=start_date,
            period_end=end_date,
        )
    )


def get_monthly_trends(
    db: Session,
    user_id: int,
    months: int = 12
) -> schemas.MonthlyReport:
    """
    Get monthly income/expense trends.
    
    Args:
        db: Database session.
        user_id: User ID.
        months: Number of months to include (default 12).
    
    Returns:
        MonthlyReport with trend data.
    """
    query = db.query(
        extract('year', models.Transaction.date).label('year'),
        extract('month', models.Transaction.date).label('month'),
        models.Category.type,
        func.sum(models.Transaction.amount).label('total')
    ).join(models.Category).filter(
        models.Transaction.user_id == user_id
    ).group_by(
        extract('year', models.Transaction.date),
        extract('month', models.Transaction.date),
        models.Category.type
    ).order_by(
        extract('year', models.Transaction.date).desc(),
        extract('month', models.Transaction.date).desc()
    ).limit(months * 2)  # *2 because income and expense are separate rows
    
    results = query.all()
    
    # Aggregate by month
    monthly_data = {}
    for r in results:
        key = f"{int(r.year)}-{int(r.month):02d}"
        if key not in monthly_data:
            monthly_data[key] = {"income": 0, "expense": 0}
        
        if r.type == models.TransactionType.INCOME:
            monthly_data[key]["income"] = r.total
        else:
            monthly_data[key]["expense"] = r.total
    
    # Convert to trends list
    trends = []
    total_income = 0
    total_expense = 0
    
    for month_key in sorted(monthly_data.keys()):
        data = monthly_data[month_key]
        total_income += data["income"]
        total_expense += data["expense"]
        trends.append(schemas.MonthlyTrend(
            month=month_key,
            income=data["income"],
            expense=data["expense"],
            balance=data["income"] - data["expense"],
        ))
    
    return schemas.MonthlyReport(
        trends=trends,
        summary=schemas.ReportSummary(
            total_income=total_income,
            total_expense=total_expense,
            balance=total_income - total_expense,
        )
    )
