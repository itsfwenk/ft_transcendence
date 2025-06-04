import { Gauge } from "prom-client";

export const gamesInProgress = new Gauge({
	name: "pong_games_in_progress",
	help: "Nombre de parties Pong en cours",
});
