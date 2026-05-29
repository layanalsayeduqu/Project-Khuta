from fastapi import APIRouter
import psycopg2.extras
from decimal import Decimal
from database import get_db_connection

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.get("/matches")
def get_matches():
    connection = get_db_connection()
    cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cursor.execute("""
        SELECT
            id,
            home_team,
            away_team,
            match_time,
            stadium AS stadium_name,
            75 AS base_price,
            status
        FROM matches
        WHERE status IN ('upcoming', 'scheduled');
    """)

    matches = cursor.fetchall()
    cursor.close()
    connection.close()

    result = []

    for match in matches:
        result.append({
            "id": match["id"],
            "home_team": match["home_team"],
            "away_team": match["away_team"],
            "date": match["match_time"].strftime("%Y-%m-%d"),
            "time": match["match_time"].strftime("%H:%M"),
            "stadium_name": match["stadium_name"],
            "base_price": float(match["base_price"]) if isinstance(match["base_price"], Decimal) else match["base_price"],
            "status": match["status"]
        })

    return result