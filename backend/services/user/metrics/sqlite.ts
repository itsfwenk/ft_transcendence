import { Histogram, Counter, Gauge } from 'prom-client';
import fs from 'fs';
import path from 'path';

export const sqliteQueryDuration = new Histogram({
  name: 'sqlite_query_duration_seconds',
  help: 'Durée des requêtes SQLite',
  labelNames: ['service', 'statement'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2]
});

export const sqliteQueriesTotal = new Counter({
  name: 'sqlite_queries_total',
  help: 'Nombre total de requêtes SQLite',
  labelNames: ['service', 'status', 'statement'],
});

export const sqliteDbFileBytes = new Gauge({
  name: 'sqlite_db_file_bytes',
  help: 'Taille du fichier SQLite',
  labelNames: ['service'],
});

const dbPath = path.resolve('/app/db/users.db');
setInterval(() => {
  try {
    const { size } = fs.statSync(dbPath);
    sqliteDbFileBytes.set({ service: 'user' }, size);
  } catch {
    sqliteDbFileBytes.set({ service: 'user' }, 0);
  }
}, 30000);

export function instrumentedRun<T>(service: string, statementName: string, fn: () => T) {
	const METRICS_ON = process.env.ENABLE_METRICS !== "false";
  if (!METRICS_ON) return fn();
  const end = sqliteQueryDuration.startTimer({ service, statement: statementName });

  try {
    const result = fn();
    sqliteQueriesTotal.inc({ service, status: 'ok', statement: statementName });
    end();
    return result;
  } catch (err) {
    sqliteQueriesTotal.inc({ service, status: 'err', statement: statementName });
    end();
    throw err;
  }
}