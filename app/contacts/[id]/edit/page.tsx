"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CLUSTER_OPTIONS, CTO_OPTIONS, DISPOSITIFS, ENTITE_OPTIONS } from "@/lib/types";

export default function EditContactPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("contacts").select("*").eq("id", id).single();
      setForm(data);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  function update(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom || !form.prenom) {
      setError("Le nom et le prénom sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    // IRC (catégorie/note) et taux d'ouverture ne sont pas modifiables ici :
    // ils continuent d'être gérés via « + Ajouter une entrée » et, plus tard,
    // automatiquement pour le taux d'ouverture. On les laisse donc inchangés.
    const { id: _id, created_at, ...updates } = form;
    const { error } = await supabase.from("contacts").update(updates).eq("id", id);
    setSaving(false);
    if (error) setError(error.message);
    else router.push(`/contacts/${id}`);
  }

  if (loading || !form) return <p className="text-ink/60 text-sm">Chargement…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-6">
        Modifier {form.prenom} {form.nom}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom *">
            <input value={form.nom} onChange={(e) => update("nom", e.target.value)} className="input" />
          </Field>
          <Field label="Prénom *">
            <input value={form.prenom} onChange={(e) => update("prenom", e.target.value)} className="input" />
          </Field>
        </div>
        <Field label="E-mail">
          <input
            type="email"
            value={form.email || ""}
            onChange={(e) => update("email", e.target.value)}
            className="input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Téléphone">
            <input
              value={form.telephone || ""}
              onChange={(e) => update("telephone", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Fonction">
            <input
              value={form.fonction || ""}
              onChange={(e) => update("fonction", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Entité">
            <select
              value={form.entite || ""}
              onChange={(e) => update("entite", e.target.value)}
              className="input"
            >
              <option value="">—</option>
              {ENTITE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cluster">
            <select
              value={form.cluster || ""}
              onChange={(e) => update("cluster", e.target.value)}
              className="input"
            >
              <option value="">—</option>
              {CLUSTER_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="CTO référent">
            <select value={form.cto || ""} onChange={(e) => update("cto", e.target.value)} className="input">
              <option value="">—</option>
              {CTO_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Site / Zone">
            <input
              value={form.site_zone || ""}
              onChange={(e) => update("site_zone", e.target.value)}
              className="input"
              placeholder="ex. Paris, Guyancourt…"
            />
          </Field>
        </div>
        <div>
          <p className="text-sm font-medium text-ink/70 mb-2">Dispositifs</p>
          <div className="grid grid-cols-1 gap-2">
            {DISPOSITIFS.map((d) => (
              <label key={d.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form[d.key]}
                  onChange={(e) => update(d.key as string, e.target.checked)}
                />
                {d.label}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-clay text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-moss text-paper px-5 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #dad5c8;
          border-radius: 2px;
          padding: 8px 12px;
          font-size: 14px;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink/70 mb-1">{label}</span>
      {children}
    </label>
  );
}
