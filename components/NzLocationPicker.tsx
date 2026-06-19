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
  onSelectionChange?: (selection: {
    countryCode: "NZ";
    region: string;
    district: string;
    area: string;
    label: string;
  }) => void;
  allLabel?: string;
  showCurrentLocation?: boolean;
};

export default function NzLocationPicker({
  label = "地域",
  value = "",
  values = [],
  multiple = false,
  onChange,
  onValuesChange,
  onCoordinatesChange,
  onSelectionChange,
  allLabel = "全て",
  showCurrentLocation = true,
}: Props) {
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [geoMessage, setGeoMessage] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const regions = useMemo(() => {
    return Array.from(new Set(nzLocations.map((location) => location.region)));
  }, []);

  const districts = useMemo(() => {
    return Array.from(
      new Set(
        nzLocations
          .filter(
            (location) =>
              !selectedRegion || location.region === selectedRegion,
          )
          .map((location) => location.district),
      ),
    );
  }, [selectedRegion]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(
        nzLocations
          .filter(
            (location) =>
              location.region === selectedRegion &&
              location.district === selectedDistrict &&
              location.area,
          )
          .map((location) => location.area),
      ),
    );
  }, [selectedDistrict, selectedRegion]);

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

  const commitSelection = (area = "") => {
    if (!selectedRegion || !selectedDistrict) return;

    const labelValue = area
      ? `${selectedRegion} / ${selectedDistrict} / ${area}`
      : `${selectedRegion} / ${selectedDistrict}`;

    selectLocation(labelValue);
    onSelectionChange?.({
      countryCode: "NZ",
      region: selectedRegion,
      district: selectedDistrict,
      area,
      label: labelValue,
    });
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
    <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold text-gray-700">Region</span>
          <select
            value={selectedRegion}
            onChange={(event) => {
              setSelectedRegion(event.target.value);
              setSelectedDistrict("");
              setSelectedArea("");
            }}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-medium text-gray-900"
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
          <span className="text-xs font-bold text-gray-700">City / District</span>
          <select
            value={selectedDistrict}
            onChange={(event) => {
              const district = event.target.value;
              setSelectedDistrict(district);
              setSelectedArea("");

              const districtAreas = nzLocations.filter(
                (location) =>
                  location.region === selectedRegion &&
                  location.district === district &&
                  location.area,
              );

              if (district && districtAreas.length === 0) {
                const labelValue = `${selectedRegion} / ${district}`;
                selectLocation(labelValue);
                onSelectionChange?.({
                  countryCode: "NZ",
                  region: selectedRegion,
                  district,
                  area: "",
                  label: labelValue,
                });
              }
            }}
            disabled={!selectedRegion}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-medium text-gray-900 disabled:bg-gray-100"
          >
            <option value="">City / Districtを選択</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-gray-700">Area / Suburb</span>
          <select
            value={selectedArea}
            onChange={(event) => {
              const area = event.target.value;
              setSelectedArea(area);
              if (area) commitSelection(area);
            }}
            disabled={!selectedDistrict || areas.length === 0}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 font-medium text-gray-900 disabled:bg-gray-100"
          >
            <option value="">
              {areas.length ? "Area / Suburbを選択" : "候補なし"}
            </option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={setAll}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-bold sm:w-auto ${
            selectedValues.length === 0
              ? "bg-blue-700 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          {allLabel}
        </button>
        {showCurrentLocation ? (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-900 disabled:bg-gray-100 sm:w-auto"
          >
            {isGettingLocation ? "取得中..." : "現在地を取得する"}
          </button>
        ) : null}
      </div>

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedValues.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectLocation(item)}
              className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
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
