import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import {
	getUserByEmail,
	saveUser,
	getUserById,
	updateUserStatus,
} from "./userDb.js";
import { linkAccount, getLinkedAccount, unlinkAccount } from "./accountDb.js";

interface AuthenticatedRequest extends FastifyRequest {
	user: { userId: string };
}

interface GoogleOAuthContext {
	googleOAuth2: {
		getAccessTokenFromAuthorizationCodeFlow: (
			req: FastifyRequest
		) => Promise<any>;
	};
}

export async function handlerGoogleCallback(
	this: GoogleOAuthContext,
	req: FastifyRequest,
	reply: FastifyReply
) {
	try {
		console.log("-> Obtention du token...");
		const token =
			await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
				req
			);

		const accessToken = token.token && token.token.access_token;

		if (!accessToken) {
			console.error(
				"Impossible de trouver l'access_token dans la réponse"
			);
			return reply.redirect("/login_error?reason=missing_access_token");
		}

		const userInfoResponse = await fetch(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		if (!userInfoResponse.ok) {
			console.error("Erreur API Google");
			return reply.redirect("/login_error?reason=api_error");
		}

		const googleUser = await userInfoResponse.json();
		console.log("Infos utilisateur obtenues:", googleUser);

		if (!googleUser.email) {
			console.error("Email manquant dans les données utilisateur Google");
			return reply.redirect("/login_error?reason=missing_email");
		}

		let user = getUserByEmail(googleUser.email);
		let isNewUser = false;

		if (!user) {
			// Pour remplir la var PasswordHsh dans ma TABLE si le client ne se conecte que avec google
			const dummyPassword = await bcrypt.hash(
				"google-oauth-" + Date.now(),
				10
			);

			console.log("Donnees Goole:", googleUser);
			console.log(
				"Tentative de creation user avec:",
				googleUser.name,
				googleUser.email
			);
			user = saveUser(
				googleUser.name || `user_${Date.now()}`,
				googleUser.email,
				dummyPassword
			);
			isNewUser = true;
		}
		console.log("resultat saveUser:", user);

		if (user) {
			if (user.status === "online") {
				console.log(
					`L'utilisateur ${user.userId} est déjà connecté ailleurs`
				);
				reply.redirect("/login_error");
			}

			updateUserStatus(user.userId, "online");

			await linkAccount(
				user.userId,
				"google",
				googleUser.id,
				token.access_token,
				token.refresh_token || null,
				token.expires_at || null
			);
			const jwt = req.server.jwt.sign(
				{ userId: user.userId },
				{ expiresIn: "24h" }
			);

			reply.setCookie("authToken", jwt, {
				signed: true,
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
			});

			reply.redirect(
				`https://localhost:8443/login_success?token=${jwt}&new=${isNewUser}`
			);
		} else {
			reply.redirect(
				"https://localhost:8443/login_error?reason=user_creation_failed"
			);
		}
	} catch (error) {
		console.error("OAuth callback error:", error);
		reply.redirect("/login_error");
	}
}

// verifier l'etat de connexion d'un compte
export async function getAuthStatus(
	req: AuthenticatedRequest,
	reply: FastifyReply
) {
	try {
		const user = getUserById(req.user.userId);
		if (!user) {
			return reply.status(404).send({ error: "User not found" });
		}

		const googleAccount = await getLinkedAccount(user.userId, "google");

		reply.send({
			user: {
				userId: user.userId,
				userName: user.userName,
				email: user.email,
				hasGoogleLinked: !!googleAccount,
			},
		});
	} catch (error) {
		console.error("Auth status error:", error);
		reply.status(500).send({ error: "Internal server error" });
	}
}

export async function linkGoogleAccount(
	req: AuthenticatedRequest,
	reply: FastifyReply
) {
	// encodeURIComponent pour eviter que la var userId casse l'url
	const redirectUrl = `/user/auth/google?linkAccount=${encodeURIComponent(
		req.user.userId
	)}`;
	reply.redirect(redirectUrl);
}

export async function unlinkGoogleAccount(
	req: AuthenticatedRequest,
	reply: FastifyReply
) {
	try {
		const success = unlinkAccount(req.user.userId, "google");
		if (success) {
			reply.send({
				success: true,
				message: "Google account unlinked successfully",
			});
		} else {
			reply.status(404).send({ error: "No linked Google account found" });
		}
	} catch (error) {
		console.error("Error unlinking account:", error);
		reply.status(500).send({ error: "Internal server error" });
	}
}
