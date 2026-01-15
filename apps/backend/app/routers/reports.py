"""
Reports router.
Aggregated financial reports and analytics.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import schemas, crud, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary", response_model=schemas.ReportSummary)
def get_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get overall financial summary.
    
    Args:
        start_date: Optional start of period.
        end_date: Optional end of period.
    
    Returns:
        Summary with total income, expense, and balance.
    """
    return crud.get_summary(db, current_user.id, start_date, end_date)


@router.get("/by-category", response_model=schemas.ReportByCategory)
def get_by_category(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get spending breakdown by category.
    
    Args:
        start_date: Optional start of period.
        end_date: Optional end of period.
    
    Returns:
        Breakdown of income/expense by category with percentages.
    """
    return crud.get_by_category(db, current_user.id, start_date, end_date)


@router.get("/monthly", response_model=schemas.MonthlyReport)
def get_monthly_trends(
    months: int = Query(12, ge=1, le=24),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get monthly income/expense trends.
    
    Args:
        months: Number of months to include (default 12, max 24).
    
    Returns:
        Monthly trends with income, expense, and balance per month.
    """
    return crud.get_monthly_trends(db, current_user.id, months)
