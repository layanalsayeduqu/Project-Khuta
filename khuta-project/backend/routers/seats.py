from fastapi import APIRouter, HTTPException
import psycopg2.extras

from database import get_db_connection

router = APIRouter(prefix="/api/seats", tags=["Seats"])


@router.get("/matches/{match_id}")
def get_seats(match_id: int):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cursor.execute("""
            SELECT
                id,
                seat_id,
                stand,
                section,
                row,
                seat,
                status,
                stand AS category,
                (status = 'available') AS is_available
                FROM seats
                ORDER BY id;
                """)

        return cursor.fetchall()

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