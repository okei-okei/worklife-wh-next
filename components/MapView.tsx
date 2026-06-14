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
};

type Props = {
  jobs: Point[];
  properties: Point[];
  lines?: Line[];
  highlightedJobId?: string;
  highlightedPropertyId?: string;
  highlightedLine?: Line | null;
};

export default function MapView({
  jobs,
  properties,
  lines = [],
  highlightedJobId,
  highlightedPropertyId,
  highlightedLine,
}: Props) {
  const center = jobs[0]
    ? [jobs[0].lat, jobs[0].lng]
    : properties[0]
      ? [properties[0].lat, properties[0].lng]
      : [-36.8485, 174.7633];

  return (
    <MapContainer
      key={`${jobs.length}-${properties.length}-${highlightedJobId}-${highlightedPropertyId}`}
      center={center as [number, number]}
      zoom={12}
      style={{
        height: "500px",
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
        >
          <Popup>
            {job.id === highlightedJobId ? "おすすめの仕事: " : "仕事: "}
            {job.label}
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
        >
          <Popup>
            {property.id === highlightedPropertyId ? "おすすめの物件: " : "物件: "}
            {property.label}
          </Popup>
        </Marker>
      ))}

      {lines.map((line, i) => (
        <Polyline
          key={i}
          positions={[
            [line.from.lat, line.from.lng],
            [line.to.lat, line.to.lng],
          ]}
          pathOptions={{
            color: "#94a3b8",
            weight: 2,
            opacity: 0.45,
          }}
        />
      ))}

      {highlightedLine && (
        <Polyline
          positions={[
            [highlightedLine.from.lat, highlightedLine.from.lng],
            [highlightedLine.to.lat, highlightedLine.to.lng],
          ]}
          pathOptions={{
            color: "#f97316",
            weight: 7,
            opacity: 0.95,
          }}
        />
      )}
    </MapContainer>
  );
}
