
export interface Match {
	id: string;
	round: number;
	player1_Id: string;
	player2_Id: string;
	player1Score: number;
	player2Score: number;
	winner_Id?: string;
	status: 'pending' | 'ready' | 'in_progress' | 'completed';
	matchTime: Date;
}
  
export interface Tournament {
	id: string;
	status: 'scheduled' | 'in_progress' | 'completed';
	players: string[]; // Liste des IDs des joueurs
	matches: Match[];
	createdAt: Date;
	updatedAt: Date;
}

export type TournamentState =
  | 'tournament_queue'
  | 'tournament_launch'
  | 'tournament_start'
  | 'semi_final_start'
  | 'game_1_start'
  | 'game_1_end'
  | 'match_1_end'
  | 'match_2_start'
  | 'game_2_start'
  | 'game_2_end'
  | 'match_2_end'
  | 'final_wait'
  | 'final_prep'
  | 'final_start'
  | 'game_3_start'
  | 'game_3_end'
  | 'tournament_loser_screen'
  | 'tournament_victory_screen'
  | 'loser_to_menu';