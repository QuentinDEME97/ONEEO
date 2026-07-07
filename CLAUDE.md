# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commandes utiles

```bash
npm run dev          # serveur de dev Nuxt sur localhost:3000
npm run build        # build de production
npm run lint         # ESLint (vérification)
npm run format       # Prettier --write (réécriture)
npm run test         # Vitest — tests unitaires du domaine uniquement
npm run test -- --reporter=verbose   # un seul fichier de test
npm run db:generate  # génère une migration depuis le schéma Drizzle
npm run db:migrate   # applique les migrations sur data/oneeo.sqlite
npm run db:seed      # peuple la base avec des fixtures
npm run console      # REPL Node avec db + schema disponibles (façon rails console)
```

> Avant tout commit : `npm run lint` et `npm run test` doivent passer.

## Format de commit

```
<gitmoji> <STATUT> | <Description courte>
```

- **STATUT** = mot-clé Keep a Changelog en majuscules : `ADDED`, `CHANGED`, `FIXED`, `REMOVED`, `DEPRECATED`, `SECURITY`
- Gitmojis courants : `✨` ADDED · `🔧` CHANGED · `🐛` FIXED · `🗑️` REMOVED · `🎉` commit initial

Exemple : `✨ ADDED | Layout sidebar + navbar`

> Le gitmoji peut être remplacé par un emoji plus représentatif des changements. Le mot-clé STATUT est obligatoire pour générer automatiquement le CHANGELOG.md.

## CHANGELOG.md

Format [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Règle stricte : **une seule section par type** (`### Added`, `### Changed`…) dans un même bloc de version. Ne jamais dupliquer une section.

## Stack

| Couche      | Technologie                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| Framework   | Nuxt 4 (fullstack) — front dans `app/`, serveur Nitro dans `server/`            |
| UI          | Tailwind CSS 4 + DaisyUI 5 (config en CSS, thème via `data-theme` sur `<html>`) |
| Icônes      | HugeIcons (`@hugeicons/core-free-icons` + `@hugeicons/vue`)                     |
| BDD         | SQLite + Drizzle ORM (`better-sqlite3`), fichier `data/oneeo.sqlite`            |
| Auth        | `nuxt-auth-utils` (sessions cookie)                                             |
| Lint/Format | ESLint (`@nuxt/eslint`) + Prettier                                              |
| Tests       | Vitest — domaine pur uniquement (`server/**/__tests__/`)                        |
| Validation  | Zod                                                                             |

## Architecture serveur (hexagonale)

```
server/
  domain/       # Cœur métier pur : types + calculs (ProgressService, SlaService…)
                # Aucune dépendance Nitro/BDD/adapter. Tout ce qui est ici est testé via Vitest.
  application/  # Orchestrateurs : pipeline d'import, appels domaine + repositories
  adapters/     # Implémentations concrètes des ports : jira/, manual/ (CSV/XLSX), llm/, mail/
  db/           # Schéma Drizzle (schema/), migrations, seed, connexion (utils/db.ts)
  api/          # Endpoints Nitro — validation d'entrée puis délégation à application/
  utils/        # Helpers auto-importés par Nitro (useDb, contexte, crypto…)
```

**Règle clé :** `domain/` ne connaît ni Nitro, ni SQLite, ni JIRA. `api/` ne contient pas de logique métier.

## Conventions importantes

- **Deux couches de données :** _canonique_ (importée, réécrite à chaque import) vs _augmentation_ (éditée dans l'app). Un import n'écrase jamais l'augmentation.
- **Cloisonnement :** toute donnée métier porte un `project_id`. Toute requête est filtrée par l'espace/projet courant.
- **Idempotence des imports :** upsert par `(source, external_id)` — rejouer un import ne crée pas de doublon.
- **Le front ne calcule pas le métier :** l'API renvoie des agrégats prêts à afficher.

## Thème DaisyUI

Le `data-theme` est posé sur `<html>` via `useHead()` dans `app/app.vue`. Les thèmes custom (par espace/projet) sont injectés comme balise `<style>` avec des CSS custom properties scoped à `[data-theme="<id>"]` — aucune recompilation nécessaire.

## Base de données

`useDb()` (`server/utils/db.ts`) retourne un singleton Drizzle. Toujours importer depuis ce helper — ne jamais instancier `better-sqlite3` directement dans un endpoint ou un service. Appliquer `npm run db:migrate` après chaque `npm run db:generate`.
