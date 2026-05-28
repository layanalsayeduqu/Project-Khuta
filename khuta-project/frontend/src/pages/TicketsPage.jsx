import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";

const FALLBACK_MATCHES = [
    {
        id: 1,
        home_team: "Al Hilal",
        home_team_ar: "الهلال",
        away_team: "Al Nassr",
        away_team_ar: "النصر",
        date: "Saturday 3 May",
        date_ar: "السبت 3 مايو",
        time: "8:00 PM",
        time_ar: "8:00 مساءً",
        stadium_name: "Prince Faisal Stadium",
        stadium_name_ar: "ملعب الأمير فيصل",
        base_price: 75
    },
    {
        id: 2,
        home_team: "Al Ittihad",
        home_team_ar: "الاتحاد",
        away_team: "Al Ahli",
        away_team_ar: "الأهلي",
        date: "Sunday 4 May",
        date_ar: "الأحد 4 مايو",
        time: "6:00 PM",
        time_ar: "6:00 مساءً",
        stadium_name: "Prince Faisal Stadium",
        stadium_name_ar: "ملعب الأمير فيصل",
        base_price: 60
    },
    {
        id: 3,
        home_team: "Al Shabab",
        home_team_ar: "الشباب",
        away_team: "Al Raed",
        away_team_ar: "الرائد",
        date: "Monday 5 May",
        date_ar: "الاثنين 5 مايو",
        time: "9:00 PM",
        time_ar: "9:00 مساءً",
        stadium_name: "Prince Faisal Stadium",
        stadium_name_ar: "ملعب الأمير فيصل",
        base_price: 50
    }
];

export default function TicketsPage() {
    const { t, lang } = useLanguage();

    // Returns the Arabic field if lang is "ar" and the field exists, otherwise falls back to the English field.
    const localize = (match, field) =>
        lang === "ar" && match[`${field}_ar`]
            ? match[`${field}_ar`]
            : match[field];
    const navigate = useNavigate();

    const [matches, setMatches] = useState(FALLBACK_MATCHES);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const response = await API.get("/api/tickets/matches");

            const apiMatches = Array.isArray(response.data)
                ? response.data
                : (response.data.matches || []);

            if (apiMatches.length > 0) {
                setMatches(apiMatches.slice(0, 12));
            }

        } catch (error) {
            console.error("Tickets matches error:", error);
        }
    };

    function toSeatMapInfo(match) {
        return {
            id: match.id,
            home: localize(match, "home_team"),
            away: localize(match, "away_team"),
            date: localize(match, "date"),
            time: localize(match, "time"),
            stadium: localize(match, "stadium_name"),
            price: match.base_price
        };
    }

    return (
            <main className="page">
            <section className="tickets-page-section">

                <div className="section-title">
                    <span />
                    {t.availableMatches || "Available Matches"}
                </div>

                <div className="tickets-grid">

                    {matches.map((match) => (

                        <div
                            className="ticket-card"
                            key={match.id}
                        >

                            <div className="teams">
                                {localize(match, "home_team")}

                                <span className="vs">
                                    {lang === "ar" ? "ضد" : "VS"}
                                </span>

                                {localize(match, "away_team")}
                            </div>

                            <div className="ticket-info">
                                <div>
                                    📅 {localize(match, "date")}
                                </div>

                                <div>
                                    🕐 {localize(match, "time")}
                                </div>

                                <div>
                                    🏟️ {localize(match, "stadium_name")}
                                </div>
                            </div>

                            <div className="price">
                                {t.startsFrom || "Starts from"}{" "}
                                {match.base_price} SAR

                                <div className="price-note">
                                    {t.priceByCategory ||
                                        "Depends on selected category"}
                                </div>
                            </div>

                            <button
                                className="book-btn"
                               onClick={() => {
                                      const token = localStorage.getItem("token");

                                      if (!token) {
                                          navigate("/login");
                                          return;
                                      }

                                      navigate("/seat-map", {
                                          state: {
                                              match: toSeatMapInfo(match)
                                          }
                                      });
                                  }}
                            >
                                {t.selectSeat} →
                            </button>

                        </div>
                    ))}

                </div>

            </section>

        </main>
    );
}