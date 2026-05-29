from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from database import get_db_connection

router = APIRouter(tags=["Favorite Club"])


class FavoriteClubRequest(BaseModel):
    user_id: int = Field(..., ge=1)
    favorite_club: str


CLUB_MAPPER = {
    "alhilal": "الهلال",
    "alnassr": "النصر",
    "alittihad": "الاتحاد",
    "alahli": "الأهلي",
    "alshabab": "الشباب",
    "alettifaq": "الاتفاق"
}

REVERSE_CLUB_MAPPER = {
    "الهلال": "alhilal",
    "النصر": "alnassr",
    "الاتحاد": "alittihad",
    "الأهلي": "alahli",
    "الشباب": "alshabab",
    "الاتفاق": "alettifaq"
}


@router.get("/api/matches/favorite")
@router.get("/api/matches/favorite/")
def get_favorite_matches(user_id: int):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT favorite_club FROM users WHERE id = %s;",
            (user_id,)
        )

        user_data = cursor.fetchone()

        if not user_data:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        favorite_club = user_data["favorite_club"]

        if not favorite_club:
            return {
                "favoriteClub": None,
                "matches": []
            }

        favorite_club = str(favorite_club).strip()

        if favorite_club.upper() in ["EMPTY", "NULL", "NONE", ""]:
            return {
                "favoriteClub": None,
                "matches": []
            }

        favorite_club_arabic = CLUB_MAPPER.get(
            favorite_club,
            favorite_club
        )

        cursor.execute("""
            SELECT
                id,
                home_team,
                away_team,
                match_time,
                stadium
            FROM matches
            WHERE TRIM(home_team) = %s
               OR TRIM(away_team) = %s
            ORDER BY match_time ASC;
        """, (favorite_club_arabic, favorite_club_arabic))

        raw_matches = cursor.fetchall()

        formatted_matches = []

        for match in raw_matches:
            match_time = match["match_time"]

            formatted_matches.append({
                "id": match["id"],
                "home_team_id": REVERSE_CLUB_MAPPER.get(
                    match["home_team"],
                    match["home_team"]
                ),
                "away_team_id": REVERSE_CLUB_MAPPER.get(
                    match["away_team"],
                    match["away_team"]
                ),
                "date": match_time.strftime("%Y-%m-%d"),
                "time": match_time.strftime("%H:%M"),
                "stadium": match["stadium"],
                "score": "VS",
                "price": 150,
                "live": False
            })

        return {
            "favoriteClub": REVERSE_CLUB_MAPPER.get(
                favorite_club_arabic,
                favorite_club
            ),
            "matches": formatted_matches
        }

    except HTTPException as error:
        raise error

    except Exception as error:
        print("Favorite matches error:", error)
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch favorite matches"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


@router.post("/api/user/update-favorite")
@router.post("/api/user/update-favorite/")
def update_favorite_club(payload: FavoriteClubRequest):
    connection = None
    cursor = None

    try:
        favorite_club = payload.favorite_club.strip()

        if favorite_club not in CLUB_MAPPER:
            raise HTTPException(
                status_code=400,
                detail="Invalid favorite club"
            )

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE users
            SET favorite_club = %s
            WHERE id = %s
            RETURNING id;
            """,
            (favorite_club, payload.user_id)
        )

        updated_user = cursor.fetchone()

        if not updated_user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        connection.commit()

        return {
            "success": True,
            "favoriteClub": favorite_club
        }

    except HTTPException as error:
        raise error

    except Exception as error:
        print("Update favorite club error:", error)
        raise HTTPException(
            status_code=500,
            detail="Failed to save favorite club"
        )

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()