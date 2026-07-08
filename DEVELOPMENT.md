# ONEEO — Suivi de développement

Document de suivi du développement, découpé en tâches fines et guidées. Objectif : chaque tâche doit être réalisable sans réflexion d'architecture, par toi ou par un agent IA.

---

## Comment utiliser ce document

- On avance **phase par phase**, **tâche par tâche**. Une tâche ≈ un commit / une PR.
- Chaque tâche a un **Objectif**, les **Fichiers** concernés, une **DoD** (Definition of Done = liste de vérifications) et une **Taille**.
- Avant de cocher une tâche : `npm run lint` et `npm run test` doivent passer.
- **Légende taille** : `XS` < 15 min · `S` ~30 min · `M` ~1–2 h · `L` ~½ journée.
- `⚠️ dép. X.Y` = dépend d'une autre tâche. `❓` = point à vérifier (voir « Points d'attention »).

### Stack figée (ne pas rediscuter en cours de tâche)

- **Runtime** : Node 24.18.0. **Gestionnaire de paquets** : npm.
- **Framework** : Nuxt 4.4.8 (fullstack). Serveur = Nitro (`server/`), front = `app/`.
- **UI** : Tailwind CSS 4 + DaisyUI 5 (config en CSS, thème par `data-theme`).
- **Graphes** : ApexCharts via `vue3-apexcharts` (composant **client-only**).
- **BDD** : SQLite + Drizzle ORM (`drizzle-orm/better-sqlite3`).
- **Auth** : `nuxt-auth-utils` (sessions cookie).
- **Validation** : Zod. **Tableaux** : TanStack Table. **Lint/format** : Biome. **Tests** : Vitest.

### Règles transverses (invariants — valables sur TOUTES les tâches)

