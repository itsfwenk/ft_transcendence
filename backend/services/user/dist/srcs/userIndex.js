"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
const userRoutes_js_1 = __importDefault(require("./userRoutes.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, fastify_1.default)();
dotenv_1.default.config();
console.log('JWT Saecret: ', process.env.JWT_SECRET);
// Configurer JWT
app.register(jwt_1.default, { secret: process.env.JWT_SECRET || 'fallback_secret' });
// Configurer Swagger
app.register(swagger_1.default, {
    swagger: {
        info: {
            title: 'User API',
            description: 'API documentation for User Service',
            version: '1.0.0'
        }
    }
});
app.register(swagger_ui_1.default, {
    routePrefix: '/docs',
    staticCSP: true
});
// Middleware pour vérifier l'authentification
app.decorate("authenticate", async function (req, reply) {
    try {
        await req.jwtVerify();
    }
    catch (err) {
        reply.status(401).send({ error: "Unauthorized" });
    }
});
// Enregistrer les routes utilisateur
app.register(userRoutes_js_1.default, { prefix: '/user' });
app.listen({ port: 4001, host: '0.0.0.0' }, () => {
    console.log('User Service running on http://localhost:4001');
});
