import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import API from "../api/api";

const BOUNDS = {
    minLon: 39.12215,
    maxLon: 39.12335,
    minLat: 22.08925,
    maxLat: 22.0904
};

const SVG_W = 820;
const SVG_H = 720;
const PAD = 45;

function toSVG(lon, lat) {
    const x =
        PAD +
        ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) *
            (SVG_W - PAD * 2);

    const y =
        PAD +
        ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) *
            (SVG_H - PAD * 2);

    return [x, y];
}

const SECTIONS_DATA = [
    { section: "N1", stand: "North", color: "#f59e0b", lonMin: 39.12235, lonMax: 39.122535, latMin: 22.0902, latMax: 22.0904 },
    { section: "N2", stand: "North", color: "#f59e0b", lonMin: 39.122555, lonMax: 39.12274, latMin: 22.0902, latMax: 22.0904 },
    { section: "N3", stand: "North", color: "#f59e0b", lonMin: 39.12276, lonMax: 39.122945, latMin: 22.0902, latMax: 22.0904 },
    { section: "N4", stand: "North", color: "#f59e0b", lonMin: 39.122965, lonMax: 39.12315, latMin: 22.0902, latMax: 22.0904 },

    { section: "S1", stand: "South", color: "#6b7280", lonMin: 39.12235, lonMax: 39.122535, latMin: 22.08925, latMax: 22.08945 },
    { section: "S2", stand: "South", color: "#6b7280", lonMin: 39.122555, lonMax: 39.12274, latMin: 22.08925, latMax: 22.08945 },
    { section: "S3", stand: "South", color: "#6b7280", lonMin: 39.12276, lonMax: 39.122945, latMin: 22.08925, latMax: 22.08945 },
    { section: "S4", stand: "South", color: "#6b7280", lonMin: 39.122965, lonMax: 39.12315, latMin: 22.08925, latMax: 22.08945 },

    { section: "W1", stand: "West", color: "#9b59b6", lonMin: 39.12215, lonMax: 39.12235, latMin: 22.0895, latMax: 22.089647 },
    { section: "W2", stand: "West", color: "#9b59b6", lonMin: 39.12215, lonMax: 39.12235, latMin: 22.089677, latMax: 22.089823 },
    { section: "W3", stand: "West", color: "#9b59b6", lonMin: 39.12215, lonMax: 39.12235, latMin: 22.089853, latMax: 22.09 },

    { section: "E1", stand: "East", color: "#2ecc71", lonMin: 39.12315, lonMax: 39.12335, latMin: 22.0895, latMax: 22.089647 },
    { section: "E2", stand: "East", color: "#2ecc71", lonMin: 39.12315, lonMax: 39.12335, latMin: 22.089677, latMax: 22.089823 },
    { section: "E3", stand: "East", color: "#2ecc71", lonMin: 39.12315, lonMax: 39.12335, latMin: 22.089853, latMax: 22.09 }
];

const NS_LONS = {
    N1: [39.1223833, 39.1224018, 39.1224203, 39.1224647, 39.1224832, 39.1225017],
    N2: [39.1225883, 39.1226068, 39.1226253, 39.1226697, 39.1226882, 39.1227067],
    N3: [39.1227933, 39.1228118, 39.1228303, 39.1228747, 39.1228932, 39.1229117],
    N4: [39.1229983, 39.1230168, 39.1230353, 39.1230797, 39.1230982, 39.1231167],
    S1: [39.1223833, 39.1224018, 39.1224203, 39.1224647, 39.1224832, 39.1225017],
    S2: [39.1225883, 39.1226068, 39.1226253, 39.1226697, 39.1226882, 39.1227067],
    S3: [39.1227933, 39.1228118, 39.1228303, 39.1228747, 39.1228932, 39.1229117],
    S4: [39.1229983, 39.1230168, 39.1230353, 39.1230797, 39.1230982, 39.1231167]
};

const N_LATS = [22.090225, 22.090275, 22.090325, 22.090375];
const S_LATS = [22.089425, 22.089375, 22.089325, 22.089275];
const W_LONS = [39.122325, 39.122275, 39.122225, 39.122175];
const E_LONS = [39.123175, 39.123225, 39.123275, 39.123325];