1. **Deux couches de données.** _Canonique_ (importée, read-only, réécrite à chaque import) vs _augmentation_ (éditée dans l'app). Un import **n'écrase jamais** l'augmentation.
2. **Cloisonnement.** Toute donnée métier porte un `project_id` ; un projet appartient à un `space`. Toute requête est filtrée par l'espace/projet courant de l'utilisateur.
3. **Idempotence de l'import.** Upsert par clé `(source, external_id)` ; rejouer un import ne crée pas de doublon.
4. **Historisation.** Les changements de champs significatifs vont dans `change_log` ; les métriques calculées sont figées dans `metric_snapshot` à chaque import.
5. **Le front ne calcule pas le métier.** L'API renvoie des agrégats prêts à afficher ; le front met en forme.

### Commandes npm (à définir en 0.3 / 0.4)

```bash
npm run dev          # serveur de dev (runtime Node)
npm run build        # build de prod
npm run lint         # Biome check
npm run format       # Biome format --write
npm run test         # Vitest (services de calcul)
npm run db:generate  # drizzle-kit : génère la migration depuis le schéma
npm run db:migrate   # applique les migrations
npm run db:seed      # jeu de données factice (fixtures)
npm run console      # console interactive Drizzle (façon `rails console`)
```

---

## ⚠️ Points d'attention (doutes à garder en tête)

- **Version Nuxt** ❓ : épingler une version **stable connue** et **committer le lockfile**. La 4.4.2 a cassé le serveur de dev (transition h3 v2). Partir sur la dernière 4.x qui démarre proprement en dev, la figer, ne pas « bump » à l'aveugle.
- **Hash mot de passe** : `hashPassword` / `verifyPassword` de `nuxt-auth-utils` (scrypt via `@adonisjs/hash`, format PHC avec paramètres embarqués + `passwordNeedsReHash()` pour la rotation des coûts). Retenu car le module est déjà une dépendance pour les sessions — `@adonisjs/hash` est donc déjà présent. L'option initiale `node:crypto` (zéro dépendance) a été abandonnée : elle réintroduisait du crypto maison, sans chemin de migration des paramètres scrypt, et « zéro dépendance » n'était plus vrai une fois `nuxt-auth-utils` installé.
- **Stockage avatar** ❓ : fichier sur disque (dossier `data/avatars`, chemin en base). Pas de base64 en BDD. À confirmer si tu veux du base64.
- **Invitations par email** : nécessitent le SMTP (phase 5). En MVP, **l'admin crée l'utilisateur avec un mot de passe temporaire** à changer à la 1ʳᵉ connexion.
- **Jours fériés (FR)** : table `holiday` par espace + seed FR (plutôt qu'une lib), pour rester configurable et agnostique.
- **Parsing imports** : `papaparse` (CSV) + `xlsx` / SheetJS (Excel).
- **Secrets connecteurs** : chiffrés au repos avec une clé d'app en variable d'environnement (`NUXT_APP_SECRET`). Jamais en clair en base.
- **Calcul « atteinte de l'objectif »** : suppose un **workflow ordonné** (statuts avec un rang). C'est modélisé dès 3.1.

---

## Phase 0 — Initialisation & socle technique

But : un squelette Nuxt navigable, avec BDD, lint et tests branchés.

### 0.1 — Créer le projet Nuxt 4

- [x] **Objectif** : initialiser Nuxt 4 en TypeScript strict.
- **Fichiers** : `nuxt.config.ts`, `tsconfig.json`, `package.json`.
- **DoD** :
  - [x] `npm run dev` démarre et affiche la page d'accueil sur `http://localhost:3000`.
  - [x] `compatibilityDate` fixée, `typescript.strict: true`, version Nuxt **épinglée** + lockfile committé.
- **Taille** : S · ❓ version (voir Points d'attention).

### 0.2 — Tailwind 4 + DaisyUI 5

- [x] **Objectif** : intégrer Tailwind 4 et DaisyUI 5, config en CSS.
- **Fichiers** : `app/assets/css/main.css`, `nuxt.config.ts`.
- **DoD** :
  - [x] `@import "tailwindcss";` + `@plugin "daisyui";` dans le CSS principal.
  - [x] Deux thèmes déclarés (`light`, `dark`) via `@plugin "daisyui/theme"`, appliqués par `data-theme` sur `<html>`.
  - [x] Un composant DaisyUI (`btn`, `card`) s'affiche correctement.
- **Taille** : S · ⚠️ dép. 0.1.

### 0.3 — Biome + scripts npm

- [x] **Objectif** : lint/format cohérent.
- **Fichiers** : `biome.json`, `package.json`.
- **DoD** :
  - [x] `npm run lint` et `npm run format` fonctionnent.
  - [x] Règles de base (imports triés, quotes cohérentes) actives.
- **Taille** : XS.

### 0.4 — Drizzle + better-sqlite3

- [x] **Objectif** : connexion SQLite typée + workflow de migration.
- **Fichiers** : `drizzle.config.ts`, `server/utils/db.ts`, `server/db/schema/index.ts`, `package.json`.
- **DoD** :
  - [x] `useDb()` renvoie une instance Drizzle (`drizzle-orm/better-sqlite3`), fichier en `data/oneeo.sqlite`.
  - [x] Scripts `db:generate` / `db:migrate` / `db:seed` en place.
  - [x] Une table de test migre sans erreur sur une base vierge.
- **Taille** : M · ⚠️ dép. 0.1.
- **Bonus** : `npm run console` ouvre une console Node interactive (façon `rails console`) avec `db` et les tables du schéma déjà en scope (`server/db/console.ts`).

### 0.5 — Structure de dossiers (hexagonale)

- [x] **Objectif** : poser l'arborescence et les conventions.
- **Fichiers** : dossiers `server/domain/`, `server/application/`, `server/adapters/`, `server/db/schema/`, `server/api/`, `app/`.
- **DoD** :
  - [x] `domain/` (types + calculs purs), `application/` (services orchestrateurs), `adapters/` (JIRA, manuel, LLM, mail).
  - [x] Un `README.md` court dans `server/` rappelle le rôle de chaque dossier.
- **Taille** : S · ⚠️ dép. 0.1.

### 0.6 — Vitest

- [x] **Objectif** : tests unitaires purs pour le domaine.
- **Fichiers** : `vitest.config.ts`, `server/domain/__tests__/smoke.test.ts`.
- **DoD** :
  - [x] `npm run test` exécute un test smoke qui passe (fonction pure, sans runtime Nuxt).
- **Taille** : XS · ⚠️ dép. 0.5.

### 0.7 — Layout de base (sidebar + navbar)

- [x] **Objectif** : coquille de l'app navigable.
- **Fichiers** : `app/layouts/default.vue`, `app/components/layout/Sidebar.vue`, `app/components/layout/Navbar.vue`.
- **DoD** :
  - [x] Sidebar DaisyUI (`drawer` + `menu`) avec les entrées : Dashboard, Sprints, Livrables, Équipes, Temps & Congés, Anomalies & SLA, Rapports & IA, Paramètres.
  - [x] Navbar avec zone droite : notifications (icône), menu utilisateur (avatar).
  - [x] Les liens pointent vers des pages vides (placeholders) sans erreur.
- **Taille** : M · ⚠️ dép. 0.2.

### 0.8 — Wrapper ApexCharts + helper de thème

- [x] **Objectif** : graphes prêts à l'emploi, thémés DaisyUI.
- **Fichiers** : `app/components/charts/BaseChart.client.vue`, `app/composables/useChartTheme.ts`.
- **DoD** :
  - [x] Composant **client-only** rendant un ApexChart de démo.
  - [x] `useChartTheme()` lit les variables CSS DaisyUI (`--color-primary`, etc.) et les injecte dans les options.
- **Taille** : M · ⚠️ dép. 0.2.

---

## Phase 1 — Identité, espaces, projets

But : se connecter, créer un espace et un projet, gérer son profil.

### 1.1 — Schéma : identité & RBAC

- [x] **Objectif** : tables d'identité et de rôles.
- **Fichiers** : `server/db/schema/identity.ts`.
- **DoD** :
  - [x] Tables `user`, `space`, `space_membership`, `role`, `permission`, `role_permission`.
  - [x] `role.is_system` (bool), unicité `(space_id, role.name)`, unicité `(user_id, space_id)` sur membership.
  - [x] Migration OK.
- **Taille** : M · ⚠️ dép. 0.4.

### 1.2 — Auth (sessions + hash)

- [x] **Objectif** : brancher `nuxt-auth-utils` et le hachage de mot de passe.
- **Fichiers** : `nuxt.config.ts`, `.env`.
- **DoD** :
  - [x] `NUXT_SESSION_PASSWORD` et `NUXT_APP_SECRET` en `.env` (+ `.env.example`).
  - [x] `hashPassword()` / `verifyPassword()` via `nuxt-auth-utils` (scrypt / `@adonisjs/hash`).
- **Taille** : S · ⚠️ dép. 1.1.
- **Note** : on utilise directement `hashPassword()` / `verifyPassword()` fournis (et auto-importés côté serveur) par `nuxt-auth-utils` — pas de wrapper maison. On ne teste pas ces fonctions (dépendance externe, déjà couverte par le module). ⚠️ signature : `verifyPassword(hashedPassword, plainPassword)` — le **hash en premier**, à savoir pour les appels de la tâche 1.4.

### 1.3 — Premier lancement (setup admin) + seed rôles

- [x] **Objectif** : bootstrap du premier administrateur.
- **Fichiers** : `server/api/setup.post.ts`, `app/pages/setup.vue`, `server/utils/roles.ts`.
- **DoD** :
  - [x] Si **aucun** `user` en base, toute navigation redirige vers `/setup`.
  - [x] Le setup crée le 1ᵉʳ user + un espace + les rôles système `Owner` et `Member` (avec **toutes** les permissions en MVP), et connecte l'utilisateur.
- **Taille** : M · ⚠️ dép. 1.2.

### 1.4 — Login / logout

- [ ] **Objectif** : authentification classique.
- **Fichiers** : `server/api/auth/login.post.ts`, `server/api/auth/logout.post.ts`, `app/pages/login.vue`.
- **DoD** :
  - [ ] Login email + mot de passe → session posée ; mauvais identifiants → message clair.
  - [ ] Logout détruit la session.
- **Taille** : S · ⚠️ dép. 1.2.

### 1.5 — Middleware d'auth + scoping espace

- [ ] **Objectif** : protéger les routes et cadrer l'espace courant.
- **Fichiers** : `app/middleware/auth.global.ts`, `server/utils/context.ts`.
- **DoD** :
  - [ ] Non connecté → redirigé vers `/login` (sauf `/setup`, `/login`).
  - [ ] Un helper serveur renvoie `{ userId, spaceId, projectId }` et **rejette** l'accès à un espace/projet dont l'utilisateur n'est pas membre.
- **Taille** : M · ⚠️ dép. 1.4.

### 1.6 — Espaces : CRUD + sélecteur

- [ ] **Objectif** : gérer et changer d'espace.
- **Fichiers** : `server/api/spaces/*`, `app/components/layout/SpaceSwitcher.vue`.
- **DoD** :
  - [ ] Créer / lister ses espaces ; sélecteur dans la sidebar mémorisant l'espace actif.
  - [ ] L'espace porte un thème par défaut (appliqué via `data-theme`).
- **Taille** : M · ⚠️ dép. 1.5.

### 1.7 — Utilisateurs de l'espace (création par l'admin)

- [ ] **Objectif** : ajouter des membres sans email (MVP).
- **Fichiers** : `server/api/spaces/[id]/members/*`, `app/pages/parametres/membres.vue`.
- **DoD** :
  - [ ] L'Owner crée un utilisateur (email + mot de passe temporaire, rôle Member).
  - [ ] Flag « mot de passe à changer » forçant le changement à la 1ʳᵉ connexion.
- **Taille** : M · ⚠️ dép. 1.6.

### 1.8 — Schéma : projet

- [ ] **Objectif** : table projet rattachée à l'espace.
- **Fichiers** : `server/db/schema/project.ts`.
- **DoD** :
  - [ ] Table `project` (`space_id`, `name`, `theme`, `deliverable_label`), migration OK.
- **Taille** : S · ⚠️ dép. 1.1.

### 1.9 — Projets : CRUD + sélecteur + thème

- [ ] **Objectif** : gérer et changer de projet, appliquer son thème.
- **Fichiers** : `server/api/projects/*`, `app/components/layout/ProjectSwitcher.vue`.
- **DoD** :
  - [ ] Créer / lister les projets de l'espace ; sélecteur sidebar mémorisant le projet actif.
  - [ ] Le thème du projet actif surcharge celui de l'espace.
- **Taille** : M · ⚠️ dép. 1.8.

### 1.10 — Page profil

- [ ] **Objectif** : éditer son profil et son mot de passe.
- **Fichiers** : `app/pages/parametres/profil.vue`, `server/api/me/*`.
- **DoD** :
  - [ ] Modifier nom/prénom, email, avatar (upload → `data/avatars`, chemin en base).
  - [ ] Changer de mot de passe (avec vérification de l'ancien).
- **Taille** : M · ⚠️ dép. 1.4 · ❓ stockage avatar.

---

## Phase 2 — Modèle métier, import manuel & fixtures

But : faire entrer des données (fichier + fixtures) dans le modèle canonique, gérer les équipes.

### 2.1 — Schéma : couche canonique

- [ ] **Objectif** : miroir normalisé de la source.
- **Fichiers** : `server/db/schema/canonical.ts`.
- **DoD** :
  - [ ] Tables `ticket`, `epic`, `sprint`, `team`, `member`, `worklog` avec `project_id`, `external_id`, `source`.
  - [ ] Index **unique** `(source, external_id)` par table ; `sprint.is_synthetic` (bool) ; `sprint.team_id`.
  - [ ] `ticket` : `type`, `status`, `title`, `url`, `estimate`, `time_spent`, `remaining`, `assignee_id`, `sprint_id`, `epic_id`, `labels` (json), `custom_fields` (json).
- **Taille** : M · ⚠️ dép. 1.8.

### 2.2 — Schéma : couche augmentation

- [ ] **Objectif** : données éditées dans l'app.
- **Fichiers** : `server/db/schema/augmentation.ts`.
- **DoD** :
  - [ ] Tables `deliverable`, `ticket_deliverable`, `ticket_link`, `sprint_objective`, `leave`, `timesheet_entry`, `status_weight`, `workflow_config`.
  - [ ] Toutes portent `project_id`. Migration OK.
- **Taille** : M · ⚠️ dép. 2.1.

### 2.3 — Schéma : historisation

- [ ] **Objectif** : traçabilité et séries temporelles.
- **Fichiers** : `server/db/schema/history.ts`.
- **DoD** :
  - [ ] Tables `import_run`, `change_log`, `metric_snapshot`.
  - [ ] `metric_snapshot` : `scope` (sprint/epic/deliverable/team), `scope_id`, `import_run_id`, `metrics` (json), `created_at`.
- **Taille** : S · ⚠️ dép. 2.1.

### 2.4 — Domaine : types + `SourcePort`

- [ ] **Objectif** : contrat d'entrée agnostique.
- **Fichiers** : `server/domain/types.ts`, `server/domain/ports/SourcePort.ts`.
- **DoD** :
  - [ ] Types du DTO canonique (indépendants de la BDD et de JIRA).
  - [ ] Interface `SourcePort { fetchTickets(), fetchSprints(), ... }` renvoyant des DTO canoniques.
- **Taille** : S · ⚠️ dép. 0.5.

### 2.5 — Pipeline d'import (squelette)

- [ ] **Objectif** : orchestrateur des étapes.
- **Fichiers** : `server/application/import/runImport.ts`.
- **DoD** :
  - [ ] Fonction `runImport(source, projectId)` enchaînant : Extract → Map → Normalize → Validate → Reconcile → Compute → Snapshot → Alert (étapes stubées).
  - [ ] Crée un `import_run` (statut `running` → `done`/`failed`).
- **Taille** : M · ⚠️ dép. 2.3, 2.4.

### 2.6 — Étape Validate (Zod)

- [ ] **Objectif** : contrôles de format des entrants.
- **Fichiers** : `server/application/import/validate.ts`, `server/domain/schemas.ts`.
- **DoD** :
  - [ ] Schémas Zod pour ticket/sprint/epic/member.
  - [ ] Les lignes invalides sont **rejetées avec un message précis** (ligne, champ, attendu) sans bloquer les valides.
- **Taille** : M · ⚠️ dép. 2.5.

### 2.7 — Étape Reconcile (upsert idempotent + change_log)

- [ ] **Objectif** : écrire la couche canonique sans doublon ni écrasement de l'augmentation.
- **Fichiers** : `server/application/import/reconcile.ts`.
- **DoD** :
  - [ ] Upsert par `(source, external_id)` ; rejouer le même import ne modifie rien.
  - [ ] Les diffs des champs significatifs (statut, estimate, assignee, sprint, remaining) créent des lignes `change_log`.
  - [ ] Aucune table d'augmentation n'est touchée.
- **Taille** : L · ⚠️ dép. 2.6.

### 2.8 — Mapping configurable (champs + statuts)

- [ ] **Objectif** : normaliser vers le vocabulaire interne.
- **Fichiers** : `server/db/schema/mapping.ts`, `server/application/import/map.ts`.
- **DoD** :
  - [ ] Table `field_mapping` / `status_mapping` par projet.
  - [ ] L'étape Map applique la correspondance source → canonique ; statuts inconnus signalés.
- **Taille** : M · ⚠️ dép. 2.7.

### 2.9 — Adapter import manuel (CSV/XLSX)

- [ ] **Objectif** : alimenter le pipeline depuis un fichier.
- **Fichiers** : `server/adapters/manual/ManualAdapter.ts`.
- **DoD** :
  - [ ] Parse CSV (`papaparse`) et XLSX (`xlsx`) → DTO canonique via `SourcePort`.
  - [ ] Un fichier d'exemple passe le pipeline complet et peuple la base.
- **Taille** : M · ⚠️ dép. 2.8.

### 2.10 — Fixtures (jeu de données factice)

- [ ] **Objectif** : pouvoir développer sans JIRA.
- **Fichiers** : `server/db/seed/fixtures.ts`, script `db:seed`.
- **DoD** :
  - [ ] `npm run db:seed` crée 1 espace, 1 projet, 1 équipe, ~3 sprints, ~2 epics, ~20 tickets réalistes (statuts variés, estimations, temps).
  - [ ] Idempotent (relançable).
- **Taille** : M · ⚠️ dép. 2.1.

### 2.11 — UI import manuel

- [ ] **Objectif** : écran d'import guidé.
- **Fichiers** : `app/pages/import.vue`, `server/api/import/manual.post.ts`.
- **DoD** :
  - [ ] Upload d'un fichier + **mode opératoire** (quoi exporter, quel format).
  - [ ] Affichage du bilan : lignes importées / rejetées + erreurs détaillées.
- **Taille** : M · ⚠️ dép. 2.9.

### 2.12 — Équipes & profils

- [ ] **Objectif** : gérer équipes, postes et capacités.
- **Fichiers** : `app/pages/equipes.vue`, `server/api/teams/*`, `server/api/members/*`.
- **DoD** :
  - [ ] Postes par défaut configurables (Scrum Master, PO, BA, Lead Dev, Dev, Testeur).
  - [ ] Créer une équipe, y rattacher des profils ; capacité 7 h/j par défaut, ajustable.
  - [ ] Chaque poste a une **famille de capacité** (Dev / Test / Autre) ; mapping **équipe SI ↔ équipe source**.
- **Taille** : L · ⚠️ dép. 2.1.

---

## Phase 3 — Calculs, dashboard & incohérences

But : le cœur de valeur — avancement, capacités, SLA, dashboard. **Les tâches marquées 🧪 incluent des tests Vitest.**

### 3.1 — Workflow ordonné + pondérations

- [ ] **Objectif** : base des calculs d'avancement et d'objectif.
- **Fichiers** : `server/application/config/workflow.ts`, seed par défaut.
- **DoD** :
  - [ ] `workflow_config` définit les statuts **avec un rang** (ordre).
  - [ ] `status_weight` par défaut : En cours 25 %, MR à valider 50 %, À tester 75 %, Livré/Terminé 100 %.
- **Taille** : M · ⚠️ dép. 2.2.

### 3.2 — 🧪 ProgressService

- [ ] **Objectif** : calcul d'avancement.
- **Fichiers** : `server/domain/progress.ts`, `server/domain/__tests__/progress.test.ts`.
- **DoD** :
  - [ ] % par ticket (pondération statut) ; moyenne EPIC/livrable (÷ nb tickets) ; agrégation sprint.
  - [ ] Ratio estimé/consommé exposé.
  - [ ] Tests couvrant : statuts variés, epic vide, tickets sans estimation.
- **Taille** : M · ⚠️ dép. 3.1.

### 3.3 — 🧪 CapacityService

- [ ] **Objectif** : capacité vs charge.
- **Fichiers** : `server/domain/capacity.ts`, `server/domain/__tests__/capacity.test.ts`.
- **DoD** :
  - [ ] Capacité équipe = jours ouvrés × capacité/membre − congés ; % hors congés ; découpe Dev/Test.
  - [ ] Charge estimée agrégée ; comparaison charge/capacité.
  - [ ] Tests : avec/sans congés, capacités individuelles différentes.
- **Taille** : M · ⚠️ dép. 2.12, 3.7.

### 3.4 — SLA : modèle + calendrier

- [ ] **Objectif** : configurer les SLA.
- **Fichiers** : `server/db/schema/sla.ts`, `server/db/schema/calendar.ts`.
- **DoD** :
  - [ ] `sla_policy` (avec `calendar_mode` : `business` par défaut / `calendar`), `sla_rule`, `sla_matcher` (champ/étiquette/type = valeur), `sla_state`.
  - [ ] Table `holiday` par espace + seed FR ; `sla_state` transverse (non filtré par sprint/équipe).
- **Taille** : M · ⚠️ dép. 2.2.

### 3.5 — 🧪 SlaService

- [ ] **Objectif** : évaluer les états SLA.
- **Fichiers** : `server/domain/sla.ts`, `server/domain/__tests__/sla.test.ts`.
- **DoD** :
  - [ ] Calcul du délai selon `calendar_mode` (jours ouvrés = hors week-ends + fériés).
  - [ ] États : En règle / **Alerte** (dépassement, ou < 24 h ouvrées du délai sans changement de statut).
  - [ ] Tests : franchissement d'un week-end/férié, seuil d'alerte, dépassement.
- **Taille** : L · ⚠️ dép. 3.4.

### 3.6 — 🧪 Réconciliation timesheet

- [ ] **Objectif** : détecter les écarts de temps.
- **Fichiers** : `server/domain/timesheet.ts`, `server/domain/__tests__/timesheet.test.ts`.
- **DoD** :
  - [ ] Les worklogs **importés font foi** ; comparaison avec `timesheet_entry` local par ticket/personne/jour.
  - [ ] Tout écart produit une incohérence typée `timesheet_gap`.
  - [ ] Tests : égalité, écart en plus, écart en moins.
- **Taille** : M · ⚠️ dép. 2.2.

### 3.7 — Snapshots de métriques

- [ ] **Objectif** : figer les métriques à chaque import (séries temporelles).
- **Fichiers** : `server/application/import/snapshot.ts`.
- **DoD** :
  - [ ] À chaque import, écrire un `metric_snapshot` par périmètre (sprint/epic/livrable/équipe) : avancement, nb tickets, nb bugs, capacité, charge, nb SLA en alerte.
  - [ ] Branché dans l'étape Compute du pipeline.
- **Taille** : M · ⚠️ dép. 3.2, 2.5.

### 3.8 — Détection d'incohérences

- [ ] **Objectif** : remonter les problèmes du sprint.
- **Fichiers** : `server/domain/inconsistencies.ts`, `server/application/import/alert.ts`.
- **DoD** :
  - [ ] Règles : ticket sans estimation ; sans temps après changement d'état ; sans mouvement depuis N jours (configurable) ; SLA en alerte ; écart timesheet.
  - [ ] Résultats persistés en `notification` à l'étape Alert.
- **Taille** : L · ⚠️ dép. 3.5, 3.6.

### 3.9 — Objectifs de sprint

- [ ] **Objectif** : définir et mesurer l'objectif.
- **Fichiers** : `server/domain/objective.ts`, `app/pages/sprints/[id].vue` (partie objectif).
- **DoD** :
  - [ ] `sprint_objective` : cible par défaut = **statut final** ; override par ticket.
  - [ ] Atteinte = part des tickets ayant atteint (rang ≥) leur statut cible.
- **Taille** : M · ⚠️ dép. 3.1.

### 3.10 — API du dashboard

- [ ] **Objectif** : agrégats prêts pour le front.
- **Fichiers** : `server/api/dashboard/[sprintId].get.ts`.
- **DoD** :
  - [ ] Renvoie, pour un sprint : header (sprint actif, nb EPIC, nb tickets, historique), avancement + atteinte objectif, nb tickets sous SLA, EPIC (avancement, nb bugs), capacités, incohérences.
  - [ ] Filtrable par équipe.
- **Taille** : L · ⚠️ dép. 3.7, 3.8, 3.9.

### 3.11 — Dashboard : header & KPI

- [ ] **Objectif** : bandeau haut du dashboard.
- **Fichiers** : `app/pages/index.vue`, `app/components/dashboard/SprintHeader.vue`.
- **DoD** :
  - [ ] Onglets par sprint (courant + suivants), sélecteur d'équipe.
  - [ ] Cartes `stat` DaisyUI : sprint actif, nb EPIC, nb tickets, nb tickets sous SLA.
- **Taille** : M · ⚠️ dép. 3.10.

### 3.12 — Dashboard : avancement (graphes)

- [ ] **Objectif** : visualiser l'avancement.
- **Fichiers** : `app/components/dashboard/ProgressPanel.vue`.
- **DoD** :
  - [ ] `radial-progress` (avancement sprint) + atteinte objectif + ratio estimé/consommé (ApexCharts, thémé).
- **Taille** : M · ⚠️ dép. 3.11, 0.8.

### 3.13 — Dashboard : capacités

- [ ] **Objectif** : section capacités.
- **Fichiers** : `app/components/dashboard/CapacityPanel.vue`.
- **DoD** :
  - [ ] Capacité équipe (% hors congés), charge vs capacité, liste des membres (charge/capacité), congés du sprint + 3 prochains (lien vers la page dédiée).
- **Taille** : M · ⚠️ dép. 3.11.

### 3.14 — Dashboard : EPIC & incohérences

- [ ] **Objectif** : sections EPIC et incohérences.
- **Fichiers** : `app/components/dashboard/EpicPanel.vue`, `app/components/dashboard/InconsistencyPanel.vue`.
- **DoD** :
  - [ ] EPIC : avancement + nb bugs (avec badge d'évolution vs snapshot précédent).
  - [ ] Incohérences : liste catégorisée avec liens vers les tickets.
- **Taille** : M · ⚠️ dép. 3.11.

### 3.15 — Page Sprints

- [ ] **Objectif** : visualiser et planifier les sprints.
- **Fichiers** : `app/pages/sprints/index.vue`, `app/pages/sprints/[id].vue`.
- **DoD** :
  - [ ] Liste + détail (contenu, capacités/charges) ; définition des objectifs.
  - [ ] Création de **sprints factices** (statut spécial, **exclus des dashboards**).
- **Taille** : L · ⚠️ dép. 3.9.

### 3.16 — Page Livrables

- [ ] **Objectif** : suivre les livrables (« expressions de besoin »).
- **Fichiers** : `app/pages/livrables/index.vue`, `app/pages/livrables/[id].vue`.
- **DoD** :
  - [ ] Liste + **page dédiée** par livrable : avancement, tickets reliés, contenu.
  - [ ] Rattacher/détacher des tickets ; libellé de l'entité pris du projet.
- **Taille** : L · ⚠️ dép. 3.2.

### 3.17 — Page Anomalies & SLA

- [ ] **Objectif** : vue transverse des SLA.
- **Fichiers** : `app/pages/anomalies.vue`.
- **DoD** :
  - [ ] Liste **transverse** (hors filtre sprint/équipe) : tickets sous SLA, états En règle / Alerte, tickets sans estimation.
  - [ ] Lien vers la config SLA.
- **Taille** : M · ⚠️ dép. 3.5.

### 3.18 — Page Temps & Congés

- [ ] **Objectif** : saisie des temps et congés.
- **Fichiers** : `app/pages/temps-conges.vue`, `server/api/timesheet/*`, `server/api/leaves/*`.
- **DoD** :
  - [ ] Onglet Timesheet (saisie + affichage des écarts vs temps importés).
  - [ ] Onglet Congés (créer/visualiser + sprints impactés).
- **Taille** : L · ⚠️ dép. 3.6.

### 3.19 — Page Paramètres

- [ ] **Objectif** : configuration du projet.
- **Fichiers** : `app/pages/parametres/index.vue` + sous-pages.
- **DoD** :
  - [ ] Workflow (statuts + ordre), pondérations, SLA + matchers, calendrier/fériés, thème projet.
  - [ ] (Connecteurs traités en phase 4.)
- **Taille** : L · ⚠️ dép. 3.1, 3.4.

---

## Phase 4 — Connecteur JIRA & automatisation

But : remplacer l'import manuel par une alimentation automatique.

### 4.1 — Connecteurs : modèle + secrets chiffrés

- [ ] **Objectif** : stocker les identifiants de connexion en sécurité.
- **Fichiers** : `server/db/schema/connector.ts`, `server/utils/crypto.ts`.
- **DoD** :
  - [ ] `connector` avec `scope` (space/project), `type`, secrets **chiffrés** (clé `NUXT_APP_SECRET`).
  - [ ] Connecteur JIRA (URL + clé API) au niveau **projet**.
- **Taille** : M · ⚠️ dép. 1.8.

### 4.2 — JiraAdapter

- [ ] **Objectif** : implémenter `SourcePort` pour JIRA.
- **Fichiers** : `server/adapters/jira/JiraAdapter.ts`.
- **DoD** :
  - [ ] Appels API + pagination ; mapping vers DTO canonique (via le mapping du projet).
  - [ ] Passe le **même pipeline** que l'import manuel (aucune logique métier dupliquée).
- **Taille** : L · ⚠️ dép. 4.1, 2.8.

### 4.3 — Test de connexion JIRA

- [ ] **Objectif** : valider les identifiants depuis l'UI.
- **Fichiers** : `server/api/connectors/jira/test.post.ts`, page Paramètres → Intégrations.
- **DoD** :
  - [ ] Bouton « Tester la connexion » → OK / message d'erreur explicite.
- **Taille** : S · ⚠️ dép. 4.2.

### 4.4 — Import planifié (Nitro) + manuel

- [ ] **Objectif** : automatiser l'alimentation.
- **Fichiers** : `server/tasks/import.ts`, `nuxt.config.ts` (scheduled tasks), `server/api/import/run.post.ts`.
- **DoD** :
  - [ ] Tâche planifiée Nitro déclenchant `runImport('jira', projectId)` à une périodicité configurable.
  - [ ] Déclenchement manuel disponible ; chaque exécution trace un `import_run`.
- **Taille** : M · ⚠️ dép. 4.2.

### 4.5 — Clé LLM (espace + surcharge projet)

- [ ] **Objectif** : préparer l'IA (phase 5).
- **Fichiers** : connecteur `type = llm`, `server/utils/resolveLlmKey.ts`.
- **DoD** :
  - [ ] Clé Claude au niveau **espace**, **surchargeable** par projet ; résolution projet → espace.
- **Taille** : S · ⚠️ dép. 4.1.

---

## Phase 5 — Backlog post-MVP (à détailler plus tard)

- [ ] **IA — Daily Digest** : génération en langage naturel (tickets sans affectation/estimation, à prendre en charge) + **ignore-list**.
- [ ] **IA — Rapports d'avancement** : prompt par défaut éditable + **historique des prompts** ; périodicité.
- [ ] **IA — Rapport anomalies/SLA** incluant le suivi des délais.
- [ ] **Envoi mail** (Nodemailer/SMTP) : envoi manuel puis automatique des comptes rendus + invitations par email.
- [ ] **UI de gestion des rôles/permissions** : rôles à nom libre + matrice de permissions cochables (le modèle existe déjà).
- [ ] **Granularité par projet** : `project_membership` avec override de rôle.
- [ ] **Jobs IA personnalisés** : l'utilisateur définit un prompt + des entrants.
- [ ] **Inscription libre + création d'espace self-service** (mode hébergé).
- [ ] **Bascule Postgres** (changement de dialect Drizzle).
- [ ] **Conteneurisation** (Docker) pour un déploiement hors localhost.
