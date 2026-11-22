"""Параметризованные SQL-запросы. ВСЕ значения передаются через ? — никакой склейки строк."""
import sqlite3
from .database import get_connection, row_to_dict


# ---------- Пользователи ----------

def get_user_by_email(email: str) -> dict | None:
    conn = get_connection()
    try:
        cur = conn.execute(
            "SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?",
            (email,),
        )
        return row_to_dict(cur.fetchone())
    finally:
        conn.close()


def get_user_by_id(user_id: int) -> dict | None:
    conn = get_connection()
    try:
        cur = conn.execute(
            "SELECT id, email, name, created_at FROM users WHERE id = ?",
            (user_id,),
        )
        return row_to_dict(cur.fetchone())
    finally:
        conn.close()


def create_user(email: str, password_hash: str, name: str) -> dict:
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
            (email, password_hash, name),
        )
        conn.commit()
        user_id = cur.lastrowid
    finally:
        conn.close()
    return get_user_by_id(user_id)  


# ---------- Автомобили ----------

def list_cars() -> list[dict]:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT id, brand, model, year, body, engine, power, transmission,
                   drive, mileage, price, description, image_url
            FROM cars
            ORDER BY id
            """
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def get_car(car_id: int) -> dict | None:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT id, brand, model, year, body, engine, power, transmission,
                   drive, mileage, price, description, image_url
            FROM cars WHERE id = ?
            """,
            (car_id,),
        )
        return row_to_dict(cur.fetchone())
    finally:
        conn.close()


def get_car_with_seller(car_id: int) -> dict | None:
    """Внутренняя функция: для отправки письма нужен seller_email, но публично его не отдаём."""
    conn = get_connection()
    try:
        cur = conn.execute(
            "SELECT id, brand, model, year, seller_email FROM cars WHERE id = ?",
            (car_id,),
        )
        return row_to_dict(cur.fetchone())
    finally:
        conn.close()


# ---------- Избранное ----------

def list_favorites(user_id: int) -> list[dict]:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            SELECT c.id, c.brand, c.model, c.year, c.body, c.engine, c.power,
                   c.transmission, c.drive, c.mileage, c.price, c.description,
                   c.image_url, f.created_at AS added_at
            FROM favorites f
            JOIN cars c ON c.id = f.car_id
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
            """,
            (user_id,),
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()


def add_favorite(user_id: int, car_id: int) -> None:
    conn = get_connection()
    try:
        conn.execute(
            "INSERT OR IGNORE INTO favorites (user_id, car_id) VALUES (?, ?)",
            (user_id, car_id),
        )
        conn.commit()
    finally:
        conn.close()


def remove_favorite(user_id: int, car_id: int) -> None:
    conn = get_connection()
    try:
        conn.execute(
            "DELETE FROM favorites WHERE user_id = ? AND car_id = ?",
            (user_id, car_id),
        )
        conn.commit()
    finally:
        conn.close()


# ---------- Заявки продавцу ----------

def create_inquiry(
    car_id: int, name: str, email: str, phone: str | None, message: str
) -> int:
    conn = get_connection()
    try:
        cur = conn.execute(
            """
            INSERT INTO inquiries (car_id, name, email, phone, message)
            VALUES (?, ?, ?, ?, ?)
            """,
            (car_id, name, email, phone, message),
        )
        conn.commit()
        return cur.lastrowid  
    finally:
        conn.close()


def list_inquiries_for_car(car_id: int) -> list[dict]:
    """Пригодится для отладки/демонстрации на защите."""
    conn = get_connection()
    try:
        cur = conn.execute(
            "SELECT id, name, email, phone, message, created_at FROM inquiries WHERE car_id = ? ORDER BY created_at DESC",
            (car_id,),
        )
        return [dict(row) for row in cur.fetchall()]
    finally:
        conn.close()