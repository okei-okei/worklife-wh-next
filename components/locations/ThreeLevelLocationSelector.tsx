"use client";

import { useMemo } from "react";
import type {
  LocationOption,
  ThreeLevelLocationValue,
} from "@/lib/locations/locationMaster";

type Props = {
  value: ThreeLevelLocationValue;
  locations: LocationOption[];
  onChange: (value: ThreeLevelLocationValue) => void;
  includeInactiveCurrentValue?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

const selectClass =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100";

export default function ThreeLevelLocationSelector({
  value,
  locations,
  onChange,
  disabled = false,
  required = false,
  className = "",
}: Props) {
  const activeLocations = useMemo(
    () => {
      const base = locations.filter(
        (location) =>
          location.isActive ||
          location.databaseId === value.locationMasterId ||
          location.key === value.locationKey,
      );
      const hasCurrent = base.some(
        (location) =>
          location.region === value.region &&
          location.cityDistrict === value.cityDistrict &&
          location.locality === value.locality,
      );

      if (hasCurrent || !value.region) return base;

      return [
        ...base,
        {
          databaseId: value.locationMasterId,
          key:
            value.locationKey ||
            [value.region, value.cityDistrict, value.locality]
              .filter(Boolean)
              .join("-"),
          level: value.locality
            ? ("locality" as const)
            : value.cityDistrict
              ? ("city_district" as const)
              : ("region" as const),
          origin: "listing" as const,
          region: value.region,
          cityDistrict: value.cityDistrict,
          locality: value.locality,
          aliases: [],
          isActive: true,
          displayOrder: -1,
        },
      ];
    },
    [
      locations,
      value.cityDistrict,
      value.locality,
      value.locationKey,
      value.locationMasterId,
      value.region,
    ],
  );

  const regions = useMemo(
    () =>
      Array.from(new Set(activeLocations.map((location) => location.region)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [activeLocations],
  );

  const cityDistricts = useMemo(
    () =>
      Array.from(
        new Set(
          activeLocations
            .filter((location) => location.region === value.region)
            .map((location) => location.cityDistrict),
        ),
      )
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [activeLocations, value.region],
  );

  const localities = useMemo(
    () =>
      activeLocations
        .filter(
          (location) =>
            location.region === value.region &&
            location.cityDistrict === value.cityDistrict &&
            Boolean(location.locality),
        )
        .sort(
          (a, b) =>
            a.displayOrder - b.displayOrder ||
            a.locality.localeCompare(b.locality),
        ),
    [activeLocations, value.cityDistrict, value.region],
  );

  const currentLabel = [value.region, value.cityDistrict, value.locality]
    .filter(Boolean)
    .join(" / ");
  const selectedExists = activeLocations.some(
    (location) =>
      location.region === value.region &&
      location.cityDistrict === value.cityDistrict &&
      location.locality === value.locality,
  );

  return (
    <div className={`space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3 ${className}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-gray-900">
          地域
          {required ? (
            <>
              <span className="ml-1 text-xs font-semibold text-red-600" aria-hidden="true">
                *
              </span>
              <span className="sr-only">必須</span>
            </>
          ) : null}
        </p>
        <a
          href="/admin/locations"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-700 underline-offset-2 hover:underline"
        >
          選択肢に地域がない場合
        </a>
      </div>

      {currentLabel && !selectedExists ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs font-semibold text-amber-900">
          現在の地域: {currentLabel}。選択肢にないため、変更する場合は新しい地域を選んでください。
        </p>
      ) : null}

      <div className="grid gap-2 md:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold text-gray-700">Region</span>
          <select
            value={value.region}
            onChange={(event) =>
              onChange({
                locationMasterId: null,
                locationKey: null,
                region: event.target.value,
                cityDistrict: "",
                locality: "",
              })
            }
            disabled={disabled}
            required={required}
            className={selectClass}
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
            value={value.cityDistrict}
            onChange={(event) =>
              onChange({
                locationMasterId: null,
                locationKey: null,
                region: value.region,
                cityDistrict: event.target.value,
                locality: "",
              })
            }
            disabled={disabled || !value.region}
            required={required}
            className={selectClass}
          >
            <option value="">City / Districtを選択</option>
            {cityDistricts.map((cityDistrict) => (
              <option key={cityDistrict} value={cityDistrict}>
                {cityDistrict}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-bold text-gray-700">Area / Suburb</span>
          <select
            value={value.locationMasterId || value.locationKey || ""}
            onChange={(event) => {
              const selectedValue = event.target.value;
              const location =
                localities.find(
                  (item) =>
                    item.databaseId === selectedValue ||
                    item.key === selectedValue,
                ) || null;

              if (!location) {
                onChange({
                  locationMasterId: null,
                  locationKey: null,
                  region: value.region,
                  cityDistrict: value.cityDistrict,
                  locality: "",
                });
                return;
              }

              onChange({
                locationMasterId: location.databaseId,
                locationKey: location.key,
                region: location.region,
                cityDistrict: location.cityDistrict,
                locality: location.locality,
              });
            }}
            disabled={disabled || !value.region || !value.cityDistrict}
            required={required}
            className={selectClass}
          >
            <option value="">Area / Suburbを選択</option>
            {localities.map((location) => (
              <option
                key={location.databaseId || location.key}
                value={location.databaseId || location.key}
              >
                {location.locality}
                {location.origin === "listing" ? "（現在の保存値）" : ""}
                {!location.isActive ? "（無効）" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
