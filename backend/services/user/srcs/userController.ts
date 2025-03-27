import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from '@fastify/jwt';
import { saveUser, getUserByEmail, getUserById, isValidEmail, updateUser, deleteUser, updateUserRole, updateUserStatus, getUsersByRole, getUserWithStatus, User, getUserByUserName } from './userDb.js';
import { getConnectedUsers, isUserConnected } from './WebsocketHandler.js';

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

		if (getUserByUserName(userName)) {
			return reply.status(400).send({ error: 'UserName already use' });
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

			updateUserStatus(user.userId, 'online');

			const token = req.server.jwt.sign(
				{ userId: user.userId },
				{ expiresIn: '24h' }
			);

			reply.setCookie('authToken', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',  // en production, utilisez HTTPS
				sameSite: 'strict',
				path: '/',  // disponible pour toutes les routes
			  });

			reply.send({ token,
				user: { 
					userId: user.userId,
					userName: user.userName,
					role: user.role,
					status: user.status,
				 }
				});
		} else {
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

	reply.send({ UserId: user.userId, username: user.userName, email: user.email, avatarUrl: user.avatarUrl });
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

interface LogoutUserRequest extends FastifyRequest {
	user: { userId: string};
}

export async function logoutUser(req: LogoutUserRequest, reply: FastifyReply) {
	// delete cookies plus tard (a voir)
	try {
		console.log(req.user.userId);
		updateUserStatus(req.user.userId, 'offline');
		reply.send({ success: true, message: `UserId: ${req.user.userId} loggout` });
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

interface UpdateRoleRequest extends FastifyRequest {
	body: {
		userId: string;
		role: string;
	};
	user: { userId: string; role: string };
}

export async function updateRole(req: UpdateRoleRequest, reply: FastifyReply) {
	// if (req.user.role !== 'admin') {
	// 	return reply.status(403).send({ error: 'Permission denied' });
	// } Pour plus tard si utilisation de admin

	const { userId, role } = req.body;

	if (!['user', 'admin'].includes(role)) {
		return reply.status(400).send({ error: 'Invalid role' });
	}

	try {
		const success = updateUserRole(userId, role);
		if (success) {
			return reply.send({ success: true, message: 'Role updated successfully' });
		} else {
			return reply.status(404).send({ error: 'User not found' });
		}
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

interface UpdateStatusRequest extends FastifyRequest {
	body: {
		status: string;
	}
	user: { userId: string };
}

export async function updateStatus(req: UpdateStatusRequest, reply: FastifyReply) {
	const { status } = req.body;
	const userId = req.user.userId;

	if (!['online', 'offline'].includes(status)) {
		return reply.status(400).send({ error: 'Invalid status' });
	}

	try {
		const success = updateUserStatus(userId, status);
		if (success) {
			return reply.send({ success: true, message: `Status updated in ${status}.`});
		} else {
			return reply.status(404).send({ error: 'User not found' });
		}
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

export async function getOnlineUsers(req: FastifyRequest, reply: FastifyReply) {
	try {
		const connectedUsersIds = getConnectedUsers();
		const onlineUsers = connectedUsersIds.map(userId => {
			const user = getUserById(userId);
			return user ? {
				userId: user.userId,
				userName: user.userName,
				status: 'online',
			} : null;
		}).filter(Boolean);

		return reply.send({
			users: onlineUsers
		});
	} catch (error) {
		console.error(error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

export async function checkUserConnectionStatus(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
	const { userId } = req.params;
	const user =getUserById(userId);

	if (!user) {
		return reply.status(404).send({ error: 'User not found' });
	}

	const isConnected = isUserConnected(userId);

	return reply.send({
		userId,
		userName: user.userName,
		isConnected,
		status: isConnected ? 'online' : 'offline'
	});
}

