import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';

import Database from 'better-sqlite3';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Convert `import.meta.url` to a directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const Fastify = require('fastify');
// const path = require('path');
const fastify = Fastify({ logger: true });

// Connect to SQLite database
const db = new Database(join(__dirname, 'database.sqlite'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`).run();

///
// // API to add a user
// fastify.post('/users', async (request, reply) => {
//   const { name } = request.body;
//   const stmt = db.prepare('INSERT INTO users (name) VALUES (?)');
//   const info = stmt.run(name);
//   reply.send({ id: info.lastInsertRowid, name });
// });

// // API to get all users
// fastify.get('/users', async (request, reply) => {
//   const users = db.prepare('SELECT * FROM users').all();
//   reply.send(users);
// });

// // Start the server
// const start = async () => {
//   try {
//     await fastify.listen({ port: 3000 });
//     console.log(`🚀 Server running at http://localhost:3000`);
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };
// start();
///

// // Serve static files from Vite's built output CommonJS
// fastify.register(require('@fastify/static'), {
//   root: path.join(__dirname, '../vite_pong/dist'),
//   prefix: '/',
//   serveHead: false,
//   wildcard: false
// });

// Serve static files from Vite's built output ES Modules
// import('@fastify/static').then(({ default: fastifyStatic }) => {
  fastify.register(fastifyStatic, {
    root: join(__dirname, '../vite_pong/dist'),
    prefix: '/',
    serveHead: true,
    wildcard: false
  });
// });

// // API Endpoint
// fastify.get('/api/hello', async (request, reply) => {
//   return { message: "Hello from the backend!" };
// });

// Catch-all route to serve `index.html` for SPA (Single Page Application)
fastify.get('/*', async (request, reply) => {
  return reply.sendFile('index.html');
});

// Handle SPA routing: Redirect all unknown routes to index.html
fastify.setNotFoundHandler((request, reply) => {
  reply.sendFile('index.html');
});

// // Start Server
// fastify.listen({ port: 3000 }, (err, address) => {
//   if (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
//   console.log(`🚀 Server running at ${address}`);
// });

// Start the server
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

// fastify.get('/', async (request, reply) => {
//   return { message: 'Pong game backend is running!' };
// });

// fastify.post('/start', async (request, reply) => {
//     return { message: 'Game started!' };
//   });
  
// fastify.post('/move', async (request, reply) => {
//   const { player, direction } = request.body;
//   return { player, direction, message: 'Move registered' };
// });

// fastify.get('/score', async (request, reply) => {
//   return { score: { player1: 0, player2: 0 } };
// });  

// const start = async () => {
//   try {
//     await fastify.listen({ port: 3000, host: '0.0.0.0' });
//     console.log('Server running at http://localhost:3000');
//   } catch (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
// };

// start();
