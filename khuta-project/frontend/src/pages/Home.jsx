import { useLanguage } from "../context/LanguageContext";

function Home() {
    const { t, lang } = useLanguage();

    const liveMatch = {
        id: 1,
        home_team: t.alHilal,
        away_team: t.alNassr,
        home_goals: 2,
        away_goals: 1,
        date: "2024-12-15T20:00:00",
        league: t.saudiLeague
    };

    const upcomingMatches = [
        { id: 1, home_team: t.alRaed, away_team: t.alNassr, date: "2024-08-22T21:00:00", league: t.saudiLeague },
        { id: 2, home_team: t.alRiyadh, away_team: t.alWehda, date: "2024-08-22T21:00:00", league: t.saudiLeague },
        { id: 3, home_team: t.alFayha, away_team: t.alTaawon, date: "2024-08-22T19:10:00", league: t.saudiLeague }
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
            <section className="today-section">
                <h2 className="home-section-title">{t.liveScore}</h2>

                <div className="live-match-card">
                    <div className="live-label">
                        {t.liveNow} 🔴
                    </div>

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
                <h2 className="home-section-title">{t.upcomingMatchesHome}</h2>

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