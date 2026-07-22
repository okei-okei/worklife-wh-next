"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import LeafletStyles from "@/components/maps/LeafletStyles";

export type MapListingType = "job" | "property";

export type MapPoint = {
  id: string;
  type: MapListingType;
  title: string;
  subtitle?: string;
  locationLabel?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string | null;
  priceLabel?: string;
  metaLabel?: string;
};

type Props = {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  type: MapListingType;
};

function createStandardMarkerIcon(color: "blue" | "red" | "green") {
  return new L.Icon({
    iconUrl:
      color === "blue"
        ? "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
        : `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconRetinaUrl:
      color === "blue"
        ? "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
        : `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const jobMarkerIcon = createStandardMarkerIcon("blue");
const propertyMarkerIcon = createStandardMarkerIcon("red");
const selectedMarkerIcon = createStandardMarkerIcon("green");

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

function getSafePopupImageUrl(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const lowered = trimmed.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return null;

  return trimmed;
}

function PopupListingImage({
  imageUrl,
  title,
}: {
  imageUrl?: string | null;
  title: string;
}) {
  const [hasImageError, setHasImageError] = useState(false);
  const safeImageUrl = getSafePopupImageUrl(imageUrl);

  if (!safeImageUrl || hasImageError) return null;

  return (
    <div className="mb-2 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
      {/* Listing images are user-provided/public storage URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeImageUrl}
        alt={`${title}の画像`}
        className="h-full w-full object-cover object-[center_58%]"
        loading="lazy"
        onError={() => setHasImageError(true)}
      />
    </div>
  );
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
  const selectLabel = type === "job" ? "この求人を選択" : "この物件を選択";

  return (
    <div className="h-[360px] w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white md:h-[520px]">
      <LeafletStyles />
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
            icon={
              point.id === selectedId
                ? selectedMarkerIcon
                : point.type === "job"
                  ? jobMarkerIcon
                  : propertyMarkerIcon
            }
            zIndexOffset={point.id === selectedId ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect(point.id),
            }}
          >
            <Popup>
              <div className="w-56 space-y-2 text-gray-900 sm:w-64">
                <PopupListingImage imageUrl={point.imageUrl} title={point.title} />
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
