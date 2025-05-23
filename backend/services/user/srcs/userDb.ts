import Database from 'better-sqlite3';
import crypto from 'crypto';
import base32 from 'hi-base32';
import { v4 as uuidv4 } from 'uuid';
import { instrumentedRun } from '../metrics/sqlite';

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
		avatarImage BLOB,
		avatarMimeType TEXT,
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
	avatarImage?: Buffer;
	avatarMimeType?: string;
	inGameId: string;
}

const users: User[] = [];


export function saveUser(userName: string, email: string, password: string) {
	const userId = uuidv4();

	const stmt = db.prepare(`
		INSERT INTO users (userId, userName, email, passwordHsh, role, status, avatarUrl, inGameId)
		VALUES (?, ?, ?, ?, 'user', 'offline', '/avatars/default.png', ?)
	`);
	return instrumentedRun('user', 'INSERT users', () => {
		const result = stmt.run(userId, userName, email, password, "none");
		return { userId, userName, email, passwordHsh: password, role: 'user', status: 'online', avatarUrl: '/avatars/default.png', inGameId:'none' };
	});
}

export function getUserByEmail(email: string): User | undefined {
	return instrumentedRun('user', 'SELECT users by email', () => {
		const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
		return stmt.get(email) as User | undefined;
	});
}

export function getUserByUserName(name: string): User | undefined {
	return instrumentedRun('user', 'SELECT users by username', () => {
		const stmt = db.prepare(`SELECT * FROM users WHERE userName = ?`);
		return stmt.get(name) as User | undefined;
	});
}

export function getUserById(userId: string): User | undefined {
	
	return instrumentedRun('user', 'SELECT users by id', () => {
		const stmt = db.prepare(`SELECT * FROM users WHERE userId = ?`);
		return stmt.get(userId) as User | undefined;
	});
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	return emailRegex.test(email);
}

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

  return instrumentedRun('user', 'UPDATE users', () => {
    stmt.run(...values, userId);
    return getUserById(userId);
  });
}


export function updateUserRole(userId: string, role: string): boolean {
  return instrumentedRun('user', 'UPDATE role', () => {
    const stmt = db.prepare(`UPDATE users SET role = ? WHERE userId = ?`);
    const result = stmt.run(role, userId);
    return result.changes > 0;
  });
}

export function updateUserStatus(userId: string, status: string): boolean {
  return instrumentedRun('user', 'UPDATE status', () => {
    const stmt = db.prepare(`UPDATE users SET status = ? WHERE userId = ?`);
    const result = stmt.run(status, userId);
    if (result.changes > 0) {
      console.log('In updateUserStatus, user', userId, 'successfully set to', status);
    }
    return result.changes > 0;
  });
}

export async function updateUserGameId(userId: string, gameId: string) {
  return instrumentedRun('user', 'UPDATE inGameId', () => {
    const stmt = db.prepare(`UPDATE users SET inGameId = ? WHERE userId = ?`);
    const result = stmt.run(gameId, userId);
    return result.changes > 0;
  });
}

export function updateUserAvatar(userId: string, avatarImage: Buffer, mimeType: string): boolean {
  return instrumentedRun('user', 'UPDATE avatar', () => {
    const stmt = db.prepare(`
      UPDATE users 
      SET avatarImage = ?, avatarMimeType = ? 
      WHERE userId = ?
    `);
    const result = stmt.run(avatarImage, mimeType, userId);
    return result.changes > 0;
  });
}

export function deleteUser(userId: string): boolean {
  const stmt = db.prepare('DELETE FROM users WHERE userId = ?');
  return instrumentedRun('user', 'DELETE user by id', () => {
    const result = stmt.run(userId);
    return result.changes > 0;
  });
}


export function deleteUserAvatar(userId: string): boolean {
  return instrumentedRun('user', 'UPDATE avatar (delete)', () => {
    const stmt = db.prepare(`
      UPDATE users
      SET avatarImage = NULL, avatarMimeType = NULL
      WHERE userId = ?
    `);
    const result = stmt.run(userId);
    return result.changes > 0;
  });
}

export function getUsersByRole(role: string): User[] {
  return instrumentedRun('user', 'SELECT users by role', () => {
    const stmt = db.prepare(`SELECT * FROM users WHERE role = ?`);
    return stmt.all(role) as User[];
  });
}

export function getUserWithStatus(status: string): User[] {
  return instrumentedRun('user', 'SELECT users by status', () => {
    const stmt = db.prepare(`SELECT * FROM users WHERE status = ?`);
    return stmt.all(status) as User[];
  });
}

export function getUserAvatar(userId: string): { image: Buffer; mimeType: string } | null {
  return instrumentedRun('user', 'SELECT avatar', () => {
    try {
      const stmt = db.prepare(`
        SELECT avatarImage, avatarMimeType
        FROM users
        WHERE userId = ?
      `);
      const result = stmt.get(userId) as { avatarImage: Buffer; avatarMimeType: string } | undefined;
      if (!result || !result.avatarImage || !result.avatarMimeType) {
        return null;
      }
      return {
        image: result.avatarImage,
        mimeType: result.avatarMimeType
      };
    } catch (error) {
      console.error('Error getting user avatar:', error);
      return null;
    }
  });
}

export async function getAllUserId() {
  return instrumentedRun('user', 'SELECT all userId', () => {
    try {
      const stmt = db.prepare(`
        SELECT userId
        FROM users
      `);
      const result = stmt.all();
      return result;
    } catch (error) {
      console.error('Error retrieving all users Id:', error);
      return [];
    }
  });
}
