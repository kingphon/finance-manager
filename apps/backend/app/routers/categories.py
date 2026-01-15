"""
Categories router.
CRUD operations for transaction categories.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import schemas, crud, models
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=list[schemas.CategoryResponse])
def list_categories(
    category_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    List all categories for the current user.
    
    Args:
        category_type: Optional filter by type (income/expense).
    
    Returns:
        List of categories.
    """
    type_filter = None
    if category_type:
        try:
            type_filter = models.TransactionType(category_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category type. Must be 'income' or 'expense'"
            )
    
    return crud.get_categories(db, current_user.id, type_filter)


@router.post("", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Create a new category.
    
    Returns:
        Created category.
    """
    return crud.create_category(db, category, current_user.id)


@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int,
    category: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update a category.
    
    Returns:
        Updated category.
    
    Raises:
        404: If category not found.
    """
    updated_category = crud.update_category(db, category_id, current_user.id, category)
    if not updated_category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return updated_category


@router.get("/{category_id}", response_model=schemas.CategoryResponse)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get a specific category by ID.
    
    Returns:
        Category details.
    
    Raises:
        404: If category not found.
    """
    category = crud.get_category(db, category_id, current_user.id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete a category by ID.
    Also deletes all associated transactions (cascade).
    
    Raises:
        404: If category not found.
    """
    deleted = crud.delete_category(db, category_id, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return None
