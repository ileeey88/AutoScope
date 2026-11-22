"""Опциональная отправка письма продавцу через SMTP.

Если SMTP_* не заданы в переменных окружения — просто возвращаем False,
заявка при этом уже сохранена в БД. Это best-effort: ошибки не ломают ответ API.
"""
import os
import smtplib
from email.message import EmailMessage


def send_inquiry_email(
    to_email: str,
    car_title: str,
    sender_name: str,
    sender_email: str,
    sender_phone: str | None,
    message: str,
) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    smtp_port = int(os.getenv("SMTP_PORT", "465"))

    if not all([smtp_host, smtp_user, smtp_pass]):
        print("[email] SMTP не настроен, письмо не отправлено (заявка в БД сохранена)")
        return False

    msg = EmailMessage()
    msg["Subject"] = f"Клиент {sender_name} связался с вами по поводу {car_title}"
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg.set_content(
        f"Поступила новая заявка по автомобилю: {car_title}\n\n"
        f"Имя: {sender_name}\n"
        f"Email: {sender_email}\n"
        f"Телефон: {sender_phone or '—'}\n\n"
        f"Сообщение:\n{message}\n"
    )

    try:
        with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=5) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True
    except Exception as exc:  
        print(f"[email] Ошибка отправки: {exc}")
        return False