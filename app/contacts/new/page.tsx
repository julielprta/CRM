"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CLUSTER_OPTIONS, CTO_OPTIONS, DISPOSITIFS, ENTITE_OPTIONS, IRC_CATEGORIES, IrcCategorie } from "@/lib/types";

const initial = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  fonction: "",
  entite: "",
  cluster: "",
  cto: "",
  site_zone: "",
  rdv_clients: false,
  tech_collab: false,
  comite_plateforme: false,
  comite_cocoordsi: false,
  mailing_brief: false,
  mailing_leaflet: false,
  mailing_irc_flash: false,
  psi_principal: false,
  psi_copie: false,
  irc_categorie: "" as IrcCategorie | "",
  irc_note: "",
};

export default function NewContactPage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom || !form.prenom) {
      setError("Le nom et le prénom sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      irc_categorie: form.irc_categorie || null,
      irc_note: form.irc_note ? parseInt(form.irc_note, 10) : null,
    };
    const { error } = await supabase.from("contacts").insert([payload]);
    setSaving(false);
    if (error) setError(error.message);
    else router.push("/");
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-6">Nouveau contact</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nom *">
            <input value={form.nom} onChange={(e) => update("nom", e.target.value)} className="input" />
          </Field>
          <Field label="Prénom *">
            <input
              value={form.prenom}
              onChange={(e) => update("prenom", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <Field label="E-mail">
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="input"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Téléphone">
            <input
              value={form.telephone}
              onChange={(e) => update("telephone", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Fonction">
            <input
              value={form.fonction}
              onChange={(e) => update("fonction", e.target.value)}
              className="input"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Entité">
            <select value={form.entite} onChange={(e) => update("entite", e.target.value)} className="input">
              <option value="">—</option>
              {ENTITE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cluster">
            <select value={form.cluster} onChange={(e) => update("cluster", e.target.value)} className="input">
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
            <select value={form.cto} onChange={(e) => update("cto", e.target.value)} className="input">
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
              value={form.site_zone}
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
                  checked={(form as any)[d.key]}
                  onChange={(e) => update(d.key as any, e.target.checked)}
                />
                {d.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink/70 mb-2">Perception (IRC) — instantané</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Catégorie">
              <select
                value={form.irc_categorie}
                onChange={(e) => update("irc_categorie", e.target.value as IrcCategorie)}
                className="input"
              >
                <option value="">—</option>
                {IRC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Note IRC (0 à 10)">
              <input
                type="number"
                min={0}
                max={10}
                value={form.irc_note}
                onChange={(e) => update("irc_note", e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <p className="text-xs text-ink/40 mt-2">
            Pour l'historique détaillé (verbatims, irritants), utilise plutôt « + Ajouter une
            entrée » sur la fiche du contact une fois créé.
          </p>
        </div>

        {error && <p className="text-clay text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-moss text-paper px-5 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer le contact"}
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