const WE_LATS = {
    W1: [22.0895264, 22.08954107, 22.08955573, 22.08959093, 22.0896056, 22.08962027],
    W2: [22.08970307, 22.08971773, 22.0897324, 22.0897676, 22.08978227, 22.08979693],
    W3: [22.08987973, 22.0898944, 22.08990907, 22.08994427, 22.08995893, 22.0899736],
    E1: [22.0895264, 22.08954107, 22.08955573, 22.08959093, 22.0896056, 22.08962027],
    E2: [22.08970307, 22.08971773, 22.0897324, 22.0897676, 22.08978227, 22.08979693],
    E3: [22.08987973, 22.0898944, 22.08990907, 22.08994427, 22.08995893, 22.0899736]
};

function getSeatCoords(section, row, seat) {
    const ri = row - 1;
    const si = seat - 1;

    if (["N1", "N2", "N3", "N4"].includes(section)) {
        const lon = NS_LONS[section]?.[si];
        const lat = N_LATS[ri];
        return lon != null && lat != null ? [lon, lat] : null;
    }
    if (["S1", "S2", "S3", "S4"].includes(section)) {
        const lon = NS_LONS[section]?.[si];
        const lat = S_LATS[ri];
        return lon != null && lat != null ? [lon, lat] : null;
    }
    if (["W1", "W2", "W3"].includes(section)) {
        const lon = W_LONS[ri];
        const lat = WE_LATS[section]?.[si];
        return lon != null && lat != null ? [lon, lat] : null;
    }
    if (["E1", "E2", "E3"].includes(section)) {
        const lon = E_LONS[ri];
        const lat = WE_LATS[section]?.[si];
        return lon != null && lat != null ? [lon, lat] : null;
    }
    return null;
}

const STAND_CATEGORIES = {
    North: { label: "Gold", multiplier: 1.5 },
    South: { label: "Silver", multiplier: 1.0 },
    West: { label: "VIP", multiplier: 2.0 },
    East: { label: "Premium", multiplier: 1.3 }
};

const [FIELD_X1] = toSVG(39.12235, 22.09);
const [FIELD_X2] = toSVG(39.12315, 22.09);
const [, FIELD_Y1] = toSVG(39.12275, 22.0902);
const [, FIELD_Y2] = toSVG(39.12275, 22.08945);

function seatColor(seat, isSelected) {
    if (isSelected) return "#7c3aed";
    if (seat.status === "sold") return "#374151";
    if (seat.status === "reserved") return "#9ca3af";

    const colors = {
        North: "#f59e0b",
        South: "#6b7280",
        West: "#9b59b6",
        East: "#2ecc71"
    };

    return colors[seat.stand] || "#6b7280";
}

