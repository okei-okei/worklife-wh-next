export type Job = {
  id: string;
  user_id?: string;
  title: string;
  url: string;
  company?: string | null;
  location?: string | null;
  employment_type?: string | null;
  hourly_rate: number | null;
  work_hours: number | null;
  accommodation_available?: boolean | null;
  image_urls?: string[] | null;
  status: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};
