# Base clients CA-GIP — MVP

Prototype de CRM interne : liste de contacts filtrable et exportable, gestion
des événements avec statuts de participation (Invité / Inscrit / Décliné /
Présent / Absent), historique par contact.

Stack : Next.js (React) + Supabase (base de données PostgreSQL hébergée).

## 1. Créer le projet Supabase

1. Va sur https://supabase.com, crée un compte gratuit et un nouveau projet.
2. Une fois le projet créé, ouvre **SQL Editor** (menu de gauche) > **New query**.
3. Colle tout le contenu du fichier `supabase/schema.sql` de ce dossier, puis clique sur **Run**.
   Ça crée les trois tables (`contacts`, `evenements`, `participations`) et ajoute
   trois contacts de démonstration.
4. Va dans **Project Settings > API**. Note deux valeurs :
   - **Project URL**
   - **anon public key**

## 2. Configurer le projet en local

Il te faut [Node.js](https://nodejs.org) installé (version 18 ou plus).

1. Ouvre un terminal dans ce dossier.
2. Installe les dépendances :
   ```bash
   npm install
   ```
3. Copie le fichier d'exemple et renomme-le :
   ```bash
   cp .env.local.example .env.local
   ```
4. Ouvre `.env.local` et remplace les deux valeurs par celles de ton projet Supabase
   (Project URL et anon public key, récupérées à l'étape 1).
5. Lance l'application :
   ```bash
   npm run dev
   ```
6. Ouvre http://localhost:3000 dans ton navigateur.

Tu dois voir les trois contacts de démonstration dans la liste.

## 3. Ce que fait le MVP

- **Contacts** (page d'accueil) : recherche, filtre par cluster / entité / dispositif,
  choix des colonnes affichées, export CSV de la liste filtrée (ouvrable dans Excel),
  fiche détaillée par contact avec son historique de participations.
- **Nouveau contact** : formulaire avec les champs du niveau 1 (référentiel) et les
  cases à cocher du niveau 2 (dispositifs).
- **Événements** : liste des événements, création (nom, type, date), et pour chaque
  événement : recherche et ajout de participants, avec un statut modifiable
  (Invité / Inscrit / Décliné / Présent / Absent).

## 4. Ce qui n'est pas encore fait (hors scope MVP)

- Authentification / gestion des droits par utilisateur.
- Import CSV en masse (pour l'instant, saisie manuelle ou via l'éditeur Supabase).
- Envoi de mail groupé (l'export CSV donne les adresses à coller dans Outlook).
- Niveau 3 : suivi IRC, verbatims, statistiques d'engagement, lien avec Netkin.

## 5. Mettre en ligne une démo accessible par lien (facultatif)

Le plus simple est [Vercel](https://vercel.com) (gratuit pour ce type de projet) :

1. Crée un compte Vercel, relie-le à un dépôt GitHub contenant ce dossier
   (ou utilise `vercel` en ligne de commande depuis ce dossier).
2. Dans les réglages du projet Vercel, ajoute les deux mêmes variables
   d'environnement que dans `.env.local`.
3. Déploie : Vercel te donne une URL publique à partager.

## 6. Sécurité — à faire avant toute vraie donnée

Le script SQL ouvre les tables en lecture/écriture à toute personne ayant la
clé publique (pratique pour un MVP, pas pour de la production). Avant d'y
mettre de vrais contacts CA-GIP, il faut restreindre les policies RLS
(Row Level Security) dans Supabase et ajouter une authentification — à valider
avec la DSI, comme pour tout hébergement de données internes.
