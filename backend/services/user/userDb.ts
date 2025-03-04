
export interface User {
	userId: number;
	userName: string;
	email: string;
	password: string;
}

const users: User[] = [];

export function saveUser(userName: string, email: string, password: string) {
	const userId = users.length + 1;
	const newUser: User = {userId, userName, email, password };
	users.push(newUser);
	return(newUser);
}

export function getUserByEmail(email: string): User | undefined {
	return users.find(users => users.email === email);
}

export function getUserById(userId: number): User | undefined {
	return users.find(users => users.userId === userId);
}
