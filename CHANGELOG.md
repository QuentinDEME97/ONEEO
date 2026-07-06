# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Initialisation du projet Nuxt 4 (tâche 0.1) : `compatibilityDate` fixée au 2025-07-15, TypeScript strict, version Nuxt 4.4.8 épinglée, lockfile committé.
- Intégration Tailwind CSS 4 + DaisyUI 5 (tâche 0.2) : config en CSS via `@tailwindcss/vite`, tous les thèmes DaisyUI activés, `data-theme` posé sur `<html>` via `useHead()`.
- Ajout Biome 2.5.2 (tâche 0.3) : lint, format `--write`, imports triés, quotes doubles, support directives Tailwind CSS.
- Intégration Drizzle ORM + better-sqlite3 (tâche 0.4) : `useDb()` typé, config `drizzle-kit`, scripts `db:generate` / `db:migrate` / `db:seed`, table de test migrée sur base vierge.
- Console interactive Drizzle façon `rails console` (`npm run console`) : `db` et les tables du schéma disponibles directement dans un REPL Node avec top-level await.
- Structure de dossiers hexagonale côté serveur (tâche 0.5) : `server/domain/` (types + calculs purs), `server/application/` (services orchestrateurs), `server/adapters/{jira,manual,llm,mail}/` (implémentations des ports), `server/api/` (endpoints Nitro) ; `server/README.md` documente le rôle de chaque dossier.
