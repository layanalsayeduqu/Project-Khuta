from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import psycopg2.extras
from datetime import datetime
import uuid
import os
from jose import jwt, JWTError

from database import get_db_connection

router = APIRouter(prefix="/api/payment", tags=["Payment"])

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = os.getenv("ALGORITHM", "HS256")


class PurchaseRequest(BaseModel):
    match_id: int
    seat_id: int = 0
    seat_label: str
    amount: float
    payment_method: str = "card"
    card_last4: Optional[str] = None


def get_current_user(authorization: str):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization token missing")

    token = authorization.replace("Bearer ", "")

    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_user_name(payload):
    user_id = payload.get("user_id") or payload.get("id") or payload.get("sub")

    if not user_id:
        return "Guest"

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        cursor.execute("SELECT name FROM users WHERE id = %s;", (user_id,))
        user = cursor.fetchone()
        return user["name"] if user else "Guest"

    finally:
        cursor.close()
        connection.close()


def generate_transaction_code(seat_id: int) -> str:
    return f"TXN-{datetime.now().strftime('%Y%m%d%H%M%S')}-{seat_id:05d}"


def generate_qr_token() -> str:
    return uuid.uuid4().hex.upper()


@router.post("/purchase")
def purchase_ticket(
    data: PurchaseRequest,
    authorization: str = Header(None)
):
    payload = get_current_user(authorization)
    user_name = get_user_name(payload)

    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    try:
        cursor.execute("""
            UPDATE seats
            SET status = 'reserved'
            WHERE seat_id = %s
            AND match_id = %s
            AND status = 'available'
            RETURNING id, seat_id;
        """, (data.seat_label, data.match_id))

        seat = cursor.fetchone()

        if not seat:
            raise HTTPException(status_code=400, detail="Seat not available or already reserved")

        real_seat_id = seat["id"]
        transaction_code = generate_transaction_code(real_seat_id)

        cursor.execute("""
            INSERT INTO payment (
                booking_id,
                amount,
                payment_method,
                card_last4,
                status,
                transaction_code
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            real_seat_id,
            data.amount,
            data.payment_method,
            data.card_last4,
            "success",
            transaction_code
        ))

        payment_id = cursor.fetchone()["id"]

        cursor.execute("""
            UPDATE seats
            SET status = 'reserved'
            WHERE id = %s;
        """, (real_seat_id,))

        cursor.execute("""
            SELECT stadium AS stadium_name, match_time
            FROM matches
            WHERE id = %s;
        """, (data.match_id,))

        match_info = cursor.fetchone()

        stadium = match_info["stadium_name"] if match_info else ""
        match_datetime = match_info["match_time"] if match_info else datetime.now()

        qr_token = generate_qr_token()

        cursor.execute("""
            INSERT INTO tickets (
                qr_token,
                payment_id,
                match_id,
                seat_id,
                seat_number,
                user_name,
                price,
                status,
                stadium_name,
                match_date,
                match_time
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            qr_token,
            payment_id,
            data.match_id,
            real_seat_id,
            data.seat_label,
            user_name,
            data.amount,
            "active",
            stadium,
            match_datetime.date(),
            match_datetime.time()
        ))

        ticket_id = cursor.fetchone()["id"]

        connection.commit()

        return {
            "message": "Purchase successful",
            "ticket_code": f"KHT-{data.match_id}-{data.seat_label}-{datetime.now().strftime('%H%M%S')}",
            "transaction_code": transaction_code,
            "payment_id": payment_id,
            "status": "success",
            "qr_token": qr_token,
            "ticket_id": ticket_id
        }

    except HTTPException:
        connection.rollback()
        raise

    except Exception as error:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(error))

    finally:
        cursor.close()
        connection.close()