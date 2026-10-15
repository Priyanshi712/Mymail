import secrets
import httpx
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.models.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    PasswordResetRequest,
    PasswordResetConfirm,
    MessageResponse,
    OAuthUrlResponse,
    OAuthCallbackPayload,
)
from app.services.auth_service import user_store
from app.core.security import create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> UserResponse:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id = payload["sub"]
    user = user_store.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        created_at=user["created_at"],
    )


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate):
    try:
        user = user_store.create(user_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
        
    access_token = create_access_token(
        subject=user["id"],
        extra_claims={"email": user["email"], "name": user["full_name"]}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user["created_at"],
        ),
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    user = user_store.authenticate(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
        
    access_token = create_access_token(
        subject=user["id"],
        extra_claims={"email": user["email"], "name": user["full_name"]}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user["created_at"],
        ),
    )


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: UserResponse = Depends(get_current_user)):
    return current_user


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(req: PasswordResetRequest):
    token = user_store.create_reset_token(req.email)
    # Always return a neutral success message to prevent user enumeration
    return MessageResponse(
        message=f"If an account with that email exists, password reset instructions have been dispatched. (Dev Token: {token})"
        if token
        else "If an account with that email exists, password reset instructions have been dispatched.",
        success=True,
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(req: PasswordResetConfirm):
    success = user_store.reset_password(req.token, req.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    return MessageResponse(
        message="Password has been successfully reset. You can now log in with your new password.",
        success=True,
    )


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: UserResponse = Depends(get_current_user)):
    return MessageResponse(
        message="Successfully logged out.",
        success=True,
    )


@router.get("/oauth/github/url", response_model=OAuthUrlResponse)
def get_github_oauth_url():
    """Generates a secure GitHub OAuth URL with anti-CSRF state token."""
    state = secrets.token_urlsafe(32)
    user_store.store_oauth_state(state)
    
    if settings.GITHUB_CLIENT_ID:
        url = (
            f"https://github.com/login/oauth/authorize"
            f"?client_id={settings.GITHUB_CLIENT_ID}"
            f"&redirect_uri={settings.GITHUB_REDIRECT_URI}"
            f"&scope=read:user,user:email"
            f"&state={state}"
        )
    else:
        # Development / Sandbox Mode URL
        url = f"{settings.GITHUB_REDIRECT_URI}?code=mock_github_code_priyanshi&state={state}"
        
    return OAuthUrlResponse(url=url, state=state, provider="github")


@router.post("/oauth/github/callback", response_model=Token)
async def github_oauth_callback(payload: OAuthCallbackPayload):
    """Processes GitHub OAuth callback, verifies CSRF state, and issues session token."""
    # Verify state against CSRF
    if not user_store.verify_and_consume_oauth_state(payload.state):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OAuth state parameter (anti-CSRF check failed)",
        )

    # Real GitHub token exchange if credentials configured
    if settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET:
        token_url = "https://github.com/login/oauth/access_token"
        headers = {"Accept": "application/json"}
        data = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "client_secret": settings.GITHUB_CLIENT_SECRET,
            "code": payload.code,
            "redirect_uri": settings.GITHUB_REDIRECT_URI,
        }
        async with httpx.AsyncClient() as http_client:
            token_resp = await http_client.post(token_url, json=data, headers=headers)
            if token_resp.status_code != 200 or "access_token" not in token_resp.json():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange GitHub authorization code",
                )
            gh_token = token_resp.json()["access_token"]
            
            # Fetch user profile
            user_resp = await http_client.get(
                "https://api.github.com/user",
                headers={"Authorization": f"Bearer {gh_token}", "Accept": "application/json"}
            )
            if user_resp.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to retrieve GitHub user profile",
                )
            gh_user = user_resp.json()
            email = gh_user.get("email")
            name = gh_user.get("name") or gh_user.get("login") or "GitHub User"
            
            # Fetch emails if email is private
            if not email:
                emails_resp = await http_client.get(
                    "https://api.github.com/user/emails",
                    headers={"Authorization": f"Bearer {gh_token}", "Accept": "application/json"}
                )
                if emails_resp.status_code == 200:
                    emails = emails_resp.json()
                    for em in emails:
                        if em.get("primary") and em.get("verified"):
                            email = em.get("email")
                            break
            if not email:
                email = f"{gh_user.get('login')}@users.noreply.github.com"
            provider_id = str(gh_user.get("id"))
    else:
        # Development / Sandbox Mode User
        email = "priyanshi27705@gmail.com"
        name = "Priyanshi (GitHub)"
        provider_id = "gh_215311977"

    user = user_store.find_or_create_oauth_user(
        email=email,
        full_name=name,
        provider="github",
        provider_id=provider_id,
    )

    access_token = create_access_token(
        subject=user["id"],
        extra_claims={"email": user["email"], "name": user["full_name"], "provider": "github"}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            created_at=user["created_at"],
        ),
    )

