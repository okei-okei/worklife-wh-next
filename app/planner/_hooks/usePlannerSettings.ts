"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  PlannerSettings,
  PlannerSettingsRow,
  PlannerSettingsSaveStatus,
} from "../_lib/types";

const PLANNER_SETTINGS_KEY = "worklife-wh-planner-settings";

export function usePlannerSettings(currentUserId: string | null) {
  const [monthlyFoodCost, setMonthlyFoodCost] = useState("500");
  const [monthlyTransportCost, setMonthlyTransportCost] = useState("150");
  const [monthlyPhoneCost, setMonthlyPhoneCost] = useState("40");
  const [monthlyOtherCost, setMonthlyOtherCost] = useState("300");
  const [initialCost, setInitialCost] = useState("0");
  const [plannedStayMonths, setPlannedStayMonths] = useState("6");
  const [hasLoadedPlannerSettings, setHasLoadedPlannerSettings] =
    useState(false);
  const [settingsSaveStatus, setSettingsSaveStatus] =
    useState<PlannerSettingsSaveStatus>("loading");

  const applyPlannerSettings = useCallback(
    (settings: Partial<PlannerSettings>) => {
      if (settings.monthlyFoodCost !== undefined) {
        setMonthlyFoodCost(settings.monthlyFoodCost);
      }

      if (settings.monthlyTransportCost !== undefined) {
        setMonthlyTransportCost(settings.monthlyTransportCost);
      }

      if (settings.monthlyPhoneCost !== undefined) {
        setMonthlyPhoneCost(settings.monthlyPhoneCost);
      }

      if (settings.monthlyOtherCost !== undefined) {
        setMonthlyOtherCost(settings.monthlyOtherCost);
      }

      if (settings.initialCost !== undefined) {
        setInitialCost(settings.initialCost);
      }

      if (settings.plannedStayMonths !== undefined) {
        setPlannedStayMonths(settings.plannedStayMonths);
      }
    },
    [],
  );

  useEffect(() => {
    if (!currentUserId) return;

    const timer = window.setTimeout(() => {
      const initializeSettings = async () => {
        const savedSettings = window.localStorage.getItem(PLANNER_SETTINGS_KEY);

        if (savedSettings) {
          try {
            applyPlannerSettings(
              JSON.parse(savedSettings) as Partial<PlannerSettings>,
            );
          } catch {
            window.localStorage.removeItem(PLANNER_SETTINGS_KEY);
          }
        }

        const { data, error } = await supabase
          .from("planner_settings")
          .select(
            "monthly_food_cost, monthly_transport_cost, monthly_phone_cost, monthly_other_cost, initial_cost, planned_stay_months",
          )
          .eq("user_id", currentUserId)
          .maybeSingle<PlannerSettingsRow>();

        if (error) {
          setSettingsSaveStatus("local");
          setHasLoadedPlannerSettings(true);
          return;
        }

        if (data) {
          applyPlannerSettings({
            monthlyFoodCost: String(data.monthly_food_cost ?? 500),
            monthlyTransportCost: String(data.monthly_transport_cost ?? 150),
            monthlyPhoneCost: String(data.monthly_phone_cost ?? 40),
            monthlyOtherCost: String(data.monthly_other_cost ?? 300),
            initialCost: String(data.initial_cost ?? 0),
            plannedStayMonths: String(data.planned_stay_months ?? 6),
          });
        }

        setSettingsSaveStatus("saved");
        setHasLoadedPlannerSettings(true);
      };

      initializeSettings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [applyPlannerSettings, currentUserId]);

  useEffect(() => {
    if (!hasLoadedPlannerSettings || !currentUserId) return;

    const settings: PlannerSettings = {
      monthlyFoodCost,
      monthlyTransportCost,
      monthlyPhoneCost,
      monthlyOtherCost,
      initialCost,
      plannedStayMonths,
    };

    window.localStorage.setItem(PLANNER_SETTINGS_KEY, JSON.stringify(settings));

    const timer = window.setTimeout(async () => {
      setSettingsSaveStatus("saving");

      const { error } = await supabase.from("planner_settings").upsert(
        {
          user_id: currentUserId,
          monthly_food_cost: Number(monthlyFoodCost || 0),
          monthly_transport_cost: Number(monthlyTransportCost || 0),
          monthly_phone_cost: Number(monthlyPhoneCost || 0),
          monthly_other_cost: Number(monthlyOtherCost || 0),
          initial_cost: Number(initialCost || 0),
          planned_stay_months: Number(plannedStayMonths || 0),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

      setSettingsSaveStatus(error ? "local" : "saved");
    }, 600);

    return () => window.clearTimeout(timer);
  }, [
    hasLoadedPlannerSettings,
    currentUserId,
    monthlyFoodCost,
    monthlyTransportCost,
    monthlyPhoneCost,
    monthlyOtherCost,
    initialCost,
    plannedStayMonths,
  ]);

  return {
    monthlyFoodCost,
    setMonthlyFoodCost,
    monthlyTransportCost,
    setMonthlyTransportCost,
    monthlyPhoneCost,
    setMonthlyPhoneCost,
    monthlyOtherCost,
    setMonthlyOtherCost,
    initialCost,
    setInitialCost,
    plannedStayMonths,
    setPlannedStayMonths,
    settingsSaveStatus,
  };
}
