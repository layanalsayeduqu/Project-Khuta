import { useLanguage } from "../context/LanguageContext";

function Home() {
    const { t, lang } = useLanguage();

    const liveMatch = {
        id: 1,
        home_team: "Al Hilal",
        away_team: "Al Nassr",
        home_goals: 2,
        away_goals: 1,
        date: "2024-12-15T20:00:00",
        league: "Pro League"
    };

    const upcomingMatches = [
        { id: 1, home_team: "Al-Raed", away_team: "Al-Nassr", date: "2024-08-22T21:00:00", league: "Pro League" },
        { id: 2, home_team: "Al Riyadh", away_team: "Al Wehda Club", date: "2024-08-22T21:00:00", league: "Pro League" },
        { id: 3, home_team: "Al-Fayha", away_team: "Al Taawon", date: "2024-08-22T19:10:00", league: "Pro League" },
        { id: 4, home_team: "Al-Fateh", away_team: "Al-Qadisiyah FC", date: "2024-08-23T21:00:00", league: "Pro League" },
        { id: 5, home_team: "Al Orubah", away_team: "Al-Ahli Jeddah", date: "2024-08-23T21:00:00", league: "Pro League" },
        { id: 6, home_team: "Al Khaleej Saihat", away_team: "Damac", date: "2024-08-23T19:10:00", league: "Pro League" },
        { id: 7, home_team: "Al-Hilal Saudi FC", away_team: "Al Okhdood", date: "2024-08-24T21:00:00", league: "Pro League" },
        { id: 8, home_team: "Al-Ettifaq", away_team: "Al Shabab", date: "2024-08-24T21:00:00", league: "Pro League" },
        { id: 9, home_team: "Al-Ittihad FC", away_team: "Al Kholood", date: "2024-08-24T19:10:00", league: "Pro League" },
        { id: 10, home_team: "Al-Nassr", away_team: "Al-Fayha", date: "2024-08-27T21:00:00", league: "Pro League" },
        { id: 11, home_team: "Al-Qadisiyah FC", away_team: "Al-Raed", date: "2024-08-27T21:00:00", league: "Pro League" },
        { id: 12, home_team: "Al-Ahli Jeddah", away_team: "Al-Fateh", date: "2024-08-27T18:45:00", league: "Pro League" }
    ];

    const formatDate = (date) =>
        new Date(date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US");

    const formatTime = (date) =>
        new Date(date).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });

    return (
        <main className="page home-page">
            <section className="home-hero">
                <div className="hero-badge">{t.premiumExperience}</div>

                <h1 className="hero-logo-text">خُطى</h1>
                <h2>{t.heroTitle}</h2>
                <p>{t.heroSub}</p>

                <div className="home-hero-actions">
                    <button
                        className="home-main-btn"
                        onClick={() => window.location.href = "/tickets"}
                    >
                        {t.bookNow}
                    </button>

                    <button
                        className="home-outline-btn"
                        onClick={() => window.location.href = "/map"}
                    >
                        {t.exploreStadium}
                    </button>
                </div>

                <div className="hero-stats">
                    <div><strong>+500</strong><span>{t.events}</span></div>
                    <div><strong>+1M</strong><span>{t.ticketsSold}</span></div>
                    <div><strong>+50</strong><span>{t.stadiums}</span></div>
                </div>
            </section>

            <section className="today-section">
                <div className="section-head">
                    <div>
                        <h2>🏆 {t.todayMatches}</h2>
                        <p>{t.todayMatchesSub}</p>
                    </div>
                </div>

                <div className="live-match-card">
                    <div className="live-label">{t.liveNow}</div>

                    <div className="live-teams">
                        <div className="live-team">
                            <div className="team-circle blue"></div>
                            <h3>{liveMatch.home_team}</h3>
                            <strong>{liveMatch.home_goals}</strong>
                        </div>

                        <div className="live-score-divider">-</div>

                        <div className="live-team">
                            <div className="team-circle yellow"></div>
                            <h3>{liveMatch.away_team}</h3>
                            <strong>{liveMatch.away_goals}</strong>
                        </div>
                    </div>

                    <div className="match-info-row">
                        <span>📅 {formatDate(liveMatch.date)}</span>
                        <span>🕐 {formatTime(liveMatch.date)}</span>
                        <span>🏟️ {liveMatch.league}</span>
                    </div>
                </div>
            </section>

            <section className="upcoming-section">
                <h2>{t.upcomingMatches}</h2>

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
            </section>
        </main>
    );
}

export default Home;
