import type {
  RouteInfo,
  RouteMode,
  RoutePoint,
} from "@/lib/services/routeService";

export async function getOpenRouteServiceRouteInfo({
  mode,
}: {
  origin: RoutePoint;
  destination: RoutePoint;
  mode: RouteMode;
}): Promise<RouteInfo | null> {
  if (mode === "transit") {
    return null;
  }

  // OpenRouteService can be a free/low-cost MVP option, but it has usage limits
  // and requires an API key for normal use. Do not expose that key through a
  // NEXT_PUBLIC_* variable or direct browser fetch. The intended production path
  // is app/api/routes/route.ts, where the server reads ORS_API_KEY and proxies a
  // normalized RouteInfo response back to the client.
  return null;
}
