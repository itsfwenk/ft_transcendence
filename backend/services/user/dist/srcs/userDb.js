"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUser = saveUser;
exports.getUserByEmail = getUserByEmail;
exports.getUserById = getUserById;
exports.isValidEmail = isValidEmail;
exports.generateSessionId = generateSessionId;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto_1 = __importDefault(require("crypto"));
const hi_base32_1 = __importDefault(require("hi-base32"));
//Connexion à la base de données SQLite
const db = new better_sqlite3_1.default('/app/db/users.db');
//Creation de la table users si elle n'existe pas
db.exec(`
	CREATE TABLE IF NOT EXISTS users (
	  userId STRING PRIMARY KEY AUTOINCREMENT,
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
const users = [];
function saveUser(userName, email, password) {
    const stmt = db.prepare(`
		INSERT INTO users (userName, email, passwordHsh)
		VALUES (?, ?, ?)
	`);
    const result = stmt.run(userName, email, password);
    return { userId: result.lastInsertRowid, userName, email };
}
function getUserByEmail(email) {
    try {
        const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
        return stmt.get(email);
    }
    catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error('Database error');
    }
}
function getUserById(userId) {
    const stmt = db.prepare(`SELECT * FROM users WHERE userId = ?`);
    const user = stmt.get(userId);
    return user;
}
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
}
function generateSessionId() {
    const bytes = crypto_1.default.randomBytes(15);
    return hi_base32_1.default.encode(bytes).replace(/=/g, "");
}
function updateUser(userId, data) {
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
    }
    catch (error) {
        console.error('Error updating user:', error);
        return undefined;
    }
}
function deleteUser(userId) {
    const stmt = db.prepare('DELETE FROM users WHERE userId = ?');
    const result = stmt.run(userId.toString());
    return result.changes > 0;
}
