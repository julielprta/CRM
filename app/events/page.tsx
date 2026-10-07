"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Evenement } from "@/lib/types";
import { formatDateFR } from "@/lib/format";

type EvenementWithCount = Evenement & { participations: { count: number }[] };

type SortOption = "date_desc" | "date_asc" | "type_asc";

export default function EventsPage() {
  const [events, setEvents] = useState<EvenementWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from("evenements").select("*, participations(count)");
      setEvents((data as any) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const types = useMemo(
    () => Array.from(new Set(events.map((e) => e.type))).sort(),
    [events]
  );

  const filteredSorted = useMemo(() => {
    let result = events;
    if (typeFilter) {
      result = result.filter((e) => e.type === typeFilter);
    }
    result = [...result].sort((a, b) => {
      if (sortBy === "date_desc") return b.date_evenement.localeCompare(a.date_evenement);
      if (sortBy === "date_asc") return a.date_evenement.localeCompare(b.date_evenement);
      if (sortBy === "type_asc") return a.type.localeCompare(b.type);
      return 0;
    });
    return result;
  }, [events, typeFilter, sortBy]);

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">Événements</h1>
          <p className="text-ink/60 mt-1 text-sm">
            {filteredSorted.length} événement{filteredSorted.length > 1 ? "s" : ""}
            {filteredSorted.length !== events.length ? ` sur ${events.length}` : ""}
          </p>
        </div>
        <Link
          href="/events/new"
          className="bg-moss text-paper px-4 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors"
        >
          + Nouvel événement
        </Link>
      </div>

      <div className="bg-white/60 border border-line rounded-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-line rounded-sm px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border border-line rounded-sm px-3 py-2 text-sm bg-white"
        >
          <option value="date_desc">Date (plus récent d'abord)</option>
          <option value="date_asc">Date (plus ancien d'abord)</option>
          <option value="type_asc">Type (A → Z)</option>
        </select>
      </div>

      {loading && <p className="text-ink/60 text-sm">Chargement…</p>}

      {!loading && (
        <div className="border border-line rounded-sm overflow-hidden bg-white/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink/60">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Participants</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredSorted.map((ev) => (
                <tr key={ev.id} className="border-b border-line/60 hover:bg-moss/5">
                  <td className="px-4 py-3">{ev.nom}</td>
                  <td className="px-4 py-3">{ev.type}</td>
                  <td className="px-4 py-3">{formatDateFR(ev.date_evenement)}</td>
                  <td className="px-4 py-3">{ev.participations?.[0]?.count ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/events/${ev.id}`} className="text-moss hover:underline">
                      Gérer
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredSorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                    Aucun événement ne correspond à ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}