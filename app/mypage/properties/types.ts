export type Property = {
  id: string;
  user_id?: string;
  title: string;
  url: string;
  location: string | null;
  address: string | null;
  rent_weekly: number | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
};
