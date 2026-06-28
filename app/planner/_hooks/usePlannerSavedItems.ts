"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveNzAddressApproximateCoordinates } from "@/lib/locationCoordinates";
import type { Job, Property } from "../_lib/types";

type Coordinates = {
  latitude: number | null;
  longitude: number | null;
};

function hasCoordinates(item: Job | Property) {
  return Boolean(item.latitude && item.longitude);
}

function buildAddressQuery(item: Job | Property) {
  if (!item.address?.trim()) return "";

  return [
    item.address,
    item.country_code === "NZ" ? "New Zealand" : item.country_code,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .filter((part, index, all) => all.indexOf(part) === index)
    .join(", ");
}

async function geocodeAddress(query: string): Promise<Coordinates> {
  if (!query) return { latitude: null, longitude: null };

  try {
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    if (!response.ok) return { latitude: null, longitude: null };
    return (await response.json()) as Coordinates;
  } catch (error) {
    console.error("planner geocode failed:", error);
    return { latitude: null, longitude: null };
  }
}

async function withResolvedCoordinates<T extends Job | Property>(
  item: T,
): Promise<T> {
  const addressQuery = buildAddressQuery(item);

  if (addressQuery) {
    const coordinates = await geocodeAddress(addressQuery);
    if (coordinates.latitude && coordinates.longitude) {
      return {
        ...item,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      };
    }

    const approximate = resolveNzAddressApproximateCoordinates(item);
    if (approximate) {
      return {
        ...item,
        latitude: approximate.latitude,
        longitude: approximate.longitude,
      };
    }

    return {
      ...item,
      latitude: null,
      longitude: null,
    };
  }

  if (item.latitude && item.longitude) return item;

  return item;
}

export function usePlannerSavedItems() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (userId: string) => {
    setIsRefreshing(true);

    try {
      const { data: jobsData } = await supabase
        .from("saved_jobs")
        .select("*")
        .eq("user_id", userId);

      const { data: propertyData } = await supabase
        .from("saved_properties")
        .select("*")
        .eq("user_id", userId);

      if (jobsData) {
        const resolvedJobs = await Promise.all(
          (jobsData as Job[]).map((job) =>
            hasCoordinates(job) && !job.address?.trim()
              ? Promise.resolve(job)
              : withResolvedCoordinates(job),
          ),
        );
        setJobs(resolvedJobs);
      }
      if (propertyData) {
        const resolvedProperties = await Promise.all(
          (propertyData as Property[]).map((property) =>
            hasCoordinates(property) && !property.address?.trim()
              ? Promise.resolve(property)
              : withResolvedCoordinates(property),
          ),
        );
        setProperties(resolvedProperties);
      }

      setLastUpdatedAt(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initializePlanner = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUserId(user.id);
        loadData(user.id);
      };

      initializePlanner();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadData, router]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`planner-saved-items-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "saved_jobs",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          loadData(currentUserId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "saved_properties",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          loadData(currentUserId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, loadData]);

  useEffect(() => {
    if (!currentUserId) return;

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        loadData(currentUserId);
      }
    };

    const refreshOnFocus = () => {
      loadData(currentUserId);
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [currentUserId, loadData]);

  const refresh = useCallback(() => {
    if (currentUserId) {
      loadData(currentUserId);
    }
  }, [currentUserId, loadData]);

  return {
    currentUserId,
    jobs,
    properties,
    lastUpdatedAt,
    isRefreshing,
    refresh,
  };
}
