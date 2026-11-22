"""Точка входа FastAPI-приложения AutoScope."""
import os
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from .database import init_db
from . import crud
from .auth import hash_password, verify_password, SESSION_COOKIE_NAME, SECRET_KEY
from .schemas import (
    RegisterIn, LoginIn, FavoriteIn, InquiryIn,
    UserOut, CarOut,
)
from .email import send_inquiry_email

@asynccontextmanager
async def lifespan(app: FastAPI):
    # При старте создаём таблицы (если их нет)
    init_db()
    yield

app = FastAPI(title="AutoScope API", lifespan=lifespan)

# Сессия через подписанную cookie
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    session_cookie=SESSION_COOKIE_NAME,
    max_age=14 * 24 * 3600,  # 14 дней
    same_site="lax",
    https_only=False,  # На хостинге с HTTPS можно поставить True
)

# --- Раздача статики и страниц ---
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Хелперы для сессии
def current_user_id(request: Request) -> int | None:
    return request.session.get("user_id")

def require_user(request: Request) -> int:
    user_id = current_user_id(request)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Требуется вход в систему")
    return user_id

# --- Раздача HTML ---
@app.get("/")
def read_index():
    return FileResponse(BASE_DIR / "index.html")

@app.get("/{page}.html")
def read_page(page: str):
    file_path = BASE_DIR / f"{page}.html"
    if file_path.exists():
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Page not found")

# --- API ---

@app.get("/api/health")
def health():
    return {"status": "ok"}

# 1. Курс валют (прокси к ЦБ)
@app.get("/api/exchange-rate")
async def get_exchange_rate():
    url = "https://www.cbr-xml-daily.ru/daily_json.js"
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            usd_rate = data["Valute"]["USD"]["Value"]
            return {"usd": usd_rate}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Ошибка получения курса: {str(e)}")

# 2. Автомобили
@app.get("/api/cars")
def api_list_cars():
    return crud.list_cars()

@app.get("/api/cars/{car_id}")
def api_get_car(car_id: int):
    car = crud.get_car(car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return car

# 3. Аутентификация
@app.post("/api/register", response_model=UserOut, status_code=201)
def api_register(payload: RegisterIn, request: Request):
    if crud.get_user_by_email(payload.email):
        raise HTTPException(status_code=409, detail="Пользователь с таким email уже существует")

    user = crud.create_user(
        email=payload.email,
        password_hash=hash_password(payload.password),
        name=payload.name,
    )
    request.session["user_id"] = user["id"]
    return user

@app.post("/api/login")
def api_login(payload: LoginIn, request: Request):
    user = crud.get_user_by_email(payload.email)
    if user is None or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")

    request.session["user_id"] = user["id"]
    return {"ok": True, "user": {
        "id": user["id"], "email": user["email"], "name": user["name"],
    }}

@app.post("/api/logout")
def api_logout(request: Request):
    request.session.clear()
    return {"ok": True}

@app.get("/api/me", response_model=UserOut)
def api_me(request: Request):
    user_id = require_user(request)
    user = crud.get_user_by_id(user_id)
    if user is None:
        request.session.clear()
        raise HTTPException(status_code=401, detail="Требуется вход в систему")
    return user

# 4. Избранное (сравнение)
@app.get("/api/favorites")
def api_list_favorites(request: Request):
    user_id = require_user(request)
    return crud.list_favorites(user_id)

@app.post("/api/favorites", status_code=201)
def api_add_favorite(payload: FavoriteIn, request: Request):
    user_id = require_user(request)
    car = crud.get_car(payload.car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    crud.add_favorite(user_id, payload.car_id)
    return {"ok": True}

@app.delete("/api/favorites/{car_id}")
def api_remove_favorite(car_id: int, request: Request):
    user_id = require_user(request)
    crud.remove_favorite(user_id, car_id)
    return {"ok": True}

# 5. Заявка продавцу
@app.post("/api/inquiries", status_code=201)
def api_create_inquiry(payload: InquiryIn):
    car = crud.get_car_with_seller(payload.car_id)
    if car is None:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    inquiry_id = crud.create_inquiry(
        car_id=payload.car_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        message=payload.message,
    )

    car_title = f"{car['brand']} {car['model']} {car['year']}"
    send_inquiry_email(
        to_email=car["seller_email"],
        car_title=car_title,
        sender_name=payload.name,
        sender_email=payload.email,
        sender_phone=payload.phone,
        message=payload.message,
    )

    return {"ok": True, "inquiry_id": inquiry_id}