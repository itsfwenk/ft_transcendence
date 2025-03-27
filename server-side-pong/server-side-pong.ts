import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';

const fastify = Fastify({ logger: true });

fastify.register(fastifyWebsocket);

// Store connected players
const players = new Map();

fastify.get('/ws', { websocket: true }, (connection, req) => {
  // console.log('connection:', connection);
  // if (typeof connection.socket.send !== 'function') {
  //   console.error('connection.socket.send is not a function:', connection.socket);
  //   return;
  // }
  const playerId = Math.random().toString(36).substring(2, 9); // Generate a unique player ID
  players.set(playerId, connection);

  connection.socket.send(JSON.stringify({ type: 'welcome', id: playerId }));

  connection.socket.on('message', (message: string) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'move') {
      // Broadcast player movement to all connected clients
      for (const [id, client] of players.entries()) {
        if (id !== playerId) {
          client.socket.send(JSON.stringify({ type: 'update', playerId, position: data.position }));
        }
      }
    }
  });

  connection.socket.on('close', () => {
    players.delete(playerId);
  });
});

let ball = { x: 400, y: 200, dx: 2, dy: 2 };

setInterval(() => {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Bounce off walls
  if (ball.y <= 0 || ball.y >= 400) {
    ball.dy *= -1;
  }

  // Broadcast ball position to all clients
  for (const [, client] of players.entries()) {
    client.socket.send(JSON.stringify({ type: 'ballUpdate', x: ball.x, y: ball.y }));
  }
}, 16);

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
