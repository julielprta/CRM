"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { DISPOSITIFS } from "@/lib/types";

const TYPES = [...DISPOSITIFS.map((d) => d.label), "Conseil d'Administration", "Comm Exec", "Autre"];

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [nom, setNom] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("evenements").select("*").eq("id", id).single();
      if (data) {
        setNom(data.nom);
        setType(data.type);
        setDate(data.date_evenement);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom || !date) {
      setError("Le nom et la date sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from("evenements")
      .update({ nom, type, date_evenement: date })
      .eq("id", id);
    setSaving(false);
    if (error) setError(error.message);
    else router.push(`/events/${id}`);
  }

  if (loading) return <p className="text-ink/60 text-sm">Chargement…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-6">Modifier l'événement</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="block text-sm font-medium text-ink/70 mb-1">Nom *</span>
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink/70 mb-1">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink/70 mb-1">Date *</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white"
          />
        </label>

        {error && <p className="text-clay text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-moss text-paper px-5 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Sauvegarder"}
          </button>
        </div>
      </form>
    </div>
  );
}
