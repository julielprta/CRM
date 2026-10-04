"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Evenement } from "@/lib/types";
import { formatDateFR } from "@/lib/format";

type EvenementWithCount = Evenement & { participations: { count: number }[] };

export default function EventsPage() {
  const [events, setEvents] = useState<EvenementWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("evenements")
        .select("*, participations(count)")
        .order("date_evenement", { ascending: false });
      setEvents((data as any) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl">Événements</h1>
          <p className="text-ink/60 mt-1 text-sm">
            {events.length} événement{events.length > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/events/new"
          className="bg-moss text-paper px-4 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors"
        >
          + Nouvel événement
        </Link>
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
              {events.map((ev) => (
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
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                    Aucun événement pour le moment.
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
