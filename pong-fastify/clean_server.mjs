import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';

import Database from 'better-sqlite3';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });

const db = new Database(join(__dirname, 'database.sqlite'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`).run();

fastify.register(fastifyStatic, {
    root: join(__dirname, '../vite_pong/dist'),
    prefix: '/',
    serveHead: true,
    wildcard: false
});

fastify.get('/*', async (request, reply) => {
  return reply.sendFile('index.html');
});

fastify.setNotFoundHandler((request, reply) => {
  reply.sendFile('index.html');
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log(`🚀 Server running at http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
