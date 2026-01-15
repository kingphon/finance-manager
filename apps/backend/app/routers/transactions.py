"""
Transactions router.
CRUD operations for financial transactions.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import schemas, crud, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=schemas.TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    List transactions with pagination and filters.
    
    Args:
        page: Page number (1-indexed).
        per_page: Items per page (max 100).
        category_id: Filter by category.
        start_date: Filter transactions on or after this date.
        end_date: Filter transactions on or before this date.
        type: Filter by type (income/expense).
    
    Returns:
        Paginated list of transactions.
    """
    skip = (page - 1) * per_page
    
    transactions, total = crud.get_transactions(
        db,
        current_user.id,
        skip=skip,
        limit=per_page,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        transaction_type=type,
    )
    
    pages = (total + per_page - 1) // per_page  # Ceiling division
    
    return schemas.TransactionListResponse(
        items=transactions,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.post("", response_model=schemas.TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: schemas.TransactionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new transaction.
    
    Returns:
        Created transaction.
    
    Raises:
        400: If category doesn't exist.
    """
    db_transaction = crud.create_transaction(db, transaction, current_user.id)
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )
    return db_transaction


@router.get("/{transaction_id}", response_model=schemas.TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get a specific transaction by ID.
    
    Returns:
        Transaction details.
    
    Raises:
        404: If transaction not found.
    """
    transaction = crud.get_transaction(db, transaction_id, current_user.id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction


@router.put("/{transaction_id}", response_model=schemas.TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_update: schemas.TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update a transaction by ID.
    
    Returns:
        Updated transaction.
    
    Raises:
        404: If transaction not found.
        400: If new category ID is invalid.
    """
    updated = crud.update_transaction(db, transaction_id, current_user.id, transaction_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found or invalid category"
        )
    return updated


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete a transaction by ID.
    
    Raises:
        404: If transaction not found.
    """
    deleted = crud.delete_transaction(db, transaction_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return None
