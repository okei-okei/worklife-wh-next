"use client";

import { useMemo, useState } from "react";
import { filterNzLocations } from "@/lib/constants/nzLocations";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (coords: {
    latitude: number | null;
    longitude: number | null;
  }) => void;
  allLabel?: string;
};

export default function NzLocationPicker({
  label = "地域",
  value,
  onChange,
  onCoordinatesChange,
  allLabel = "全て",
}: Props) {
  const [query, setQuery] = useState("");
  const [geoMessage, setGeoMessage] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const locations = useMemo(() => {
    return filterNzLocations(query).slice(0, 30);
  }, [query]);

  const handleUseCurrentLocation = () => {
    setGeoMessage("");

    if (!navigator.geolocation) {
      setGeoMessage("このブラウザでは現在地取得を利用できません。");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onChange("現在地");
        onCoordinatesChange?.({ latitude, longitude });
        setGeoMessage("現在地を取得しました。");
        setIsGettingLocation(false);
      },
      () => {
        setGeoMessage("現在地を取得できませんでした。権限設定を確認してください。");
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-sm font-bold text-gray-900">{label}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900 placeholder:text-gray-600"
          placeholder="地域名・市区町村名で検索"
        />
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            onChange("");
            onCoordinatesChange?.({ latitude: null, longitude: null });
          }}
          className={`w-full rounded-lg px-4 py-3 font-bold sm:w-auto ${
            value === "" ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-900"
          }`}
        >
          {allLabel}
        </button>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isGettingLocation}
          className="w-full rounded-lg bg-gray-700 px-4 py-3 font-bold text-white disabled:bg-gray-300 sm:w-auto"
        >
          {isGettingLocation ? "取得中..." : "現在地を取得する"}
        </button>
      </div>

      {geoMessage && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm font-bold text-blue-800">
          {geoMessage}
        </p>
      )}

      <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {locations.map((location) => (
            <button
              key={location.label}
              type="button"
              onClick={() => {
                onChange(location.label);
                onCoordinatesChange?.({ latitude: null, longitude: null });
              }}
              className={`rounded-lg px-3 py-2 text-left text-sm font-bold ${
                value === location.label
                  ? "bg-blue-700 text-white"
                  : "bg-white text-gray-900 hover:bg-blue-50"
              }`}
            >
              {location.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
