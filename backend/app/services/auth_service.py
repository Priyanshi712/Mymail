import uuid
from datetime import datetime, timezone
from typing import Dict, Optional
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.auth import UserCreate, UserResponse, Token


class InMemoryUserStore:
    def __init__(self):
        # email -> user_data
        self._users: Dict[str, dict] = {}
        # token -> email
        self._reset_tokens: Dict[str, str] = {}
        
        # Seed a default demo account for immediate testing
        self.seed_demo_user()

    def seed_demo_user(self):
        demo_email = "demo@mymail.ai"
        if demo_email not in self._users:
            self._users[demo_email] = {
                "id": str(uuid.uuid4()),
                "email": demo_email,
                "full_name": "Demo Professional",
                "hashed_password": get_password_hash("Password123"),
                "created_at": datetime.now(timezone.utc),
            }

    def get_by_email(self, email: str) -> Optional[dict]:
        return self._users.get(email.lower())

    def get_by_id(self, user_id: str) -> Optional[dict]:
        for u in self._users.values():
            if u["id"] == user_id:
                return u
        return None

    def create(self, user_in: UserCreate) -> dict:
        email = user_in.email.lower()
        if email in self._users:
            raise ValueError("An account with this email already exists")
            
        user_data = {
            "id": str(uuid.uuid4()),
            "email": email,
            "full_name": user_in.full_name,
            "hashed_password": get_password_hash(user_in.password),
            "created_at": datetime.now(timezone.utc),
        }
        self._users[email] = user_data
        return user_data

    def authenticate(self, email: str, password: str) -> Optional[dict]:
        user = self.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return user

    def create_reset_token(self, email: str) -> Optional[str]:
        user = self.get_by_email(email)
        if not user:
            return None
        token = str(uuid.uuid4())
        self._reset_tokens[token] = email.lower()
        return token

    def verify_reset_token(self, token: str) -> Optional[str]:
        return self._reset_tokens.get(token)

    def reset_password(self, token: str, new_password: str) -> bool:
        email = self._reset_tokens.pop(token, None)
        if not email:
            return False
        user = self.get_by_email(email)
        if not user:
            return False
        user["hashed_password"] = get_password_hash(new_password)
        return True


user_store = InMemoryUserStore()
