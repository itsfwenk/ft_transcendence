import Database from "better-sqlite3";

const db = new Database("/app/db/users.db");

interface LinkedAccount {
	id: number;
	userId: string;
	provider: string;
	providerId: string;
	accessToken: string;
	refreshToken: string | null;
	tokenExpiry: number | null;
}

export function linkAccount(
	userId: string,
	provider: string,
	providerId: string,
	accessToken: string,
	refreshToken: string | null,
	tokenExpiry: number | null
): boolean {
	try {
		const existingAccount = getLinkedAccount(userId, provider);

		if (existingAccount) {
			// refresh ses tokens si existe deja
			const updateStmt = db.prepare(`
				UPDATE linked_accounts
				SET accessToken = ?, refreshToken = ?, tokenExpiry = ?
				WHERE userId = ? AND provider = ?
			`);

			updateStmt.run(
				accessToken,
				refreshToken,
				tokenExpiry,
				userId,
				provider
			);
		} else {
			// creer une nouvelle liaison
			const insertStmt = db.prepare(`
				INSERT INTO linked_accounts (userId, provider, providerId, accessToken, refreshToken, tokenExpiry)
				VALUES (?, ?, ?, ?, ?, ?)
			`);

			insertStmt.run(
				userId,
				provider,
				providerId,
				accessToken,
				refreshToken,
				tokenExpiry
			);
		}
		return true;
	} catch (error) {
		console.error("Error linking account:", error);
		return false;
	}
}

// Recupere un compte lie
export function getLinkedAccount(
	userId: string,
	provider: string
): LinkedAccount | undefined {
	try {
		const stmt = db.prepare(`
			SELECT * FROM linked_accounts
			WHERE userId = ? AND provider = ?
		`);

		return stmt.get(userId, provider) as LinkedAccount | undefined;
	} catch (error) {
		console.error("Error getting linked account:", error);
		return undefined;
	}
}

export function getAllLinkedAccounts(userId: string): LinkedAccount[] {
	try {
		const stmt = db.prepare(
			`SELECT * FROM linked_accounts WHERE userId = ?`
		);

		return stmt.all(userId) as LinkedAccount[];
	} catch (error) {
		console.error("Error getting all linked accounts:", error);
		return [];
	}
}

export function unlinkAccount(userId: string, provider: string): boolean {
	try {
		const stmt = db.prepare(
			`DELETE FROM linked_accounts WHERE userId = ? AND provider = ?`
		);

		const result = stmt.run(userId, provider);
		return result.changes > 0;
	} catch (error) {
		console.error("Error unlinking account:", error);
		return false;
	}
}

export function findUserByProviderId(
	provider: string,
	providerId: string
): string | null {
	try {
		const stmt = db.prepare(`SELECT userId FROM linked_accounts
			WHERE provider = ? AND providerId = ?
		`);

		const result = stmt.get(provider, providerId);
		return result ? (result as any).userId : null;
	} catch (error) {
		console.error("Error finding user by provider ID:", error);
		return null;
	}
}
