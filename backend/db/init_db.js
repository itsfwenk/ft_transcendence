import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';

async function initDB(dbFile, sqlFile) {
  const db = await open({ filename: dbFile, driver: sqlite3.Database });
  const sql = await fs.readFile(sqlFile, 'utf8');
  await db.exec(sql);
  console.log(`✅ Base de données initialisée : ${dbFile}`);
  await db.close();
}

async function main() {
  await initDB('./db/users.db', './db/migrations/users.sql');
  await initDB('./db/games.db', './db/migrations/games.sql');
  await initDB('./db/matchmaking.db', './db/migrations/matchmaking.sql');
}

main().catch(console.error);
