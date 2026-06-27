"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

export type MapListingType = "job" | "property";

export type MapPoint = {
  id: string;
  type: MapListingType;
  title: string;
  subtitle?: string;
  locationLabel?: string;
  latitude: number;
  longitude: number;
  priceLabel?: string;
  metaLabel?: string;
};

type Props = {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  type: MapListingType;
};

function createPinIcon(color: string, size = 28) {
  const pinWidth = size;
  const pinHeight = Math.round(size * 1.35);
  const dotSize = Math.max(8, Math.round(size * 0.34));

  return L.divIcon({
    className: "",
    html: `<span style="position:relative;display:block;width:${pinWidth}px;height:${pinHeight}px;"><span style="position:absolute;left:50%;top:0;width:${pinWidth}px;height:${pinWidth}px;transform:translateX(-50%) rotate(45deg);border-radius:999px 999px 999px 0;background:${color};border:2px solid white;box-shadow:0 8px 18px rgba(15,23,42,.32);"></span><span style="position:absolute;left:50%;top:${Math.round(size * 0.28)}px;width:${dotSize}px;height:${dotSize}px;transform:translateX(-50%);border-radius:9999px;background:white;"></span></span>`,
    iconSize: [pinWidth, pinHeight],
    iconAnchor: [pinWidth / 2, pinHeight - 2],
    popupAnchor: [0, -pinHeight + 4],
  });
}

const jobIcon = createPinIcon("#2563eb");
const propertyIcon = createPinIcon("#dc2626");
const selectedIcon = createPinIcon("#16a34a", 36);

function MapBoundsUpdater({ points }: { points: MapPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) {
      map.setView([-36.8485, 174.7633], 11);
      return;
    }

    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 13);
      return;
    }

    const bounds = L.latLngBounds(
      points.map((point) => [point.latitude, point.longitude]),
    );
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
  }, [map, points]);

  return null;
}

export default function PublicListingsMap({
  points,
  selectedId,
  onSelect,
  type,
}: Props) {
  const center = points[0]
    ? ([points[0].latitude, points[0].longitude] as [number, number])
    : ([-36.8485, 174.7633] as [number, number]);
  const defaultIcon = type === "job" ? jobIcon : propertyIcon;
  const selectLabel = type === "job" ? "この求人を選択" : "この物件を選択";

  return (
    <div className="h-[360px] w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white md:h-[520px]">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapBoundsUpdater points={points} />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((point) => (
          <Marker
            key={`${point.id}-${point.latitude}-${point.longitude}`}
            position={[point.latitude, point.longitude]}
            icon={point.id === selectedId ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onSelect(point.id),
            }}
          >
            <Popup>
              <div className="min-w-44 space-y-2 text-gray-900">
                <p className="font-bold">{point.title}</p>
                {point.subtitle ? (
                  <p className="text-sm">{point.subtitle}</p>
                ) : null}
                {point.locationLabel ? (
                  <p className="text-sm">{point.locationLabel}</p>
                ) : null}
                {point.priceLabel ? (
                  <p className="text-sm">{point.priceLabel}</p>
                ) : null}
                {point.metaLabel ? (
                  <p className="text-sm">{point.metaLabel}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => onSelect(point.id)}
                  className="inline-block rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white"
                >
                  {selectLabel}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
