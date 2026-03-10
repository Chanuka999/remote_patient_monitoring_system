import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const EMERGENCY_CONTACTS = [
  { label: "Local Emergency", number: "119" },
  { label: "Ambulance", number: "1990" },
  { label: "Police", number: "119" },
];

// ── helpers (none of these touch `res`) ───────────────────────────────────

/** Safely parse JSON from a fetch Response; returns null on failure */
const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

/** Fetch with an explicit timeout so external APIs can't hang the server */
const fetchWithTimeout = async (url, options = {}, timeoutMs = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

// ── OpenStreetMap Overpass fallback — returns hospital array, never throws ─

const queryOSM = async (lat, lng, radius) => {
  const query =
    `[out:json][timeout:20];` +
    `(node["amenity"="hospital"](around:${radius},${lat},${lng});` +
    `way["amenity"="hospital"](around:${radius},${lat},${lng}););` +
    `out center 12;`;

  try {
    // POST avoids URL-length issues and is more reliable than GET
    const response = await fetchWithTimeout(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "RemotePatientMonitoringSystem/1.0",
        },
        body: `data=${encodeURIComponent(query)}`,
      },
      15000,
    );

    if (!response.ok) return [];

    const data = await safeJson(response);
    if (!data || !Array.isArray(data.elements)) return [];

    return data.elements.slice(0, 12).map((el) => {
      const hLat = el?.lat ?? el?.center?.lat;
      const hLng = el?.lon ?? el?.center?.lon;
      const tags = el?.tags || {};
      return {
        name: tags?.name || "Unknown Hospital",
        address:
          [tags?.["addr:street"], tags?.["addr:city"]]
            .filter(Boolean)
            .join(", ") || "Address unavailable",
        rating: 0,
        userRatingsTotal: 0,
        placeId: "",
        latitude: Number(hLat ?? 0),
        longitude: Number(hLng ?? 0),
        mapsUrl:
          Number.isFinite(Number(hLat)) && Number.isFinite(Number(hLng))
            ? `https://www.google.com/maps/search/?api=1&query=${hLat},${hLng}`
            : "",
        emergencyContact: tags?.phone || tags?.["contact:phone"] || "",
      };
    });
  } catch (err) {
    console.error("[hospitalController] OSM query failed:", err.message);
    return [];
  }
};

// ── Google Places helpers ──────────────────────────────────────────────────

const fetchPlacePhone = async (placeId, apiKey) => {
  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json" +
      `?place_id=${encodeURIComponent(placeId)}` +
      "&fields=formatted_phone_number,international_phone_number" +
      `&key=${encodeURIComponent(apiKey)}`;
    const response = await fetchWithTimeout(url, {}, 8000);
    const data = await safeJson(response);
    if (data?.status !== "OK") return "";
    return (
      data?.result?.international_phone_number ||
      data?.result?.formatted_phone_number ||
      ""
    );
  } catch {
    return "";
  }
};

const queryGoogleMaps = async (lat, lng, radius, apiKey) => {
  const url =
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json" +
    `?location=${lat},${lng}` +
    `&radius=${radius}` +
    "&type=hospital" +
    `&key=${encodeURIComponent(apiKey)}`;

  const response = await fetchWithTimeout(url, {}, 12000);
  const data = await safeJson(response);

  if (
    !response.ok ||
    !data ||
    (data.status !== "OK" && data.status !== "ZERO_RESULTS")
  ) {
    throw new Error(`Google Places error: ${data?.status ?? "unknown"}`);
  }

  const results = Array.isArray(data?.results) ? data.results : [];
  const hospitals = results.slice(0, 12).map((item) => {
    const hLat = item?.geometry?.location?.lat;
    const hLng = item?.geometry?.location?.lng;
    return {
      name: item?.name || "Unknown Hospital",
      address:
        item?.vicinity || item?.formatted_address || "Address unavailable",
      rating: Number(item?.rating ?? 0),
      userRatingsTotal: Number(item?.user_ratings_total ?? 0),
      placeId: item?.place_id || "",
      latitude: Number(hLat ?? 0),
      longitude: Number(hLng ?? 0),
      mapsUrl:
        Number.isFinite(hLat) && Number.isFinite(hLng)
          ? `https://www.google.com/maps/search/?api=1&query=${hLat},${hLng}`
          : "",
      emergencyContact: "",
    };
  });

  // Enrich first 5 with phone numbers (parallel to save time)
  await Promise.all(
    hospitals.slice(0, Math.min(5, hospitals.length)).map(async (h, i) => {
      if (h.placeId) {
        hospitals[i].emergencyContact = await fetchPlacePhone(
          h.placeId,
          apiKey,
        );
      }
    }),
  );

  return hospitals;
};

// ── Route handler ───────────────────────────────────────────────────────────

const verifyTokenFromReq = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  const token = auth.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const getNearbyHospitals = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius ?? 7000);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "lat and lng query params are required",
      });
    }

    let hospitals = [];
    let source = "none";

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      try {
        hospitals = await queryGoogleMaps(lat, lng, radius, apiKey);
        source = "google";
      } catch (err) {
        console.warn(
          "[hospitalController] Google Maps failed, trying OSM:",
          err.message,
        );
        hospitals = await queryOSM(lat, lng, radius);
        source = "openstreetmap";
      }
    } else {
      hospitals = await queryOSM(lat, lng, radius);
      source = "openstreetmap";
    }

    return res.status(200).json({
      success: true,
      source,
      data: {
        center: { latitude: lat, longitude: lng },
        radius,
        hospitals,
        emergencyContacts: EMERGENCY_CONTACTS,
      },
    });
  } catch (err) {
    console.error("[hospitalController] Unhandled error:", err);
    // Always return a usable payload so the frontend shows emergency contacts
    return res.status(200).json({
      success: true,
      source: "fallback",
      data: {
        center: {
          latitude: Number(req.query.lat ?? 0),
          longitude: Number(req.query.lng ?? 0),
        },
        radius: Number(req.query.radius ?? 7000),
        hospitals: [],
        emergencyContacts: EMERGENCY_CONTACTS,
      },
    });
  }
};
