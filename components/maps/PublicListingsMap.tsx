"use client";

import { useEffect } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import LeafletStyles from "@/components/maps/LeafletStyles";
import ResponsiveJobImage from "@/components/jobs/ResponsiveJobImage";

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

export type CurrentLocationPoint = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
};

type Props = {
  points: MapPoint[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  type: MapListingType;
  currentLocation?: CurrentLocationPoint | null;
  currentLocationFocusKey?: number;
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
const currentLocationIcon = L.divIcon({
  className: "current-location-marker",
  html: `
    <span class="current-location-marker__ring">
      <span class="current-location-marker__dot"></span>
    </span>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

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

function CurrentLocationFlyTo({
  currentLocation,
  focusKey = 0,
}: {
  currentLocation?: CurrentLocationPoint | null;
  focusKey?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!currentLocation || focusKey <= 0) return;

    map.flyTo([currentLocation.latitude, currentLocation.longitude], 15, {
      duration: 0.8,
    });
  }, [currentLocation, focusKey, map]);

  return null;
}

function shouldShowAccuracyCircle(accuracy?: number | null) {
  return (
    typeof accuracy === "number" &&
    Number.isFinite(accuracy) &&
    accuracy > 0 &&
    accuracy <= 2000
  );
}

export default function PublicListingsMap({
  points,
  selectedId,
  onSelect,
  type,
  currentLocation,
  currentLocationFocusKey,
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
        <CurrentLocationFlyTo
          currentLocation={currentLocation}
          focusKey={currentLocationFocusKey}
        />
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {currentLocation && shouldShowAccuracyCircle(currentLocation.accuracy) ? (
          <Circle
            center={[currentLocation.latitude, currentLocation.longitude]}
            radius={currentLocation.accuracy || 0}
            pathOptions={{
              color: "#168c66",
              opacity: 0.25,
              fillColor: "#168c66",
              fillOpacity: 0.08,
              weight: 1,
            }}
          />
        ) : null}

        {currentLocation ? (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={currentLocationIcon}
            zIndexOffset={1200}
          >
            <Popup>
              <div className="space-y-1 text-sm text-gray-900">
                <p className="font-bold">現在地</p>
                {currentLocation.accuracy ? (
                  <p className="text-gray-700">
                    誤差の目安: 約{Math.round(currentLocation.accuracy)}m
                  </p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ) : null}

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
              <div className="w-56 max-w-[min(320px,calc(100vw-48px))] space-y-2 text-gray-900 sm:w-72">
                {point.type === "job" ? (
                  <ResponsiveJobImage
                    src={point.imageUrl}
                    alt={`${point.title}の画像`}
                    mode="popup"
                  />
                ) : null}
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
