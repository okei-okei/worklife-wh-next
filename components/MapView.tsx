"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import { useEffect } from "react";

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
const highlightedJobIcon = createPinIcon("#eab308", 36);
const highlightedPropertyIcon = createPinIcon("#16a34a", 36);

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

type Props = {
  jobs: Point[];
  properties: Point[];
  lines?: Line[];
  highlightedJobId?: string;
  highlightedPropertyId?: string;
  highlightedLine?: Line | null;
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

export default function MapView({
  jobs,
  properties,
  lines = [],
  highlightedJobId,
  highlightedPropertyId,
  highlightedLine,
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
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {jobs.map((job) => (
          <Marker
            key={`${job.id}-${job.lat}-${job.lng}`}
            position={[job.lat, job.lng]}
            icon={job.id === highlightedJobId ? highlightedJobIcon : jobIcon}
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
                ? highlightedPropertyIcon
                : propertyIcon
            }
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
