import type { Job, MapLine, Property, ScoreResult } from "./types";

export function getJobPoints(jobs: Job[]) {
  return jobs
    .filter((job) => job.latitude && job.longitude)
    .map((job) => ({
      id: job.id,
      lat: job.latitude!,
      lng: job.longitude!,
      label: job.title,
    }));
}

export function getPropertyPoints(properties: Property[]) {
  return properties
    .filter((property) => property.latitude && property.longitude)
    .map((property) => ({
      id: property.id,
      lat: property.latitude!,
      lng: property.longitude!,
      label: property.title,
    }));
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
  };
}