export default function SeatMap() {
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const selectedMatch = location.state?.match;

    const [seats, setSeats] = useState([]);
    const [selected, setSelected] = useState({});

    useEffect(() => {
        if (!selectedMatch?.id) return;

        setSeats([]);

        API.get(`/api/seats/matches/${selectedMatch.id}`)
            .then((response) => {
                const dbSeats = Array.isArray(response.data) ? response.data : [];

                setSeats(
                    dbSeats
                        .map((db) => {
                            const coords = getSeatCoords(db.section, db.row, db.seat);
                            if (!coords) return null;

                            return {
                                seat_id: db.seat_id || `${db.section}-R${db.row}-S${db.seat}`,
                                stand: db.stand,
                                section: db.section,
                                row: db.row,
                                seat: db.seat,
                                status: db.status || "available",
                                dbId: db.id,
                                lon: coords[0],
                                lat: coords[1]
                            };
                        })
                        .filter(Boolean)
                );
            })
            .catch(() => setSeats([]));
    }, [selectedMatch?.id]);

    const toggle = (seat) => {
        if (seat.status !== "available") return;

        setSelected((previous) => {
            const next = { ...previous };

            if (next[seat.seat_id]) {
                delete next[seat.seat_id];
            } else {
                next[seat.seat_id] = seat;
            }

            return next;
        });
    };

    const selectedList = Object.values(selected);

    const seatPrice = (seat) => {
        const multiplier =
            STAND_CATEGORIES[seat.stand]?.multiplier || 1;

        return Math.round((selectedMatch?.price || 75) * multiplier);
    };

    const [error, setError] = useState("");

    const handleContinue = () => {
        setError("");

        const seatData = selectedList.map((seat) => ({
            id: seat.seat_id,
            dbId: seat.dbId ?? null,
            price: seatPrice(seat),
            cat: STAND_CATEGORIES[seat.stand]?.label || seat.stand
        }));

        navigate("/payment", {
            state: {
                booking: {
                    seats: seatData,
                    match: selectedMatch,
                    total: seatData.reduce(
                        (sum, seat) => sum + seat.price,
                        0
                    )
                }
            }
        });
    };

    return (
        <main className="page">
            <section className="sm-page">
                {selectedMatch && (
                    <div className="match-header">
                        <div className="match-teams">
                            {selectedMatch.home}{" "}
                            <span className="vs">VS</span>{" "}
                            {selectedMatch.away}
                        </div>

                        <div className="match-meta">
                            📅 {selectedMatch.date} · 🕐 {selectedMatch.time} · 🏟️{" "}
                            {selectedMatch.stadium}
                        </div>
                    </div>
                )}

                <div className="sm-layout">
                    <div className="map-card">
                        <div className="sm-title">
                            🏟️ {t.seatMap}
                        </div>

                        <svg
                            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                            className="stadium-svg"
                            style={{
                                width: "100%",
                                height: "auto",
                                display: "block"
                            }}
                        >
                            <rect
                                x={0}
                                y={0}
                                width={SVG_W}
                                height={SVG_H}
                                fill="#f8fafc"
                                rx={12}
                            />

                            <rect
                                x={FIELD_X1}
                                y={FIELD_Y1}
                                width={FIELD_X2 - FIELD_X1}
                                height={FIELD_Y2 - FIELD_Y1}
                                fill="#166534"
                                rx={6}
                            />

                            <rect
                                x={FIELD_X1 + 8}
                                y={FIELD_Y1 + 8}
                                width={FIELD_X2 - FIELD_X1 - 16}
                                height={FIELD_Y2 - FIELD_Y1 - 16}
                                fill="none"
                                stroke="rgba(255,255,255,0.3)"
                                strokeWidth={1.5}
                            />

                            <line
                                x1={FIELD_X1}
                                y1={(FIELD_Y1 + FIELD_Y2) / 2}
                                x2={FIELD_X2}
                                y2={(FIELD_Y1 + FIELD_Y2) / 2}
                                stroke="rgba(255,255,255,0.25)"
                                strokeWidth={1.5}
                            />

                            <circle
                                cx={(FIELD_X1 + FIELD_X2) / 2}
                                cy={(FIELD_Y1 + FIELD_Y2) / 2}
                                r={28}
                                fill="none"
                                stroke="rgba(255,255,255,0.25)"
                                strokeWidth={1.5}
                            />

                            <text
                                x={(FIELD_X1 + FIELD_X2) / 2}
                                y={(FIELD_Y1 + FIELD_Y2) / 2 + 5}
                                textAnchor="middle"
                                fill="rgba(255,255,255,0.5)"
                                fontSize={13}
                                fontWeight="700"
                                letterSpacing="2"
                            >
                                ⚽
                            </text>

                            {SECTIONS_DATA.map((section) => {
                                const [x1, y1] = toSVG(
                                    section.lonMin,
                                    section.latMax
                                );

                                const [x2, y2] = toSVG(
                                    section.lonMax,
                                    section.latMin
                                );

                                return (
                                    <rect
                                        key={section.section}
                                        x={x1}
                                        y={y1}
                                        width={x2 - x1}
                                        height={y2 - y1}
                                        fill={section.color}
                                        fillOpacity={0.12}
                                        stroke={section.color}
                                        strokeWidth={0.8}
                                        strokeOpacity={0.5}
                                        rx={2}
                                    />
                                );
                            })}

                            {SECTIONS_DATA.map((section) => {
                                const [x1, y1] = toSVG(
                                    section.lonMin,
                                    section.latMax
                                );

                                const [x2, y2] = toSVG(
                                    section.lonMax,
                                    section.latMin
                                );

                                const category =
                                    STAND_CATEGORIES[section.stand];

                                const price = category
                                    ? Math.round(
                                          (selectedMatch?.price || 75) *
                                              category.multiplier
                                      )
                                    : null;

                                const mx = (x1 + x2) / 2;
                                const my = (y1 + y2) / 2;

                                return (
                                    <g key={`label-${section.section}`}>
                                        <text
                                            x={mx}
                                            y={my - 4}
                                            textAnchor="middle"
                                            fill={section.color}
                                            fontSize={6}
                                            fontWeight="800"
                                            opacity={0.9}
                                        >
                                            {section.section}
                                        </text>

                                        {category && (
                                            <text
                                                x={mx}
                                                y={my + 3}
                                                textAnchor="middle"
                                                fill={section.color}
                                                fontSize={5}
                                                opacity={0.85}
                                            >
                                                {category.label}
                                            </text>
                                        )}

                                        {price !== null && (
                                            <text
                                                x={mx}
                                                y={my + 10}
                                                textAnchor="middle"
                                                fill={section.color}
                                                fontSize={5}
                                                opacity={0.8}
                                            >
                                                {price} SAR
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {seats.map((seat) => {
                                const [x, y] = toSVG(seat.lon, seat.lat);

                                const isSelected = !!selected[seat.seat_id];

                                const disabled = seat.status !== "available";

                                const fill = seatColor(seat, isSelected);

                                return (
                                    <rect
                                        key={seat.seat_id}
                                        x={x - 3.5}
                                        y={y - 3.5}
                                        width={7}
                                        height={7}
                                        rx={1.5}
                                        fill={fill}
                                        fillOpacity={disabled ? 0.45 : 1}
                                        stroke={isSelected ? "#5b21b6" : "none"}
                                        strokeWidth={1}
                                        cursor={disabled ? "not-allowed" : "pointer"}
                                        onClick={() => toggle(seat)}
                                    >
                                        <title>
                                            {seat.seat_id} |{" "}
                                            {STAND_CATEGORIES[seat.stand]?.label ||
                                                seat.stand}{" "}
                                            | {seatPrice(seat)} SAR | {seat.status}
                                        </title>
                                    </rect>
                                );
                            })}
                        </svg>

                        <div className="svg-legend">
                            <div className="legend-item">
                                <span
                                    className="legend-dot"
                                    style={{ background: "#9b59b6" }}
                                />
                                VIP
                            </div>

                            <div className="legend-item">
                                <span
                                    className="legend-dot"
                                    style={{ background: "#f59e0b" }}
                                />
                                Gold
                            </div>

                            <div className="legend-item">
                                <span
                                    className="legend-dot"
                                    style={{ background: "#2ecc71" }}
                                />
                                Premium
                            </div>

                            <div className="legend-item">
                                <span
                                    className="legend-dot"
                                    style={{ background: "#6b7280" }}
                                />
                                Silver
                            </div>

                            <div className="legend-item">
                                <span
                                    className="legend-dot"
                                    style={{ background: "#7c3aed" }}
                                />
                                {t.selected || "Selected"}
                            </div>

                            <div className="legend-item">
                                <span
                                    className="legend-dot"
                                    style={{ background: "#374151" }}
                                />
                                {t.sold}
                            </div>
                        </div>
                    </div>

                    <div className="sidebar">
                        <div className="summary-card">
                            <div className="card-title">
                                {t.selectSeat} ({selectedList.length})
                            </div>

                            {selectedList.length === 0 ? (
                                <div className="empty-msg">
                                    {t.noSeatsSelected || "No seats selected yet"}
                                </div>
                            ) : (
                                <div className="picked-list">
                                    {selectedList.map((seat) => (
                                        <div
                                            key={seat.seat_id}
                                            className="picked-row"
                                        >
                                            <button
                                                className="rm-btn"
                                                onClick={() => toggle(seat)}
                                                title="Remove"
                                            >
                                                ✕
                                            </button>

                                            <div className="picked-info">
                                                <span className="picked-id">
                                                    {seat.seat_id}
                                                </span>

                                                <span className="picked-stand">
                                                    {STAND_CATEGORIES[seat.stand]?.label ||
                                                        seat.stand}
                                                </span>
                                            </div>

                                            <span className="picked-price">
                                                {seatPrice(seat)} SAR
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="total-row">
                                <span>
                                    {t.total || "Total"} ({selectedList.length})
                                </span>

                                <span>
                                    {selectedList.reduce(
                                        (sum, seat) => sum + seatPrice(seat),
                                        0
                                    )}{" "}
                                    SAR
                                </span>
                            </div>

                            <button
                                className="continue-btn"
                                disabled={selectedList.length === 0}
                                onClick={handleContinue}
                            >
                                {t.confirmPayment} →
                            </button>

                            {error && (
                                <p className="field-error">
                                    {error}
                                </p>
                            )}


                            <button
                                className="back-btn"
                                onClick={() => navigate("/tickets")}
                            >
                                ← {t.back || "Back"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}