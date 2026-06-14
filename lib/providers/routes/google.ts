import type {
  RouteInfo,
  RouteMode,
  RoutePoint,
} from "@/lib/services/routeService";

export async function getGoogleRouteInfo({
  mode,
}: {
  origin: RoutePoint;
  destination: RoutePoint;
  mode: RouteMode;
}): Promise<RouteInfo | null> {
  if (mode === "transit") {
    // Transit will be implemented here after Google Maps is introduced.
    // The planner UI should not need changes because routeService normalizes
    // every provider into the same RouteInfo shape.
    return null;
  }

  // Google Maps Routes/Directions is intended for the post-MVP business phase.
  // Never expose the API key through NEXT_PUBLIC_* env vars or browser fetches.
  // A future app/api/routes/route.ts endpoint should read GOOGLE_MAPS_API_KEY
  // on the server, call Google, and return the normalized RouteInfo shape.
  // This provider interface keeps UI changes minimal when switching from free
  // MVP APIs to Google Maps.
  return null;
}
