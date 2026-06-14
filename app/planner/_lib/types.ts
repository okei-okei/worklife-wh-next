export type Job = {
  id: string;
  title: string;
  hourly_rate: number | null;
  work_hours: number | null;
  latitude: number | null;
  longitude: number | null;
};

export type Property = {
  id: string;
  title: string;
  rent_weekly: number | null;
  latitude: number | null;
  longitude: number | null;
};

export type ScoreResult = {
  job: Job;
  property: Property;
  distance: number | null;
  travelMin: number | null;
  monthlyGrossIncome: number;
  paye: number;
  monthlyNetIncome: number;
  monthlyRent: number;
  monthlyLivingCost: number;
  monthlySavings: number;
  commutePenalty: number;
  score: number;
  lifeRating: number;
};

export type MapLine = {
  from: {
    lat: number;
    lng: number;
  };
  to: {
    lat: number;
    lng: number;
  };
};

export type PlannerSettings = {
  monthlyFoodCost: string;
  monthlyTransportCost: string;
  monthlyPhoneCost: string;
  monthlyOtherCost: string;
  plannedStayMonths: string;
};

export type PlannerSettingsRow = {
  monthly_food_cost: number | null;
  monthly_transport_cost: number | null;
  monthly_phone_cost: number | null;
  monthly_other_cost: number | null;
  planned_stay_months: number | null;
};

export type PlannerSettingsSaveStatus =
  | "loading"
  | "saved"
  | "local"
  | "saving";

export type PlannerInputConfig = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
};
