# Base clients CA-GIP — MVP

**Prototype de CRM pour le suivi des contacts, des événements et de la relation client.**

[**Accéder à la démo en ligne**](https://crm-gamma-eight-57.vercel.app/) 

> **Statut :** "brique à casser" — développé en solo en deux semaines, avec des données fictives. Déployé sur Vercel pour faciliter les démonstrations et les tests.

---

## Fonctionnalités

- **Gestion des contacts :** création, consultation, modification, recherche et filtrage.
- **Suivi des dispositifs :** visualisation de l'engagement des contacts dans les différents dispositifs de communication.
- **Gestion des événements :** création et modification d'événements, consultation des participants et suivi des statuts.
- **Gestion des participations :** ajout de participants en masse et suivi des statuts (Invité, Inscrit, Décliné, Présent, Absent).
- **Historique de la relation client :** suivi des entrées IRC, des remontées QoS et des commentaires.
- **Export CSV :** extraction des données de contacts.

## Démonstration

L'application est accessible en ligne :

**[Ouvrir le CRM — Démo Vercel](https://crm-gamma-eight-57.vercel.app/)**

Une seconde URL de déploiement est également disponible :

[Accéder au second déploiement](https://crm-l1unz5ha2-julielprta.vercel.app/)

Les deux liens correspondent à des déploiements Vercel du projet. Pour les démonstrations, privilégier le premier lien.

**Attention :** l'application est un prototype de démonstration. Elle ne doit pas être utilisée pour stocker des données clients réelles ou confidentielles.

## Stack technique

| Technologie | Rôle |
|---|---|
| [Next.js 14](https://nextjs.org/) | Framework React et routage avec App Router |
| [React](https://react.dev/) | Construction de l'interface utilisateur |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique et fiabilisation du code |
| [Tailwind CSS](https://tailwindcss.com/) | Mise en forme de l'interface |
| [Supabase](https://supabase.com/) | Base PostgreSQL hébergée et API de données |
| [PapaParse](https://www.papaparse.com/) | Génération des exports CSV |
| [Vercel](https://vercel.com/) | Hébergement et déploiement de la démonstration |

Cette stack a été choisie pour permettre un développement rapide, avec une architecture simple à faire évoluer. Supabase fournit la base de données et son API, sans nécessiter la création d'un backend dédié pour ce MVP.

## Architecture

```text
Navigateur
    ↕
Application Next.js
    ↕
Client Supabase (@supabase/supabase-js)
    ↕
Supabase — PostgreSQL
```

L'application utilise la bibliothèque `@supabase/supabase-js` pour interagir avec la base de données. Les pages et composants réalisent directement les opérations de lecture et d'écriture via le client Supabase.

La configuration de la connexion est centralisée dans `lib/supabaseClient.ts`.

La sécurité des accès aux données dépend notamment des politiques RLS (*Row Level Security*) configurées dans Supabase. Dans l'état actuel du prototype, ces règles ne constituent pas une protection suffisante pour des données réelles.

## Structure du projet

```text
app/
├── page.tsx                    # Liste des contacts
├── contacts/
│   ├── new/                    # Création d'un contact
│   └── [id]/
│       ├── page.tsx            # Fiche contact et historique
│       ├── edit/               # Modification d'un contact
│       ├── irc/new/            # Ajout d'une entrée IRC
│       ├── qos/new/            # Ajout d'une remontée QoS
│       └── commentaires/new/   # Ajout d'un commentaire
├── events/
│   ├── page.tsx                # Liste des événements
│   ├── new/                    # Création d'un événement
│   └── [id]/
│       ├── page.tsx            # Tableau de bord de l'événement
│       └── edit/               # Modification d'un événement
├── layout.tsx                  # Gabarit général
└── globals.css                 # Styles globaux

components/
└── Nav.tsx                     # Navigation commune

lib/
├── supabaseClient.ts           # Client Supabase
├── types.ts                    # Types et listes de choix
└── format.ts                   # Formatage des dates

supabase/
├── schema.sql                  # Schéma de la base de données
└── seed_contacts_demo.sql      # Données de démonstration
```

## Modèle de données

Le schéma repose sur six tables principales :

| Table | Rôle |
|---|---|
| `contacts` | Référentiel des contacts, dispositifs et informations de perception |
| `evenements` | Événements, réunions et dates d'envoi de mailings |
| `participations` | Association entre contacts et événements, avec suivi des statuts |
| `irc_entries` | Historique des enquêtes et interactions IRC, avec verbatims et irritants |
| `qos_entries` | Historique des remontées de qualité de service |
| `commentaires_entries` | Commentaires libres historisés par contact |

La table `participations` relie les contacts aux événements et alimente l'historique des participations affiché sur chaque fiche contact.

Le détail des colonnes et des relations est disponible dans [`supabase/schema.sql`](supabase/schema.sql).

## Installation et lancement en local

### Prérequis

- [Node.js](https://nodejs.org/) 18 ou supérieur
- [npm](https://www.npmjs.com/)
- Un compte [Supabase](https://supabase.com/)

### 1. Configurer Supabase

Créer un projet Supabase, puis ouvrir le **SQL Editor** et exécuter :

1. `supabase/schema.sql`
2. `supabase/seed_contacts_demo.sql` pour charger les données de démonstration.

### 2. Configurer les variables d'environnement

Récupérer l'URL du projet Supabase et sa clé publique dans les paramètres du projet.

À la racine du dépôt :

```bash
npm install
cp .env.local.example .env.local
```

Renseigner ensuite les variables attendues par le projet dans `.env.local`. Les noms exacts doivent correspondre à ceux utilisés dans `lib/supabaseClient.ts` et dans le fichier d'exemple.

Ne jamais versionner `.env.local` ni publier de clé secrète.

### 3. Lancer l'application

```bash
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000).

## Déploiement

Le projet est déployé sur [Vercel](https://vercel.com/), qui prend en charge le déploiement des applications Next.js.

**Démo en ligne :** [https://crm-gamma-eight-57.vercel.app/](https://crm-gamma-eight-57.vercel.app/)

Le déploiement nécessite de configurer les variables d'environnement Supabase dans les paramètres du projet Vercel. Les variables publiques utilisées par l'application doivent être disponibles lors du build.

Le déploiement de l'application ne signifie pas que l'environnement est homologué pour des données internes ou confidentielles de CA-GIP.

## État actuel et limites connues

Ce projet est un **MVP de démonstration**, et non une application prête pour une mise en production.

- **Authentification absente :** aucune connexion utilisateur n'est actuellement mise en place. Les politiques RLS utilisées dans le prototype sont permissives et ne doivent pas être considérées comme une protection des données.
- **Traçabilité des auteurs incomplète :** des champs `auteur` existent dans les tables IRC, QoS et commentaires, mais ils ne sont pas alimentés à partir d'une identité utilisateur authentifiée.
- **Hébergement à valider :** la base Supabase utilisée pour la démonstration est hébergée dans le cloud, hors d'une infrastructure CA-GIP nécessairement homologuée. Toute utilisation réelle devra faire l'objet d'une validation par les équipes compétentes (DSI, sécurité et conformité).
- **Taux d'ouverture des e-mails non implémenté :** aucune intégration de tracking d'ouverture n'est actuellement en place.
- **Import CSV des contacts absent :** les contacts sont ajoutés individuellement depuis l'interface ou via des opérations en base.
- **Intégration événementielle absente :** aucune connexion à Netkin ou à une autre plateforme événementielle n'est encore développée.

## Pistes d'évolution

1. Mettre en place l'authentification et une gestion des droits adaptée aux rôles utilisateurs.
2. Définir les politiques RLS et sécuriser les accès aux données.
3. Faire valider l'architecture d'hébergement par les équipes internes concernées.
4. Ajouter l'import de contacts en masse depuis un fichier CSV.
5. Intégrer un outil d'emailing pour suivre les ouvertures, si cette fonctionnalité est retenue.
6. Étudier une intégration avec la plateforme événementielle retenue pour automatiser le suivi des inscriptions et des présences.
7. Compléter la traçabilité des modifications et des auteurs.

---

*Projet réalisé dans une démarche de prototypage métier et de transformation digitale : partir d'un besoin opérationnel, construire rapidement une solution tangible, puis identifier les conditions nécessaires à son industrialisation.*
