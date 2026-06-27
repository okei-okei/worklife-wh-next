"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { resolveNzApproximateCoordinates } from "@/lib/locationCoordinates";
import type { Job, Property } from "../_lib/types";

function withResolvedCoordinates<T extends Job | Property>(item: T): T {
  if (item.latitude && item.longitude) return item;

  const coordinates = resolveNzApproximateCoordinates(item);
  if (!coordinates) return item;

  return {
    ...item,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
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
        setJobs((jobsData as Job[]).map(withResolvedCoordinates));
      }
      if (propertyData) {
        setProperties((propertyData as Property[]).map(withResolvedCoordinates));
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
