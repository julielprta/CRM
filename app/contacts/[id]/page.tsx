"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  CommentaireEntry,
  Contact,
  DISPOSITIFS,
  Evenement,
  IrcEntry,
  Participation,
  QosEntry,
} from "@/lib/types";
import { formatDateFR } from "@/lib/format";

type ParticipationRow = Participation & { evenements: Evenement };

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [contact, setContact] = useState<Contact | null>(null);
  const [history, setHistory] = useState<ParticipationRow[]>([]);
  const [ircHistory, setIrcHistory] = useState<IrcEntry[]>([]);
  const [qosHistory, setQosHistory] = useState<QosEntry[]>([]);
  const [commentHistory, setCommentHistory] = useState<CommentaireEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: c } = await supabase.from("contacts").select("*").eq("id", id).single();
      setContact(c as Contact);

      const { data: h } = await supabase
        .from("participations")
        .select("*, evenements(*)")
        .eq("contact_id", id)
        .order("created_at", { ascending: false });
      setHistory((h as any) ?? []);

      const { data: irc } = await supabase
        .from("irc_entries")
        .select("*")
        .eq("contact_id", id)
        .order("date_entry", { ascending: false });
      setIrcHistory((irc as IrcEntry[]) ?? []);

      const { data: qos } = await supabase
        .from("qos_entries")
        .select("*")
        .eq("contact_id", id)
        .order("date_entry", { ascending: false });
      setQosHistory((qos as QosEntry[]) ?? []);

      const { data: comments } = await supabase
        .from("commentaires_entries")
        .select("*")
        .eq("contact_id", id)
        .order("date_entry", { ascending: false });
      setCommentHistory((comments as CommentaireEntry[]) ?? []);

      setLoading(false);
    }
    if (id) load();
  }, [id]);

  if (loading) return <p className="text-ink/60 text-sm">Chargement…</p>;
  if (!contact) return <p className="text-ink/60 text-sm">Contact introuvable.</p>;

  const activeDispositifs = DISPOSITIFS.filter((d) => (contact as any)[d.key]);

  const pastWithStatut = history.filter((p) => p.statut === "Présent" || p.statut === "Absent");
  const presentCount = pastWithStatut.filter((p) => p.statut === "Présent").length;
  const presenceRate =
    pastWithStatut.length > 0 ? Math.round((presentCount / pastWithStatut.length) * 100) : null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-2">
        <p className="text-ink/50 text-sm">Fiche contact</p>
        <Link href={`/contacts/${contact.id}/edit`} className="text-moss text-sm hover:underline">
          Modifier
        </Link>
      </div>
      <h1 className="font-display text-3xl mb-1">
        {contact.prenom} {contact.nom}
      </h1>
      <p className="text-ink/60 mb-6">
        {contact.fonction} {contact.entite ? `— ${contact.entite}` : ""}
      </p>

      {(contact.irc_categorie || contact.irc_note !== null) && (
        <div className="mb-6 flex gap-2 items-center">
          {contact.irc_categorie && <IrcBadge categorie={contact.irc_categorie} />}
          {contact.irc_note !== null && (
            <span className="text-xs border border-line rounded-full px-3 py-1 text-ink/70">
              Note IRC : {contact.irc_note > 0 ? "+" : ""}{contact.irc_note}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-10 bg-white/50 border border-line rounded-sm p-5 text-sm">
        <InfoRow label="E-mail" value={contact.email} />
        <InfoRow label="Téléphone" value={contact.telephone} />
        <InfoRow label="Cluster" value={contact.cluster} />
        <InfoRow label="CTO référent" value={contact.cto} />
        <InfoRow label="Site / Zone" value={contact.site_zone} />
      </div>

      <div className="mb-10">
        <h2 className="font-display text-xl mb-3">Dispositifs</h2>
        {activeDispositifs.length === 0 ? (
          <p className="text-ink/50 text-sm">Aucun dispositif coché.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeDispositifs.map((d) => (
              <span
                key={d.key}
                className="text-xs bg-moss/10 text-moss border border-moss/30 rounded-full px-3 py-1"
              >
                {d.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="font-display text-xl mb-3">Engagement</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <StatCard
            label="Taux de présence aux événements"
            value={presenceRate !== null ? `${presenceRate}%` : "—"}
            note={
              pastWithStatut.length > 0
                ? `${presentCount}/${pastWithStatut.length} événement(s) avec statut connu`
                : "Pas encore de statut Présent/Absent enregistré"
            }
          />
          <StatCard
            label="Taux d'ouverture des e-mails"
            value={
              contact.taux_ouverture_email !== null ? `${contact.taux_ouverture_email}%` : "—"
            }
            note="Pas encore disponible — sera calculé automatiquement une fois un outil d'emailing connecté"
          />
        </div>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-xl mb-3">Historique des participations</h2>
        {history.length === 0 ? (
          <p className="text-ink/50 text-sm">Aucun événement enregistré pour ce contact.</p>
        ) : (
          <div className="border border-line rounded-sm overflow-hidden bg-white/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-ink/60">
                  <th className="px-4 py-2 font-medium">Événement</th>
                  <th className="px-4 py-2 font-medium">Type</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {history.map((p) => (
                  <tr key={p.id} className="border-b border-line/60">
                    <td className="px-4 py-2">{p.evenements?.nom}</td>
                    <td className="px-4 py-2">{p.evenements?.type}</td>
                    <td className="px-4 py-2">{formatDateFR(p.evenements?.date_evenement)}</td>
                    <td className="px-4 py-2">
                      <StatutBadge statut={p.statut} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Perception (IRC)</h2>
          <Link
            href={`/contacts/${contact.id}/irc/new`}
            className="text-moss text-sm hover:underline"
          >
            + Ajouter une entrée
          </Link>
        </div>
        {ircHistory.length === 0 ? (
          <p className="text-ink/50 text-sm">Aucune entrée IRC enregistrée pour ce contact.</p>
        ) : (
          <div className="space-y-3">
            {ircHistory.map((entry) => (
              <div key={entry.id} className="border border-line rounded-sm p-4 bg-white/50 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-ink/50">{formatDateFR(entry.date_entry)}</span>
                    {entry.categorie && <IrcBadge categorie={entry.categorie} />}
                    {entry.note !== null && (
                      <span className="text-xs text-ink/50">Note : {entry.note > 0 ? "+" : ""}{entry.note}</span>
                    )}
                  </div>
                </div>
                {entry.commentaire && <p className="mb-2">{entry.commentaire}</p>}
                {entry.irritants && (
                  <p className="text-xs text-clay">Irritants : {entry.irritants}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Actualité QoS</h2>
          <Link
            href={`/contacts/${contact.id}/qos/new`}
            className="text-moss text-sm hover:underline"
          >
            + Ajouter une remontée
          </Link>
        </div>
        {qosHistory.length === 0 ? (
          <p className="text-ink/50 text-sm">Aucune remontée QoS enregistrée pour ce contact.</p>
        ) : (
          <div className="space-y-3">
            {qosHistory.map((entry) => (
              <div key={entry.id} className="border border-line rounded-sm p-4 bg-white/50 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ink/50">{formatDateFR(entry.date_entry)}</span>
                </div>
                <p>{entry.commentaire}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Commentaires</h2>
          <Link
            href={`/contacts/${contact.id}/commentaires/new`}
            className="text-moss text-sm hover:underline"
          >
            + Ajouter un commentaire
          </Link>
        </div>
        {commentHistory.length === 0 ? (
          <p className="text-ink/50 text-sm">Aucun commentaire enregistré pour ce contact.</p>
        ) : (
          <div className="space-y-3">
            {commentHistory.map((entry) => (
              <div key={entry.id} className="border border-line rounded-sm p-4 bg-white/50 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ink/50">{formatDateFR(entry.date_entry)}</span>
                </div>
                <p>{entry.commentaire}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-ink/50 text-xs uppercase tracking-wide mb-0.5">{label}</p>
      <p>{value || "—"}</p>
    </div>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="border border-line rounded-sm p-4 bg-white/50">
      <p className="text-ink/50 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl mb-1">{value}</p>
      <p className="text-ink/40 text-xs">{note}</p>
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    Invité: "bg-ink/5 text-ink/70 border-ink/20",
    Inscrit: "bg-moss/10 text-moss border-moss/30",
    Décliné: "bg-clay/10 text-clay border-clay/30",
    Présent: "bg-moss/20 text-mossdark border-moss/40",
    Absent: "bg-ink/5 text-ink/40 border-ink/10",
  };
  return (
    <span className={`text-xs border rounded-full px-2 py-0.5 ${colors[statut] ?? ""}`}>
      {statut}
    </span>
  );
}

function IrcBadge({ categorie }: { categorie: string }) {
  const colors: Record<string, string> = {
    Promoteur: "bg-moss/15 text-moss border-moss/30",
    Neutre: "bg-ink/5 text-ink/60 border-ink/20",
    Détracteur: "bg-clay/10 text-clay border-clay/30",
  };
  return (
    <span className={`text-xs border rounded-full px-3 py-1 ${colors[categorie] ?? ""}`}>
      {categorie}
    </span>
  );
}
