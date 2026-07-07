# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Schéma d'identité & RBAC (tâche 1.1) : tables `user`, `space`, `space_membership`, `role`, `permission`, `role_permission` (`server/db/schema/identity.ts`), PK en UUID (`crypto.randomUUID()` via `$defaultFn`), `created_at`/`updated_at` (rafraîchi automatiquement à chaque écriture), `role.is_system`, unicité `(space_id, role.name)` et `(user_id, space_id)` sur `space_membership`.
- Auth : sessions + hash de mot de passe (tâche 1.2) : module `nuxt-auth-utils` branché dans `nuxt.config.ts`, `NUXT_SESSION_PASSWORD` (scellement des cookies de session) et `NUXT_APP_SECRET` (chiffrement des secrets connecteurs, phase 4) documentés dans `.env.example` ; `hashPassword()` / `verifyPassword()` (`server/utils/password.ts`) via `node:crypto` scrypt (salt aléatoire par hash, comparaison en temps constant), avec tests unitaires (`server/utils/__tests__/password.test.ts`) et fixtures de mots de passe (`server/utils/__tests__/fixtures/passwords.ts`).
- Test e2e API (`@nuxt/test-utils`) sur les routes de session exposées par `nuxt-auth-utils` (`server/utils/__tests__/auth-session.e2e.test.ts`) : `GET /api/_auth/session` sans cookie, `DELETE /api/_auth/session` (déconnexion + purge du cookie).

### Changed

- `useDb()` active `PRAGMA foreign_keys = ON` afin que les contraintes `ON DELETE CASCADE`/`RESTRICT` du schéma soient appliquées par SQLite.
- `vitest.config.ts` : `testTimeout`/`hookTimeout` portés à 30 s pour accommoder le démarrage d'un vrai serveur Nuxt dans les tests `*.e2e.test.ts`.

### Removed

- Table de test `health_check` (tâche 0.4), remplacée par le schéma métier de la tâche 1.1.

## [0.0.1] - 2026-07-07

### Added

- Initialisation du projet Nuxt 4 (tâche 0.1) : `compatibilityDate` fixée au 2025-07-15, TypeScript strict, version Nuxt 4.4.8 épinglée, lockfile committé.
- Intégration Tailwind CSS 4 + DaisyUI 5 (tâche 0.2) : config en CSS via `@tailwindcss/vite`, tous les thèmes DaisyUI activés, `data-theme` posé sur `<html>` via `useHead()`.
- Ajout Biome 2.5.2 (tâche 0.3) : lint, format `--write`, imports triés, quotes doubles, support directives Tailwind CSS.
- Intégration Drizzle ORM + better-sqlite3 (tâche 0.4) : `useDb()` typé, config `drizzle-kit`, scripts `db:generate` / `db:migrate` / `db:seed`, table de test migrée sur base vierge.
- Console interactive Drizzle façon `rails console` (`npm run console`) : `db` et les tables du schéma disponibles directement dans un REPL Node avec top-level await.
- Structure de dossiers hexagonale côté serveur (tâche 0.5) : `server/domain/` (types + calculs purs), `server/application/` (services orchestrateurs), `server/adapters/{jira,manual,llm,mail}/` (implémentations des ports), `server/api/` (endpoints Nitro) ; `server/README.md` documente le rôle de chaque dossier.
- Intégration Vitest (tâche 0.6) : `vitest.config.ts` ciblant `server/**/__tests__/**/*.test.ts`, script `npm run test`, test smoke sur une fonction pure (`server/domain/__tests__/smoke.test.ts`) exécuté sans runtime Nuxt.
- Layout de base navigable (tâche 0.7) : drawer DaisyUI sidebar always-open sur desktop / hamburger mobile, navbar sticky avec notifications et menu utilisateur, 8 pages placeholder (Dashboard, Sprints, Livrables, Équipes, Temps & Congés, Anomalies & SLA, Rapports & IA, Paramètres).
- Intégration HugeIcons (`@hugeicons/core-free-icons` + `@hugeicons/vue`) pour les icônes de navigation et de la navbar.
- Wrapper ApexCharts + helper de thème (tâche 0.8) : `app/components/charts/BaseChart.client.vue` (composant client-only avec démo intégrée), `useChartTheme()` qui lit les variables CSS DaisyUI (`--color-primary`, `--color-base-content`, etc.) et les injecte dans les options ApexCharts, avec réactivité au changement de `data-theme` via `MutationObserver`.

### Changed

- Remplacement de Biome par ESLint (`@nuxt/eslint`) + Prettier : résout les faux positifs "unused import" sur les templates Vue, config Prettier double quotes / 2 espaces, règle `no-explicit-any` désactivée.
- Toolbar ApexCharts masquée par défaut dans `BaseChart.client.vue` (surchageable via les options).
