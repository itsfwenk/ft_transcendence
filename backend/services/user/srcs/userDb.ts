import Database from 'better-sqlite3';
import crypto from 'crypto';
import base32 from 'hi-base32';
import { v4 as uuidv4 } from 'uuid';

//Connexion à la base de données SQLite
const db = new Database('/app/db/users.db');

//Creation de la table users si elle n'existe pas
db.exec(`
	CREATE TABLE IF NOT EXISTS users (
		userId TEXT PRIMARY KEY,
		userName TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		passwordHsh TEXT NOT NULL,
		role TEXT NOT NULL,
		status TEXT DEFAULT 'offline',
		avatarUrl TEXT DEFAULT '/avatars/default.png',
		inGameId TEST NOT NULL
	)
`);

db.exec(`
	CREATE TABLE IF NOT EXISTS linked_accounts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	userId TEXT NOT NULL,
	provider TEXT NOT NULL,
	providerId TEXT NOT NULL,
	accessToken TEXT,
	refreshToken TEXT,
	tokenExpiry INTEGER,
	FOREIGN KEY (userId) REFERENCES users(userId),
	UNIQUE(provider, providerId) 
	)
`);

db.exec(`
	  CREATE TABLE IF NOT EXISTS friendships (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  userId TEXT NOT NULL,
	  friendId TEXT NOT NULL,
	  createdAt INTEGER NOT NULL,
	  FOREIGN KEY (userId) REFERENCES users(userId),
	  FOREIGN KEY (friendId) REFERENCES users(userId),
	  UNIQUE(userId, friendId)
	)
`);

export interface User {
	userId: string;
	userName: string;
	email: string;
	passwordHsh: string;
	role: string;
	status: string;
	avatarUrl: string;
	inGameId: string;
	// token: string;
}

const users: User[] = [];

export function saveUser(userName: string, email: string, password: string) {
	const userId = uuidv4();

	const stmt = db.prepare(`
		INSERT INTO users (userId, userName, email, passwordHsh, role, status, avatarUrl, inGameId)
		VALUES (?, ?, ?, ?, 'user', 'online', '/avatars/default.png', ?)
	`);
	const result = stmt.run(userId, userName, email, password, "none");

	return { userId, userName, email, passwordHsh: password, role: 'user', status: 'online', avatarUrl: '/avatars/default.png', inGameId:'none' };
}

export function getUserByEmail(email: string): User | undefined {
	try {
		const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
		return stmt.get(email) as User | undefined;
	} catch (error) {
		console.error('Error fetching user by email:', error);
		throw new Error('Database error');
	}
}

export function getUserByUserName(name: string): User | undefined {
	try {
		const stmt = db.prepare(`SELECT * FROM users WHERE userName = ?`);
		return stmt.get(name) as User | undefined;
	} catch (error) {
		console.error('Error fetching user by userName:', error);
		throw new Error('Database error');
	}
}

export function getUserById(userId: string): User | undefined {
	const stmt = db.prepare(`SELECT * FROM users WHERE userId = ?`);
	const user = stmt.get(userId);
	return user as User | undefined;
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	return emailRegex.test(email);
}

// export function generateSessionId(): string {
// 	const bytes = crypto.randomBytes(15);
// 	return base32.encode(bytes).replace(/=/g, "");
// }

export function updateUser(userId: string, data: Partial<User>): User | undefined {
	const entries = Object.entries(data).filter(([_, value]) => value !== undefined);

	if (entries.length === 0) {
		return getUserById(userId);
	}

	const fields = entries.map(([key, _]) => `${key} = ?`).join(', ');
	const values = entries.map(([_, value]) => value);

	const stmt = db.prepare(`
		UPDATE users
		SET ${fields}
		WHERE userId = ?
	`);

	try {
		stmt.run(...values, userId);
		return getUserById(userId);
	} catch (error) {
		console.error('Error updating user:', error);
		return undefined;
	}
}

export function deleteUser(userId: string): boolean {
	const stmt = db.prepare('DELETE FROM users WHERE userId = ?');
	const result = stmt.run(userId);
	return result.changes > 0;
}

export function updateUserRole(userId: string, role: string): boolean {
	const stmt = db.prepare(`UPDATE users SET role = ? WHERE userId = ?`);
	const result = stmt.run(role, userId);
	return result.changes > 0;
}

export function updateUserStatus(userId: string, status: string): boolean {
	const stmt = db.prepare(`UPDATE users SET status = ? WHERE userId = ?`);
	const result = stmt.run(status, userId);
	return result.changes > 0;
}

export function getUsersByRole(role: string): User[] {
	const stmt = db.prepare(`SELECT * FROM users WHERE role = ?`);
	return stmt.all(role) as User[];
}

export function getUserWithStatus(status: string): User[] {
	const stmt = db.prepare(`SELECT * FROM users WHERE status = ?`);
	return stmt.all(status) as User[];
}

export async function updateUserGameId(userId: string, gameId: string) {
	const stmt = db.prepare(`UPDATE users SET inGameId = ? WHERE userId = ?`);
	const result = stmt.run(gameId, userId);
	return result.changes > 0;
}