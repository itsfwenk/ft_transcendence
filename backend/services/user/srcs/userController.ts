import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from '@fastify/jwt';
import { saveUser, getUserByEmail, getUserById, isValidEmail, updateUser, deleteUser, User } from './userDb.js';

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

	if (!isValidEmail(email)) {
		return reply.status(400).send({ error: 'Invalid email format' });
	}

	try {
		// Vérifier si l'utilisateur existe déjà
		if (getUserByEmail(email)) {
			return reply.status(400).send({ error: 'Email already use' });
		}
	
		if (!password || password.length < 6) {
			return reply.status(400).send({ error: 'Password must be at least 6 characters long'});
		}
	
		// Hasher le mot de passe
		const hashedPassword = await bcrypt.hash(password, 10);

		// Ajouter l'utilisateur
		const newUser = saveUser(userName, email, hashedPassword);
		reply.send({ success: true, user: { userId: newUser.userId, userName, email } });

	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
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
  
	try {
		const user = getUserByEmail(email);
	
		if (user) {
			const passwordMatch = await bcrypt.compare(password, user.passwordHsh);
			if (passwordMatch === false) {
				return reply.status(401).send({ error: 'Invalid password' });
			}
			const token = req.server.jwt.sign(
				{ userId: user.userId },
				{ expiresIn: '24h' }
			);
			reply.send({ token, user: { userId: user.userId, userName: user.userName } });
		}
		else
		{
			return reply.status(401).send({ error: 'Invalid email or password' });
		}
	} catch (error) {
		console.error(error);
		reply.status(500).send({ error: 'Internal server error' });
	}
}


//interface pour '/profile'
interface ProfileRequest extends FastifyRequest {
	user: { userId: string };
}

// Profil utilisateur (protégé avec JWT)
export async function getUserProfile(req: ProfileRequest, reply: FastifyReply) {
	const user = getUserById(req.user.userId);
	if (!user)
		return reply.status(404).send({ error: 'User not found' });

	reply.send({ UserId: user.userId, username: user.userName, email: user.email});
}

export async function getUserByIdController(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const { userId } = req.params;
    const user = getUserById(userId);

    if (!user) {
        return reply.status(404).send({ error: "User not found" });
    }
    reply.send(user);
}

interface updateProfileRequest extends FastifyRequest {
	body: Partial<{
		userName: string;
		email: string;
		password: string;
	}>
	user: { userId: string };
}

export async function updateProfile(req: updateProfileRequest, reply: FastifyReply) {
	const userId = req.user.userId;
	const updates: any = {};

	if (req.body.userName !== undefined) {
		if (req.body.userName.trim() === '') {
			return reply.status(400).send({ error: 'Username cannot be empty' });
		}
		updates.userName = req.body.userName;
	}

	if (req.body.email !== undefined) {
		if ((!isValidEmail(req.body.email))) {
			return (reply.status(400).send({ error: 'Invalid email format' }));
		}
	}

	if (req.body.email !== undefined) {
		const existingUser = getUserByEmail(req.body.email);
		if (existingUser && existingUser.userId !== userId)
			return reply.status(400).send({ error: 'Email already use' });
		updates.email = req.body.email;
	}

	if (req.body.password !== undefined) {
		if (req.body.password.length < 6) {
			return reply.status(400).send({ error : 'Password must be at least 6 character long' });
		}
		updates.password = req.body.password;
	}

	try {
		const updtUser = updateUser(userId, updates);

		if (!updtUser) {
			return reply.status(500).send({ error: 'Failed to update' });
		}

		reply.send({
			success: true,
			user: {
				userId: updtUser.userId,
				userName: updtUser.userName,
				email: updtUser.email
			}
		});
	} catch (error) {
		reply.status(500).send({ error: 'Insternal server error' });
	}
}

export async function deleteAccount(req: ProfileRequest, reply: FastifyReply) {
	const userId = req.user.userId;

	try {
		const success = deleteUser(userId);
		if (success) {
			reply.send({ success: true, user: `${userId}`, message: 'Account deleted successfully'});
		} else {
			reply.status(404).send({ error: 'User not found' });
		}
	} catch (error) {
		reply.status(500).send({ error: 'Internal server error' });
	}
}