"""
OAuth utilities module.
Handles Google and GitHub OAuth authentication flows.
"""
from typing import Optional, Tuple
from urllib.parse import urlencode
import httpx
from sqlalchemy.orm import Session

from .config import get_settings
from . import models
from .auth import create_access_token

settings = get_settings()


def get_google_auth_url(state: Optional[str] = None) -> str:
    """
    Generate Google OAuth consent URL.
    
    Args:
        state: Optional state parameter for CSRF protection.
    
    Returns:
        URL to redirect user to Google OAuth consent screen.
    """
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": f"{settings.BACKEND_URL}/auth/google/callback",
        "response_type": "code",
        "scope": "email profile",
        "access_type": "offline",
        "state": state or "google",
    }
    return f"{settings.GOOGLE_AUTH_URL}?{urlencode(params)}"


def get_github_auth_url(state: Optional[str] = None) -> str:
    """
    Generate GitHub OAuth authorization URL.
    
    Args:
        state: Optional state parameter for CSRF protection.
    
    Returns:
        URL to redirect user to GitHub OAuth authorization.
    """
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": f"{settings.BACKEND_URL}/auth/github/callback",
        "scope": "user:email",
        "state": state or "github",
    }
    return f"{settings.GITHUB_AUTH_URL}?{urlencode(params)}"


async def verify_google_token(code: str) -> Optional[dict]:
    """
    Exchange Google authorization code for user info.
    
    Args:
        code: Authorization code from Google OAuth callback.
    
    Returns:
        Dictionary with user info (email, sub) or None if failed.
    """
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            settings.GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": f"{settings.BACKEND_URL}/auth/google/callback",
            },
        )
        
        if token_response.status_code != 200:
            return None
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return None
        
        # Get user info
        userinfo_response = await client.get(
            settings.GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        
        if userinfo_response.status_code != 200:
            return None
        
        return userinfo_response.json()


async def verify_github_token(code: str) -> Optional[dict]:
    """
    Exchange GitHub authorization code for user info.
    
    Args:
        code: Authorization code from GitHub OAuth callback.
    
    Returns:
        Dictionary with user info (email, id) or None if failed.
    """
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            settings.GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": f"{settings.BACKEND_URL}/auth/github/callback",
            },
        )
        
        if token_response.status_code != 200:
            return None
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            return None
        
        # Get user info
        user_response = await client.get(
            settings.GITHUB_USER_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )
        
        if user_response.status_code != 200:
            return None
        
        user_data = user_response.json()
        
        # Get user email if not public
        if not user_data.get("email"):
            email_response = await client.get(
                settings.GITHUB_EMAIL_URL,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
            
            if email_response.status_code == 200:
                emails = email_response.json()
                # Find primary email
                for email in emails:
                    if email.get("primary"):
                        user_data["email"] = email.get("email")
                        break
        
        return user_data


def get_or_create_oauth_user(
    db: Session,
    email: str,
    oauth_provider: models.OAuthProvider,
    oauth_id: str
) -> Tuple[models.User, str]:
    """
    Find or create a user from OAuth profile.
    
    Args:
        db: Database session.
        email: User's email from OAuth provider.
        oauth_provider: The OAuth provider (google/github).
        oauth_id: Provider-specific user ID.
    
    Returns:
        Tuple of (User model, JWT access token).
    """
    # Check if user exists with this email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if user:
        # Update OAuth info if needed
        if user.oauth_provider == models.OAuthProvider.LOCAL:
            # Existing local user - link OAuth account
            user.oauth_provider = oauth_provider
            user.oauth_id = oauth_id
            db.commit()
    else:
        # Create new OAuth user
        user = models.User(
            email=email,
            hashed_password=None,  # No password for OAuth users
            oauth_provider=oauth_provider,
            oauth_id=oauth_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return user, access_token
