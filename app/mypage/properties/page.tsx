"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PropertyForm from "./PropertyForm";
import PropertyList from "./PropertyList";
import { Property } from "./types";
import Link from "next/link";
import EditPropertyModal from "./EditPropertyModal";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [editing, setEditing] = useState<Property | null>(null);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from("saved_properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setProperties(data || []);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

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
          onRefresh={fetchProperties}
          onEdit={(p) => setEditing(p)}
        />

        <EditPropertyModal
          property={editing}
          onClose={() => setEditing(null)}
          onUpdated={fetchProperties}
        />
      </div>
    </main>
  );
}
