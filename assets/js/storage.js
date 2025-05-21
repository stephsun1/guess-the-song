// Storage Management Module

class StorageManager {
    constructor() {
        this.HIGH_SCORES_KEY = 'guessTheSong_highScores';
        this.CURRENT_GAME_KEY = 'guessTheSong_currentGame';
    }

    // Save high score for an artist
    saveHighScore(artistName, score) {
        const highScores = this.getHighScores();
        const currentDate = new Date().toISOString();

        highScores[artistName] = {
            score,
            date: currentDate
        };

        localStorage.setItem(this.HIGH_SCORES_KEY, JSON.stringify(highScores));
        console.log('Saved high score for:', artistName);
    }

    // Get high scores
    getHighScores() {
        const scores = localStorage.getItem(this.HIGH_SCORES_KEY);
        return scores ? JSON.parse(scores) : {};
    }

    // Get high score for specific artist
    getArtistHighScore(artistName) {
        const highScores = this.getHighScores();
        return highScores[artistName] || null;
    }

    // Save current game state
    saveGameState(gameState) {
        sessionStorage.setItem(this.CURRENT_GAME_KEY, JSON.stringify(gameState));
        console.log('Game state saved');
    }

    // Load current game state
    loadGameState() {
        const state = sessionStorage.getItem(this.CURRENT_GAME_KEY);
        return state ? JSON.parse(state) : null;
    }

    // Clear current game state
    clearGameState() {
        sessionStorage.removeItem(this.CURRENT_GAME_KEY);
        console.log('Game state cleared');
    }

    // Clear all data (for testing)
    clearAllData() {
        localStorage.removeItem(this.HIGH_SCORES_KEY);
        sessionStorage.removeItem(this.CURRENT_GAME_KEY);
        console.log('All data cleared');
    }
}

// Export singleton instance
window.storageManager = new StorageManager(); 