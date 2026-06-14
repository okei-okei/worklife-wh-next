import {
  calculateDistanceKm,
  estimateTravelTimeMinutes,
} from "@/lib/services/distanceService";
import type { Job, Property, ScoreResult } from "./types";

type CalculatePlannerResultsParams = {
  jobs: Job[];
  properties: Property[];
  maxWeeklyRent: string;
  maxCommuteMinutes: string;
  minHourlyRate: string;
  monthlyFoodCost: string;
  monthlyTransportCost: string;
  monthlyPhoneCost: string;
  monthlyOtherCost: string;
};

export function calculateMonthlyLivingCost({
  monthlyFoodCost,
  monthlyTransportCost,
  monthlyPhoneCost,
  monthlyOtherCost,
}: Pick<
  CalculatePlannerResultsParams,
  | "monthlyFoodCost"
  | "monthlyTransportCost"
  | "monthlyPhoneCost"
  | "monthlyOtherCost"
>) {
  return (
    Number(monthlyFoodCost || 0) +
    Number(monthlyTransportCost || 0) +
    Number(monthlyPhoneCost || 0) +
    Number(monthlyOtherCost || 0)
  );
}

export function calculateLifeRating(monthlySavings: number) {
  if (monthlySavings >= 1200) return 5;
  if (monthlySavings >= 800) return 4;
  if (monthlySavings >= 400) return 3;
  if (monthlySavings >= 0) return 2;
  return 1;
}

export function calculatePlannerResults({
  jobs,
  properties,
  maxWeeklyRent,
  maxCommuteMinutes,
  minHourlyRate,
  monthlyFoodCost,
  monthlyTransportCost,
  monthlyPhoneCost,
  monthlyOtherCost,
}: CalculatePlannerResultsParams): ScoreResult[] {
  if (!jobs.length || !properties.length) return [];

  const rentLimit = Number(maxWeeklyRent);
  const commuteLimit = Number(maxCommuteMinutes);
  const hourlyLimit = Number(minHourlyRate);

  const hasRentLimit = maxWeeklyRent.trim() !== "" && !Number.isNaN(rentLimit);
  const hasCommuteLimit =
    maxCommuteMinutes.trim() !== "" && !Number.isNaN(commuteLimit);
  const hasHourlyLimit =
    minHourlyRate.trim() !== "" && !Number.isNaN(hourlyLimit);
  const monthlyLivingCost = calculateMonthlyLivingCost({
    monthlyFoodCost,
    monthlyTransportCost,
    monthlyPhoneCost,
    monthlyOtherCost,
  });

  const scored: ScoreResult[] = [];

  for (const job of jobs) {
    for (const property of properties) {
      const distance = calculateDistanceKm(
        {
          latitude: job.latitude,
          longitude: job.longitude,
        },
        {
          latitude: property.latitude,
          longitude: property.longitude,
        },
      );

      const travel = estimateTravelTimeMinutes(distance);
      const travelMin = travel?.drive || null;

      const monthlyGrossIncome =
        (job.hourly_rate || 0) * (job.work_hours || 0) * 4.33;
      const paye = monthlyGrossIncome * 0.15;
      const monthlyNetIncome = monthlyGrossIncome - paye;
      const monthlyRent = (property.rent_weekly || 0) * 4.33;
      const monthlySavings =
        monthlyNetIncome - monthlyRent - monthlyLivingCost;
      const commutePenalty = (travelMin || 0) * 2;
      const score = monthlySavings - commutePenalty;

      if (hasRentLimit && (property.rent_weekly ?? Infinity) > rentLimit) {
        continue;
      }

      if (hasHourlyLimit && (job.hourly_rate ?? 0) < hourlyLimit) {
        continue;
      }

      if (hasCommuteLimit && (travelMin ?? Infinity) > commuteLimit) {
        continue;
      }

      scored.push({
        job,
        property,
        distance,
        travelMin,
        monthlyGrossIncome,
        paye,
        monthlyNetIncome,
        monthlyRent,
        monthlyLivingCost,
        monthlySavings,
        commutePenalty,
        score,
        lifeRating: calculateLifeRating(monthlySavings),
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 10);
}

export function formatCurrency(value: number) {
  return `$${value.toFixed(0)}`;
}

export function formatLifeRating(rating: number) {
  return `${"★".repeat(rating)}${"☆".repeat(5 - rating)}`;
}
