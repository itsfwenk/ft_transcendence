import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import userProxy from './userProxy.js';
import gameProxy from './gameProxy.js';
import matchmakingProxy from './matchmakingProxy.js';


const app = Fastify();

//Configurer Swagger UI
app.register(swagger,{
	swagger: {
		info: {
			title: 'API Gateway',
			description: 'Doc des services User et Game',
			version: '1.0.0'
		}
	}
});

app.register(swaggerUI, {
	routePrefix: '/docs',
	staticCSP: true
});

//Enregistrer les proxy pour User et Game
app.register(userProxy);
app.register(gameProxy);
app.register(matchmakingProxy);

app.listen({port: 4000 , host: '0.0.0.0'}, () => {
	console.log('API Gateway running on http://localhost:4000');
});