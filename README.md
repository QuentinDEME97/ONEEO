# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Base de données (Drizzle)

La persistance utilise [Drizzle ORM](https://orm.drizzle.team/) sur SQLite (`better-sqlite3`), fichier en `data/oneeo.sqlite`.

```bash
npm run db:generate  # génère une migration à partir du schéma (server/db/schema)
npm run db:migrate   # applique les migrations sur data/oneeo.sqlite
npm run db:seed      # charge le jeu de données factice (fixtures)
```

### Console interactive

À la manière de la console Rails (`rails console`), une console Node interactive est disponible :

```bash
npm run console
```

Elle démarre un REPL avec `db` (l'instance Drizzle) et toutes les tables du schéma déjà importées dans le scope, ainsi que les helpers de `drizzle-orm` (`eq`, `and`, `sql`, …). Le top-level `await` fonctionne nativement dans le REPL Node :

```
oneeo> await db.select().from(healthCheck)
[ { id: 1, createdAt: '2026-07-06 17:41:07' } ]
```
