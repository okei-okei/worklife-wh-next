"use client";

import { useMemo, useState } from "react";
import { nzLocations } from "@/lib/constants/nzLocations";

type Props = {
  label?: string;
  value?: string;
  values?: string[];
  multiple?: boolean;
  onChange?: (value: string) => void;
  onValuesChange?: (values: string[]) => void;
  onCoordinatesChange?: (coords: {
    latitude: number | null;
    longitude: number | null;
  }) => void;
  allLabel?: string;
};

export default function NzLocationPicker({
  label = "地域",
  value = "",
  values = [],
  multiple = false,
  onChange,
  onValuesChange,
  onCoordinatesChange,
  allLabel = "全て",
}: Props) {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [geoMessage, setGeoMessage] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const regions = useMemo(() => {
    return Array.from(new Set(nzLocations.map((location) => location.region)));
  }, []);

  const districts = useMemo(() => {
    return selectedRegion
      ? nzLocations.filter((location) => location.region === selectedRegion)
      : nzLocations;
  }, [selectedRegion]);

  const selectedValues = multiple ? values : value ? [value] : [];

  const setAll = () => {
    onChange?.("");
    onValuesChange?.([]);
    onCoordinatesChange?.({ latitude: null, longitude: null });
  };

  const selectLocation = (labelValue: string) => {
    if (multiple) {
      const exists = values.includes(labelValue);
      onValuesChange?.(
        exists
          ? values.filter((item) => item !== labelValue)
          : [...values, labelValue],
      );
      return;
    }

    onChange?.(labelValue);
    onCoordinatesChange?.({ latitude: null, longitude: null });
  };

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
        onChange?.("現在地");
        onValuesChange?.(["現在地"]);
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-gray-900">{label}</span>
          <select
            value={selectedRegion}
            onChange={(event) => {
              setSelectedRegion(event.target.value);
              setSelectedDistrict("");
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900"
          >
            <option value="">Regionを選択</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-gray-900">
            District / City
          </span>
          <select
            value={selectedDistrict}
            onChange={(event) => {
              const labelValue = event.target.value;
              setSelectedDistrict(labelValue);
              if (labelValue) selectLocation(labelValue);
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 font-medium text-gray-900 placeholder:text-gray-600"
          >
            <option value="">未設定</option>
            {districts.map((location) => (
              <option key={location.label} value={location.label}>
                {location.district}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={setAll}
          className={`w-full rounded-lg px-4 py-3 font-bold sm:w-auto ${
            selectedValues.length === 0
              ? "bg-blue-700 text-white"
              : "bg-gray-100 text-gray-900"
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

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectLocation(item)}
              className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
            >
              {item} {multiple ? "×" : ""}
            </button>
          ))}
        </div>
      )}

      {geoMessage && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm font-bold text-blue-800">
          {geoMessage}
        </p>
      )}

      <p className="text-xs font-medium text-gray-700">
        選択中: {selectedValues.length ? selectedValues.join(" / ") : allLabel}
      </p>
    </div>
  );
}
