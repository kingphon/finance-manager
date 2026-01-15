"""
SQLAlchemy ORM models for the finance tracker.
Defines User, Category, and Transaction tables.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, 
    ForeignKey, Enum as SQLEnum, Text
)
from sqlalchemy.orm import relationship
import enum

from .database import Base


class TransactionType(str, enum.Enum):
    """Enum for transaction/category types."""
    INCOME = "income"
    EXPENSE = "expense"


class OAuthProvider(str, enum.Enum):
    """Enum for OAuth providers."""
    LOCAL = "local"
    GOOGLE = "google"
    GITHUB = "github"


class User(Base):
    """
    User model for authentication.
    Supports both local auth (email/password) and OAuth (Google/GitHub).
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Nullable for OAuth users
    oauth_provider = Column(
        SQLEnum(OAuthProvider), 
        default=OAuthProvider.LOCAL,
        nullable=False
    )
    oauth_id = Column(String(255), nullable=True)  # Provider-specific user ID
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Category(Base):
    """
    Category model for organizing transactions.
    Each category belongs to a user and has a type (income/expense).
    """
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(SQLEnum(TransactionType), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Category(id={self.id}, name={self.name}, type={self.type})>"


class Transaction(Base):
    """
    Transaction model for income and expense records.
    Each transaction belongs to a user and a category.
    """
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, amount={self.amount}, date={self.date})>"
