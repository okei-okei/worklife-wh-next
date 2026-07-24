"use client";

import {
  MapContainer,
  Circle,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";
import LeafletStyles from "@/components/maps/LeafletStyles";

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

type Point = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  subtitle?: string;
  details?: string[];
  href?: string;
  selectLabel?: string;
};

type Line = {
  from: {
    lat: number;
    lng: number;
  };
  to: {
    lat: number;
    lng: number;
  };
  coordinates?: Array<{
    lat: number;
    lng: number;
  }>;
};

type CurrentLocationPoint = {
  lat: number;
  lng: number;
  accuracy?: number | null;
};

type Props = {
  jobs: Point[];
  properties: Point[];
  lines?: Line[];
  highlightedJobId?: string;
  highlightedPropertyId?: string;
  highlightedLine?: Line | null;
  currentLocation?: CurrentLocationPoint | null;
  currentLocationFocusKey?: number;
  onJobSelect?: (id: string) => void;
  onPropertySelect?: (id: string) => void;
};

function MapBoundsUpdater({
  jobs,
  properties,
  lines,
  highlightedLine,
}: {
  jobs: Point[];
  properties: Point[];
  lines: Line[];
  highlightedLine?: Line | null;
}) {
  const map = useMap();

  useEffect(() => {
    const positions: Array<[number, number]> = [
      ...jobs.map((job) => [job.lat, job.lng] as [number, number]),
      ...properties.map(
        (property) => [property.lat, property.lng] as [number, number],
      ),
      ...lines.flatMap((line) =>
        line.coordinates?.length
          ? line.coordinates.map(
              (coordinate) =>
                [coordinate.lat, coordinate.lng] as [number, number],
            )
          : [
              [line.from.lat, line.from.lng] as [number, number],
              [line.to.lat, line.to.lng] as [number, number],
            ],
      ),
      ...(highlightedLine
        ? highlightedLine.coordinates?.length
          ? highlightedLine.coordinates.map(
              (coordinate) =>
                [coordinate.lat, coordinate.lng] as [number, number],
            )
          : [
              [
                highlightedLine.from.lat,
                highlightedLine.from.lng,
              ] as [number, number],
              [
                highlightedLine.to.lat,
                highlightedLine.to.lng,
              ] as [number, number],
            ]
        : []),
    ];

    if (!positions.length) {
      map.setView([-36.8485, 174.7633], 11);
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 13);
      return;
    }

    map.fitBounds(L.latLngBounds(positions), {
      padding: [30, 30],
      maxZoom: 14,
    });
  }, [jobs, properties, lines, highlightedLine, map]);

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

    map.flyTo([currentLocation.lat, currentLocation.lng], 15, {
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

export default function MapView({
  jobs,
  properties,
  lines = [],
  highlightedJobId,
  highlightedPropertyId,
  highlightedLine,
  currentLocation,
  currentLocationFocusKey,
  onJobSelect,
  onPropertySelect,
}: Props) {
  const center = jobs[0]
    ? [jobs[0].lat, jobs[0].lng]
    : properties[0]
      ? [properties[0].lat, properties[0].lng]
      : [-36.8485, 174.7633];

  return (
    <div className="h-[350px] w-full min-w-0 overflow-hidden rounded-xl md:h-[500px]">
      <LeafletStyles />
      <MapContainer
        key={`${jobs.length}-${properties.length}-${highlightedJobId}-${highlightedPropertyId}`}
        center={center as [number, number]}
        zoom={12}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <MapBoundsUpdater
          jobs={jobs}
          properties={properties}
          lines={lines}
          highlightedLine={highlightedLine}
        />
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
            center={[currentLocation.lat, currentLocation.lng]}
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
            position={[currentLocation.lat, currentLocation.lng]}
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

        {jobs.map((job) => (
          <Marker
            key={`${job.id}-${job.lat}-${job.lng}`}
            position={[job.lat, job.lng]}
            icon={job.id === highlightedJobId ? selectedMarkerIcon : jobMarkerIcon}
            zIndexOffset={job.id === highlightedJobId ? 1000 : 0}
            eventHandlers={{
              click: () => onJobSelect?.(job.id),
            }}
          >
            <Popup>
              <div className="min-w-44 space-y-2 text-gray-900">
                <p className="font-bold">{job.label}</p>
                {job.subtitle ? <p className="text-sm">{job.subtitle}</p> : null}
                {job.details?.map((detail) => (
                  <p key={detail} className="text-sm">
                    {detail}
                  </p>
                ))}
                {onJobSelect ? (
                  <button
                    type="button"
                    onClick={() => onJobSelect(job.id)}
                    className="inline-block rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white"
                  >
                    {job.selectLabel || "この求人を選択"}
                  </button>
                ) : null}
                {job.href ? (
                  <a
                    href={job.href}
                    className="inline-block font-bold text-blue-700 underline"
                  >
                    詳細を見る
                  </a>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}

        {properties.map((property) => (
          <Marker
            key={`${property.id}-${property.lat}-${property.lng}`}
            position={[property.lat, property.lng]}
            icon={
              property.id === highlightedPropertyId
                ? selectedMarkerIcon
                : propertyMarkerIcon
            }
            zIndexOffset={property.id === highlightedPropertyId ? 1000 : 0}
            eventHandlers={{
              click: () => onPropertySelect?.(property.id),
            }}
          >
            <Popup>
              <div className="min-w-44 space-y-2 text-gray-900">
                <p className="font-bold">{property.label}</p>
                {property.subtitle ? (
                  <p className="text-sm">{property.subtitle}</p>
                ) : null}
                {property.details?.map((detail) => (
                  <p key={detail} className="text-sm">
                    {detail}
                  </p>
                ))}
                {onPropertySelect ? (
                  <button
                    type="button"
                    onClick={() => onPropertySelect(property.id)}
                    className="inline-block rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white"
                  >
                    {property.selectLabel || "この物件を選択"}
                  </button>
                ) : null}
                {property.href ? (
                  <a
                    href={property.href}
                    className="inline-block font-bold text-blue-700 underline"
                  >
                    詳細を見る
                  </a>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}

        {lines.map((line, i) => (
          <Polyline
            key={i}
            positions={
              line.coordinates?.length
                ? line.coordinates.map((coordinate) => [
                    coordinate.lat,
                    coordinate.lng,
                  ])
                : [
                    [line.from.lat, line.from.lng],
                    [line.to.lat, line.to.lng],
                  ]
            }
            pathOptions={{
              color: "#94a3b8",
              weight: 2,
              opacity: 0.45,
            }}
          />
        ))}

        {highlightedLine && (
          <Polyline
            positions={
              highlightedLine.coordinates?.length
                ? highlightedLine.coordinates.map((coordinate) => [
                    coordinate.lat,
                    coordinate.lng,
                  ])
                : [
                    [highlightedLine.from.lat, highlightedLine.from.lng],
                    [highlightedLine.to.lat, highlightedLine.to.lng],
                  ]
            }
            pathOptions={{
              color: "#f97316",
              weight: 7,
              opacity: 0.95,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
