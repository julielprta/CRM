"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NewQosEntryPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [commentaire, setCommentaire] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !commentaire) {
      setError("La date et le commentaire sont obligatoires.");
      return;
    }
    setSaving(true);
    setError(null);
    // "auteur" n'est pas encore rempli ici : il sera renseigné automatiquement
    // plus tard, une fois une vraie connexion utilisateur en place (comme pour
    // les commentaires). Pour l'instant la colonne reste vide.
    const { error: insertError } = await supabase.from("qos_entries").insert([
      { contact_id: contactId, date_entry: date, commentaire },
    ]);
    setSaving(false);
    if (insertError) setError(insertError.message);
    else router.push(`/contacts/${contactId}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-6">Nouvelle remontée QoS</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
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
          <span className="block text-sm font-medium text-ink/70 mb-1">Commentaire *</span>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className="input"
            rows={4}
          />
        </label>

        {error && <p className="text-clay text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-moss text-paper px-5 py-2 rounded-sm text-sm font-medium hover:bg-mossdark transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer la remontée"}
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
