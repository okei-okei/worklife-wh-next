export type Job = {
  id: string;
  user_id?: string;
  title: string;
  url: string;
  hourly_rate: number | null;
  work_hours: number | null;
  status: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};
