"""Подключение к SQLite и инициализация схемы БД."""
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "app.db"


def get_connection() -> sqlite3.Connection:
    """Открывает соединение с БД. row_factory позволяет обращаться к колонкам по имени."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    """Создаёт таблицы, если их ещё нет. Вызывается при старте приложения."""
    conn = get_connection()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                name          TEXT NOT NULL,
                created_at    TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS cars (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                brand        TEXT NOT NULL,
                model        TEXT NOT NULL,
                year         INTEGER NOT NULL,
                body         TEXT NOT NULL,
                engine       TEXT NOT NULL,
                power        INTEGER NOT NULL,
                transmission TEXT NOT NULL,
                drive        TEXT NOT NULL,
                mileage      INTEGER NOT NULL,
                price        INTEGER NOT NULL,
                description  TEXT NOT NULL,
                image_url    TEXT NOT NULL,
                seller_email TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS favorites (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
                created_at TEXT NOT NULL DEFAULT (datetime('now')),
                UNIQUE (user_id, car_id)
            );

            CREATE TABLE IF NOT EXISTS inquiries (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
                name       TEXT NOT NULL,
                email      TEXT NOT NULL,
                phone      TEXT,
                message    TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
            CREATE INDEX IF NOT EXISTS idx_inquiries_car ON inquiries(car_id);
            """
        )
        conn.commit()
    finally:
        conn.close()


def row_to_dict(row: sqlite3.Row | None) -> dict | None:
    """Утилита: sqlite3.Row → dict (для JSON-ответов)."""
    if row is None:
        return None
    return {key: row[key] for key in row.keys()}