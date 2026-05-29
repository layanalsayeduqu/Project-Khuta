from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import random
import smtplib
import os
from email.mime.text import MIMEText

from database import get_db_connection

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
    confirm_password: str

# تخزين مؤقت للـ OTP
otp_storage = {}

# دالة إرسال الإيميل المخصصة لاستعادة كلمة المرور
def send_email(to_email: str, code: str):
    host = os.getenv("MAILTRAP_HOST")
    port = int(os.getenv("MAILTRAP_PORT", 587)) # منفذ 587 مناسب جداً لـ Gmail
    username = os.getenv("MAILTRAP_USERNAME")
    password = os.getenv("MAILTRAP_PASSWORD")
    mail_from = os.getenv("MAIL_FROM", "no-reply@khuta.com")

    if not host or not username or not password:
        raise HTTPException(
            status_code=500,
            detail="Mail settings are missing in .env"
        )

    # رسالة الإيميل
    message = MIMEText(
        f"Your Khuta password reset code is: {code}",
        "plain",
        "utf-8"
    )

    message["Subject"] = "Khuta Password Reset"
    message["From"] = mail_from
    message["To"] = to_email

    # عملية الإرسال
    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(username, password)
        server.sendmail(mail_from, to_email, message.as_string())


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE email = %s;",
            (data.email,)
        )

        user = cursor.fetchone()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # إنشاء OTP عشوائي
        otp = str(random.randint(100000, 999999))
        otp_storage[data.email] = otp

        # إرسال الكود للإيميل الفعلي (بدون كشفه في الشاشة)
        send_email(data.email, otp)

        return {
            "success": True,
            "message": "OTP sent to your email successfully"
        }

    except HTTPException as error:
        raise error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest):
    connection = None
    cursor = None

    try:
        if data.new_password != data.confirm_password:
            raise HTTPException(
                status_code=400,
                detail="Passwords do not match"
            )

        saved_otp = otp_storage.get(data.email)

        if not saved_otp:
            raise HTTPException(
                status_code=404,
                detail="OTP not found"
            )

        if saved_otp != data.otp:
            raise HTTPException(
                status_code=400,
                detail="Invalid OTP"
            )

        from utils.security import hash_password

        hashed_password = hash_password(
            data.new_password
        )

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            UPDATE users
            SET password_hash = %s
            WHERE email = %s;
        """,
        (
            hashed_password,
            data.email
        ))

        connection.commit()

        # حذف الـ OTP بعد الاستخدام
        del otp_storage[data.email]

        return {
            "success": True,
            "message": "Password reset successfully"
        }

    except HTTPException as error:
        raise error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()