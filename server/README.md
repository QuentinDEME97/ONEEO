# server/ — architecture hexagonale

- **`domain/`** — Cœur métier pur : types et calculs (`ProgressService`, `CapacityService`, `SlaService`…). Aucune dépendance à Nitro, à la BDD ou à un adapter. Testable sans runtime (Vitest).
- **`application/`** — Services orchestrateurs : enchaînent les étapes du pipeline d'import, appellent le domaine et les repositories. Ne connaissent pas JIRA, HTTP, ni SQLite directement.
- **`adapters/`** — Implémentations concrètes des ports (`SourcePort`, `LlmPort`, `MailPort`) : `jira/`, `manual/` (CSV/XLSX), `llm/` (Claude), `mail/` (SMTP). Un nouvel outil source = un nouvel adapter, sans toucher au domaine.
- **`db/`** — Schéma Drizzle (`schema/`), migrations, seed et connexion SQLite.
- **`api/`** — Endpoints Nitro (`server/api/**`). Fins : validation d'entrée puis délégation à `application/`.
- **`utils/`** — Helpers transverses (connexion DB, contexte, crypto…) auto-importés par Nitro.
