"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PropertyForm from "./PropertyForm";
import PropertyList from "./PropertyList";
import { Property } from "./types";
import Link from "next/link";
import EditPropertyModal from "./EditPropertyModal";
import { useRouter } from "next/navigation";

export default function PropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [editing, setEditing] = useState<Property | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
      .from("saved_properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProperties(data || []);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchProperties();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchProperties]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-100 p-4 text-gray-900 md:p-6">
      <div className="mx-auto max-w-5xl min-w-0 space-y-6">
        <div>
          <h1 className="min-w-0 whitespace-normal break-words text-2xl font-bold md:text-4xl">
            保存した物件
          </h1>
        </div>

        <PropertyForm onSaved={fetchProperties} />

        <PropertyList
          properties={properties}
          userId={currentUserId}
          onRefresh={fetchProperties}
          onEdit={(p) => setEditing(p)}
        />

        <EditPropertyModal
          property={editing}
          userId={currentUserId}
          onClose={() => setEditing(null)}
          onUpdated={fetchProperties}
        />

        <div className="flex justify-center">
          <Link
            href="/mypage"
            className="w-full rounded-lg bg-gray-700 px-4 py-3 text-center font-bold text-white sm:w-auto"
          >
            ← マイページホームへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
