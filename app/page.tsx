"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";
import { Contact, DISPOSITIFS } from "@/lib/types";

const ALL_COLUMNS = [
  { key: "nom", label: "Nom" },
  { key: "prenom", label: "Prénom" },
  { key: "email", label: "E-mail" },
  { key: "entite", label: "Entité" },
  { key: "cluster", label: "Cluster" },
  { key: "fonction", label: "Fonction" },
  { key: "site_zone", label: "Site / Zone" },
] as const;

type ColKey = (typeof ALL_COLUMNS)[number]["key"];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [clusterFilter, setClusterFilter] = useState("");
  const [entiteFilter, setEntiteFilter] = useState("");
  const [dispositifFilter, setDispositifFilter] = useState<string>("");

  const [visibleCols, setVisibleCols] = useState<ColKey[]>([
    "nom",
    "prenom",
    "email",
    "entite",
    "cluster",
  ]);
  const [showColPicker, setShowColPicker] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("nom", { ascending: true });
      if (error) setError(error.message);
      else setContacts(data as Contact[]);
      setLoading(false);
    }
    load();
  }, []);

  const clusters = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.cluster).filter(Boolean))) as string[],
    [contacts]
  );
  const entites = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.entite).filter(Boolean))) as string[],
    [contacts]
  );

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (clusterFilter && c.cluster !== clusterFilter) return false;
      if (entiteFilter && c.entite !== entiteFilter) return false;
      if (dispositifFilter && !(c as any)[dispositifFilter]) return false;
      if (search) {
        const s = search.toLowerCase();
        const haystack = `${c.nom} ${c.prenom} ${c.email ?? ""} ${c.entite ?? ""}`.toLowerCase();
        if (!haystack.includes(s)) return false;
      }
      return true;
    });
  }, [contacts, search, clusterFilter, entiteFilter, dispositifFilter]);

  function toggleCol(key: ColKey) {
    setVisibleCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function exportCsv() {
    const rows = filtered.map((c) => {
      const row: Record<string, string> = {};
      visibleCols.forEach((key) => {
        row[ALL_COLUMNS.find((col) => col.key === key)!.label] = (c as any)[key] ?? "";
      });
      return row;
    });
    const csv = Papa.unparse(rows, { delimiter: ";" });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl">Contacts</h1>
          <p className="text-ink/60 mt-1 text-sm">
            {filtered.length} contact{filtered.length > 1 ? "s" : ""}
            {filtered.length !== contacts.length ? ` sur ${contacts.length}` : ""}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCsv}
            className="bg-moss text-paper px-4 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors"
          >
            Exporter la liste (CSV)
          </button>
          <Link
            href="/contacts/new"
            className="border border-ink/20 px-4 py-2 rounded-sm text-sm font-medium hover:border-moss hover:text-moss transition-colors"
          >
            + Nouveau contact
          </Link>
        </div>
      </div>

      <div className="bg-white/60 border border-line rounded-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Rechercher (nom, e-mail, entité...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-line rounded-sm px-3 py-2 text-sm flex-1 min-w-[220px] bg-white"
        />
        <select
          value={clusterFilter}
          onChange={(e) => setClusterFilter(e.target.value)}
          className="border border-line rounded-sm px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les clusters</option>
          {clusters.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={entiteFilter}
          onChange={(e) => setEntiteFilter(e.target.value)}
          className="border border-line rounded-sm px-3 py-2 text-sm bg-white"
        >
          <option value="">Toutes les entités</option>
          {entites.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={dispositifFilter}
          onChange={(e) => setDispositifFilter(e.target.value)}
          className="border border-line rounded-sm px-3 py-2 text-sm bg-white"
        >
          <option value="">Tous les dispositifs</option>
          {DISPOSITIFS.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>
        <div className="relative ml-auto">
          <button
            onClick={() => setShowColPicker((s) => !s)}
            className="text-sm border border-line rounded-sm px-3 py-2 bg-white hover:border-moss"
          >
            Colonnes ▾
          </button>
          {showColPicker && (
            <div className="absolute right-0 mt-1 bg-white border border-line rounded-sm shadow-lg p-3 z-20 w-56">
              {ALL_COLUMNS.map((col) => (
                <label key={col.key} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(col.key)}
                    onChange={() => toggleCol(col.key)}
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <p className="text-ink/60 text-sm">Chargement…</p>}
      {error && (
        <p className="text-clay text-sm border border-clay/40 bg-clay/5 rounded-sm p-3">
          Erreur de connexion à Supabase : {error}. Vérifie ton fichier .env.local.
        </p>
      )}

      {!loading && !error && (
        <div className="border border-line rounded-sm overflow-x-auto bg-white/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink/60">
                {visibleCols.map((key) => (
                  <th key={key} className="px-4 py-3 font-medium">
                    {ALL_COLUMNS.find((c) => c.key === key)?.label}
                  </th>
                ))}
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-line/60 hover:bg-moss/5">
                  {visibleCols.map((key) => (
                    <td key={key} className="px-4 py-3">
                      {(c as any)[key] || <span className="text-ink/30">—</span>}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/contacts/${c.id}`} className="text-moss hover:underline">
                      Voir la fiche
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={visibleCols.length + 1} className="px-4 py-8 text-center text-ink/50">
                    Aucun contact ne correspond à ces filtres.
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
