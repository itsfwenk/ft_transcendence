-- CREATE TABLE IF NOT EXISTS games (
-- 	id INTEGER PRIMARY KEY AUTOINCREMENT,
--     player1 INTEGER NOT NULL,
--     player2 INTEGER NOT NULL,
--     winner_id INTEGER,
--     score_player1 INTEGER DEFAULT 0,
--     score_player2 INTEGER DEFAULT 0,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY(player1) REFERENCES users(id),
--     FOREIGN KEY(player2) REFERENCES users(id),
--     FOREIGN KEY(winner) REFERENCES users(id)
-- )