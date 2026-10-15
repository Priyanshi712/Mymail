from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="User full name")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    confirm_password: str = Field(..., description="Confirmation of password")

    @model_validator(mode="after")
    def passwords_match(self) -> "UserCreate":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        
        # Check basic complexity
        has_digit = any(c.isdigit() for c in self.password)
        has_letter = any(c.isalpha() for c in self.password)
        if not (has_digit and has_letter):
            raise ValueError("Password must contain at least one letter and one number")
        return self


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    remember_me: bool = False


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_new_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "PasswordResetConfirm":
        if self.new_password != self.confirm_new_password:
            raise ValueError("Passwords do not match")
        has_digit = any(c.isdigit() for c in self.new_password)
        has_letter = any(c.isalpha() for c in self.new_password)
        if not (has_digit and has_letter):
            raise ValueError("Password must contain at least one letter and one number")
        return self


class MessageResponse(BaseModel):
    message: str
    success: bool = True
