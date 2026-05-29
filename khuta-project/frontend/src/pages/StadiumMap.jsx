import { useEffect, useRef, useState } from "react";
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
const FACILITY_CONFIG = {
  restroom: { icon: "🚻", color: "#0a68b4" },
  food: { icon: "🍴", color: "#c71111" },
  medical: { icon: "✚", color: "#116e08" },
  exit: { icon: "🚪", color: "#00897B" },
  prayer: { icon: "🕌", color: "#6D4C41" },
  gate: { icon: "🚩", color: "#1B5E20" },
};

let popupRefGlobal = null;
function App() {
  const mapRef      = useRef(null);
  const markersRef  = useRef([]);
  const routeAnimationRef = useRef(null);
  const [selectedSeat,   setSelectedSeat]   = useState(null);
  const [selectedGate,   setSelectedGate]   = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const selectedRouteRef = useRef({ start: null, end: null });
  const seats3dRef = useRef(null);
const [msg, setMsg] = useState("");
  const [routeDrawn, setRouteDrawn] = useState(false);
  const [nearbyFacilities, setNearbyFacilities] = useState([]);
  const [nearbyType, setNearbyType] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");

const { lang, t } = useLanguage();
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
          paint: { "background-color": "#9ee7a3" },
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

        const field = fieldData;
        const fieldDecor = makeFieldDecor(field);
        map.addSource("field", { type: "geojson", data: field });
        map.addLayer({
          id: "field-fill",
          type: "fill",
          source: "field",
          paint: { "fill-color": "#2e8b3c", "fill-opacity": 1 },
        });

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
            "fill-extrusion-height": ["get", "height"],
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

        const seatPoints = normalizeSeatPoints(seats);
        seats3dRef.current = normalizeSeat3dCollection(seats3d);
        map.addSource("seats", { type: "geojson", data: seatPoints });

        map.addSource("seats-3d", { type: "geojson", data: seats3dRef.current });
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

    "circle-radius": ["case", ["boolean", ["feature-state", "selected"], false], 8, 0],
    "circle-color": "#ff2d55",
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": ["case", ["boolean", ["feature-state", "selected"], false], 3, 0],
    "circle-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0],
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

map.addSource("selected-row-3d", { type: "geojson", data: emptyRoute() });
map.addLayer({
  id: "selected-row-3d",
  type: "fill-extrusion",
  source: "selected-row-3d",
  paint: {
    "fill-extrusion-color": "#ffd166",
    "fill-extrusion-height": ["+", ["to-number", ["coalesce", ["get", "visual_height"], 1]], 0.7],
    "fill-extrusion-base": ["to-number", ["coalesce", ["get", "visual_base"], 0]],
    "fill-extrusion-opacity": 0.75,
  },
});

map.addSource("selected-seat-3d", { type: "geojson", data: emptyRoute() });
map.addLayer({
  id: "selected-seat-3d",
  type: "fill-extrusion",
  source: "selected-seat-3d",
  paint: {
    "fill-extrusion-color": "#ff2d55",
    "fill-extrusion-height": ["+", ["to-number", ["coalesce", ["get", "visual_height"], 1]], 1.8],
    "fill-extrusion-base": ["to-number", ["coalesce", ["get", "visual_base"], 0]],
    "fill-extrusion-opacity": 1,
  },
});

map.addSource("selected-seat-point", { type: "geojson", data: emptyRoute() });
map.addLayer({
  id: "selected-seat-point",
  type: "circle",
  source: "selected-seat-point",
  paint: {
    "circle-radius": 11,
    "circle-color": "#ff2d55",
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 3,
    "circle-opacity": 0.98,
  },
});
map.addLayer({
  id: "selected-seat-point-label",
  type: "symbol",
  source: "selected-seat-point",
  layout: {
    "text-field": ["concat", "Seat ", ["to-string", ["get", "seat"]]],
    "text-size": 13,
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-offset": [0, -1.5],
    "text-allow-overlap": true,
  },
  paint: {
    "text-color": "#ffffff",
    "text-halo-color": "#111111",
    "text-halo-width": 2,
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

        map.addSource("route", { type: "geojson", data: emptyRoute() });
        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#00b8d9",
            "line-width": 11,
            "line-opacity": 0.22,
            "line-blur": 3.5,
          },
        });
        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#006d7c",
            "line-width": 5.2,
            "line-opacity": 0.55,
          },
        });
        map.addLayer({
          id: "route-dashed",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#eaffff",
            "line-width": 3.1,
            "line-opacity": 0.95,
            "line-dasharray": [0, 4, 3],
          },
        });

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

          highlightSelectedSeat(p, coords);

          const currentLang = mapRef.current?.customLang || "en";
          const labels = t;

          selectRoutePoint(
            {
              ...p,
              type: "seat",
              label: p.seat_id || p.id || p.seat || "Seat",
              coordinates: coords,
            },
            e.lngLat,
            `<div class="pop-title">${p.seat_id || p.id || "Seat"}</div>
             <div class="pop-row"><span>${t.section}</span><b>${p.section || "-"}</b></div>
             <div class="pop-row"><span>${t.row}</span><b>${p.row || "-"}</b></div>
             <div class="pop-row"><span>${t.status}</span><b class="status-${p.status || "available"}">${p.status === "sold" ? labels.statusSold : p.status === "reserved" ? labels.statusReserved : labels.statusAvailable}</b></div>`
          );
        });
      map.on("click", "gates-click-area", (e) => {
  const f = e.features?.[0];
  if (!f) return;

  selectRoutePoint(
    {
      ...f.properties,
      type: "gate",
      label: f.properties?.name || f.properties?.id || "Gate",
      coordinates: f.geometry.coordinates,
    },
    e.lngLat,
    `<div class="pop-title">${f.properties?.name || f.properties?.id || "Gate"}</div>
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
      stopRouteAnimation();
      markersRef.current.forEach(m => m.remove());
      popupRefGlobal?.remove?.();
      window.removeEventListener("resize", handleMapResize);
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.customLang = lang;
    }
    setMsg(t.routeMsg);
  }, [lang]);

  function highlightSelectedSeat(seatProps, coords) {
    const map = mapRef.current;
    if (!map) return;

    const selectedSeatPoint = {
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        properties: seatProps || {},
        geometry: { type: "Point", coordinates: coords },
      }],
    };

    map.getSource("selected-seat-point")?.setData(selectedSeatPoint);

    const seats3d = seats3dRef.current;
    if (!seats3d?.features?.length) return;

    const selectedKey = getSeatIdentity(seatProps);
    const selectedRowKey = getSeatRowIdentity(seatProps);

    const sameRowFeatures = seats3d.features.filter((feature) =>
      selectedRowKey && getSeatRowIdentity(feature.properties || {}) === selectedRowKey
    );

    const sameSeatFeatures = seats3d.features.filter((feature) =>
      selectedKey && getSeatIdentity(feature.properties || {}) === selectedKey
    );

    map.getSource("selected-row-3d")?.setData({
      type: "FeatureCollection",
      features: sameRowFeatures,
    });

    map.getSource("selected-seat-3d")?.setData({
      type: "FeatureCollection",
      features: sameSeatFeatures,
    });
  }

  function clearSeatHighlight() {
    mapRef.current?.getSource("selected-row-3d")?.setData(emptyRoute());
    mapRef.current?.getSource("selected-seat-3d")?.setData(emptyRoute());
    mapRef.current?.getSource("selected-seat-point")?.setData(emptyRoute());
  }

 function getPointLabel(point) {
  if (!point) return t.notSelected;

  return (
    point?.label ||
    point?.name_en ||
    point?.nameEn ||
    point?.english_name ||
    point?.name_ar ||
    point?.name ||
    point?.gate_name ||
    point?.seat_id ||
    point?.id ||
    point?.seat ||
    (point.type && t.facilityLabels?.[point.type]) ||
    t.notSelected
  );
}

  function getFacilityLabel(type) {
    const key = String(type || "facility").toLowerCase();
    return t.facilityLabels?.[key] || t.nearbyFacilities;
  }

  function getNearbyItemLabel(item, type) {
    if (lang === "ar") {
      return item?.name_ar || item?.name || getFacilityLabel(type);
    }

    return item?.name_en || item?.nameEn || item?.english_name || getFacilityLabel(type);
  }

  function getSeatDetails(seat) {
    const section = seat?.section || seat?.section_id || seat?.sectionId || seat?.block || seat?.stand_section || "-";
    const row = seat?.row || seat?.row_id || seat?.rowId || "-";
    const seatNo = seat?.seat || seat?.seat_number || seat?.seatNo || seat?.number || seat?.id || seat?.seat_id || "-";
    return { section, row, seatNo };
  }

  function getOriginForNearby() {
    return selectedRouteRef.current?.start?.coordinates || startPoint?.coordinates || null;
  }

  async function fetchNearbyFacilities(type) {
    const normalizedType = String(type || "").toLowerCase();
    const origin = getOriginForNearby();

    if (!normalizedType) {
      return;
    }

    if (!origin) {
      setNearbyType(normalizedType);
      setNearbyFacilities([]);
      setNearbyLoading(false);
      setNearbyError(t.selectStartFirst);
      return;
    }

    const [lon, lat] = origin;
    const url = `${API_BASE}/directions/near/coordinates=${lon},${lat}/floor=1/poi_cat_id=${normalizedType}`;

    try {
      setNearbyType(normalizedType);
      setNearbyLoading(true);
      setNearbyError("");
      const res = await fetch(url, {
        headers: { "Accept-Language": lang || "ar" },
      });
      const data = await res.json();

      if (data?.error || data?.detail) {
        setNearbyFacilities([]);
        setNearbyError(data.reason || data.error || data.detail || t.couldNotLoadNearby);
        return;
      }

      setNearbyFacilities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("nearest facilities error:", err);
      setNearbyFacilities([]);
      setNearbyError(t.failedBackend);
    } finally {
      setNearbyLoading(false);
    }
  }

  function selectRoutePoint(point, lngLat, popupHtml) {
    const displayCoords = point.coordinates;

    if (!Array.isArray(displayCoords) || displayCoords.length < 2) {
      setMsg(lang === "ar" ? "لا يمكن تحديد هذه النقطة للمسار" : "This point cannot be used for routing");
      return;
    }

    const routePoint = {
      ...point,
      label: getPointLabel(point),
      coordinates: displayCoords,
    };

    const current = selectedRouteRef.current;

    if (!current.start || (current.start && current.end)) {
      selectedRouteRef.current = { start: routePoint, end: null };

      setStartPoint(routePoint);
      setEndPoint(null);

      
      setSelectedGate(routePoint);
      setSelectedSeat(null);

      setRouteDrawn(false);
      stopRouteAnimation();
      mapRef.current?.getSource("route")?.setData(emptyRoute());
      setMsg(t.startSelected);
    } else {
      const sameCoordinates =
        Number(current.start.coordinates?.[0]) === Number(routePoint.coordinates?.[0]) &&
        Number(current.start.coordinates?.[1]) === Number(routePoint.coordinates?.[1]);

      if (sameCoordinates) {
        setMsg(lang === "ar" ? "اختاري نقطة مختلفة عن نقطة البداية" : "Choose a different destination point");
        return;
      }

      selectedRouteRef.current = { ...current, end: routePoint };

      setEndPoint(routePoint);

   
      setSelectedSeat(routePoint);

      setMsg(t.twoPointsSelected);
    }

    if (popupHtml) {
      showPopup(mapRef.current, lngLat || routePoint.coordinates, popupHtml);
    }
  }

  function stopRouteAnimation() {
    if (routeAnimationRef.current) {
      clearInterval(routeAnimationRef.current);
      routeAnimationRef.current = null;
    }
  }

  function startRouteAnimation() {
    const map = mapRef.current;
    if (!map || !map.getLayer("route-dashed")) return;

    stopRouteAnimation();

    const dashFrames = [
      [0, 4, 3],
      [0.5, 3.5, 3],
      [1, 3, 3],
      [1.5, 2.5, 3],
      [2, 2, 3],
      [2.5, 1.5, 3],
      [3, 1, 3],
      [3.5, 0.5, 3],
      [4, 0, 3],
      [0, 0.5, 3, 3.5],
      [0, 1, 3, 3],
      [0, 1.5, 3, 2.5],
      [0, 2, 3, 2],
      [0, 2.5, 3, 1.5],
      [0, 3, 3, 1],
      [0, 3.5, 3, 0.5],
    ];

    let frame = 0;
    routeAnimationRef.current = setInterval(() => {
      if (!map.getLayer("route-dashed")) {
        stopRouteAnimation();
        return;
      }
      map.setPaintProperty("route-dashed", "line-dasharray", dashFrames[frame]);
      frame = (frame + 1) % dashFrames.length;
    }, 90);
  }

  async function fetchRoute() {
    const start = selectedRouteRef.current.start;
    const end = selectedRouteRef.current.end;

    if (!start || !end) {
      setMsg(t.selectTwoPointsFirst);
      return;
    }

    const startCoords = start.coordinates;
    const endCoords = end.coordinates;

    const [startLon, startLat] = startCoords;
    const [endLon, endLat] = endCoords;
    const floor = 1;

    const params = new URLSearchParams({
      start_lon: startLon,
      start_lat: startLat,
      end_lon: endLon,
      end_lat: endLat,
      floor: floor,
    });

    const url = `${API_BASE}/directions/coords?${params}`;

    try {
      setMsg(t.calculatingRoute);
      const res  = await fetch(url);
      const data = await res.json();

      if (data.error) {
        setMsg(`${t.routeError}: ${data.reason || data.error}`);
        return;
      }

      const displayRoute = {
        ...(data || {}),
        type: "FeatureCollection",
        features: data?.features || [],
      };

      mapRef.current?.getSource("route")?.setData(displayRoute);
      setRouteDrawn(true);
      startRouteAnimation();

      const info = data.route_info || {};
      const dist = info.route_length ? `${parseFloat(info.route_length).toFixed(0)} m` : "";
      const time = info.walk_time   ? `${Math.ceil(info.walk_time / 60)} min`           : "";
      setMsg(
        lang === "ar"
          ? `المسار: ${dist} — ${time}`
          : `Route: ${dist} — ${time}`
      );

      if (displayRoute.features?.length) {
        const coords = displayRoute.features.flatMap(f =>
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
      setMsg(t.failedBackend);
      console.error("fetchRoute error:", err);
    }
  }

  function resetSelection() {
    selectedRouteRef.current = { start: null, end: null };
    setStartPoint(null);
    setEndPoint(null);
    setSelectedGate(null);
    setSelectedSeat(null);
    setRouteDrawn(false);
    setNearbyFacilities([]);
    setNearbyType(null);
    setNearbyError("");
    stopRouteAnimation();
    setMsg(t.routeMsg);
    mapRef.current?.getSource("route")?.setData(emptyRoute());
    clearSeatHighlight();
  }
 function addGateMarkers(map, data) {
  data.features.forEach((feature) => {
    const p = feature.properties || {};
    const type = String(p.type || "").toLowerCase();

    const num =
      type === "exit"
        ? String(p.id || "").replace(/\D/g, "")
        : String(p.name || p.id || "").replace(/\D/g, "");

    const displayName =
      type === "exit"
        ? `Exit ${num || String(p.id || "").replace("E", "")}`
        : p.name || p.id || getFacilityLabel("gate");

    const el = document.createElement("button");

    if (type === "exit") {
      el.className = "exit-marker old-map-marker";
      el.innerHTML = `
        <span class="old-exit-symbol">↪</span>
      `;
      el.title = displayName;
    } else {
      el.className = "gate-marker old-map-marker";
      el.innerHTML = `
        <span class="old-gate-text">GATE</span>
        <span class="old-gate-num">${num}</span>
      `;
      el.title = displayName;
    }

    el.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const routeType = type === "exit" ? "exit" : "gate";

      const routePoint = {
        ...p,
        type: routeType,
        label: displayName,
        coordinates: feature.geometry.coordinates,
      };

      selectRoutePoint(
        routePoint,
        feature.geometry.coordinates,
        `<div class="pop-title">${displayName}</div>
         <div class="pop-row"><span>${t.locationSelected}</span></div>`
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
function addFacilityMarkers(map, data) {
  data.features.forEach((feature) => {
    const p = feature.properties || {};
    const type = String(p.type || p.category || "").toLowerCase();

    const cfg =
      FACILITY_CONFIG[type] ||
      { icon: "📍", color: "linear-gradient(135deg,#666,#444)" };

    const el = document.createElement("button");
    el.className = `facility-marker fac-${type}`;

    el.innerHTML = `
      <div class="facility-wrap">
        <div class="facility-icon">${cfg.icon}</div>
      </div>
    `;

    el.querySelector(".facility-icon").style.background = cfg.color;

    el.title = getFacilityLabel(type);

    el.onclick = () => {
      const facilityType = type || p.type || p.category || "facility";
      const displayLabel = getFacilityLabel(facilityType);
      const routePoint = { ...p, type: facilityType, label: displayLabel, coordinates: feature.geometry.coordinates };

      fetchNearbyFacilities(facilityType);

      selectRoutePoint(
        routePoint,
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
                <strong>{startPoint ? getPointLabel(startPoint) : t.notSelected}</strong>
              </div>
              <div className="selection-row">
                <span>{t.destination}</span>
                <strong>{endPoint ? getPointLabel(endPoint) : t.notSelected}</strong>
              </div>
            </div>
            <div className="route-placeholder">
              <div className="route-badge">⌁</div>
              <strong>{msg}</strong>
            </div>

            {endPoint?.type === "seat" && (() => {
              const seat = getSeatDetails(endPoint);
              return (
                <div className="seat-guidance-card">
                  <div className="seat-guidance-success">
                    {t.youReachedDestination}
                  </div>
                  <div className="seat-guidance-main">
                    {`${t.goToSection} ${seat.section}`}
                  </div>
                  <div className="seat-guidance-grid">
                    <div>
                      <span>{t.row}</span>
                      <strong>{seat.row}</strong>
                    </div>
                    <div>
                      <span>{t.seat}</span>
                      <strong>{seat.seatNo}</strong>
                    </div>
                  </div>
                </div>
              );
            })()}

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

          <aside className="panel nearby-panel">
            <h2>
              {nearbyType
                ? `${t.nearest} ${getFacilityLabel(nearbyType)}`
                : t.nearbyFacilities}
            </h2>

            {!nearbyType && (
              <p className="panel-hint">
                {t.clickFacilityHint}
              </p>
            )}

            {nearbyLoading && (
              <div className="nearby-empty">
                {t.loadingNearest}
              </div>
            )}

          {nearbyError && !nearbyLoading && nearbyFacilities.length === 0 && (
  <div className="nearby-error">{nearbyError}</div>
)}

            {!nearbyLoading && !nearbyError && nearbyType && nearbyFacilities.length === 0 && (
              <div className="nearby-empty">
                {t.noNearbyResults}
              </div>
            )}

            <div className="nearby-list">
              {nearbyFacilities.slice(0, 5).map((item, index) => (
                <button
                  key={`${item.id}-${index}`}
                  className="nearby-card"
                  type="button"
                  onClick={() => {
                    const coords = item.geometry?.coordinates;
                    if (!coords) return;
                    const itemLabel = getNearbyItemLabel(item, nearbyType);
                    selectRoutePoint(
                      {
                        id: item.id,
                        type: item.type || nearbyType,
                        label: itemLabel,
                        name_ar: item.name_ar || item.name,
                        name_en: item.name_en || item.nameEn || item.english_name,
                        coordinates: coords,
                      },
                      coords,
                      `<div class="pop-title">${itemLabel}</div>
                       <div class="pop-row"><span>${t.distance}</span><b>${Math.round(item.distance || 0)} m</b></div>`
                    );
                    mapRef.current?.flyTo({ center: coords, zoom: 20.2, duration: 700 });
                  }}
                >
                  <span className="nearby-rank">{index + 1}</span>
                  <span className="nearby-info">
                    <strong>{getNearbyItemLabel(item, nearbyType)}</strong>
                    <small>{t.approxDistance}: {Math.round(item.distance || 0)} m</small>
                  </span>
                  <span className="nearby-icon">{FACILITY_CONFIG[nearbyType]?.icon || "📍"}</span>
                </button>
              ))}
            </div>
          </aside>
        </section>

        <section className="legend-strip">
          <div className="legend-strip-title">{t.legend}</div>
          <div className="legend-strip-list">
            <div className="legend-strip-item"><span className="legend-icon gate">G</span><strong>{getFacilityLabel("gate")}</strong></div>
            <div className="legend-strip-item"><span className="legend-icon exit">↪</span><strong>{getFacilityLabel("exit")}</strong></div>
            <div className="legend-strip-item"><span className="legend-icon restroom">🚻</span><strong>{getFacilityLabel("restroom")}</strong></div>
            <div className="legend-strip-item"><span className="legend-icon food">🍴</span><strong>{getFacilityLabel("food")}</strong></div>
            <div className="legend-strip-item"><span className="legend-icon medical">✚</span><strong>{getFacilityLabel("medical")}</strong></div>
            <div className="legend-strip-item"><span className="legend-icon prayer">🕌</span><strong>{getFacilityLabel("prayer")}</strong></div>
          </div>
        </section>
      </section>

    </main>
  );
}

function normalizeText(value) {
  return String(value ?? "").trim().toUpperCase();
}

function getSeatIdentity(props = {}) {
  const section = normalizeText(props.section || props.section_id || props.sectionId || props.block || props.stand_section);
  const row = normalizeText(props.row || props.row_id || props.rowId);
  const seat = normalizeText(props.seat || props.seat_number || props.seatNo || props.number || props.id || props.seat_id);
  return `${section}|${row}|${seat}`;
}

function getSeatRowIdentity(props = {}) {
  const section = normalizeText(props.section || props.section_id || props.sectionId || props.block || props.stand_section);
  const row = normalizeText(props.row || props.row_id || props.rowId);
  return `${section}|${row}`;
}

function normalizeSeat3dCollection(seats3d) {
  let id = 1;
  return {
    type: "FeatureCollection",
    features: (seats3d.features || []).map((seat) => ({
      ...seat,
      id: seat.id ?? id++,
      properties: {
        ...(seat.properties || {}),
        stand: seat.properties?.stand || guessStand(seat.properties?.section),
      },
    })),
  };
}

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
export default App;