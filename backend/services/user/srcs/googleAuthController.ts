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
	}
}