import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const CLUBS = [
    { id: "alhilal", name: "Al Hilal", color: "#2f80ed" },
    { id: "alnassr", name: "Al Nassr", color: "#f2c94c" },
    { id: "alittihad", name: "Al Ittihad", color: "#252238" },
    { id: "alahli", name: "Al Ahli", color: "#2ecc71" },
    { id: "alshabab", name: "Al Shabab", color: "#cbb7ff" },
    { id: "alettifaq", name: "Al Ettifaq", color: "#8b4a4a" }
];

const MATCHES = [
    {
        id: 1,
        home: "Al Hilal",
        away: "Al Nassr",
        homeColor: "#2f80ed",
        awayColor: "#f2c94c",
        score: "2 - 1",
        date: "2024-12-15",
        time: "20:00",
        stadium: "King Fahd Stadium",
        price: 150,
        live: true
    },
    {
        id: 2,
        home: "Al Ahli",
        away: "Al Hilal",
        homeColor: "#2ecc71",
        awayColor: "#2f80ed",
        score: "VS",
        date: "2024-12-20",
        time: "20:30",
        stadium: "Prince Abdullah Al Faisal Stadium",
        price: 250,
        live: false
    }
];

function FavoriteClub() {
    const { t } = useLanguage();

    const [selectedClub, setSelectedClub] = useState(CLUBS[0]);

    return (
        <main className="page">
            <section className="favorite-page-pro">

                <div className="favorite-header">
                   
                    {/* هنا تم إضافة الستايل المباشر لتصغير اللوقو */}
                    <img 
                        src="/logo.png" 
                        alt="Khuta Logo" 
                        style={{ width: '120px', height: 'auto' }} 
                    />
                

                    <div>
                        <h1>{t.favorites || "My Favorites"}</h1>
                        <p>
                            {t.favoriteSubtitle ||
                                "Select your favorite club and never miss a match"}
                        </p>
                    </div>
                </div>

                <div className="favorite-layout">

                    <aside className="favorite-card">
                        <h3>
                            {t.selectClub || "Select Your Club"}
                        </h3>

                        <div className="club-stack">
                            {CLUBS.map((club) => (
                                <button
                                    key={club.id}
                                    type="button"
                                    className={`club-choice ${
                                        selectedClub.id === club.id
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => setSelectedClub(club)}
                                >
                                    <span
                                        className="club-dot"
                                        style={{
                                            background: club.color
                                        }}
                                    />

                                    <span>{club.name}</span>

                                    {selectedClub.id === club.id && (
                                        <span className="club-check">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button className="save-btn">
                            {t.saveFavoriteClub || "Save Favorite Club"}
                        </button>
                    </aside>

                    <section className="favorite-content">

                        <div className="selected-club-card">
                            <span
                                className="selected-club-logo"
                                style={{
                                    background: selectedClub.color
                                }}
                            />

                            <div>
                                <h2>{selectedClub.name}</h2>
                                <p>2 upcoming matches</p>
                            </div>
                        </div>

                        <h3 className="favorite-section-title">
                            📅 {t.upcomingTickets || "Upcoming Matches"}
                        </h3>

                        <div className="favorite-matches">
                            {MATCHES.map((match) => (
                                <div
                                    key={match.id}
                                    className="favorite-match-card"
                                >
                                    {match.live && (
                                        <span className="live-pill">
                                            ● LIVE
                                        </span>
                                    )}

                                    <div className="fav-teams">
                                        <div className="fav-team">
                                            <span
                                                className="fav-team-logo"
                                                style={{
                                                    background: match.homeColor
                                                }}
                                            />
                                            <strong>{match.home}</strong>
                                        </div>

                                        <div className="fav-score">
                                            {match.score}
                                        </div>

                                        <div className="fav-team">
                                            <span
                                                className="fav-team-logo"
                                                style={{
                                                    background: match.awayColor
                                                }}
                                            />
                                            <strong>{match.away}</strong>
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
                                                {t.startsFrom || "Starting from"}
                                            </span>
                                            <strong>{match.price} SAR</strong>
                                        </div>

                                        <div className="fav-actions">
                                            <button className="details-btn">
                                                {t.viewDetails || "View Details"}
                                            </button>

                                            <button className="book-btn-mini">
                                                {t.bookTicket || "Book Ticket"} →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </section>

                </div>
            </section>
        </main>
    );
}

export default FavoriteClub;
