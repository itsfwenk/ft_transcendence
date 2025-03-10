import Database from 'better-sqlite3';
import crypto from 'crypto';
import base32 from 'hi-base32';

//Connexion à la base de données SQLite
const db = new Database('./backend/db/users.db');

//Creation de la table users si elle n'existe pas
db.exec(`
	CREATE TABLE IF NOT EXISTS users (
	  userId INTEGER PRIMARY KEY AUTOINCREMENT,
	  userName TEXT NOT NULL,
	  email TEXT UNIQUE NOT NULL,
	  passwordHsh TEXT NOT NULL
	)
`);

db.exec(`
	CREATE TABLE IF NOT EXISTS token (
	token STRING NOT NULL UNIQUE,
	expiresAt INTEGER NOT NULL,
	userId INTEGER NOT NULL,
	
	FOREIGN KEY (userId) REFERENCES users(userId)
	)
`);

export interface User {
	userId: number;
	userName: string;
	email: string;
	passwordHsh: string;
}

const users: User[] = [];

export function saveUser(userName: string, email: string, password: string) {
	const stmt = db.prepare(`
		INSERT INTO users (userName, email, passwordHsh)
		VALUES (?, ?, ?)
	`);
	const result = stmt.run(userName, email, password);
	return { userId: result.lastInsertRowid, userName, email };
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

export function getUserById(userId: number): User | undefined {
	//return users.find(users => users.userId === userId);
	const stmt = db.prepare(`SELECT * FROM users WHERE userId = ?`);
	const user = stmt.get(userId);
	return user as User | undefined;
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	return emailRegex.test(email);
}

export function generateSessionId(): string {
	const bytes = crypto.randomBytes(15);
	return base32.encode(bytes).replace(/=/g, "");
}