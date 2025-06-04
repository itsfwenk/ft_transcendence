import Database from "better-sqlite3";
import { getUserById } from "./userDb";

const db = new Database("/app/db/users.db");

interface Friend {
	userId: string;
	userName: string;
	status: string;
	avatarUrl: string;
}

export function addFriend(userId: string, friendId: string): boolean {
	try {
		const user = getUserById(userId);
		const friend = getUserById(friendId);

		if (!user || !friend) {
			return false;
		}

		if (userId === friendId) {
			return false;
		}

		const checkStmt = db.prepare(`
			SELECT id FROM friendships
			WHERE userId = ? AND friendId = ?
			`);

		const existingFriendship = checkStmt.get(userId, friendId);
		if (existingFriendship) {
			return true;
		}

		const insertStmt = db.prepare(`
			INSERT INTO friendships (userId, friendId, createdAt)
			VALUES (?, ?, ?)
		`);

		const now = Math.floor(Date.now() / 1000);
		insertStmt.run(userId, friendId, now);

		return true;
	} catch (error) {
		console.error("Error adding friend:", error);
		return false;
	}
}

export function removeFriend(userId: string, friendId: string): boolean {
	try {
		const stmt = db.prepare(`
			DELETE FROM friendships
			WHERE userId = ? AND friendId = ?
			`);

		const result = stmt.run(userId, friendId);
		return result.changes > 0;
	} catch (error) {
		console.error("Error removing friend:", error);
		return false;
	}
}

export function areFriends(userId: string, friendId: string): boolean {
	try {
		const stmt = db.prepare(`
			SELECT id FROM friendships
			WHERE userId = ? AND friendId = ?
			`);

		const friendship = stmt.get(userId, friendId);
		return !!friendship;
	} catch (error) {
		console.error("Error checking friendship:", error);
		return false;
	}
}

export function getFriends(userId: string): Friend[] {
	try {
		const stmt = db.prepare(`
			SELECT u.userId, u.userName, u.status, u.avatarUrl
			FROM friendships f
			JOIN users u ON f.friendId = u.userId
			WHERE f.userId = ?
		`);

		return stmt.all(userId) as Friend[];
	} catch (error) {
		console.error("Error getting friends:", error);
		return [];
	}
}

export function getOnlineFriends(userId: string): Friend[] {
	try {
		const stmt = db.prepare(`
			SELECT u.userId, u.userName, u.status, u.avatarUrl
			FROM friendships f
			JOIN users u ON f.friendId = u.userId
			WHERE f.userId = ? AND u.status = 'online'
		`);

		return stmt.all(userId) as Friend[];
	} catch (error) {
		console.error("Error getting online friends:", error);
		return [];
	}
}
