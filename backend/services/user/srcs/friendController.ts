import { FastifyRequest, FastifyReply } from "fastify";
import { addFriend, removeFriend, getFriends, getOnlineFriends, areFriends } from "./friendDb";
import { getUserByUserName } from "./userDb";

interface AuthenticatedRequest extends FastifyRequest {
	user: { userId: string };
}

interface FriendRequest extends AuthenticatedRequest {
	params: { userName: string };
}

export async function addFriendController(req: FriendRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;
		const { userName } = req.params;

		const friendUser = getUserByUserName(userName);
		if (!friendUser) {
			return reply.status(404).send({ error: 'User not found' });
		}

		const friendId = friendUser.userId;

		if (userId === friendId) {
			return reply.status(400).send({ error: 'Cannot add yourself as a friend' });
		}

		const success = addFriend(userId, friendId);

		if (success) {
			return reply.send({
				success: true,
				message: 'Friend added successfully',
				friend: {
					userId: friendUser.userId,
					userName: friendUser.userName,
					status: friendUser.status,
					avatarUrl: friendUser.avatarUrl
				}
			});
		} else {
			return reply.status(500).send({ error: 'Failed to add friend '});
		}
	} catch (error) {
		console.error('Error in addFriendController:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

interface FriendIdRequest extends AuthenticatedRequest {
	params: { friendId: string };
}

export async function removeFriendController(req: FriendIdRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;
		const { friendId } = req.params;

		const isFriend = areFriends(userId, friendId);
		if (!isFriend) {
			return reply.status(404).send({ error: 'This user is not in your friends list' });
		}

		const success = removeFriend(userId, friendId);

		if (success) {
			return reply.send({ success: true, message: 'Friend removed successfully'})
		} else {
			return reply.status(500).send({ error: 'Failed to remove friend' });
		}
	} catch (error) {
		console.error('Error in removeFriendController:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

export async function getFriendsController(req: AuthenticatedRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;
		const friends = getFriends(userId);

		return reply.send({
			success: true,
			count: friends.length,
			friends
		});
	} catch (error) {
		console.error('Error in getFriendsCOntroller:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

export async function getOnlineFriendsController(req: AuthenticatedRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;
		const onlineFriends = getOnlineFriends(userId);

		return reply.send({
			success: true,
			count: onlineFriends.length,
			friends: onlineFriends
		});
	} catch (error) {
		console.error('Error in getOnlineFriendCOntroller:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

export async function checkFriendshipController(req: FriendIdRequest, reply: FastifyReply) {
	try {
		const userId = req.user.userId;
		const { friendId } = req.params;

		const isFriend = areFriends(userId, friendId);

		return reply.send({
			success: true,
			isFriend
		});
	} catch (error) {
		console.error('Error in checkFriendshipController:', error);
		return reply.status(500).send({ error: 'Internal server error' });
	}
}

