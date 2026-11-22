"""Хеширование паролей и работа с сессией через cookie."""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SESSION_COOKIE_NAME = "carshop_session"
SECRET_KEY = "change-me-in-production-please-32-chars-min" 


def hash_password(plain: str) -> str:
    """Возвращает bcrypt-хеш пароля."""
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """Сверяет пароль с хешем."""
    return pwd_context.verify(plain, hashed)