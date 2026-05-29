import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

const CLUBS = [
    { id: "alhilal", color: "#2f80ed" },
    { id: "alnassr", color: "#f2c94c" },
    { id: "alittihad", color: "#252238" },
    { id: "alahli", color: "#2ecc71" },
    { id: "alshabab", color: "#cbb7ff" },
    { id: "alettifaq", color: "#8b4a4a" }
];

const API_BASE_URL = "http://127.0.0.1:8000";

function FavoriteClub() {
    const { t, lang } = useLanguage();

    const [selectedClubId, setSelectedClubId] = useState(CLUBS[0].id);
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);

    const currentClub =
        CLUBS.find((club) => club.id === selectedClubId) || CLUBS[0];

    const getUserId = () => {
        const userId =
            localStorage.getItem("user_id") ||
            localStorage.getItem("userId") ||
            localStorage.getItem("id");

        return Number(userId);
    };

    const fetchFavoriteData = async () => {
        const userId = getUserId();

        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/matches/favorite?user_id=${userId}`
            );

            const data = await response.json();

            if (response.ok) {
                setMatches(data.matches || []);

                if (
                    data.favoriteClub &&
                    data.favoriteClub !== "EMPTY" &&
                    data.favoriteClub !== "NULL"
                ) {
                    setSelectedClubId(data.favoriteClub);
                }
            }
        } catch (error) {
            console.error("Failed to fetch favorite matches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavoriteData();
    }, []);

    const handleSaveFavorite = async () => {
        const userId = getUserId();

        if (!userId) {
            alert(
                lang === "ar"
                    ? "يجب تسجيل الدخول أولًا"
                    : "Please login first"
            );
            return;
        }

        setSaveLoading(true);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/user/update-favorite`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        favorite_club: selectedClubId
                    })
                }
            );

            if (response.ok) {
                await fetchFavoriteData();
            }
        } catch (error) {
            console.error("Save failed:", error);
            console.error("Error saving favorite club:", error);
            alert(
                lang === "ar"
                    ? "خطأ في الاتصال بالسيرفر"
                    : "Network error"
            );
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh"
                }}
            >
                <h2>{t.loading || "Loading..."}</h2>
            </div>
        );
    }

    return (
        <main className="page">
            <section className="favorite-page-pro">
                <div className="favorite-header">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        style={{ width: "120px", height: "auto" }}
                    />

                    <div>
                        <h1>{t.favorites || "My Favorites"}</h1>
                       
                    </div>
                </div>

                <div className="favorite-layout">
                    <aside className="favorite-card">
                        <h3>{t.selectClub}</h3>

                        <div className="club-stack">
                            {CLUBS.map((club) => (
                                <button
                                    key={club.id}
                                    type="button"
                                    className={`club-choice ${
                                        selectedClubId === club.id
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedClubId(club.id)
                                    }
                                >
                                    <span
                                        className="club-dot"
                                        style={{
                                            background: club.color
                                        }}
                                    />

                                    <span>{t[club.id] || club.id}</span>

                                    {selectedClubId === club.id && (
                                        <span className="club-check">
                                            ✓
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            className="save-btn"
                            onClick={handleSaveFavorite}
                            disabled={saveLoading}
                        >
                            {saveLoading
                                ? lang === "ar"
                                    ? "جاري الحفظ..."
                                    : "Saving..."
                                : t.saveFavoriteClub || "Save"}
                        </button>
                    </aside>

                    <section className="favorite-content">
                        <div className="selected-club-card">
                            <span
                                className="selected-club-logo"
                                style={{
                                    background: currentClub.color
                                }}
                            />

                            <div>
                                <h2>
                                    {t[currentClub.id] ||
                                        currentClub.id}
                                </h2>

                                <p>
                                    {matches.length}{" "}
                                    {t.upcomingMatchesCount ||
                                        "upcoming matches"}
                                </p>
                            </div>
                        </div>

                        <h3 className="favorite-section-title">
                            📅 {t.upcomingMatches || "Upcoming Matches"}
                        </h3>

                        <div className="favorite-matches">
                            {matches.length === 0 ? (
                                <p
                                    style={{
                                        padding: "30px",
                                        textAlign: "center",
                                        color: "#888"
                                    }}
                                >
                                    {t.noMatches ||
                                        "No upcoming matches"}
                                </p>
                            ) : (
                                matches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="favorite-match-card"
                                    >
                                        <div className="fav-teams">
                                            <div className="fav-team">
                                                <strong>
                                                    {t[
                                                        match.home_team_id
                                                    ] ||
                                                        match.home_team_id}
                                                </strong>
                                            </div>

                                            <div className="fav-score">
                                                {match.score || "VS"}
                                            </div>

                                            <div className="fav-team">
                                                <strong>
                                                    {t[
                                                        match.away_team_id
                                                    ] ||
                                                        match.away_team_id}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="fav-meta">
                                            <span>📅 {match.date}</span>
                                            <span>⏱ {match.time}</span>
                                            <span>🏟 {match.stadium}</span>
                                        </div>

                                        <div className="fav-footer">
                                            <div>
                                                <span className="fav-price-label">
                                                    {t.startsFrom}
                                                </span>

                                                <strong>
                                                    {" "}
                                                    {match.price || 150} SAR
                                                </strong>
                                            </div>

                                          <div className="fav-actions">
                                        <button
                                            className="details-btn"
                                            onClick={() => navigate("/tickets")}
                                        >
                                            {t.viewDetails}
                                        </button>

                                        <button
                                            className="book-btn-mini"
                                            onClick={() => navigate("/tickets")}
                                        >
                                            {t.bookTicket} →
                                        </button>
                                    </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}

export default FavoriteClub;