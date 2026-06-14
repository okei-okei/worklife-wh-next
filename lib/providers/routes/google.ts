import type { RouteInfo, RouteMode, RoutePoint } from "@/lib/services/routeService";

export async function getGoogleRouteInfo({
  mode,
}: {
  origin: RoutePoint;
  destination: RoutePoint;
  mode: RouteMode;
}): Promise<RouteInfo | null> {
  if (mode === "transit") {
    return null;
  }

  // Google Maps Routes/Directions requires a server-managed API key.
  // Keep the key out of the browser. A future app/api/routes/route.ts endpoint
  // should read GOOGLE_MAPS_API_KEY on the server, call Google, then return the
  // normalized RouteInfo shape used by the planner.
  return null;
}
