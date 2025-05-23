import { Gauge } from 'prom-client';


export const connectedUsers = new Gauge({
  name: 'pong_connected_users',
  help: 'Nombre de joueurs actuellement connectés',
});