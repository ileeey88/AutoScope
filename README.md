# AutoScope — магазин автомобилей

Учебный проект по дисциплине «Введение в интернет-технологии».
**Вариант 11:** Магазин автомобилей (группа А — каталог и подбор).
**Стек:** Python (FastAPI), SQLite, HTML/CSS/JS.

## 🌐 Демо (ПР 4)
*   **Адрес приложения:** [https://auto-scope.ru](https://auto-scope.ru)
*   **Тестовая учетная запись:** 
    *   Email: `user@example.com`
    *   Пароль: `password123`
    *(На бесплатном хостинге база данных сбрасывается при перезапуске, поэтому тестовые данные создаются автоматически при старте).*

## 📋 Что уже сделано
*   **ПР 1:** 5 статических страниц (Главная, Каталог, Авто, Сравнение, Связь с продавцом), семантическая разметка, адаптивность до 360 px, Flexbox/Grid, общий `style.css`.
*   **ПР 2:** Фильтрация и сортировка каталога, валидация форм, внешний API (курс ЦБ РФ через прокси-запрос), интерактивные элементы (раскрывающиеся фильтры).
*   **ПР 3:** Сервер на FastAPI, база данных SQLite (4 таблицы), регистрация/вход с хешированием паролей, избранное (сравнение) для авторизованных, заявки продавцу.
*   **ПР 4:** Упаковка в Docker, деплой на Render, привязка собственного домена, настройка HTTPS.

## 🛠️ Используемые технологии
*   **Фронтенд:** HTML5, CSS3 (Grid, Flexbox, медиа-запросы), JavaScript (ES6+, Fetch API).
*   **Бэкенд:** Python 3.11, FastAPI, Uvicorn, Pydantic, Passlib (bcrypt).
*   **База данных:** SQLite (через стандартную библиотеку `sqlite3`).
*   **Инфраструктура:** Docker, Render, Git.

## 📂 Структура проекта
```text
.
├── app/
│   ├── main.py        # Точка входа FastAPI, все эндпоинты
│   ├── database.py    # Подключение к SQLite, создание таблиц
│   ├── auth.py        # Хеширование паролей, работа с сессией
│   ├── crud.py        # Параметризованные SQL-запросы
│   ├── schemas.py     # Pydantic-схемы
│   ├── email.py       # Отправка писем (опционально)
│   └── seed.py        # Наполнение БД тестовыми данными
├── static/
│   ├── css/style.css  # Единый файл стилей
│   ├── js/            # Скрипты (catalog.js, car.js, auth.js и др.)
│   └── img/           # Изображения и логотип
├── *.html             # HTML-страницы (index, catalog, car, compare, contact-seller, login, register, profile)
├── data/app.db        # Файл базы данных (создается автоматически, в .gitignore)
├── requirements.txt   # Зависимости Python
├── Dockerfile         # Инструкция для сборки контейнера
├── .env               # Секретные настройки (в .gitignore)
├── .gitignore
└── README.md
```
## Запуск на локальном компьютере
Клонируйте репозиторий и перейдите в папку проекта:

```text
git clone https://github.com/ileeey88/autoscope.git
cd autoscope
Создайте и активируйте виртуальное окружение:
```
```text
python -m venv .venv
```
# Windows:
```text
.venv\Scripts\activate
```
# Linux/Mac:
```text
source .venv/bin/activate
```
## Установите зависимости:

```text
pip install -r requirements.txt
```
## Создайте файл .env в корне проекта и добавьте секретный ключ:
```text
env
SECRET_KEY=super-secret-key-change-me-in-production
```
## Наполните базу данных тестовыми данными:
```text
python -m app.seed
```
## Запустите сервер:
```text
uvicorn app.main:app --reload --port 8000
```
Приложение будет доступно по адресу: [http://localhost:8000](http://localhost:8000).
Документация API (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs).

## 🐳 Запуск через Docker
Если у вас установлен Docker, можно запустить проект в изолированном контейнере:
```text
docker build -t autoscope .
docker run -p 8000:8000 --env-file .env autoscope
```
После запуска приложение будет доступно по адресу [http://localhost:8000](http://localhost:8000).

## 🗄️ Схема базы данных
#Приложение использует 4 таблицы:

##users##: id, email (уникальный), password_hash, name, created_at.

##cars: id##, brand, model, year, body, engine, power, transmission, drive, mileage, price, description, image_url, seller_email.

##favorites##: id, user_id (FK), car_id (FK), created_at. (Связь M:N между пользователями и машинами).

##inquiries##: id, car_id (FK), name, email, phone, message, created_at.

## 🔒 Безопасность
Пароли хранятся в базе данных только в виде bcrypt-хешей. Открытых паролей в БД нет (проверяется через DB Browser for SQLite).

SQL-запросы параметризованы. В коде (app/crud.py) отсутствует конкатенация строк при подстановке значений — используются плейсхолдеры ?.

Сессии защищены с помощью подписанных cookie (httponly, samesite=lax), что предотвращает доступ к ним из JavaScript.

Доступ к данным (избранное, профиль) проверяется на стороне сервера. Неавторизованный пользователь получит ошибку 401 Unauthorized.
