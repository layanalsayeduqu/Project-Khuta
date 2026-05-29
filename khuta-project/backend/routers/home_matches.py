from fastapi import APIRouter, HTTPException
from database import get_db_connection

router = APIRouter(
    prefix="/home",
    tags=["Home Matches"]
)


@router.get("/matches")
def get_home_matches():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                id,
                home_team,
                away_team,
                match_time,
                stadium
            FROM matches
            ORDER BY match_time ASC;
        """)

        rows = cursor.fetchall()

        matches = []

        for row in rows:
            match_time = row["match_time"]

            matches.append({
                "id": row["id"],
                "home_team": row["home_team"],
                "away_team": row["away_team"],
                "date": match_time.isoformat(),
                "league": "دوري روشن السعودي",
                "stadium": row["stadium"]
            })

        live_match = matches[0] if matches else None
        upcoming_matches = matches

        if live_match:
            live_match["home_goals"] = 2
            live_match["away_goals"] = 1

        if live_match:
            live_match["home_goals"] = 2
            live_match["away_goals"] = 1

        return {
            "liveMatch": live_match,
            "upcomingMatches": upcoming_matches
        }

    except Exception as error:
        print("Home matches error:", error)
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch home matches"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()