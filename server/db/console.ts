import repl from "node:repl";
import * as drizzleOrm from "drizzle-orm";
import { useDb } from "../utils/db";
import * as schema from "./schema";

// Console interactive façon `rails console` : `db` et les tables du schéma
// sont directement disponibles, avec top-level await pour les requêtes.
const db = useDb();

console.log(
  "ONEEO console — `db` (instance Drizzle) et les tables du schéma sont dans le scope."
);

const replServer = repl.start({ prompt: "oneeo> " });

Object.assign(replServer.context, { db, ...schema, ...drizzleOrm });
