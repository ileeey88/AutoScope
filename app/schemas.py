"""Pydantic-схемы для валидации запросов и ответов."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)  # bcrypt лимит 72 байта
    name: str = Field(min_length=2, max_length=100)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    created_at: str


class CarOut(BaseModel):
    id: int
    brand: str
    model: str
    year: int
    body: str
    engine: str
    power: int
    transmission: str
    drive: str
    mileage: int
    price: int
    description: str
    image_url: str


class FavoriteIn(BaseModel):
    car_id: int


class InquiryIn(BaseModel):
    car_id: int
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=30)
    message: str = Field(min_length=10, max_length=2000)