import { FastifyRequest, FastifyReply } from "fastify";
import { getUserById, updateUser } from "./userDb";
import path from 'path';
import { randomUUID } from "crypto";
import fs from 'fs';
import util from 'util';
import { pipeline } from "stream";
const pump = util.promisify(pipeline);

const AVATARS_STORAGE_DIR = '/app/public/avatars';
const AVATARS_URL_PREFIX = 'http://localhost:4000/avatars';
const DEFAULT_AVATAR_URL = `${AVATARS_URL_PREFIX}/default.png`;

interface UploadAvatarRequest extends FastifyRequest {
	user: { userId: string };
	file: () => Promise<any>;
}

export async function uplpoadAvatar(req: UploadAvatarRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;
		const user = getUserById(userId);

		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		const data = await req.file();

		if (!data) {
			return reply.status(400).send({ error: 'No file uploaded' });
		}

		// verif si c'est bien une image avec le MIM
		const mimeType = data.mimetype;
		if (!mimeType.startsWith('image/')) {
			return reply.status(400).send({ error: 'Only image files are allowed' });
		}

		const extension = path.extname(data.filename || '.jpg').toLowerCase();
		const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

		if (!allowedExtensions.includes(extension)) {
			return reply.status(400).send({ error: 'Only jpg, png and gif files are allowed' });
		}

		const filename = `${userId}-${randomUUID()}${extension}`;
		const avatarPath = path.join(AVATARS_STORAGE_DIR, filename);
		const avatarUrl = `${AVATARS_URL_PREFIX}/${filename}`;

		await pump(data.file, fs.createWriteStream(avatarPath));

		if (user.avatarUrl && user.avatarUrl !== DEFAULT_AVATAR_URL) {
			const oldAvatarPath = path.join(AVATARS_STORAGE_DIR, user.avatarUrl);
			if (fs.existsSync(oldAvatarPath)) {
				fs.unlinkSync(oldAvatarPath);
			}
		}

		const updatedUser = updateUser(userId, { avatarUrl });

		if (!updatedUser) {
			return reply.status(500).send({ error: 'Failed to update avatar' });
		}

		return reply.send({
			success: true,
			avatarUrl
		});
	} catch (error) {
		console.error('Error uploading avatar:', error);
		return reply.status(500).send( { error: 'Internal server error' });
	}
}
export async function deleteAvatar(req: UploadAvatarRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;
		const user = getUserById(userId);

		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		if (user.avatarUrl && user.avatarUrl !== DEFAULT_AVATAR_URL) {
			const avatarPath = path.join(AVATARS_STORAGE_DIR, user.avatarUrl);
			if (fs.existsSync(avatarPath)) {
				fs.unlinkSync(avatarPath);
			}
		}

		const updatedUser = updateUser(userId, { avatarUrl: DEFAULT_AVATAR_URL });

		if (!updatedUser) {
			return reply.status(500).send({ error: 'Failed to reset avatar' });
		}

		return reply.send({
			success: true,
			avatarUrl: DEFAULT_AVATAR_URL
		});
	} catch (error) {
		console.error('Error deleting avatar:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

export async function getAvatar(req: FastifyRequest<{ Params: {userId: string } }>, reply: FastifyReply) {
	try {
		const { userId } = req.params;
		const user = getUserById(userId);

		if (!user) {
			return reply.status(404).send({ error: 'User not found' });
		}

		return reply.send({ avatarUrl: user.avatarUrl });
	} catch (error) {
		console.error('Error getting avatar:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}