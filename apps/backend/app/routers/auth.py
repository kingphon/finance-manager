"""
Authentication router.
Handles user registration, login, and OAuth flows.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .. import schemas, crud, models
from ..database import get_db
from ..auth import authenticate_user, create_access_token, get_current_user
from ..oauth import (
    get_google_auth_url,
    get_github_auth_url,
    verify_google_token,
    verify_github_token,
    get_or_create_oauth_user,
)
from ..config import get_settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with email and password.
    
    Returns:
        Created user information.
    
    Raises:
        400: If email already registered.
    """
    existing_user = crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = crud.create_user(db, user)
    return db_user


@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    Uses OAuth2 password flow (username = email).
    
    Returns:
        JWT access token.
    
    Raises:
        401: If credentials are invalid.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return schemas.Token(access_token=access_token)


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    """
    Get current authenticated user info.
    
    Returns:
        Current user information.
    """
    return current_user


# ============== OAuth Routes ==============

@router.get("/google")
def google_login():
    """
    Redirect to Google OAuth consent screen.
    
    Returns:
        Redirect response to Google OAuth.
    """
    auth_url = get_google_auth_url()
    return RedirectResponse(url=auth_url)


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback.
    Exchanges code for token and creates/links user.
    
    Returns:
        Redirect to frontend with token in query params.
    
    Raises:
        400: If OAuth verification fails.
    """
    user_info = await verify_google_token(code)
    
    if not user_info or not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to verify Google token"
        )
    
    user, access_token = get_or_create_oauth_user(
        db,
        email=user_info["email"],
        oauth_provider=models.OAuthProvider.GOOGLE,
        oauth_id=user_info.get("id", user_info.get("sub", "")),
    )
    
    # Redirect to frontend with token
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}&provider=google"
    return RedirectResponse(url=redirect_url)


@router.get("/github")
def github_login():
    """
    Redirect to GitHub OAuth authorization.
    
    Returns:
        Redirect response to GitHub OAuth.
    """
    auth_url = get_github_auth_url()
    return RedirectResponse(url=auth_url)


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle GitHub OAuth callback.
    Exchanges code for token and creates/links user.
    
    Returns:
        Redirect to frontend with token in query params.
    
    Raises:
        400: If OAuth verification fails.
    """
    user_info = await verify_github_token(code)
    
    if not user_info or not user_info.get("email"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to verify GitHub token or email not available"
        )
    
    user, access_token = get_or_create_oauth_user(
        db,
        email=user_info["email"],
        oauth_provider=models.OAuthProvider.GITHUB,
        oauth_id=str(user_info.get("id", "")),
    )
    
    # Redirect to frontend with token
    redirect_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}&provider=github"
    return RedirectResponse(url=redirect_url)
