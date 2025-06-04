import { FastifyRequest, FastifyReply } from "fastify";
import {
	getUserById,
	updateUser,
	updateUserAvatar,
	getUserAvatar,
	deleteUserAvatar,
} from "./userDb";
import { randomUUID } from "crypto";

const DEFAULT_AVATAR_URL = "/avatars/default.png";

interface UploadAvatarRequest extends FastifyRequest {
	user: { userId: string };
	file: () => Promise<any>;
}

export async function uploadAvatar(
	req: UploadAvatarRequest,
	reply: FastifyReply
) {
	try {
		const userId = req.user.userId;
		const user = getUserById(userId);

		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		const data = await req.file();

		if (!data) {
			return reply.status(400).send({ error: "No file uploaded" });
		}

		const mimeType = data.mimetype;
		if (!mimeType.startsWith("image/")) {
			return reply
				.status(400)
				.send({ error: "Only image files are allowed" });
		}

		const chunks: Buffer[] = [];
		for await (const chunk of data.file) {
			chunks.push(chunk);
		}
		const fileBuffer = Buffer.concat(chunks);

		const success = updateUserAvatar(userId, fileBuffer, mimeType);

		if (!success) {
			return reply.status(500).send({ error: "Failed to update avatar" });
		}

		const uniqueId = randomUUID();
		const avatarUrl = `/api/user/avatar/${userId}?v=${uniqueId}`;

		const updatedUser = updateUser(userId, { avatarUrl });

		if (!updatedUser) {
			return reply
				.status(500)
				.send({ error: "Failed to update avatar URL" });
		}

		return reply.send({
			success: true,
			avatarUrl,
		});
	} catch (error) {
		console.error("Error uploading avatar:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}

export async function deleteAvatar(
	req: UploadAvatarRequest,
	reply: FastifyReply
) {
	try {
		const userId = req.user.userId;
		const user = getUserById(userId);

		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		const success = deleteUserAvatar(userId);

		const updatedUser = updateUser(userId, {
			avatarUrl: DEFAULT_AVATAR_URL,
		});

		if (!success || !updatedUser) {
			return reply.status(500).send({ error: "Failed to reset avatar" });
		}

		return reply.send({
			success: true,
			avatarUrl: DEFAULT_AVATAR_URL,
		});
	} catch (error) {
		console.error("Error deleting avatar:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}

export async function getAvatar(
	req: FastifyRequest<{ Params: { userId: string } }>,
	reply: FastifyReply
) {
	try {
		const { userId } = req.params;
		const user = getUserById(userId);

		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		const avatar = getUserAvatar(userId);

		if (avatar && avatar.image) {
			reply.type(avatar.mimeType);
			return reply.send(avatar.image);
		} else {
			return reply.send({
				avatarUrl: user.avatarUrl || DEFAULT_AVATAR_URL,
			});
		}
	} catch (error) {
		console.error("Error getting avatar:", error);
		return reply.status(500).send({ error: "Internal server error" });
	}
}
