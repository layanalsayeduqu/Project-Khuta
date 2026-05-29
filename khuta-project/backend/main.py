from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_db_connection

from routers.create_account import router as create_account_router
from routers.login import router as login_router
from routers.update_profile import router as update_profile_router
from routers.reset_password import router as reset_password_router
from routers.email_verified import router as email_verified_router
from routers.view import router as map_router
from routers.tickets import router as tickets_router
from routers.seats import router as seats_router
from routers.payment import router as payment_router
from routers.bookings import router as bookings_router
from routers.favorite_club import router as favorite_club_router
from routers.home_matches import router as home_matches_router

app = FastAPI(
    title="Khuta API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(create_account_router)
app.include_router(login_router)
app.include_router(update_profile_router)
app.include_router(reset_password_router)
app.include_router(email_verified_router)

app.include_router(map_router, prefix="/api/v1", tags=["Map"])


app.include_router(tickets_router)
app.include_router(seats_router)
app.include_router(payment_router)
app.include_router(bookings_router)
app.include_router(favorite_club_router)
app.include_router(home_matches_router)


@app.get("/")
def home():
    return {
        "message": "Khuta API is running successfully"
    }


@app.get("/test-db")
def test_database():
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT NOW();")

        result = cursor.fetchone()

        cursor.close()
        connection.close()

        return {
            "success": True,
            "database_time": str(result["now"])
        }

    except Exception as error:
        return {
            "success": False,
            "error": str(error)
        }