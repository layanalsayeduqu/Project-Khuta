import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useLanguage } from "../context/LanguageContext";

const DATA = {
  field: "/data/field.geojson",
  building: "/data/building.geojson",
  seats3d: "/data/seats_3d.geojson",
  sections: "/data/sections.geojson",
  seats: "/data/seats.geojson",
  gates: "/data/gates.geojson",
  facilities: "/data/facilities.geojson",
  gates3d: "/data/gates_3d.geojson",
  facilities3d: "/data/facilities_3d.geojson",
  walkways3d: "/data/walkways_3d.geojson",
  surroundings: "/data/surroundings.geojson",
};
const API_BASE = "http://localhost:8000/api/v1";
const STAND_COLORS = {
  North: "#3498db",
  East:  "#27ae60",
  South: "#e67e22",
  West:  "#8e44ad",
};
const STAND_COLORS_DARK = {
  North: "#1f6fb7",
  East:  "#1e8449",
  South: "#ca6f1e",
  West:  "#7d3c98",
};
const FACILITY_CONFIG = {
  restroom: { icon: "🚻", color: "#0a68b4", label: "دورات مياه", labelEn: "Restrooms" },
  food:     { icon: "🍴", color: "#c71111", label: "مطاعم", labelEn: "Food & Beverage" },
  medical:  { icon: "✚",  color: "#116e08", label: "خدمات طبية", labelEn: "First Aid" },
  exit:     { icon: "🚪", color: "#00897B", label: "مخرج طوارئ", labelEn: "Emergency Exit" },
  prayer:   { icon: "🕌", color: "#6D4C41", label: "مصلى", labelEn: "Prayer Room" },
  gate:     { icon: "🚩", color: "#1B5E20", label: "بوابات الدخول", labelEn: "Entry Gate" },
};


