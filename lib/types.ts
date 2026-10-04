export type Contact = {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  fonction: string | null;
  entite: string | null;
  cluster: string | null;
  cto: string | null;
  site_zone: string | null;
  commentaires: string | null;
  rdv_clients: boolean;
  tech_collab: boolean;
  mailing_brief: boolean;
  mailing_leaflet: boolean;
  mailing_irc_flash: boolean;
  psi_principal: boolean;
  psi_copie: boolean;
  comite_plateforme: boolean;
  comite_cocoordsi: boolean;
  irc_categorie: IrcCategorie | null;
  irc_note: number | null;
  taux_ouverture_email: number | null;
  created_at: string;
};

export type Evenement = {
  id: string;
  nom: string;
  type: string;
  date_evenement: string;
  created_at: string;
};

export type Statut = "Invité" | "Inscrit" | "Décliné" | "Présent" | "Absent";

export type Participation = {
  id: string;
  contact_id: string;
  evenement_id: string;
  statut: Statut;
  created_at: string;
};

export type IrcCategorie = "Détracteur" | "Neutre" | "Promoteur";

export type IrcEntry = {
  id: string;
  contact_id: string;
  date_entry: string;
  note: number | null;
  categorie: IrcCategorie | null;
  commentaire: string | null;
  irritants: string | null; // libellés séparés par des virgules
  auteur: string | null;
  created_at: string;
};

// Remontées QoS : séparées de l'IRC (annuel) car elles arrivent toute l'année.
export type QosEntry = {
  id: string;
  contact_id: string;
  date_entry: string;
  auteur: string | null;
  commentaire: string | null;
  created_at: string;
};

// Commentaires historisés — même principe que les remontées QoS.
export type CommentaireEntry = {
  id: string;
  contact_id: string;
  date_entry: string;
  auteur: string | null;
  commentaire: string;
  created_at: string;
};

export const STATUTS: Statut[] = ["Invité", "Inscrit", "Décliné", "Présent", "Absent"];

export const IRC_CATEGORIES: IrcCategorie[] = ["Détracteur", "Neutre", "Promoteur"];

// Dictionnaire des irritants — à affiner avec les vrais thèmes de l'IRC.
export const IRRITANTS_OPTIONS: string[] = [
  "Délais de traitement",
  "Qualité de service",
  "Communication insuffisante",
  "Complexité des outils",
  "Disponibilité des interlocuteurs",
  "Autre",
];

// Listes de démo — à remplacer par les vraies valeurs CA-GIP.
// Ajouter/retirer une valeur ici suffit à la faire apparaître partout.
export const CTO_OPTIONS: string[] = ["CTO 1", "CTO 2", "CTO 3"];

export const ENTITE_OPTIONS: string[] = ["CAIF", "AZQORE", "CACEIS", "CACIB", "CAPS", "CASA"];

export const CLUSTER_OPTIONS: string[] = [
  "BPCR",
  "BPCA",
  "CXI",
  "CIB",
  "GEA",
  "Paiements",
  "SFS",
  "QdS",
];

export const SITE_OPTIONS: string[] = ["Paris", "Guyancourt", "Lille", "Lyon", "Autre"];

// Auteurs possibles pour les entrées IRC / QoS — en attendant une vraie
// authentification, c'est une liste à choisir à la main.
export const AUTEUR_OPTIONS: string[] = ["Julie", "Autre"];

export const DISPOSITIFS: { key: keyof Contact; label: string }[] = [
  { key: "rdv_clients", label: "Rendez-vous Clients" },
  { key: "tech_collab", label: "Tech & Collab" },
  { key: "comite_plateforme", label: "Comité Plateforme" },
  { key: "comite_cocoordsi", label: "CoCoorDSI" },
  { key: "mailing_brief", label: "Mailing Brief" },
  { key: "mailing_leaflet", label: "Mailing Leaflet" },
  { key: "mailing_irc_flash", label: "Mailing IRC Flash" },
  { key: "psi_principal", label: "PSI — destinataire principal" },
  { key: "psi_copie", label: "PSI — en copie" },
];
