"""seed_default_categories

Revision ID: 202601151124
Revises: 157735966235
Create Date: 2026-01-15 11:24:00.000000

"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '202601151124'
down_revision: Union[str, None] = '157735966235'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Default user ID to seed categories for
DEFAULT_USER_ID = 1

# Default categories to seed
DEFAULT_CATEGORIES = [
    # Expense categories
    {"name": "Food & Dining", "type": "EXPENSE"},
    {"name": "Groceries", "type": "EXPENSE"},
    {"name": "Housing", "type": "EXPENSE"},
    {"name": "Rent/Mortgage", "type": "EXPENSE"},
    {"name": "Utilities", "type": "EXPENSE"},
    {"name": "Transportation", "type": "EXPENSE"},
    {"name": "Gas & Fuel", "type": "EXPENSE"},
    {"name": "Healthcare", "type": "EXPENSE"},
    {"name": "Insurance", "type": "EXPENSE"},
    {"name": "Entertainment", "type": "EXPENSE"},
    {"name": "Shopping", "type": "EXPENSE"},
    {"name": "Clothing", "type": "EXPENSE"},
    {"name": "Education", "type": "EXPENSE"},
    {"name": "Travel", "type": "EXPENSE"},
    {"name": "Personal Care", "type": "EXPENSE"},
    {"name": "Gifts & Donations", "type": "EXPENSE"},
    {"name": "Subscriptions", "type": "EXPENSE"},
    {"name": "Phone & Internet", "type": "EXPENSE"},
    {"name": "Childcare", "type": "EXPENSE"},
    {"name": "Pet Care", "type": "EXPENSE"},
    {"name": "Home Maintenance", "type": "EXPENSE"},
    {"name": "Other Expense", "type": "EXPENSE"},
    
    # Income categories
    {"name": "Salary", "type": "INCOME"},
    {"name": "Freelance", "type": "INCOME"},
    {"name": "Investment", "type": "INCOME"},
    {"name": "Dividends", "type": "INCOME"},
    {"name": "Rental Income", "type": "INCOME"},
    {"name": "Bonus", "type": "INCOME"},
    {"name": "Commission", "type": "INCOME"},
    {"name": "Refund", "type": "INCOME"},
    {"name": "Gift Received", "type": "INCOME"},
    {"name": "Side Hustle", "type": "INCOME"},
    {"name": "Other Income", "type": "INCOME"},
]


def upgrade() -> None:
    """Seed default categories for user."""
    # Get connection for raw SQL execution
    connection = op.get_bind()
    
    # Check if user exists
    result = connection.execute(
        sa.text("SELECT id FROM users WHERE id = :user_id"),
        {"user_id": DEFAULT_USER_ID}
    )
    user = result.fetchone()
    
    if not user:
        print(f"Warning: User {DEFAULT_USER_ID} not found. Skipping category seeding.")
        return
    
    # Insert categories
    now = datetime.utcnow()
    for category in DEFAULT_CATEGORIES:
        # Check if category already exists for this user
        existing = connection.execute(
            sa.text("""
                SELECT id FROM categories 
                WHERE name = :name AND type = :type AND user_id = :user_id
            """),
            {"name": category["name"], "type": category["type"], "user_id": DEFAULT_USER_ID}
        ).fetchone()
        
        if not existing:
            connection.execute(
                sa.text("""
                    INSERT INTO categories (name, type, user_id, created_at)
                    VALUES (:name, :type, :user_id, :created_at)
                """),
                {
                    "name": category["name"],
                    "type": category["type"],
                    "user_id": DEFAULT_USER_ID,
                    "created_at": now
                }
            )
    
    print(f"Seeded {len(DEFAULT_CATEGORIES)} default categories for user {DEFAULT_USER_ID}")


def downgrade() -> None:
    """Remove seeded categories."""
    connection = op.get_bind()
    
    for category in DEFAULT_CATEGORIES:
        connection.execute(
            sa.text("""
                DELETE FROM categories 
                WHERE name = :name AND type = :type AND user_id = :user_id
            """),
            {"name": category["name"], "type": category["type"], "user_id": DEFAULT_USER_ID}
        )
    
    print(f"Removed seeded categories for user {DEFAULT_USER_ID}")
