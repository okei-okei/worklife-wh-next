import type { Job, MapLine, Property, ScoreResult } from "./types";
import { resolveNzApproximateCoordinates } from "@/lib/locationCoordinates";

function getCoordinates(item: Job | Property) {
  if (item.latitude && item.longitude) {
    return {
      lat: Number(item.latitude),
      lng: Number(item.longitude),
    };
  }

  const approximate = resolveNzApproximateCoordinates(item);
  if (!approximate) return null;

  return {
    lat: approximate.latitude,
    lng: approximate.longitude,
  };
}

export function getJobPoints(jobs: Job[]) {
  return jobs
    .map((job) => {
      const coordinates = getCoordinates(job);
      if (!coordinates) return null;

      return {
        id: job.id,
        lat: coordinates.lat,
        lng: coordinates.lng,
        label: job.title,
      };
    })
    .filter((job): job is NonNullable<typeof job> => Boolean(job));
}

export function getPropertyPoints(properties: Property[]) {
  return properties
    .map((property) => {
      const coordinates = getCoordinates(property);
      if (!coordinates) return null;

      return {
        id: property.id,
        lat: coordinates.lat,
        lng: coordinates.lng,
        label: property.title,
      };
    })
    .filter((property): property is NonNullable<typeof property> =>
      Boolean(property),
    );
}

export function getResultLines(results: ScoreResult[]): MapLine[] {
  return results
    .filter(
      (result) =>
        result.job.latitude &&
        result.job.longitude &&
        result.property.latitude &&
        result.property.longitude,
    )
    .map((result) => ({
      from: {
        lat: result.job.latitude!,
        lng: result.job.longitude!,
      },
      to: {
        lat: result.property.latitude!,
        lng: result.property.longitude!,
      },
      coordinates: result.routeCoordinates.map((coordinate) => ({
        lat: coordinate.latitude,
        lng: coordinate.longitude,
      })),
    }));
}

export function getHighlightedLine(
  selectedResult: ScoreResult | undefined,
): MapLine | null {
  if (
    !selectedResult?.job.latitude ||
    !selectedResult.job.longitude ||
    !selectedResult.property.latitude ||
    !selectedResult.property.longitude
  ) {
    return null;
  }

  return {
    from: {
      lat: selectedResult.job.latitude,
      lng: selectedResult.job.longitude,
    },
    to: {
      lat: selectedResult.property.latitude,
      lng: selectedResult.property.longitude,
    },
    coordinates: selectedResult.routeCoordinates.map((coordinate) => ({
      lat: coordinate.latitude,
      lng: coordinate.longitude,
    })),
  };
}
