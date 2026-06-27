import {
  calculateDistanceKm,
  estimateTravelTimeMinutes,
  type LatLng,
} from "@/lib/services/distanceService";
import { getGoogleRouteInfo } from "@/lib/providers/routes/google";
import { getOpenRouteServiceRouteInfo } from "@/lib/providers/routes/openrouteservice";
import { getOsrmRouteInfo } from "@/lib/providers/routes/osrm";

export type RouteMode = "walking" | "driving" | "transit";

export type RouteProvider = "osrm" | "openrouteservice" | "google" | "fallback";

export type RoutePoint = {
  latitude: number;
  longitude: number;
};

export type { LatLng };

export type RouteCoordinates = {
  latitude: number;
  longitude: number;
};

export type RouteResult = {
  distanceKm: number | null;
  durationMinutes: number | null;
  coordinates: [number, number][];
  source: "osrm" | "fallback";
};

export type RouteInfo = {
  distanceKm: number | null;
  durationMin: number | null;
  mode: RouteMode;
  provider: RouteProvider;
  coordinates: RouteCoordinates[];
  isFallback?: boolean;
  message?: string;
};

const DEFAULT_ROUTE_PROVIDER: RouteProvider = "osrm";

// Provider selection is centralized here so the planner UI can keep calling
// getRouteInfo() without knowing whether routes come from a free MVP provider
// or, after commercialization, Google Maps Routes/Directions.
function getConfiguredRouteProvider(): RouteProvider {
  const provider = process.env.NEXT_PUBLIC_ROUTE_PROVIDER;

  if (
    provider === "osrm" ||
    provider === "openrouteservice" ||
    provider === "google"
  ) {
    return provider;
  }

  return DEFAULT_ROUTE_PROVIDER;
}

function isValidPoint(point: LatLng): point is RoutePoint {
  return Boolean(point.latitude && point.longitude);
}

function createFallbackRouteInfo({
  origin,
  destination,
  mode,
  message,
}: {
  origin: LatLng;
  destination: LatLng;
  mode: RouteMode;
  message?: string;
}): RouteInfo {
  const distanceKm = calculateDistanceKm(origin, destination);
  const estimatedTravel = estimateTravelTimeMinutes(distanceKm);
  const durationMin =
    mode === "walking"
      ? estimatedTravel?.walk || null
      : mode === "driving"
        ? estimatedTravel?.drive || null
        : null;

  return {
    distanceKm,
    durationMin,
    mode,
    provider: "fallback",
    coordinates:
      isValidPoint(origin) && isValidPoint(destination)
        ? [origin, destination]
        : [],
    isFallback: true,
    message:
      message ||
      "道路経路を取得できなかったため、直線距離をもとにした推定時間を表示しています。",
  };
}

export function getTransitUnsupportedRouteInfo({
  origin,
  destination,
}: {
  origin: LatLng;
  destination: LatLng;
}): RouteInfo {
  return createFallbackRouteInfo({
    origin,
    destination,
    mode: "transit",
    message: "公共交通ルートはGoogle Maps連携後に対応予定です。",
  });
}

export async function getRouteInfo({
  origin,
  destination,
  mode,
  provider = getConfiguredRouteProvider(),
}: {
  origin: LatLng;
  destination: LatLng;
  mode: RouteMode;
  provider?: RouteProvider;
}): Promise<RouteInfo> {
  if (!isValidPoint(origin) || !isValidPoint(destination)) {
    return createFallbackRouteInfo({
      origin,
      destination,
      mode,
      message: "位置情報が不足しているため、経路を計算できません。",
    });
  }

  if (mode === "transit") {
    // Transit routing is planned only for the future Google provider. Free MVP
    // providers used here do not cover reliable public-transport routing.
    return getTransitUnsupportedRouteInfo({ origin, destination });
  }

  try {
    let routeInfo: RouteInfo | null = null;

    if (provider === "osrm") {
      routeInfo = await getOsrmRouteInfo({ origin, destination, mode });
    }

    if (provider === "openrouteservice") {
      routeInfo = await getOpenRouteServiceRouteInfo({
        origin,
        destination,
        mode,
      });
    }

    if (provider === "google") {
      routeInfo = await getGoogleRouteInfo({ origin, destination, mode });
    }

    if (routeInfo) {
      return routeInfo;
    }

    return createFallbackRouteInfo({
      origin,
      destination,
      mode,
      message:
        provider === "openrouteservice"
          ? "OpenRouteServiceはサーバーAPI経由で接続予定です。現在は直線距離を表示しています。"
          : provider === "google"
            ? "Google MapsはサーバーAPI経由で接続予定です。現在は直線距離を表示しています。"
            : undefined,
    });
  } catch (error) {
    console.error(error);

    return createFallbackRouteInfo({
      origin,
      destination,
      mode,
    });
  }
}

export async function getDrivingRoute(
  from: LatLng,
  to: LatLng,
): Promise<RouteResult> {
  const routeInfo = await getRouteInfo({
    origin: from,
    destination: to,
    mode: "driving",
    provider: "osrm",
  });

  return {
    distanceKm: routeInfo.distanceKm,
    durationMinutes: routeInfo.durationMin,
    coordinates: routeInfo.coordinates.map((coordinate) => [
      coordinate.latitude,
      coordinate.longitude,
    ]),
    source: routeInfo.provider === "osrm" && !routeInfo.isFallback
      ? "osrm"
      : "fallback",
  };
}
