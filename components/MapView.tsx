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

type Point = {
  id: string;
  lat: number;
  lng: number;
  label: string;
};

type Props = {
  jobs: Point[];
  properties: Point[];
  lines?: {
    from: {
      lat: number;
      lng: number;
    };
    to: {
      lat: number;
      lng: number;
    };
  }[];
};

export default function MapView({ jobs, properties, lines = [] }: Props) {
  const center = jobs[0]
    ? [jobs[0].lat, jobs[0].lng]
    : properties[0]
      ? [properties[0].lat, properties[0].lng]
      : [-36.8485, 174.7633];

  return (
    <MapContainer
      key={`${jobs.length}-${properties.length}`}
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
          icon={jobIcon}
        >
          <Popup>💼 {job.label}</Popup>
        </Marker>
      ))}

      {properties.map((property) => (
        <Marker
          key={`${property.id}-${property.lat}-${property.lng}`}
          position={[property.lat, property.lng]}
          icon={propertyIcon}
        >
          <Popup>🏠 {property.label}</Popup>
        </Marker>
      ))}

      {lines.map((line, i) => (
        <Polyline
          key={i}
          positions={[
            [line.from.lat, line.from.lng],
            [line.to.lat, line.to.lng],
          ]}
        />
      ))}
    </MapContainer>
  );
}
