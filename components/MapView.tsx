"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

const jobIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});

const propertyIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

const highlightedJobIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  iconSize: [40, 40],
});

const highlightedPropertyIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [40, 40],
});

type Point = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  subtitle?: string;
  details?: string[];
  href?: string;
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
