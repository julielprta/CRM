"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AUTEUR_OPTIONS, IRC_CATEGORIES, IRRITANTS_OPTIONS, IrcCategorie } from "@/lib/types";

export default function NewIrcEntryPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>("");
  const [categorie, setCategorie] = useState<IrcCategorie | "">("");
  const [commentaire, setCommentaire] = useState("");
  const [irritants, setIrritants] = useState<string[]>([]);
  const [auteur, setAuteur] = useState(AUTEUR_OPTIONS[0] ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleIrritant(value: string) {
    setIrritants((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) {
      setError("La date est obligatoire.");
      return;
    }
    setSaving(true);
    setError(null);

    const noteValue = note ? parseInt(note, 10) : null;

    const { error: insertError } = await supabase.from("irc_entries").insert([
      {
        contact_id: contactId,
        date_entry: date,
        note: noteValue,
        categorie: categorie || null,
        commentaire: commentaire || null,
        irritants: irritants.join(", ") || null,
        auteur: auteur || null,
      },
    ]);

    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    await supabase
      .from("contacts")
      .update({ irc_categorie: categorie || null, irc_note: noteValue })
      .eq("id", contactId);

    setSaving(false);
    router.push(`/contacts/${contactId}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-6">Nouvelle entrée IRC</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-ink/70 mb-1">Date *</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-ink/70 mb-1">
              Note (0 à 10)
            </span>
            <input
              type="number"
              min={0}
              max={10}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-ink/70 mb-1">Catégorie</span>
            <select
              value={categorie}
              onChange={(e) => setCategorie(e.target.value as IrcCategorie)}
              className="input"
            >
              <option value="">—</option>
              {IRC_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-ink/70 mb-1">Rédigé par</span>
            <select value={auteur} onChange={(e) => setAuteur(e.target.value)} className="input">
              {AUTEUR_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-ink/70 mb-1">
            Commentaire / Verbatim
          </span>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className="input"
            rows={3}
          />
        </label>

        <div>
          <p className="text-sm font-medium text-ink/70 mb-2">Irritants</p>
          <div className="grid grid-cols-1 gap-2">
            {IRRITANTS_OPTIONS.map((i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={irritants.includes(i)}
                  onChange={() => toggleIrritant(i)}
                />
                {i}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="text-clay text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-moss text-paper px-5 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer l'entrée"}
        </button>
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
