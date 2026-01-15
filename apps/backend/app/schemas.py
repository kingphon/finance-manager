"""
Pydantic schemas for request/response validation.
Defines data transfer objects for API endpoints.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


class TransactionType(str, Enum):
    """Transaction type enum for API."""
    INCOME = "income"
    EXPENSE = "expense"


# ============== User Schemas ==============

class UserBase(BaseModel):
    """Base user schema with email."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for user registration with password."""
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    """Schema for user response (excludes password)."""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Auth Schemas ==============

class Token(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Decoded token data."""
    email: Optional[str] = None
    user_id: Optional[int] = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class OAuthCallback(BaseModel):
    """OAuth callback data."""
    code: str
    state: Optional[str] = None


# ============== Category Schemas ==============

class CategoryBase(BaseModel):
    """Base category schema."""
    name: str = Field(..., min_length=1, max_length=100)
    type: TransactionType


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[TransactionType] = None

    class Config:
        from_attributes = True


class CategoryResponse(CategoryBase):
    """Schema for category response."""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Transaction Schemas ==============

class TransactionBase(BaseModel):
    """Base transaction schema."""
    amount: float = Field(..., gt=0)
    description: Optional[str] = None
    date: datetime
    category_id: int


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction (all fields optional)."""
    amount: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    date: Optional[datetime] = None
    category_id: Optional[int] = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response with category info."""
    id: int
    user_id: int
    created_at: datetime
    category: Optional[CategoryResponse] = None
    
    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    """Paginated transaction list response."""
    items: List[TransactionResponse]
    total: int
    page: int
    per_page: int
    pages: int


# ============== Report Schemas ==============

class ReportSummary(BaseModel):
    """Overall financial summary."""
    total_income: float
    total_expense: float
    balance: float
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None


class CategorySummary(BaseModel):
    """Summary by category."""
    category_id: int
    category_name: str
    category_type: TransactionType
    total: float
    percentage: float
    transaction_count: int


class MonthlyTrend(BaseModel):
    """Monthly income/expense trend."""
    month: str  # Format: "YYYY-MM"
    income: float
    expense: float
    balance: float


class ReportByCategory(BaseModel):
    """Report grouped by categories."""
    income_categories: List[CategorySummary]
    expense_categories: List[CategorySummary]
    summary: ReportSummary


class MonthlyReport(BaseModel):
    """Monthly trend report."""
    trends: List[MonthlyTrend]
    summary: ReportSummary
