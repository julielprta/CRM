"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";
import { Contact, DISPOSITIFS, Evenement, Participation, STATUTS, Statut } from "@/lib/types";
import { formatDateFR } from "@/lib/format";

type ParticipationRow = Participation & { contacts: Contact };

export default function EventDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Evenement | null>(null);
  const [participations, setParticipations] = useState<ParticipationRow[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [addSearch, setAddSearch] = useState("");
  const [bulkDispositif, setBulkDispositif] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    const { data: ev } = await supabase.from("evenements").select("*").eq("id", id).single();
    setEvent(ev as Evenement);

    const { data: parts } = await supabase
      .from("participations")
      .select("*, contacts(*)")
      .eq("evenement_id", id);
    setParticipations((parts as any) ?? []);

    const { data: contacts } = await supabase.from("contacts").select("*").order("nom");
    setAllContacts((contacts as Contact[]) ?? []);

    setLoading(false);
  }

  useEffect(() => {
    if (id) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addedIds = useMemo(() => new Set(participations.map((p) => p.contact_id)), [participations]);

  const counts = useMemo(() => {
    const base: Record<Statut, number> = {
      Invité: 0,
      Inscrit: 0,
      Décliné: 0,
      Présent: 0,
      Absent: 0,
    };
    participations.forEach((p) => {
      base[p.statut] = (base[p.statut] ?? 0) + 1;
    });
    return base;
  }, [participations]);

  const searchResults = useMemo(() => {
    if (!addSearch) return [];
    const s = addSearch.toLowerCase();
    return allContacts
      .filter((c) => !addedIds.has(c.id))
      .filter((c) => `${c.nom} ${c.prenom} ${c.email ?? ""}`.toLowerCase().includes(s))
      .slice(0, 8);
  }, [addSearch, allContacts, addedIds]);

  const bulkCandidates = useMemo(() => {
    if (!bulkDispositif) return [];
    return allContacts.filter((c) => (c as any)[bulkDispositif] && !addedIds.has(c.id));
  }, [bulkDispositif, allContacts, addedIds]);

  async function addParticipant(contactId: string) {
    await supabase
      .from("participations")
      .insert([{ contact_id: contactId, evenement_id: id, statut: "Invité" }]);
    setAddSearch("");
    loadAll();
  }

  async function addByDispositif() {
    if (!bulkDispositif || bulkCandidates.length === 0) return;
    setBulkLoading(true);
    const rows = bulkCandidates.map((c) => ({
      contact_id: c.id,
      evenement_id: id,
      statut: "Invité",
    }));
    await supabase.from("participations").insert(rows);
    setBulkDispositif("");
    setBulkLoading(false);
    loadAll();
  }

  async function updateStatut(participationId: string, statut: Statut) {
    setParticipations((prev) =>
      prev.map((p) => (p.id === participationId ? { ...p, statut } : p))
    );
    await supabase.from("participations").update({ statut }).eq("id", participationId);
  }

  async function removeParticipant(participationId: string) {
    await supabase.from("participations").delete().eq("id", participationId);
    loadAll();
  }

  function exportParticipants() {
    const rows = participations.map((p) => ({
      Nom: p.contacts?.nom ?? "",
      Prénom: p.contacts?.prenom ?? "",
      Email: p.contacts?.email ?? "",
      Entité: p.contacts?.entite ?? "",
      Cluster: p.contacts?.cluster ?? "",
      Statut: p.statut,
    }));
    const csv = Papa.unparse(rows, { delimiter: ";" });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${event?.nom ?? "evenement"}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <p className="text-ink/60 text-sm">Chargement…</p>;
  if (!event) return <p className="text-ink/60 text-sm">Événement introuvable.</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-ink/50 text-sm">
          {event.type} — {formatDateFR(event.date_evenement)}
        </p>
        <Link href={`/events/${id}/edit`} className="text-moss text-sm hover:underline">
          Modifier
        </Link>
      </div>
      <h1 className="font-display text-3xl mb-6">{event.nom}</h1>

      {/* Tableau de bord : compteurs par statut */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {STATUTS.map((s) => (
          <div key={s} className="border border-line rounded-sm p-3 bg-white/50 text-center">
            <p className="font-display text-2xl">{counts[s]}</p>
            <p className="text-ink/50 text-xs mt-1">{s}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 border border-line rounded-sm p-4 bg-white/50">
        <p className="text-sm font-medium text-ink/70 mb-2">
          Ajouter tous les contacts ayant un tag
        </p>
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={bulkDispositif}
            onChange={(e) => setBulkDispositif(e.target.value)}
            className="border border-line rounded-sm px-3 py-2 text-sm bg-white"
          >
            <option value="">Choisir un tag…</option>
            {DISPOSITIFS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
          <button
            onClick={addByDispositif}
            disabled={!bulkDispositif || bulkCandidates.length === 0 || bulkLoading}
            className="bg-moss text-paper px-4 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors disabled:opacity-40"
          >
            {bulkLoading
              ? "Ajout…"
              : bulkDispositif
              ? `Ajouter ${bulkCandidates.length} contact${bulkCandidates.length > 1 ? "s" : ""}`
              : "Ajouter"}
          </button>
        </div>
        {bulkDispositif && bulkCandidates.length === 0 && (
          <p className="text-ink/40 text-xs mt-2">
            Tous les contacts avec ce tag sont déjà dans la liste des participants.
          </p>
        )}
      </div>

      <div className="mb-8 relative">
        <label className="block text-sm font-medium text-ink/70 mb-1">
          Ajouter un contact précis
        </label>
        <input
          value={addSearch}
          onChange={(e) => setAddSearch(e.target.value)}
          placeholder="Rechercher un contact par nom ou e-mail…"
          className="w-full border border-line rounded-sm px-3 py-2 text-sm bg-white"
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-line rounded-sm shadow-lg">
            {searchResults.map((c) => (
              <button
                key={c.id}
                onClick={() => addParticipant(c.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-moss/5 flex justify-between"
              >
                <span>
                  {c.prenom} {c.nom}
                </span>
                <span className="text-ink/40">{c.email}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-xl">Participants ({participations.length})</h2>
        {participations.length > 0 && (
          <button
            onClick={exportParticipants}
            className="border border-ink/20 px-3 py-1.5 rounded-sm text-sm font-medium hover:border-moss hover:text-moss transition-colors"
          >
            Exporter la liste (CSV)
          </button>
        )}
      </div>

      {participations.length === 0 ? (
        <p className="text-ink/50 text-sm">Aucun participant ajouté pour le moment.</p>
      ) : (
        <div className="border border-line rounded-sm overflow-hidden bg-white/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink/60">
                <th className="px-4 py-2 font-medium">Contact</th>
                <th className="px-4 py-2 font-medium">Entité</th>
                <th className="px-4 py-2 font-medium">Statut</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {participations.map((p) => (
                <tr key={p.id} className="border-b border-line/60">
                  <td className="px-4 py-2">
                    {p.contacts?.prenom} {p.contacts?.nom}
                  </td>
                  <td className="px-4 py-2">{p.contacts?.entite || "—"}</td>
                  <td className="px-4 py-2">
                    <select
                      value={p.statut}
                      onChange={(e) => updateStatut(p.id, e.target.value as Statut)}
                      className="border border-line rounded-sm px-2 py-1 text-sm bg-white"
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="text-ink/40 hover:text-clay text-xs"
                    >
                      Retirer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
