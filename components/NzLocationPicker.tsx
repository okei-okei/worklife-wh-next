"use client";

import { useEffect, useMemo, useState } from "react";
import { nzLocations, type NzLocation } from "@/lib/constants/nzLocations";
import {
  getCurrentLocation,
  getGeolocationFailureMessage,
} from "@/lib/geolocation";
import {
  mergeLocationOptions,
  optionToNzLocation,
  type LocationOption,
} from "@/lib/locations/locationMaster";

const OTHER_AREA_VALUE = "__other_area__";

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
    id?: string;
    linzId?: string | null;
    countryCode: "NZ";
    region: string;
    district: string;
    territorialAuthority?: string | null;
    majorName?: string | null;
    area: string;
    suburbLocality?: string;
    customLocality?: string | null;
    locationSource?: "master" | "custom";
    locationReviewStatus?: "pending" | null;
    label: string;
    searchText?: string;
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
  const [showCustomLocality, setShowCustomLocality] = useState(false);
  const [customLocality, setCustomLocality] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [geoMessage, setGeoMessage] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [dynamicLocationOptions, setDynamicLocationOptions] = useState<
    LocationOption[]
  >([]);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/locations")
      .then((response) => response.json())
      .then((data: { locations?: LocationOption[] }) => {
        if (isMounted) setDynamicLocationOptions(data.locations || []);
      })
      .catch(() => {
        if (isMounted) setDynamicLocationOptions([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const allLocations = useMemo(() => {
    const merged = mergeLocationOptions(dynamicLocationOptions);
    if (!merged.length) return nzLocations;
    return merged.map(optionToNzLocation);
  }, [dynamicLocationOptions]);

  const regions = useMemo(() => {
    return Array.from(new Set(allLocations.map((location) => location.region)));
  }, [allLocations]);

  const districts = useMemo(() => {
    return Array.from(
      new Set(
        allLocations
          .filter(
            (location) =>
              !selectedRegion || location.region === selectedRegion,
          )
          .map((location) => location.district),
      ),
    ).filter(Boolean);
  }, [allLocations, selectedRegion]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(
        allLocations
          .filter(
            (location) =>
              location.region === selectedRegion &&
              location.district === selectedDistrict &&
              location.area,
          )
          .map((location) => location.area),
      ),
    );
  }, [allLocations, selectedDistrict, selectedRegion]);

  const searchResults = useMemo(() => {
    const normalizedQuery = normalizeLocationText(searchQuery);

    if (!normalizedQuery) {
      return allLocations.slice(0, 30);
    }

    return allLocations
      .map((location) => {
        const normalizedSearchText = normalizeLocationText(location.searchText);
        const normalizedArea = normalizeLocationText(location.area);
        const normalizedDistrict = normalizeLocationText(location.district);
        const normalizedRegion = normalizeLocationText(location.region);
        const normalizedAliases = (location.aliases || []).map(
          normalizeLocationText,
        );
        const words = normalizedSearchText.split(/\s+/);
        let score = 0;

        if (normalizedArea === normalizedQuery) score = 100;
        else if (normalizedAliases.includes(normalizedQuery)) score = 95;
        else if (normalizedDistrict === normalizedQuery) score = 90;
        else if (normalizedRegion === normalizedQuery) score = 80;
        else if (normalizedArea.startsWith(normalizedQuery)) score = 70;
        else if (normalizedDistrict.startsWith(normalizedQuery)) score = 65;
        else if (words.includes(normalizedQuery)) score = 60;
        else if (normalizedSearchText.includes(normalizedQuery)) score = 40;

        return { location, score };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score || a.location.label.localeCompare(b.location.label),
      )
      .map((item) => item.location)
      .slice(0, 30);
  }, [allLocations, searchQuery]);

  const selectedValues = multiple ? values : value ? [value] : [];

  const setAll = () => {
    setSelectedRegion("");
    setSelectedDistrict("");
    setSelectedArea("");
    setShowCustomLocality(false);
    setCustomLocality("");
    setSearchQuery("");
    onChange?.("");
    onValuesChange?.([]);
    onCoordinatesChange?.({ latitude: null, longitude: null });
  };

  const selectLocation = (labelValue: string, parentValues: string[] = []) => {
    if (multiple) {
      const filteredValues = values.filter(
        (item) => !parentValues.includes(item) || item === labelValue,
      );
      const exists = filteredValues.includes(labelValue);
      onValuesChange?.(
        exists
          ? filteredValues.filter((item) => item !== labelValue)
          : [...filteredValues, labelValue],
      );
      return;
    }

    onChange?.(labelValue);
    onCoordinatesChange?.({ latitude: null, longitude: null });
  };

  const emitSelection = (location: NzLocation, labelValue = location.label) => {
    const parentValues = [
      location.region,
      `${location.region} / ${location.district}`,
    ].filter((item) => item !== labelValue);
    selectLocation(labelValue, parentValues);
    onSelectionChange?.({
      id: location.id,
      linzId: location.linzId,
      countryCode: location.countryCode,
      region: location.region,
      district: location.district,
      territorialAuthority: location.territorialAuthority,
      majorName: location.majorName,
      area: location.area,
      suburbLocality: location.suburbLocality,
      customLocality: null,
      locationSource: "master",
      locationReviewStatus: null,
      label: labelValue,
      searchText: location.searchText,
    });
  };

  const emitManualSelection = ({
    region,
    district = "",
    area = "",
    custom = false,
  }: {
    region: string;
    district?: string;
    area?: string;
    custom?: boolean;
  }) => {
    if (!region) return;

    const labelValue = [region, district, area].filter(Boolean).join(" / ");
    const parentValues = [
      region,
      district ? `${region} / ${district}` : "",
    ].filter(
      (item): item is string => Boolean(item) && item !== labelValue,
    );
    selectLocation(labelValue, parentValues);
    onSelectionChange?.({
      countryCode: "NZ",
      region,
      district,
      territorialAuthority: district || null,
      majorName: null,
      area,
      suburbLocality: custom ? "" : area,
      customLocality: custom ? area : null,
      locationSource: custom ? "custom" : "master",
      locationReviewStatus: custom ? "pending" : null,
      label: labelValue,
      searchText: labelValue.toLowerCase(),
    });
  };

  const commitSelection = (area = "") => {
    if (!selectedRegion) return;

    if (!selectedDistrict) {
      emitManualSelection({ region: selectedRegion });
      return;
    }

    const location =
      allLocations.find(
        (item) =>
          item.region === selectedRegion &&
          item.district === selectedDistrict &&
          (area ? item.area === area : true),
      ) || null;

    const labelValue = area
      ? `${selectedRegion} / ${selectedDistrict} / ${area}`
      : `${selectedRegion} / ${selectedDistrict}`;

    if (location) {
      emitSelection(location, labelValue);
      return;
    }

    emitManualSelection({
      region: selectedRegion,
      district: selectedDistrict,
      area,
    });
  };

  const commitCustomLocality = () => {
    const trimmedCustomLocality = customLocality.trim();
    if (!selectedRegion || !trimmedCustomLocality) return;

    const labelValue = [
      selectedRegion,
      selectedDistrict,
      trimmedCustomLocality,
    ]
      .filter(Boolean)
      .join(" / ");

    setSelectedArea(trimmedCustomLocality);
    const parentValues = [
      selectedRegion,
      selectedDistrict ? `${selectedRegion} / ${selectedDistrict}` : "",
    ].filter(
      (item): item is string => Boolean(item) && item !== labelValue,
    );
    selectLocation(labelValue, parentValues);
    onSelectionChange?.({
      countryCode: "NZ",
      region: selectedRegion,
      district: selectedDistrict,
      territorialAuthority: selectedDistrict || null,
      majorName: null,
      area: trimmedCustomLocality,
      suburbLocality: "",
      customLocality: trimmedCustomLocality,
      locationSource: "custom",
      locationReviewStatus: "pending",
      label: labelValue,
      searchText: labelValue.toLowerCase(),
    });
  };

  const handleUseCurrentLocation = async () => {
    setGeoMessage("");
    setIsGettingLocation(true);

    try {
      const { latitude, longitude } = await getCurrentLocation();
      onChange?.("現在地");
      onValuesChange?.(["現在地"]);
      onCoordinatesChange?.({ latitude, longitude });
      setGeoMessage("現在地を取得しました。");
    } catch (error) {
      setGeoMessage(getGeolocationFailureMessage(error));
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-sm font-bold text-gray-900">{label}</p>
      <p className="text-xs font-medium text-gray-600">
        RegionやCity / Districtだけでも絞り込めます。住所や地図上の正確な位置とは別に扱います。
      </p>
      <label className="block">
        <span className="text-xs font-bold text-gray-700">
          地域検索
        </span>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-500"
          placeholder="例: Ilam, Hornby, Riccarton"
        />
      </label>
      {searchQuery.trim() ? (
        <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
          {searchResults.length ? (
            <div className="grid gap-1">
              {searchResults.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(location.region);
                    setSelectedDistrict(location.district);
                    setSelectedArea(location.area);
                    setSearchQuery("");
                    emitSelection(location);
                  }}
                  className="rounded-lg px-2 py-1.5 text-left text-xs font-bold text-gray-900 hover:bg-blue-50"
                >
                  {location.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2 px-2 py-1.5">
              <p className="text-xs font-bold text-gray-600">
                候補が見つかりません
              </p>
              <p className="text-xs font-medium text-gray-600">
                候補にない場合は、RegionとCity / Districtを選んで「その他」から入力してください。
              </p>
            </div>
          )}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs font-bold text-gray-700">Region</span>
          <select
            value={selectedRegion}
            onChange={(event) => {
              const region = event.target.value;
              setSelectedRegion(region);
              setSelectedDistrict("");
              setSelectedArea("");
              setShowCustomLocality(false);
              setCustomLocality("");
              if (region) {
                emitManualSelection({ region });
              }
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
              setShowCustomLocality(false);
              setCustomLocality("");

              if (district) {
                emitManualSelection({
                  region: selectedRegion,
                  district,
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
          <span className="text-xs font-bold text-gray-700">
            Area / Suburb
          </span>
          <select
            value={selectedArea}
            onChange={(event) => {
              const area = event.target.value;
              setSelectedArea(area);
              if (area === OTHER_AREA_VALUE) {
                setShowCustomLocality(true);
                return;
              }
              setShowCustomLocality(false);
              if (area) commitSelection(area);
            }}
            disabled={!selectedRegion}
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
            <option value={OTHER_AREA_VALUE}>その他・候補にない地域</option>
          </select>
        </label>
      </div>

      {showCustomLocality ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-3">
          <label className="block">
            <span className="text-xs font-bold text-gray-700">地域名を入力</span>
            <input
              value={customLocality}
              onChange={(event) => setCustomLocality(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 placeholder:text-gray-500"
              placeholder="例: Ilam、Hornby、Riccarton"
            />
          </label>
          <p className="mt-2 text-xs font-medium text-gray-600">
            候補に表示されないArea・Suburbを入力してください。入力内容は検索・絞り込み用に使用します。
          </p>
          <button
            type="button"
            onClick={commitCustomLocality}
            disabled={!customLocality.trim()}
            className="mt-3 w-full rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-300 sm:w-auto"
          >
            この地域を選択
          </button>
        </div>
      ) : null}

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
            {isGettingLocation ? "現在地を確認中" : "現在地を取得する"}
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

function normalizeLocationText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\bsaint\b/g, "st")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
