// Convertit une date stockée au format "AAAA-MM-JJ" (format Supabase) en
// "JJ/MM/AAAA" pour l'affichage. Retourne "—" si la date est vide.
export function formatDateFR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
