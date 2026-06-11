export type LatLng = {
  latitude: number | null;
  longitude: number | null;
};

// ハーバサイン公式（地球上の距離計算）
export function calculateDistanceKm(a: LatLng, b: LatLng): number | null {
  if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) {
    return null;
  }

  const R = 6371; // 地球の半径（km）

  const dLat = deg2rad(b.latitude - a.latitude);
  const dLon = deg2rad(b.longitude - a.longitude);

  const lat1 = deg2rad(a.latitude);
  const lat2 = deg2rad(b.latitude);

  const aCalc =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// 目安：徒歩・車の時間換算
export function estimateTravelTimeMinutes(distanceKm: number | null) {
  if (!distanceKm) return null;

  // 平均（かなりラフ）
  const walkingSpeed = 5; // km/h
  const drivingSpeed = 30; // km/h（都市部想定）

  return {
    walk: Math.round((distanceKm / walkingSpeed) * 60),
    drive: Math.round((distanceKm / drivingSpeed) * 60),
  };
}
