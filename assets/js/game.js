// Game Logic Module

class GameManager {
    constructor() {
        this.currentRound = 0;
        this.totalRounds = 10;
        this.score = 0;
        this.currentTrack = null;
        this.options = [];
        this.tracks = [];
    }

    // Initialize new game
    async initializeGame(artistName) {
        this.currentRound = 0;
        this.score = 0;
        this.tracks = [];
        
        try {
            // TODO: Fetch tracks from Spotify
            console.log('Initializing game for artist:', artistName);
            return true;
        } catch (error) {
            console.error('Game initialization error:', error);
            return false;
        }
    }

    // Start next round
    async startNextRound() {
        if (this.currentRound >= this.totalRounds) {
            return this.endGame();
        }

        this.currentRound++;
        // TODO: Set up round with track and options
        console.log('Starting round:', this.currentRound);
        return true;
    }

    // Submit guess
    submitGuess(guess) {
        const isCorrect = guess === this.currentTrack?.name;
        if (isCorrect) {
            this.score += 100;
        }
        return {
            isCorrect,
            correctAnswer: this.currentTrack?.name,
            score: this.score
        };
    }

    // End game
    endGame() {
        const isSuperFan = this.score >= 800;
        return {
            finalScore: this.score,
            isSuperFan,
            totalRounds: this.currentRound
        };
    }

    // Get current game state
    getGameState() {
        return {
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            score: this.score,
            options: this.options
        };
    }
}

// Export singleton instance
window.gameManager = new GameManager(); 