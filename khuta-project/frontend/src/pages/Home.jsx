import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

import stadiumImg from "../assets/stadium_mini.png";
import logoImg from "../assets/logo.png";

const API_BASE_URL = "http://127.0.0.1:8000";

function Home() {
    const { t, lang } = useLanguage();

    const [liveMatch, setLiveMatch] = useState(null);
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHomeMatches();
    }, []);

    const fetchHomeMatches = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/home/matches`);
            const data = await response.json();

            if (response.ok) {
                setLiveMatch(data.liveMatch);
                setUpcomingMatches(data.upcomingMatches || []);
            }
        } catch (error) {
            console.error("Home matches error:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US");

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });

    return (
        <main className="page home-page">
            <section
                className="hero-welcome-banner"
                style={{ backgroundImage: `url(${stadiumImg})` }}
            >
                <div className="hero-welcome-overlay"></div>

                <div className="hero-welcome-content">
                    <h1>
                        <img
                            src={logoImg}
                            alt="Logo"
                            className="hero-welcome-logo"
                        />
                        <span>{t.projectTitle}</span>
                    </h1>

                    <p>{t.projectSubtitle}</p>
                </div>
            </section>

            <section className="today-section">
                <h2 className="home-section-title">{t.liveScore}</h2>

                {loading ? (
                    <p className="empty-msg">{t.loading}</p>
                ) : liveMatch ? (
                    <div className="live-match-card">
                        <div className="live-label">
                            {t.liveNow} 🔴
                        </div>

                        <div className="live-teams">
                            <div className="live-team">
                                <div className="team-circle blue"></div>
                                <h3>{liveMatch.home_team}</h3>
                                <strong>{liveMatch.home_goals ?? "-"}</strong>
                            </div>

                            <div className="live-score-divider">-</div>

                            <div className="live-team">
                                <div className="team-circle yellow"></div>
                                <h3>{liveMatch.away_team}</h3>
                                <strong>{liveMatch.away_goals ?? "-"}</strong>
                            </div>
                        </div>

                        <div className="match-info-row">
                            <span>📅 {formatDate(liveMatch.date)}</span>
                            <span>🕐 {formatTime(liveMatch.date)}</span>
                            <span>🏟️ {liveMatch.league}</span>
                        </div>
                    </div>
                ) : (
                    <p className="empty-msg">{t.noMatches || "No matches found"}</p>
                )}
            </section>

            <section className="upcoming-section">
                <h2 className="home-section-title">{t.upcomingMatchesHome}</h2>

                {loading ? (
                    <p className="empty-msg">{t.loading}</p>
                ) : (
                    <div className="upcoming-grid">
                        {upcomingMatches.map((match) => (
                            <div className="upcoming-card" key={match.id}>
                                <div className="upcoming-teams">
                                    <div className="upcoming-team">
                                        <div className="team-circle purple"></div>
                                        <h3>{match.home_team}</h3>
                                    </div>

                                    <span className="vs-circle">VS</span>

                                    <div className="upcoming-team">
                                        <div className="team-circle green"></div>
                                        <h3>{match.away_team}</h3>
                                    </div>
                                </div>

                                <div className="match-info-row">
                                    <span>📅 {formatDate(match.date)}</span>
                                    <span>🕐 {formatTime(match.date)}</span>
                                    <span>🏟️ {match.league}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Home;