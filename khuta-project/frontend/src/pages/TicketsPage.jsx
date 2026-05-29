import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { useLanguage } from "../context/LanguageContext";

export default function TicketsPage() {
    const { t, lang } = useLanguage();

    // Returns the Arabic field if lang is "ar" and the field exists, otherwise falls back to the English field.
    const localize = (match, field) =>
        lang === "ar" && match[`${field}_ar`]
            ? match[`${field}_ar`]
            : match[field];
    const navigate = useNavigate();

    const [matches, setMatches] = useState([]);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const response = await API.get("/api/tickets/matches");

            const apiMatches = Array.isArray(response.data)
                ? response.data
                : (response.data.matches || []);

            setMatches(apiMatches.slice(0, 12));

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