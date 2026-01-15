"""
Basic API tests for Finance Manager backend.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine


@pytest.fixture(scope="module")
def client():
    """Create test client with fresh database."""
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)


class TestHealthCheck:
    """Test health check endpoints."""

    def test_root_endpoint(self, client):
        """Test root endpoint returns healthy status."""
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestAuthEndpoints:
    """Test authentication endpoints."""

    def test_register_new_user(self, client):
        """Test user registration."""
        response = client.post(
            "/auth/register",
            json={"email": "test@example.com", "password": "testpass123"},
        )
        assert response.status_code == 201
        assert response.json()["email"] == "test@example.com"
        assert "id" in response.json()

    def test_register_duplicate_email(self, client):
        """Test registration with existing email fails."""
        # First registration
        client.post(
            "/auth/register",
            json={"email": "duplicate@example.com", "password": "testpass123"},
        )
        # Second registration with same email
        response = client.post(
            "/auth/register",
            json={"email": "duplicate@example.com", "password": "testpass123"},
        )
        assert response.status_code == 400

    def test_login_success(self, client):
        """Test successful login returns token."""
        # Register first
        client.post(
            "/auth/register",
            json={"email": "login@example.com", "password": "testpass123"},
        )
        # Login
        response = client.post(
            "/auth/login",
            data={"username": "login@example.com", "password": "testpass123"},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        """Test login with wrong password fails."""
        # Register first
        client.post(
            "/auth/register",
            json={"email": "wrongpass@example.com", "password": "testpass123"},
        )
        # Try wrong password
        response = client.post(
            "/auth/login",
            data={"username": "wrongpass@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401

    def test_get_me_authenticated(self, client):
        """Test getting current user info."""
        # Register and login
        client.post(
            "/auth/register",
            json={"email": "me@example.com", "password": "testpass123"},
        )
        login_response = client.post(
            "/auth/login",
            data={"username": "me@example.com", "password": "testpass123"},
        )
        token = login_response.json()["access_token"]

        # Get me
        response = client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["email"] == "me@example.com"

    def test_get_me_unauthenticated(self, client):
        """Test getting current user without token fails."""
        response = client.get("/auth/me")
        assert response.status_code == 401


class TestCategoryEndpoints:
    """Test category CRUD endpoints."""

    @pytest.fixture
    def auth_headers(self, client):
        """Create authenticated user and return headers."""
        client.post(
            "/auth/register",
            json={"email": "category@example.com", "password": "testpass123"},
        )
        login_response = client.post(
            "/auth/login",
            data={"username": "category@example.com", "password": "testpass123"},
        )
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_create_category(self, client, auth_headers):
        """Test creating a category."""
        response = client.post(
            "/categories",
            json={"name": "Food", "type": "expense"},
            headers=auth_headers,
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Food"
        assert response.json()["type"] == "expense"

    def test_list_categories(self, client, auth_headers):
        """Test listing categories."""
        # Create some categories
        client.post(
            "/categories",
            json={"name": "Salary", "type": "income"},
            headers=auth_headers,
        )
        client.post(
            "/categories",
            json={"name": "Transport", "type": "expense"},
            headers=auth_headers,
        )

        # List all
        response = client.get("/categories", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) >= 2

    def test_delete_category(self, client, auth_headers):
        """Test deleting a category."""
        # Create
        create_response = client.post(
            "/categories",
            json={"name": "ToDelete", "type": "expense"},
            headers=auth_headers,
        )
        category_id = create_response.json()["id"]

        # Delete
        response = client.delete(f"/categories/{category_id}", headers=auth_headers)
        assert response.status_code == 204


class TestTransactionEndpoints:
    """Test transaction CRUD endpoints."""

    @pytest.fixture
    def auth_and_category(self, client):
        """Create authenticated user with a category."""
        client.post(
            "/auth/register",
            json={"email": "transaction@example.com", "password": "testpass123"},
        )
        login_response = client.post(
            "/auth/login",
            data={"username": "transaction@example.com", "password": "testpass123"},
        )
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create category
        cat_response = client.post(
            "/categories",
            json={"name": "Groceries", "type": "expense"},
            headers=headers,
        )
        category_id = cat_response.json()["id"]

        return {"headers": headers, "category_id": category_id}

    def test_create_transaction(self, client, auth_and_category):
        """Test creating a transaction."""
        response = client.post(
            "/transactions",
            json={
                "amount": 50.00,
                "description": "Weekly groceries",
                "date": "2024-01-15T10:00:00",
                "category_id": auth_and_category["category_id"],
            },
            headers=auth_and_category["headers"],
        )
        assert response.status_code == 201
        assert response.json()["amount"] == 50.00

    def test_list_transactions(self, client, auth_and_category):
        """Test listing transactions with pagination."""
        # Create a transaction
        client.post(
            "/transactions",
            json={
                "amount": 25.00,
                "description": "Test",
                "date": "2024-01-15T10:00:00",
                "category_id": auth_and_category["category_id"],
            },
            headers=auth_and_category["headers"],
        )

        response = client.get("/transactions", headers=auth_and_category["headers"])
        assert response.status_code == 200
        assert "items" in response.json()
        assert "total" in response.json()


class TestReportEndpoints:
    """Test report endpoints."""

    @pytest.fixture
    def auth_headers(self, client):
        """Create authenticated user."""
        client.post(
            "/auth/register",
            json={"email": "report@example.com", "password": "testpass123"},
        )
        login_response = client.post(
            "/auth/login",
            data={"username": "report@example.com", "password": "testpass123"},
        )
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_get_summary(self, client, auth_headers):
        """Test getting financial summary."""
        response = client.get("/reports/summary", headers=auth_headers)
        assert response.status_code == 200
        assert "total_income" in response.json()
        assert "total_expense" in response.json()
        assert "balance" in response.json()

    def test_get_by_category(self, client, auth_headers):
        """Test getting breakdown by category."""
        response = client.get("/reports/by-category", headers=auth_headers)
        assert response.status_code == 200
        assert "income_categories" in response.json()
        assert "expense_categories" in response.json()

    def test_get_monthly_trends(self, client, auth_headers):
        """Test getting monthly trends."""
        response = client.get("/reports/monthly", headers=auth_headers)
        assert response.status_code == 200
        assert "trends" in response.json()
        assert "summary" in response.json()
