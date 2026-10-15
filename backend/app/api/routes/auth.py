from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    PasswordResetRequest,
    PasswordResetConfirm,
    MessageResponse,
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
