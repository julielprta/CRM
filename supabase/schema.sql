-- Schéma MVP CRM CA-GIP
-- À exécuter dans Supabase : Project > SQL Editor > New query > coller > Run

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  email text,
  telephone text,
  fonction text,
  entite text,
  cluster text,
  cto text,
  site_zone text,
  commentaires text,
  -- Niveau 2 : dispositifs (Oui/Non)
  rdv_clients boolean default false,
  tech_collab boolean default false,
  mailing_brief boolean default false,
  mailing_leaflet boolean default false,
  mailing_irc_flash boolean default false,
  psi_principal boolean default false,
  psi_copie boolean default false,
  created_at timestamptz default now()
);

create table if not exists evenements (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  type text not null, -- ex: "Tech & Collab", "RDV Clients", "CoCoorDSI"
  date_evenement date not null,
  created_at timestamptz default now()
);

create table if not exists participations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  evenement_id uuid references evenements(id) on delete cascade,
  statut text not null default 'Invité', -- Invité / Inscrit / Décliné / Présent / Absent
  created_at timestamptz default now(),
  unique (contact_id, evenement_id)
);

create index if not exists idx_participations_contact on participations(contact_id);
create index if not exists idx_participations_evenement on participations(evenement_id);
create index if not exists idx_contacts_cluster on contacts(cluster);
create index if not exists idx_contacts_entite on contacts(entite);

-- MVP : accès ouvert en lecture/écriture (à restreindre avant tout usage avec de vraies données)
alter table contacts enable row level security;
alter table evenements enable row level security;
alter table participations enable row level security;

create policy "mvp_all_contacts" on contacts for all using (true) with check (true);
create policy "mvp_all_evenements" on evenements for all using (true) with check (true);
create policy "mvp_all_participations" on participations for all using (true) with check (true);

-- Quelques données de démo
insert into contacts (nom, prenom, email, fonction, entite, cluster, tech_collab, rdv_clients, mailing_brief)
values
  ('Fournier', 'Clothilde', 'clothilde.fournier@example.com', 'Directrice IT', 'Banque Populaire', 'BPCA', true, false, true),
  ('La Porta', 'Julie', 'julie.laporta@example.com', 'Chargée de transformation', 'CA-GIP', 'BPCR', true, true, true),
  ('Leclerc', 'Paul', 'paul.leclerc@example.com', 'Responsable Qualité', 'Crédit Agricole', 'QdS', false, true, false)
on conflict do nothing;

-- Niveau 3 : perception client (IRC) et engagement — ajouté après le MVP initial
alter table contacts add column if not exists irc_categorie text;
alter table contacts add column if not exists irc_note integer;
alter table contacts add column if not exists taux_ouverture_email numeric;

create table if not exists irc_entries (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  date_entry date not null,
  note integer,
  categorie text,
  commentaire text,
  irritants text,
  actualite_qos text,
  created_at timestamptz default now()
);

alter table irc_entries enable row level security;
create policy "mvp_all_irc_entries" on irc_entries for all using (true) with check (true);

-- Auteur des entrées IRC + remontées QoS séparées (toute l'année, hors cycle IRC annuel)
alter table irc_entries add column if not exists auteur text;

create table if not exists qos_entries (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  date_entry date not null,
  auteur text,
  commentaire text,
  created_at timestamptz default now()
);

alter table qos_entries enable row level security;
create policy "mvp_all_qos_entries" on qos_entries for all using (true) with check (true);
