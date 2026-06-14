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
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">保存した物件</h1>

          <Link
            href="/mypage"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            ← マイページ
          </Link>
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
      </div>
    </main>
  );
}