let popupRefGlobal = null;
function App() {
  const mapRef      = useRef(null);
  const markersRef  = useRef([]);
  const [selectedSeat,   setSelectedSeat]   = useState(null);
  const [selectedGate,   setSelectedGate]   = useState(null);
  // يسمح باختيار أي نقطتين على الخريطة كبداية ونهاية، وليس بوابة ثم مقعد فقط
  const selectedRouteRef = useRef({ start: null, end: null });
  // نخزن بيانات الممرات حتى نرسل للباك أقرب نقطة مشي بدل نقطة داخل المدرج
  const walkwaysRef = useRef(null);
  const [seatFilter,     setSeatFilter]     = useState("all");
  const [activeFilter,   setActiveFilter]   = useState("all");
const [msg, setMsg] = useState("");  const [routeDrawn,     setRouteDrawn]     = useState(false);
  
const { lang, t } = useLanguage();

  const filterOptions = useMemo(() => [
    { value: "all",       label: lang === "ar" ? "كل المقاعد" : "All Seats",   color: "#555" },
    { value: "available", label: lang === "ar" ? "المتاحة" : "Available",      color: "#27ae60" },
    { value: "reserved",  label: lang === "ar" ? "المحجوزة" : "Reserved",     color: "#95a5a6" },
    { value: "sold",      label: lang === "ar" ? "المباعة" : "Sold",      color: "#e74c3c" },
  ], [lang]);
  const legendStands = useMemo(() => [
    { key: "North", label: "المدرج الشمالي",  ar: "N" },
    { key: "East",  label: "المدرج الشرقي",   ar: "E" },
    { key: "South", label: "المدرج الجنوبي",  ar: "S" },
    { key: "West",  label: "المدرج الغربي",   ar: "W" },
  ], []);
  const facilityLegend = useMemo(() => [
    { type: "gate",     label: "بوابات الدخول" },
    { type: "restroom", label: "دورات مياه" },
    { type: "food",     label: "مطاعم ومشروبات" },
    { type: "medical",  label: "خدمات طبية" },
  ], []);
  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
       pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
      style: {
        version: 8,
        sources: {},
        layers: [{
          id: "background",
          type: "background",
          paint: { "background-color": "#ebe7d8" },
        }],
       glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
      },
      center: [39.12275, 22.08975],
      zoom: 19.15,
      pitch: 22,
      bearing: 0,
      antialias: true,
    });
    mapRef.current = map;
    const handleMapResize = () => map.resize();
    window.addEventListener("resize", handleMapResize);
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.on("load", async () => {
      setTimeout(() => map.resize(), 150);
      
      try {
        const [fieldData, building, sections, seats, seats3d, gates, facilities, gates3d, facilities3d ,walkways3d,surroundings] = await Promise.all([
          fetch(DATA.field).then(r => r.json()),
          fetch(DATA.building).then(r => r.json()),
          fetch(DATA.sections).then(r => r.json()),
          fetch(DATA.seats).then(r => r.json()),
          fetch(DATA.seats3d).then(r => r.json()),
          fetch(DATA.gates).then(r => r.json()),
          fetch(DATA.facilities).then(r => r.json()),
          fetch(DATA.gates3d).then(r => r.json()),
          fetch(DATA.facilities3d).then(r => r.json()),
          fetch(DATA.walkways3d).then(r => r.json()),
        fetch(DATA.surroundings).then(r => r.json()),
        ]);
        walkwaysRef.current = walkways3d;
map.addSource("surroundings", { type: "geojson", data: surroundings });

map.addLayer({
  id: "surroundings-3d",
  type: "fill-extrusion",
  source: "surroundings",
  filter: ["!=", ["get", "type"], "tree"],
  paint: {
    "fill-extrusion-color": ["get", "color"],
    "fill-extrusion-height": ["get", "height"],
    "fill-extrusion-base": ["get", "base"],
    "fill-extrusion-opacity": 1
  }
});
surroundings.features
  .filter(f => f.properties.type === "tree")
  .forEach((feature, i) => {

    const trees = ["🌴","🌳","🌲"];
    const icon = trees[i % trees.length];

    const el = document.createElement("div");
    el.className = "tree-marker";
    el.innerHTML = icon;

    new maplibregl.Marker({
      element: el,
      anchor: "center"
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
  });
        // ── جسم الاستاد من ملف building.geojson ──
        map.addSource("stadium-building", { type: "geojson", data: building });
        map.addLayer({
          id: "building-base",
          type: "fill-extrusion",
          source: "stadium-building",
          filter: ["==", ["get", "part"], "outer_floor"],
          paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 1,
          },
        });
        map.addLayer({
          id: "building-concourse",
          type: "fill-extrusion",
          source: "stadium-building",
          filter: ["==", ["get", "part"], "concourse"],
          paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 1,
          },
        });
        map.addLayer({
          id: "building-inner-rim",
          type: "fill-extrusion",
          source: "stadium-building",
          filter: ["==", ["get", "part"], "inner_rim"],
          paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 0.95,
          },
        });
        map.addLayer({
          id: "building-outer-wall",
          type: "fill-extrusion",
          source: "stadium-building",
          filter: ["==", ["get", "part"], "outer_wall"],
          paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 0.95,
          },
        });
 

        // ── أرضية الملعب ──
        const field = fieldData;
        const fieldDecor = makeFieldDecor(field);
        map.addSource("field", { type: "geojson", data: field });
        map.addLayer({
          id: "field-fill",
          type: "fill",
          source: "field",
          paint: { "fill-color": "#2e8b3c", "fill-opacity": 1 },
        });
        // زخارف الملعب
        map.addSource("field-decor", { type: "geojson", data: fieldDecor });
        map.addLayer({
          id: "field-stripes-dark",
          type: "fill",
          source: "field-decor",
          filter: ["==", ["get", "kind"], "stripeDark"],
          paint: { "fill-color": "#1e7a30", "fill-opacity": 0.5 },
        });
        map.addLayer({
          id: "field-stripes-light",
          type: "fill",
          source: "field-decor",
          filter: ["==", ["get", "kind"], "stripeLight"],
          paint: { "fill-color": "#35a04a", "fill-opacity": 0.45 },
        });
        map.addLayer({
          id: "field-border",
          type: "line",
          source: "field",
          paint: { "line-color": "#ffffff", "line-width": 3, "line-opacity": 1 },
        });
        map.addLayer({
          id: "field-lines",
          type: "line",
          source: "field-decor",
          filter: ["==", ["get", "kind"], "line"],
          paint: { "line-color": "#ffffff", "line-width": 2, "line-opacity": 0.95 },
        });
        map.addLayer({
          id: "field-spots",
          type: "circle",
          source: "field-decor",
          filter: ["==", ["get", "kind"], "spot"],
          paint: { "circle-radius": 3, "circle-color": "#ffffff", "circle-opacity": 0.95 },
        });
        // ── ممرات 3D ──
        map.addSource("walkways-3d", {
          type: "geojson",
          data: walkways3d,
        });
map.addLayer({
  id: "walkways-3d",
  type: "fill-extrusion",
  source: "walkways-3d",
  paint: {
    "fill-extrusion-color": "#f4eee2",
    "fill-extrusion-height": 0.8,
    "fill-extrusion-base": 0.3,
    "fill-extrusion-opacity": 1
  }
});
map.addLayer({
  id: "walkways-outline",
  type: "line",
  source: "walkways-3d",
          paint: {
    "line-color": "#8d877c",
    "line-width": 1.2,
    "line-opacity": 0.55
  }
});
        // ── السكشنات (المدرجات) ──
        map.addSource("sections", { type: "geojson", data: sections });
        map.addLayer({
          id: "sections-3d",
          type: "fill-extrusion",
          source: "sections",
          paint: {
            "fill-extrusion-color": [
              "case",
              ["==", ["get", "stand"], "North"], STAND_COLORS.North,
              ["==", ["get", "stand"], "East"],  STAND_COLORS.East,
              ["==", ["get", "stand"], "South"], STAND_COLORS.South,
              ["==", ["get", "stand"], "West"],  STAND_COLORS.West,
              "#5897c7",
            ],
            "fill-extrusion-height": ["get", "height"], // Uses the height values like 4, 8, 12, 16
            "fill-extrusion-base": 0,
          },
        });
        map.addLayer({
          id: "sections-border",
          type: "line",
          source: "sections",
          paint: { "line-color": "rgba(255,255,255,0.95)", "line-width": 1.4, "line-opacity": 0.85 },
        });
        map.moveLayer("walkways-3d");
       map.moveLayer("walkways-outline");
        // ── ممرات بين السكشنات ──
        const aisles = makeSectionAisles(sections);
        map.addSource("section-aisles", { type: "geojson", data: aisles });
        map.addLayer({
          id: "section-aisles",
          type: "line",
          source: "section-aisles",
           paint: {
    "line-opacity": 0,
  },
        });
        // ── أسماء السكشنات ──
        map.addLayer({
          id: "section-labels",
          type: "symbol",
          source: "sections",
          layout: {
            "text-field": ["coalesce", ["get", "section"], ["get", "name"], ["get", "id"]],
            "text-size": 18,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-allow-overlap": false,
            "text-ignore-placement": false,
          },
          paint: {
            "text-color": "#ffffff",
            "text-halo-color": "rgba(0,0,0,0.6)",
            "text-halo-width": 2.5,
          },
        });
        // ── المقاعد ──
        const seatPoints = normalizeSeatPoints(seats);
        map.addSource("seats", { type: "geojson", data: seatPoints });
        // كراسي 3D: للعرض فقط، بينما نقاط seats تبقى موجودة للباك إند والاختيار
        map.addSource("seats-3d", { type: "geojson", data: seats3d });
       map.addLayer({
  id: "seats-3d",
  type: "fill-extrusion",
  source: "seats-3d",
  paint: {
    "fill-extrusion-color": "#4e524c",
   "fill-extrusion-height": ["get", "visual_height"],
"fill-extrusion-base": ["get", "visual_base"],
    "fill-extrusion-opacity": 1,
  },
});
        // طبقة المقاعد الأساسية مخفية لتجنب ازدحام النقاط
        map.addLayer({
          id: "seats",
          type: "circle",
          source: "seats",
          paint: { "circle-radius": 0, "circle-opacity": 0 }
        });
     map.addLayer({
  id: "seats-points",
  type: "circle",
  source: "seats",
  paint: {
    "circle-radius": 0,
    "circle-opacity": 0,
  },
});
map.addLayer({
  id: "seats-click",
  type: "circle",
  source: "seats",
  paint: {
    "circle-radius": 8,
    "circle-opacity": 0,
  },
});
        map.addLayer({
          id: "seat-labels",
          type: "symbol",
          source: "seats",
          minzoom: 21,
          layout: {
            "text-field": ["to-string", ["get", "seat"]],
            "text-size": 0,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-allow-overlap": true,
          },
          paint: { "text-color": "#fff", "text-halo-color": "#000", "text-halo-width": 0 },
        });
        // ── البوابات: نقاط مخفية للباك إند + فتحات 3D على الجدار ──
        map.addSource("gates", { type: "geojson", data: gates });
        map.addLayer({
          id: "gates-click-area",
          type: "circle",
          source: "gates",
          paint: {
            "circle-radius": 18,
            "circle-color": "#1B5E20",
            "circle-opacity": 0,
            "circle-stroke-width": 0,
          },
        });
        map.addSource("gates-3d", { type: "geojson", data: gates3d });
         addGateMarkers(map, gates);
         map.addLayer({
          id: "gates-3d",
          type: "fill-extrusion",
          source: "gates-3d",
          paint: {
            "fill-extrusion-color": ["coalesce", ["get", "color"], "#263238"],
            "fill-extrusion-height": ["coalesce", ["get", "height"], 4.5],
            "fill-extrusion-base": ["coalesce", ["get", "base"], 0],
            "fill-extrusion-opacity": 0.96,
          },
        });
        // ── المرافق: نقاط للباك إند + صناديق 3D صغيرة على الجدار ──
        map.addSource("facilities", { type: "geojson", data: facilities });
        map.addSource("facilities-3d", { type: "geojson", data: facilities3d });
        map.addLayer({
          id: "facilities-3d",
          type: "fill-extrusion",
          source: "facilities-3d",
          paint: {
           "fill-extrusion-color": ["get", "color"],
           "fill-extrusion-height": ["get", "height"],
           "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 0.92,
          },
        });
      map.addLayer({
  id: "facilities-3d-labels",
  type: "symbol",
  source: "facilities-3d",
  layout: {
    "text-field": ["get", "icon"],
    "text-size": 25,
    "text-allow-overlap": true
  },
  paint: {
    "text-color": "#ffffff",
    "text-halo-color": "#222",
    "text-halo-width": 3
  }
});
addFacilityMarkers(map, facilities);
        // ── خط المسار ──
        map.addSource("route", { type: "geojson", data: emptyRoute() });
        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#f1c40f", "line-width": 10, "line-opacity": 0.3, "line-blur": 4 },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#1a1a1a", "line-width": 5.5, "line-opacity": 0.9 },
        });
        map.addLayer({
          id: "route-dashed",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#f1c40f", "line-width": 2.5, "line-dasharray": [1.2, 1.6] },
        });
        // ── أحداث النقر ──
        let lastSelectedId = null;
       map.on("click", "seats-click", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          if (lastSelectedId !== null) {
            try { map.setFeatureState({ source: "seats", id: lastSelectedId }, { selected: false }); } catch {}
          }
          lastSelectedId = f.id;
          map.setFeatureState({ source: "seats", id: f.id }, { selected: true });
          const p = f.properties || {};
          const coords = f.geometry.coordinates;
          
          // قراءة اللغة من المرجع لضمان جلب الحالة الصحيحة للبوب اب
          const currentLang = mapRef.current?.customLang || "en";
          const labels = t;
          
          selectRoutePoint(
            { ...p, type: "seat", label: p.seat_id || p.id || p.seat || "Seat", coordinates: coords },
            e.lngLat,
            `<div class="pop-title">${p.seat_id || p.id || "Seat"}</div>
             <div class="pop-row"><span>Section</span><b>${p.section || "-"}</b></div>
             <div class="pop-row"><span>Row</span><b>${p.row || "-"}</b></div>
             <div class="pop-row"><span>Status</span><b class="status-${p.status || "available"}">${p.status === "sold" ? labels.statusSold : p.status === "reserved" ? labels.statusReserved : labels.statusAvailable}</b></div>`
          );
        });
        map.on("click", "gates-click-area", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const currentLang = mapRef.current?.customLang || "en";
          selectRoutePoint(
            { ...f.properties, type: "gate", label: f.properties?.name || "Gate", coordinates: f.geometry.coordinates },
            e.lngLat,
            `<div class="pop-title">${f.properties?.name || "Gate"}</div>
             <div class="pop-row"><span>✅ ${t.gateClickArea}</span></div>`
          );
        });
        map.on("click", "gates-3d", (e) => {
          const f = e.features?.[0];
          if (!f) return;
          const currentLang = mapRef.current?.customLang || "en";
          showPopup(map, e.lngLat,
            `<div class="pop-title">${f.properties?.name || "Gate"}</div>
             <div class="pop-row"><span>${t.gate3d}</span></div>`
          );
        });
       map.on("mouseenter", "seats-click", () => (map.getCanvas().style.cursor = "pointer"));
       map.on("mouseleave", "seats-click", () => (map.getCanvas().style.cursor = ""));
        map.on("mouseenter", "gates-click-area", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "gates-click-area", () => (map.getCanvas().style.cursor = ""));
        map.on("mouseenter", "gates-3d", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "gates-3d", () => (map.getCanvas().style.cursor = ""));
        map.on("mouseenter", "facilities-3d", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "facilities-3d", () => (map.getCanvas().style.cursor = ""));
        map.on("mouseenter", "walkways-3d", () => (map.getCanvas().style.cursor = "default"));
        map.on("mouseleave", "walkways-3d", () => (map.getCanvas().style.cursor = ""));
      } catch (err) {
        console.error("Map error:", err);
        const currentLang = mapRef.current?.customLang || "en";
        setMsg(currentLang === "ar" ? "خطأ في تحميل الخريطة، تحقق من Console" : "Map error, check Console");
      }
    });
    return () => {
      markersRef.current.forEach(m => m.remove());
      popupRefGlobal?.remove?.();
      window.removeEventListener("resize", handleMapResize);
      map.remove();
    };
  }, []);
 
  // تمرير اللغة الحالية إلى مرجع الخريطة لضمان جلبها داخل أحداث الخريطة دون إعادة تحميل الـ useEffect
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.customLang = lang;
    }
    setMsg(t.routeMsg);
  }, [lang]);

  function getPointLabel(point) {
    return (
      point?.label ||
      point?.name ||
      point?.name_ar ||
      point?.seat_id ||
      point?.id ||
      point?.seat ||
      "Selected Point"
    );
  }

  function pointDistance(a, b) {
    if (!a || !b) return Number.POSITIVE_INFINITY;

    const dx = Number(a[0]) - Number(b[0]);
    const dy = Number(a[1]) - Number(b[1]);

    return Math.sqrt(dx * dx + dy * dy);
  }

  function getAllWalkwayPoints() {
    const data = walkwaysRef.current;

    if (!data?.features) return [];

    const points = [];

    function collect(coords) {
      if (!coords) return;

      if (typeof coords[0] === "number") {
        points.push(coords);
        return;
      }

      coords.forEach(collect);
    }

    data.features.forEach((feature) => {
      collect(feature.geometry?.coordinates);
    });

    return points;
  }

  function snapToNearestWalkway(originalCoords) {
    const walkwayPoints = getAllWalkwayPoints();

    if (!originalCoords || !walkwayPoints.length) {
      return originalCoords;
    }

    let nearest = walkwayPoints[0];
    let minDistance = pointDistance(originalCoords, nearest);

    walkwayPoints.forEach((point) => {
      const d = pointDistance(originalCoords, point);

      if (d < minDistance) {
        minDistance = d;
        nearest = point;
      }
    });

    return nearest;
  }

  function selectRoutePoint(point, lngLat, popupHtml) {
    const currentLang = mapRef.current?.customLang || "en";
    const displayCoords = point.coordinates;
    const routeCoords = snapToNearestWalkway(displayCoords);

    const routePoint = {
      ...point,
      label: getPointLabel(point),
      coordinates: displayCoords,
      // coordinates للعرض، و routeCoordinates للحساب مع الباك
      routeCoordinates: routeCoords,
    };

    const current = selectedRouteRef.current;

    // إذا لم توجد نقطة بداية، أو كان هناك مسار مكتمل، ابدأ اختيار جديد
    if (!current.start || (current.start && current.end)) {
      selectedRouteRef.current = { start: routePoint, end: null };
      setSelectedGate(routePoint);
      setSelectedSeat(null);
      setRouteDrawn(false);
      mapRef.current?.getSource("route")?.setData(emptyRoute());
      setMsg(currentLang === "ar" ? "تم اختيار نقطة البداية. اختاري نقطة النهاية." : "Start point selected. Select the destination point.");
    } else {
      selectedRouteRef.current = { ...current, end: routePoint };
      setSelectedSeat(routePoint);
      setMsg(currentLang === "ar" ? "تم اختيار نقطتين. اضغطي Find Best Route لحساب المسار." : "Two points selected. Click Find Best Route to calculate the route.");
    }

    if (popupHtml) {
      showPopup(mapRef.current, lngLat || routePoint.coordinates, popupHtml);
    }
  }

  // ── fetchRoute: calls backend pgr_dijkstra and draws the result on the map ──
  async function fetchRoute() {
    if (!selectedGate || !selectedSeat) {
      setMsg(lang === "ar" ? "اختاري أي نقطتين على الخريطة أولاً." : "Select any two points on the map first.");
      return;
    }

    const startCoords = selectedGate.routeCoordinates || selectedGate.coordinates;
    const endCoords = selectedSeat.routeCoordinates || selectedSeat.coordinates;

    const [gateLon, gateLat] = startCoords;
    const [seatLon, seatLat] = endCoords;
    const floor = 1;

    const params = new URLSearchParams({
      start_lon: gateLon,
      start_lat: gateLat,
      end_lon:   seatLon,
      end_lat:   seatLat,
      floor:     floor,
    });
    const url = `${API_BASE}/directions/coords?${params}`;

    try {
      setMsg(lang === "ar" ? "جاري حساب المسار..." : "Calculating route...");
      const res  = await fetch(url);
      const data = await res.json();

      if (data.error) {
        setMsg(lang === "ar" ? `خطأ: ${data.reason || data.error}` : `Error: ${data.reason || data.error}`);
        return;
      }

      mapRef.current?.getSource("route")?.setData(data);
      setRouteDrawn(true);

      const info = data.route_info || {};
      const dist = info.route_length ? `${parseFloat(info.route_length).toFixed(0)} m` : "";
      const time = info.walk_time   ? `${Math.ceil(info.walk_time / 60)} min`           : "";
      setMsg(
        lang === "ar"
          ? `المسار: ${dist} — ${time}`
          : `Route: ${dist} — ${time}`
      );

      if (data.features?.length) {
        const coords = data.features.flatMap(f =>
          f.geometry.type === "LineString" ? f.geometry.coordinates : []
        );
        if (coords.length) {
          const lngs = coords.map(c => c[0]);
          const lats  = coords.map(c => c[1]);
          mapRef.current?.fitBounds(
            [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
            { padding: 80, duration: 800 }
          );
        }
      }
    } catch (err) {
      setMsg(lang === "ar" ? "فشل الاتصال بالخادم" : "Failed to connect to backend");
      console.error("fetchRoute error:", err);
    }
  }

  function resetSelection() {
    selectedRouteRef.current = { start: null, end: null };
    setSelectedGate(null);
    setSelectedSeat(null);
    setRouteDrawn(false);
    setMsg(t.routeMsg);
    mapRef.current?.getSource("route")?.setData(emptyRoute());
  }
 function addGateMarkers(map, data) {
  data.features.forEach((feature) => {
    const p = feature.properties || {};
    const type = String(p.type || "").toLowerCase();
    const num = String(p.name || p.id || "").replace(/\D/g, "");

    const el = document.createElement("button");
if (type === "exit") {
  el.className = "exit-marker old-map-marker";
  el.innerHTML = `
    <span class="old-exit-symbol">↪</span>
  `;
  el.title = p.name || "Emergency Exit";
} else {
  el.className = "gate-marker old-map-marker";
  el.innerHTML = `
    <span class="old-gate-text">GATE</span>
    <span class="old-gate-num">${num}</span>
  `;
  el.title = p.name || "Gate";
}
    el.onclick = () => {
      const currentLang = mapRef.current?.customLang || "en";
      selectRoutePoint(
        { ...p, type: type === "exit" ? "exit" : "gate", label: p.name || (type === "exit" ? "Emergency Exit" : "Gate"), coordinates: feature.geometry.coordinates },
        feature.geometry.coordinates,
        `<div class="pop-title">${p.name || "Gate"}</div>
         <div class="pop-row"><span>${t.locationSelected}</span></div>`
      );
    };

   const marker = new maplibregl.Marker({
  element: el,
  anchor: "center"
})
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);

    markersRef.current.push(marker);
  });
}
function addFacilityMarkers(map, data) {
  data.features.forEach((feature) => {
    const p = feature.properties || {};
    const type = String(p.type || p.category || "").toLowerCase();

    const cfg =
      FACILITY_CONFIG[type] ||
      { icon: "📍", color: "linear-gradient(135deg,#666,#444)", label: p.name_ar || p.name || "مرفق", labelEn: "Facility" };

    const el = document.createElement("button");
    el.className = `facility-marker fac-${type}`;

    el.innerHTML = `
      <div class="facility-wrap">
        <div class="facility-icon">${cfg.icon}</div>
      </div>
    `;

    el.querySelector(".facility-icon").style.background = cfg.color;

    el.title = p.name_ar || p.name || cfg.label;

    el.onclick = () => {
      const currentLang = mapRef.current?.customLang || "en";
      const displayLabel = currentLang === "ar" ? (p.name_ar || cfg.label) : (p.name || cfg.labelEn);
      selectRoutePoint(
        { ...p, type: type || "facility", label: displayLabel, coordinates: feature.geometry.coordinates },
        feature.geometry.coordinates,
        `<div class="pop-title">${displayLabel}</div>
         <div class="pop-row"><span>${cfg.icon} ${displayLabel}</span></div>`
      );
    };

    const marker = new maplibregl.Marker({
      element: el,
      anchor: "center",
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);

    markersRef.current.push(marker);
  });
}
  return (
    <main className="page map-page" dir={lang === "ar" ? "rtl" : "ltr"}>
      <section className="page-shell">
       <header className="page-header">
        <div>
            <h1>{t.mainTitle}</h1>
            <p>{t.mainSubtitle}</p>
        </div>
        </header>

        <section className="navigation-grid">
          <aside className="panel route-panel">
            <div className="panel-title-row">
              <div className="panel-icon arrow-icon">↗</div>
              <div>
                <h2>{t.findRoute}</h2>
                <p>{t.backendRouting}</p>
              </div>
            </div>
            <div className="selection-summary">
              <div className="selection-row">
                <span>{t.startPoint}</span>
                <strong>{selectedGate ? getPointLabel(selectedGate) : t.notSelected}</strong>
              </div>
              <div className="selection-row">
                <span>{t.destination}</span>
                <strong>{selectedSeat ? getPointLabel(selectedSeat) : t.notSelected}</strong>
              </div>
            </div>
            <div className="route-placeholder">
              <div className="route-badge">⌁</div>
              <strong>{msg}</strong>
            </div>
           <div className="route-actions">
              <button className="primary-action" type="button" onClick={fetchRoute}>
                  {t.findRoute}
              </button>

              <button className="danger-action" type="button" onClick={resetSelection}>
                  {t.clearSelection}
              </button>
          </div>
          </aside>
          <section className="map-column">
            <div className="map-card">
              <div id="map" />
            
              <div className="map-credit">MapLibre ●</div>
            </div>

          </section>

          <aside className="panel legend-panel">
            <h2>{t.mapLegend}</h2>
            <div className="legend-list">
              <div className="legend-row"><span className="legend-icon gate">G</span><strong>{FACILITY_CONFIG.gate[lang === "ar" ? "label" : "labelEn"]}</strong></div>
              <div className="legend-row"><span className="legend-icon exit">↪</span><strong>{FACILITY_CONFIG.exit[lang === "ar" ? "label" : "labelEn"]}</strong></div>
              <div className="legend-row"><span className="legend-icon restroom">🚻</span><strong>{FACILITY_CONFIG.restroom[lang === "ar" ? "label" : "labelEn"]}</strong></div>
              <div className="legend-row"><span className="legend-icon food">🍴</span><strong>{FACILITY_CONFIG.food[lang === "ar" ? "label" : "labelEn"]}</strong></div>
              <div className="legend-row"><span className="legend-icon medical">✚</span><strong>{FACILITY_CONFIG.medical[lang === "ar" ? "label" : "labelEn"]}</strong></div>
              <div className="legend-row"><span className="legend-icon prayer">🕌</span><strong>{FACILITY_CONFIG.prayer[lang === "ar" ? "label" : "labelEn"]}</strong></div>
            </div>
          </aside>
        </section>
      </section>

    </main>
  );
}
// ─── دوال بناء الطبقات ────────────────────────────────────────────
function normalizeSeatPoints(seats) {
  let id = 1;
  return {
    type: "FeatureCollection",
    features: seats.features.map(seat => ({
      type: "Feature",
      id: id++,
      properties: {
        ...(seat.properties || {}),
        stand: seat.properties?.stand || guessStand(seat.properties?.section),
      },
      geometry: seat.geometry,
    })),
  };
}
function makeOuterFloor(sections) {
  const b = getBounds([sections]);
  const c = getCenter(b);
  const rx = (b.maxLng - b.minLng) * 0.58;
  const ry = (b.maxLat - b.minLat) * 0.58;
  return ellipseFeatureCollection(c.lng, c.lat, rx, ry, 96, { name: "outer-floor" });
}
function makeInnerFloor(sections) {
  const b = getBounds([sections]);
  const c = getCenter(b);
  const rx = (b.maxLng - b.minLng) * 0.47;
  const ry = (b.maxLat - b.minLat) * 0.47;
  return ellipseFeatureCollection(c.lng, c.lat, rx, ry, 96, { name: "inner-floor" });
}
function makeStadiumWalls(sections) {
  const b = getBounds([sections]);
  const c = getCenter(b);
  const outerRx = (b.maxLng - b.minLng) * 0.62;
  const outerRy = (b.maxLat - b.minLat) * 0.62;
  const innerRx = (b.maxLng - b.minLng) * 0.54;
  const innerRy = (b.maxLat - b.minLat) * 0.54;
  const outer = ellipseRing(c.lng, c.lat, outerRx, outerRy, 112);
  const inner = ellipseRing(c.lng, c.lat, innerRx, innerRy, 112).reverse();
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: { name: "oval-wall" },
      geometry: { type: "Polygon", coordinates: [outer, inner] }
    }]
  };
}
function makeCleanField(sections) {
  const b = getBounds([sections]);
  const c = getCenter(b);
  const fw = (b.maxLng - b.minLng) * 0.43;
  const fh = (b.maxLat - b.minLat) * 0.34;
  return rectFeatureCollection(c.lng - fw / 2, c.lat - fh / 2, c.lng + fw / 2, c.lat + fh / 2);
}
function makeFieldDecor(field) {
  const b = getBounds([field]);
  const features = [];
  const w = b.maxLng - b.minLng;
  const h = b.maxLat - b.minLat;
  const cx = (b.minLng + b.maxLng) / 2;
  const cy = (b.minLat + b.maxLat) / 2;
  const stripeCount = 10;
  const sw = w / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    features.push({
      ...rectFeature(b.minLng + sw * i, b.minLat, b.minLng + sw * (i + 1), b.maxLat),
      properties: { kind: i % 2 === 0 ? "stripeLight" : "stripeDark" },
    });
  }
  const addLine = (coords) =>
    features.push({ type: "Feature", properties: { kind: "line" }, geometry: { type: "LineString", coordinates: coords } });
  const ix = w * 0.025, iy = h * 0.045;
  addLine([[b.minLng + ix, b.minLat + iy], [b.maxLng - ix, b.minLat + iy], [b.maxLng - ix, b.maxLat - iy], [b.minLng + ix, b.maxLat - iy], [b.minLng + ix, b.minLat + iy]]);
  addLine([[cx, b.minLat + iy], [cx, b.maxLat - iy]]);
  addLine(ellipse(cx, cy, w * 0.075, h * 0.17, 80));
  const bw = w * 0.16, bh = h * 0.44;
  const sbw = w * 0.065, sbh = h * 0.24;
  addLine([[b.minLng + ix, cy - bh / 2], [b.minLng + ix + bw, cy - bh / 2], [b.minLng + ix + bw, cy + bh / 2], [b.minLng + ix, cy + bh / 2]]);
  addLine([[b.maxLng - ix, cy - bh / 2], [b.maxLng - ix - bw, cy - bh / 2], [b.maxLng - ix - bw, cy + bh / 2], [b.maxLng - ix, cy + bh / 2]]);
  addLine([[b.minLng + ix, cy - sbh / 2], [b.minLng + ix + sbw, cy - sbh / 2], [b.minLng + ix + sbw, cy + sbh / 2], [b.minLng + ix, cy + sbh / 2]]);
  addLine([[b.maxLng - ix, cy - sbh / 2], [b.maxLng - ix - sbw, cy - sbh / 2], [b.maxLng - ix - sbw, cy + sbh / 2], [b.maxLng - ix, cy + sbh / 2]]);
  features.push({ type: "Feature", properties: { kind: "spot" }, geometry: { type: "Point", coordinates: [cx, cy] } });
  features.push({ type: "Feature", properties: { kind: "spot" }, geometry: { type: "Point", coordinates: [b.minLng + w * 0.12, cy] } });
  features.push({ type: "Feature", properties: { kind: "spot" }, geometry: { type: "Point", coordinates: [b.maxLng - w * 0.12, cy] } });
  return { type: "FeatureCollection", features };
}
function makeSectionAisles(sections) {
  const features = [];
  sections.features.forEach((section) => {
    const ring = section.geometry.coordinates[0];
    const b = getRingBounds(ring);
    const w = b.maxLng - b.minLng, h = b.maxLat - b.minLat;
    const horizontal = w > h;
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      if (horizontal) {
        const y = b.minLat + h * t;
        features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[b.minLng, y], [b.maxLng, y]] } });
      } else {
        const x = b.minLng + w * t;
        features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [[x, b.minLat], [x, b.maxLat]] } });
      }
    }
  });
  return { type: "FeatureCollection", features };
}
function makeGateBuildings(gates) {
  return {
    type: "FeatureCollection",
    features: gates.features.map(f => {
      const [lng, lat] = f.geometry.coordinates;
      const s = 0.000022;
      return { ...rectFeature(lng - s, lat - s, lng + s, lat + s), properties: f.properties || {} };
    }),
  };
}
function makeFacilitiesBuildings(data) {
  return {
    type: "FeatureCollection",
    features: data.features.map(f => {
      const [lng, lat] = f.geometry.coordinates;
      const type = String(f.properties?.type || f.properties?.category || "").toLowerCase();
      const s = 0.000016;
      return { ...rectFeature(lng - s, lat - s, lng + s, lat + s), properties: { ...(f.properties || {}), type } };
    }),
  };
}
function getCenter(b) {
  return { lng: (b.minLng + b.maxLng) / 2, lat: (b.minLat + b.maxLat) / 2 };
}
function ellipseRing(cx, cy, rx, ry, steps = 96) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = (Math.PI * 2 * i) / steps;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}
function ellipseFeatureCollection(cx, cy, rx, ry, steps = 96, properties = {}) {
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties,
      geometry: { type: "Polygon", coordinates: [ellipseRing(cx, cy, rx, ry, steps)] }
    }]
  };
}
function rectFeatureCollection(minX, minY, maxX, maxY) {
  return { type: "FeatureCollection", features: [rectFeature(minX, minY, maxX, maxY)] };
}
function rectFeature(minX, minY, maxX, maxY) {
  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [[[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY], [minX, minY]]] },
  };
}
function ellipse(cx, cy, rx, ry, steps = 48) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = (Math.PI * 2 * i) / steps;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}
function guessStand(section = "") {
  const s = String(section).toUpperCase();
  if (s.startsWith("N")) return "North";
  if (s.startsWith("E")) return "East";
  if (s.startsWith("S")) return "South";
  if (s.startsWith("W")) return "West";
  return "Unknown";
}
function getBounds(collections) {
  const points = [];
  collections.forEach(fc => fc.features.forEach(f => collectCoords(f.geometry.coordinates, points)));
  const lngs = points.map(p => p[0]);
  const lats  = points.map(p => p[1]);
  return { minLng: Math.min(...lngs), maxLng: Math.max(...lngs), minLat: Math.min(...lats), maxLat: Math.max(...lats) };
}
function getRingBounds(ring) {
  const lngs = ring.map(p => p[0]);
  const lats  = ring.map(p => p[1]);
  return { minLng: Math.min(...lngs), maxLng: Math.max(...lngs), minLat: Math.min(...lats), maxLat: Math.max(...lats) };
}
function collectCoords(coords, out) {
  if (typeof coords[0] === "number") { out.push(coords); return; }
  coords.forEach(c => collectCoords(c, out));
}
function showPopup(map, lngLat, html) {
  popupRefGlobal?.remove?.();
  popupRefGlobal = null;
}
function emptyRoute() {
  return { type: "FeatureCollection", features: [] };
}
function statusAr(status) {
  if (status === "sold")     return "Sold";
  if (status === "reserved") return "Reserved";
  return "Available";
}
export default App;