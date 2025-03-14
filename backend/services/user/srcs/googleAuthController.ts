import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import { getUserByEmail, saveUser, getUserById } from './userDb.js';
import { linkAccount, getLinkedAccount, unlinkAccount } from './accountDb.js';

interface GoogleAUthRequest extends FastifyRequest {
	user?: { userId: string };
}

export async function handlerGoogleCallback(req: FastifyRequest, reply: FastifyReply) {
	try {
		const token = await this.getAccessTokenFromAuthorizationCodeFlow(req);

		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{
			headers: {
				Authorization: `Bearer ${token.access_token}`
			}
		});

		const googleUser = await userInfoResponse.json();

		let user = getUserByEmail(googleUser.email);
		let isNewUser = false;

		if (!user) {
			// Pour remplir la var PasswordHsh dans ma TABLE si le client ne se conecte que avec google
			const dummyPassword = await bcrypt.hash("google-oauth-" + Date.now(), 10);

			user = saveUser(
				googleUser.name,
				googleUser.email,
				dummyPassword
			);
				isNewUser = true;
		}

		await linkAccount(
			user.userId,
			'google',
			googleUser.id,
			token.access_token,
			token.refresh_token || null,
			token.expires_at || null
		);

		const jwt = req.server.jwt.sign(
			{ userId: user.userId },
			{ expiresIn: '24h' }
		);

		reply.redirect(`/login-sucess?token=${jwt}&new=${isNewUser}`);
	} catch (error) {
		console.error('OAuth callback error:', error);
		reply.redirect('/login-error');
	}
}

// verifier l'etat de connexion d'un compte 
export async function getAuthStatus(req: GoogleAUthRequest, reply: FastifyReply) {
	try {
		if (!req.user) {
			return reply.status(401).send({ error: 'Unauthorized' });
		}

		const user = getUserById(req.user.userId);
		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		const googleAccount = await getLinkedAccount(user.userId, 'google');

		reply.send({
			user: {
				userId: user.userId,
				userName: user.userName,
				email: user.email,
				hasGoogleLinked: !!googleAccount
			}
		});
	} catch (error) {
		console.error('Auth status error:', error);
		reply.status(500).send({ error: 'Internal server error' });
	}
}

export async function linkGoogleAccount(req: GoogleAUthRequest, reply: FastifyReply) {
	if (!req.user) {
		return reply.status(401).send({ error: 'Unauthorized' });
	}

	// encodeURIComponent pour eviter que la var userId casse l'url
	const redirectUrl = `/user/auth/google?linkAccount=${encodeURIComponent(req.user.userId)}`;
	reply.redirect(redirectUrl);
}

export async function unlinkGoogleAccount(req: GoogleAUthRequest, reply: FastifyReply) {
	try {
		if (!req.user) {
			return reply.status(401).send({ error: 'Unauthorized' });
		}

		const success = unlinkAccount(req.user.userId, 'google');
		if (success) {
			reply.send({ success: true, message: 'Google account unlinked successfully' });
		} else {
			reply.status(404).send({ error: 'No linked Google account found' });
		}
	} catch (error) {
		console.error('Error unlinking account:', error);
		reply.status(500).send({ error: 'Internal server error' });
	}
}