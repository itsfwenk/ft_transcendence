import Database from 'better-sqlite3';

//Connexion à la base de données SQLite
const db = new Database('/app/db/users.db');

//Creation de la table users si elle n'existe pas
db.exec(`
	CREATE TABLE IF NOT EXISTS users (
	  userId INTEGER PRIMARY KEY AUTOINCREMENT,
	  userName TEXT NOT NULL,
	  email TEXT UNIQUE NOT NULL,
	  password TEXT NOT NULL
	)
`);

export interface User {
	userId: number;
	userName: string;
	email: string;
	password: string;
	socket: WebSocket;
}

const users: User[] = [];

export function saveUser(userName: string, email: string, password: string) {
	const stmt = db.prepare(`
		INSERT INTO users (userName, email, password)
		VALUES (?, ?, ?)
	`);
	const result = stmt.run(userName, email, password);
	return { userId: result.lastInsertRowid, userName, email };
}

export function getUserByEmail(email: string): User | undefined {
	//return users.find(users => users.email === email);
	const stmt = db.prepare(`SELECT * FROM users WHERE email = ?`);
	return stmt.get(email) as User | undefined;
}

export function getUserById(userId: number): User | undefined {
	//return users.find(users => users.userId === userId);
	const stmt = db.prepare(`SELECT * FROM users WHERE userId = ?`);
	const user = stmt.get(userId);
	return user as User | undefined;
}
