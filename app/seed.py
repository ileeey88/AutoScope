"""Наполнение БД тестовыми данными.

Запуск:
    python -m app.seed

Скрипт идемпотентен: если данные уже есть — пропускает.
"""
from .database import init_db, get_connection
from .auth import hash_password


CARS = [
    # brand, model, year, body, engine, power, transmission, drive, mileage, price, description, image, seller
    ("Toyota", "Camry", 2022, "Седан", "2.5 л, бензин", 181, "Автомат", "Передний", 34000, 3100000,
     "Бизнес-седан с просторным салоном, плавным ходом и экономичным двигателем. Один владелец по ПТС, обслуживание у официального дилера.",
     "img/car-01.jpg", "seller1@carshop.example"),
    ("Hyundai", "Tucson", 2023, "Кроссовер", "2.0 л, бензин", 150, "Автомат", "Полный", 46000, 3450000,
     "Современный кроссовер с богатой комплектацией, подогревом всех сидений и камерой 360°.",
     "img/car-02.jpg", "seller2@carshop.example"),
    ("Kia", "Sportage", 2022, "Кроссовер", "2.0 л, бензин", 150, "Автомат", "Передний", 52000, 3250000,
     "Практичный кроссовер для города и трассы. Обслуживание по регламенту, все ТО пройдены.",
     "img/car-03.jpg", "seller1@carshop.example"),
    ("Volkswagen", "Golf", 2021, "Хэтчбек", "1.4 л, бензин", 150, "Робот", "Передний", 81000, 2400000,
     "Немецкое качество сборки, экономичный двигатель, отличная шумоизоляция.",
     "img/car-04.jpg", "seller3@carshop.example"),
    ("Skoda", "Octavia", 2022, "Седан", "1.4 л, бензин", 150, "Автомат", "Передний", 67000, 2700000,
     "Просторный лифтбек с большим багажником. Идеален для семьи.",
     "img/car-05.jpg", "seller2@carshop.example"),
    ("Mazda", "CX-5", 2023, "Кроссовер", "2.0 л, бензин", 150, "Автомат", "Полный", 23000, 3600000,
     "Премиальный кроссовер с отличной управляемостью и качественными материалами салона.",
     "img/car-06.jpg", "seller1@carshop.example"),
    ("BMW", "3 серии", 2021, "Седан", "2.0 л, бензин", 184, "Автомат", "Задний", 31000, 4200000,
     "Спортивный седан бизнес-класса. Полная история обслуживания у официального дилера.",
     "img/car-07.jpg", "seller3@carshop.example"),
    ("Lada", "Vesta", 2023, "Седан", "1.6 л, бензин", 106, "Вариатор", "Передний", 59000, 1700000,
     "Новый отечественный седан. Гарантия производителя до 2026 года.",
     "img/car-08.jpg", "seller2@carshop.example"),
    ("Toyota", "RAV4", 2022, "Кроссовер", "2.0 л, бензин", 149, "Вариатор", "Полный", 60000, 3700000,
     "Надёжный кроссовер с полным приводом. Один владелец, вся история в дилерской базе.",
     "img/car-09.jpg", "seller1@carshop.example"),
    ("Kia", "Rio", 2021, "Седан", "1.6 л, бензин", 123, "Автомат", "Передний", 89000, 1850000,
     "Экономичный городской седан. Идеален для ежедневных поездок.",
     "img/car-10.jpg", "seller3@carshop.example"),
    ("Hyundai", "Solaris", 2022, "Седан", "1.6 л, бензин", 123, "Автомат", "Передний", 70000, 1950000,
     "Популярный бюджетный седан с надёжным двигателем и недорогим обслуживанием.",
     "img/car-11.jpg", "seller2@carshop.example"),
    ("Skoda", "Kodiaq", 2023, "Внедорожник", "2.0 л, бензин", 180, "Робот", "Полный", 21000, 4000000,
     "Семиместный семейный внедорожник с панорамной крышей и полным приводом.",
     "img/car-12.jpg", "seller1@carshop.example"),
    ("Renault", "Logan", 2021, "Седан", "1.6 л, бензин", 113, "Механика", "Передний", 95000, 1200000,
     "Неприхотливый и экономичный седан. Отличный вариант для начинающих водителей.",
     "img/car-13.jpg", "seller3@carshop.example"),
    ("Nissan", "Qashqai", 2022, "Кроссовер", "1.3 л, бензин", 158, "Вариатор", "Передний", 41000, 2900000,
     "Компактный кроссовер с экономичным турбодвигателем и современным салоном.",
     "img/car-14.jpg", "seller2@carshop.example"),
    ("Honda", "CR-V", 2021, "Кроссовер", "2.0 л, бензин", 150, "Вариатор", "Полный", 55000, 3300000,
     "Надёжный японский кроссовер с просторным салоном и большим багажником.",
     "img/car-15.jpg", "seller1@carshop.example"),
    ("Volvo", "XC60", 2022, "Кроссовер", "2.0 л, бензин", 250, "Автомат", "Полный", 28000, 4900000,
     "Премиальный скандинавский кроссовер. Богатая комплектация, системы безопасности.",
     "img/car-16.jpg", "seller3@carshop.example"),
]

TEST_USERS = [
    ("user@example.com", "password123", "Тестовый Пользователь"),
    ("ivan@example.com", "ivan12345", "Иван Петров"),
]


def seed():
    init_db()
    conn = get_connection()
    try:
        # cars
        existing = conn.execute("SELECT COUNT(*) AS n FROM cars").fetchone()["n"]
        if existing == 0:
            for c in CARS:
                conn.execute(
                    """
                    INSERT INTO cars (brand, model, year, body, engine, power,
                                      transmission, drive, mileage, price,
                                      description, image_url, seller_email)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    c,
                )
            print(f"[seed] Добавлено {len(CARS)} автомобилей")
        else:
            print(f"[seed] Автомобили уже есть ({existing}), пропускаем")

        # users
        for email, password, name in TEST_USERS:
            exists = conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone()
            if not exists:
                conn.execute(
                    "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
                    (email, hash_password(password), name),
                )
                print(f"[seed] Создан пользователь {email}")

        conn.commit()
    finally:
        conn.close()
    print("[seed] Готово")


if __name__ == "__main__":
    seed()