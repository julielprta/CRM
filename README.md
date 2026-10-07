# Base clients CA-GIP — MVP

## Contexte

Prototype de CRM interne pour l'équipe communication de CA-GIP, construit pour
remplacer un suivi jusque-là géré sur SharePoint. Objectif : centraliser les
contacts, suivre leur participation aux événements et dispositifs (RDV
Clients, Tech & Collab, comités, mailings…), et consigner la perception
client (IRC) et les remontées QoS dans le temps.

Ce projet est un **MVP de démonstration** réalisé en solo sur 2 semaines, à
données fictives. Voir "État actuel et limites connues" plus bas avant toute
mise en production.

## Stack technique

| Techno | Rôle |
|---|---|
| [Next.js](https://nextjs.org) 14 (App Router) | Framework qui fait tourner l'application et gère le routage (chaque dossier dans `app/` = une URL) |
| [React](https://react.dev) | Bibliothèque d'interface — l'appli est découpée en composants |
| [TypeScript](https://www.typescriptlang.org) | JavaScript typé — évite une classe d'erreurs à l'écriture |
| [Tailwind CSS](https://tailwindcss.com) | Styles écrits en classes utilitaires directement dans le JSX |
| [Supabase](https://supabase.com) | Base de données (PostgreSQL managé) + API auto-générée + futur système d'authentification |
| [papaparse](https://www.papaparse.com) | Génération des exports CSV |

Choix fait pour un MVP rapide à construire et à faire évoluer par quelqu'un
qui découvre le développement web (pas de serveur backend à écrire à la
main : Supabase expose directement la base de données via une API).

## Architecture
Navigateur ←→ Application Next.js (le code de ce dépôt) ←→ Supabase (PostgreSQL, dans le cloud)

L'application elle-même n'a pas de serveur backend propre : chaque page
appelle directement Supabase depuis le navigateur via la librairie
`@supabase/supabase-js` (voir `lib/supabaseClient.ts`). La sécurité des
données repose donc entièrement sur les règles RLS (Row Level Security)
définies côté Supabase — voir les limites plus bas.

## Structure du projet
app/
page.tsx Liste des contacts (accueil) : recherche, filtres, export CSV
contacts/new/ Création d'un contact
contacts/[id]/page.tsx Fiche contact : infos, dispositifs, engagement, historiques
contacts/[id]/edit/ Modification d'un contact
contacts/[id]/irc/new/ Ajout d'une entrée de perception IRC
contacts/[id]/qos/new/ Ajout d'une remontée QoS
contacts/[id]/commentaires/new/ Ajout d'un commentaire historisé
events/page.tsx Liste des événements
events/new/ Création d'un événement
events/[id]/page.tsx Tableau de bord d'un événement (compteurs, participants, ajout en masse)
events/[id]/edit/ Modification d'un événement
layout.tsx, globals.css Gabarit général et styles globaux

components/
Nav.tsx Barre de navigation commune à toutes les pages

lib/
supabaseClient.ts Connexion unique à Supabase, réutilisée partout
types.ts Types TypeScript + toutes les listes de choix (clusters, entités, CTO…)
format.ts Formatage des dates en jj/mm/aaaa

supabase/
schema.sql Script de création des tables (à exécuter manuellement dans Supabase)
seed_contacts_demo.sql Contacts de démonstration pour les tests/présentations

## Schéma de données

- **contacts** — référentiel (niveau 1) + dispositifs en colonnes Oui/Non
  (niveau 2) + instantané de perception IRC (catégorie/note).
- **evenements** — un événement = une date + un type (réunion physique OU
  date d'envoi d'un mailing).
- **participations** — table de liaison contact ↔ événement, avec un statut
  (Invité / Inscrit / Décliné / Présent / Absent). C'est elle qui alimente
  automatiquement l'historique affiché sur la fiche contact.
- **irc_entries** — historique des entrées de perception IRC (une ligne par
  enquête/interaction), avec verbatim et irritants.
- **qos_entries** — remontées qualité de service, indépendantes du cycle IRC
  annuel.
- **commentaires_entries** — commentaires libres historisés sur un contact.

Le détail des colonnes est dans `supabase/schema.sql`.

## Installation et lancement en local

Prérequis : [Node.js](https://nodejs.org) 18+, un compte
[Supabase](https://supabase.com) (gratuit).

1. Créer un projet Supabase, puis dans **SQL Editor**, exécuter dans l'ordre
   `supabase/schema.sql` puis, pour des données de démo,
   `supabase/seed_contacts_demo.sql`.
2. Récupérer l'URL et la clé `anon public` du projet (**Project Settings > API**).
3. À la racine du projet :
```bash
   npm install
   cp .env.local.example .env.local
   # éditer .env.local avec l'URL et la clé récupérées à l'étape 2
   npm run dev
```
4. Ouvrir http://localhost:3000.

## État actuel et limites connues

À lire avant toute évolution vers une mise en production avec de vraies
données clients.

- **Pas d'authentification.** N'importe qui disposant de l'URL et de la clé
  Supabase peut lire et modifier toutes les données (règles RLS ouvertes,
  `using (true)`, dans `schema.sql`). À remplacer par Supabase Auth (ou un
  équivalent) avant toute donnée réelle.
- **Pas de traçabilité des auteurs.** Les champs `auteur` existent déjà dans
  `irc_entries`, `qos_entries` et `commentaires_entries`, mais ne sont pas
  encore remplis : il n'y a pas de notion d'utilisateur connecté. À brancher
  en même temps que l'authentification, pour que ce champ se remplisse
  automatiquement plutôt que d'être saisi à la main.
- **Hébergement non conforme pour de vraies données.** Supabase Cloud (offre
  gratuite utilisée ici) héberge les données hors de l'infrastructure
  CA-GIP, sans garantie de localisation ni conformité SOC 2 sur ce plan.
  Deux pistes pour une vraie mise en production : auto-héberger Supabase sur
  l'infrastructure CA-GIP (le code applicatif ne changerait pas), ou migrer
  vers une plateforme déjà homologuée en interne. Décision à prendre avec la
  DSI, pas au niveau de ce projet.
- **Taux d'ouverture des e-mails non implémenté.** Aucune donnée réelle
  n'existe actuellement nulle part : il faudrait un outil d'emailing (avec
  tracking d'ouverture) envoyant ses événements vers Supabase, par exemple
  via un webhook relayé par n8n.
- **Pas d'import CSV en masse** pour les contacts (ajout un par un pour
  l'instant, ou insertion directe en base via le SQL Editor de Supabase).
- **Lien avec Netkin (plateforme événementielle envisagée)** non implémenté
  — prévu au niveau 3 du cahier des charges, à construire une fois Netkin
  retenue et son format d'échange connu (export/API).

## Pistes d'évolution

Par ordre de priorité probable pour une suite :

1. Authentification (Supabase Auth) + remplissage automatique des champs
   `auteur`.
2. Décision et mise en œuvre de l'hébergement définitif avec la DSI.
3. Import CSV en masse pour les contacts.
4. Connexion à un outil d'emailing réel pour le taux d'ouverture.
5. Intégration avec la plateforme événementielle (Netkin ou autre) pour
   automatiser inscriptions/présences.

## Déploiement (optionnel, pour une démo accessible par lien)

Le plus simple est [Vercel](https://vercel.com), qui fait Next.js :

1. Connecter ce dépôt à un compte Vercel.
2. Renseigner les deux mêmes variables d'environnement que dans `.env.local`
   dans les réglages du projet Vercel.
3. Déployer : Vercel fournit une URL publique.

Utile pour une démonstration ; ne résout pas la question de l'hébergement
des données pour une vraie mise en production (voir plus haut).