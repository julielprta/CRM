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