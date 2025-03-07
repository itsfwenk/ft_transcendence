import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from '@fastify/jwt';
import { saveUser, getUserByEmail, getUserById, User } from './userDb.js';

// Interface pour les requêtes de création d'utilisateur
interface RegisterRequest extends FastifyRequest {
	body: {
	  userName: string;
	  email: string;
	  password: string;
	};
  }

// Inscription
export async function registerUser(req:RegisterRequest, reply:FastifyReply) {
	const { userName, email, password } = req.body;

  // Vérifier si l'utilisateur existe déjà
  if (getUserByEmail(email)) {
    return reply.status(400).send({ error: 'Email already in use' });
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Ajouter l'utilisateur
  const newUser = saveUser(userName, email, hashedPassword);
  reply.send({ success: true, user: { userId: newUser.userId, userName, email } });
}

// Interface pour la requête de connexion
interface LoginRequest extends FastifyRequest {
	body: {
	  email: string;
	  password: string;
	};
  }

// Connexion
export async function loginUser(req:LoginRequest, reply:FastifyReply) {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  const token = req.server.jwt.sign({ userId: user.userId });
  reply.send({ token });
}


//interface pour '/profile'
interface ProfileRequest extends FastifyRequest {
	user: { userId: number };
}

// Profil utilisateur (protégé avec JWT)
export async function getUserProfile(req:ProfileRequest, reply:FastifyReply) {
	const user = getUserById(req.user.userId);
	if (!user) return reply.status(404).send({ error: 'User not found' });

	reply.send({ UserId: user.userId, username: user.userName, email: user.email, password: user.password });
}

export async function getUserByIdController(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const { userId } = req.params;
    const user = getUserById(parseInt(userId));

    if (!user) {
        return reply.status(404).send({ error: "User not found" });
    }
    reply.send(user);
}
