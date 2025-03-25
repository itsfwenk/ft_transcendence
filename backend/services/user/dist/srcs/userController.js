"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getUserProfile = getUserProfile;
exports.getUserByIdController = getUserByIdController;
exports.updateProfile = updateProfile;
exports.deleteAccount = deleteAccount;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userDb_js_1 = require("./userDb.js");
// Inscription
async function registerUser(req, reply) {
    const { userName, email, password } = req.body;
    if (!(0, userDb_js_1.isValidEmail)(email)) {
        return reply.status(400).send({ error: 'Invalid email format' });
    }
    try {
        // Vérifier si l'utilisateur existe déjà
        if ((0, userDb_js_1.getUserByEmail)(email)) {
            return reply.status(400).send({ error: 'Email already use' });
        }
        if (!password || password.length < 6) {
            return reply.status(400).send({ error: 'Password must be at least 6 characters long' });
        }
        // Hasher le mot de passe
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Ajouter l'utilisateur
        const newUser = (0, userDb_js_1.saveUser)(userName, email, hashedPassword);
        reply.send({ success: true, user: { userId: newUser.userId, userName, email } });
    }
    catch (error) {
        console.error(error);
        return reply.status(500).send({ error: 'Internal server error' });
    }
}
// Connexion
async function loginUser(req, reply) {
    const { email, password } = req.body;
    try {
        const user = (0, userDb_js_1.getUserByEmail)(email);
        if (user) {
            const passwordMatch = await bcrypt_1.default.compare(password, user.passwordHsh);
            if (passwordMatch === false) {
                return reply.status(401).send({ error: 'Invalid password' });
            }
            const token = req.server.jwt.sign({ userId: user.userId }, { expiresIn: '24h' });
            reply.send({ token, user: { userId: user.userId, userName: user.userName } });
        }
        else {
            return reply.status(401).send({ error: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error(error);
        reply.status(500).send({ error: 'Internal server error' });
    }
}
// Profil utilisateur (protégé avec JWT)
async function getUserProfile(req, reply) {
    const user = (0, userDb_js_1.getUserById)(req.user.userId);
    if (!user)
        return reply.status(404).send({ error: 'User not found' });
    reply.send({ UserId: user.userId, username: user.userName, email: user.email });
}
async function getUserByIdController(req, reply) {
    const { userId } = req.params;
    const user = (0, userDb_js_1.getUserById)(parseInt(userId));
    if (!user) {
        return reply.status(404).send({ error: "User not found" });
    }
    reply.send(user);
}
async function updateProfile(req, reply) {
    const userId = req.user.userId;
    const updates = {};
    if (req.body.userName !== undefined) {
        if (req.body.userName.trim() === '') {
            return reply.status(400).send({ error: 'Username cannot be empty' });
        }
        updates.userName = req.body.userName;
    }
    if (req.body.email !== undefined) {
        if ((!(0, userDb_js_1.isValidEmail)(req.body.email))) {
            return (reply.status(400).send({ error: 'Invalid email format' }));
        }
    }
    if (req.body.email !== undefined) {
        const existingUser = (0, userDb_js_1.getUserByEmail)(req.body.email);
        if (existingUser && existingUser.userId !== userId)
            return reply.status(400).send({ error: 'Email already use' });
        updates.email = req.body.email;
    }
    if (req.body.password !== undefined) {
        if (req.body.password.length < 6) {
            return reply.status(400).send({ error: 'Password must be at least 6 character long' });
        }
        updates.password = req.body.password;
    }
    try {
        const updtUser = (0, userDb_js_1.updateUser)(userId, updates);
        if (!updtUser) {
            return reply.status(500).send({ error: 'Failed to update' });
        }
        reply.send({
            success: true,
            user: {
                userId: updtUser.userId,
                userName: updtUser.userName,
                email: updtUser.email
            }
        });
    }
    catch (error) {
        reply.status(500).send({ error: 'Insternal server error' });
    }
}
async function deleteAccount(req, reply) {
    const userId = req.user.userId;
    console.log(req.user);
    try {
        const success = (0, userDb_js_1.deleteUser)(userId);
        if (success) {
            reply.send({ success: true, user: `${userId}`, message: 'Account deleted successfully' });
        }
        else {
            reply.status(404).send({ error: 'User not found' });
        }
    }
    catch (error) {
        reply.status(500).send({ error: 'Internal server error' });
    }
}
