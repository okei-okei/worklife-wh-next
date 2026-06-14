import type {
  RouteCoordinates,
  RouteInfo,
  RouteMode,
  RoutePoint,
} from "@/lib/services/routeService";

type OsrmRouteResponse = {
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
  }>;
};

const OSRM_PROFILE_BY_MODE: Record<RouteMode, string | null> = {
  walking: "foot",
  driving: "driving",
  transit: null,
};

function toRouteCoordinates(
  coordinates: Array<[number, number]> | undefined,
): RouteCoordinates[] {
  return (coordinates || []).map(([longitude, latitude]) => ({
    latitude,
    longitude,
  }));
}

export async function getOsrmRouteInfo({
  origin,
  destination,
  mode,
}: {
  origin: RoutePoint;
  destination: RoutePoint;
  mode: RouteMode;
}): Promise<RouteInfo | null> {
  const profile = OSRM_PROFILE_BY_MODE[mode];

  if (!profile) {
    return null;
  }

  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson`;

  // Free routing APIs are for the MVP phase only. The OSRM public demo server
  // is useful for early checks, but it is not intended for production traffic.
  // Move this call behind app/api/routes/route.ts or a paid/self-hosted routing
  // service before launch.
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("OSRM route request failed.");
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];

  if (!route?.distance || !route.duration) {
    return null;
  }

  return {
    distanceKm: route.distance / 1000,
    durationMin: Math.round(route.duration / 60),
    mode,
    provider: "osrm",
    coordinates: toRouteCoordinates(route.geometry?.coordinates),
  };
}
