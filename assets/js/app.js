// Immediate debug logging
console.log('Loading app.js...');

// Initialize gameData before Alpine loads
window.gameData = {
    // UI State
    currentScreen: 'welcome',
    isLoading: false,
    error: null,
    audioProgress: 0,
    isPlaying: false,
    lastGuess: null,
    scoreUpdateInterval: null,

    // Game State
    artist: '',
    score: 0,
    currentRound: 0,
    totalRounds: 10,
    lastHighScore: null,
    currentOptions: [],
    
    // Recent Scores
    recentScores: [],
    
    // Suggestion State
    suggestions: [],
    selectedIndex: -1,
    
    // Leaderboard State
    playerName: '',
    leaderboardScores: [],
    scoreSaved: false,

    // Initialize
    async init() {
        console.log('Initializing game data...');
        try {
            // Check for required managers
            if (typeof audioManager === 'undefined') {
                throw new Error('Audio manager not loaded');
            }
            if (typeof musicManager === 'undefined') {
                throw new Error('Music manager not loaded');
            }
            if (typeof leaderboardManager === 'undefined') {
                throw new Error('Leaderboard manager not loaded');
            }
            
            // Initialize audio first
            console.log('Setting up audio...');
            await audioManager.initialize();
            
            // Test audio setup
            const testAudio = new Audio();
            testAudio.volume = 1;
            console.log('Audio test setup complete');
            
            // Set up progress callback
            audioManager.setProgressCallback((progress) => {
                this.audioProgress = progress;
                this.isPlaying = audioManager.isPlaying;
            });

            // Initialize music manager
            console.log('Initializing music manager...');
            await musicManager.initialize();
            console.log('Music manager initialized');
            
            // Load recent scores
            console.log('Loading recent scores...');
            this.loadRecentScores();
            
            this.checkLastHighScore();
            this.error = null; // Clear any previous errors
            console.log('Game data initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
            this.error = `Failed to initialize game: ${error.message}. Please refresh the page.`;
        }
    },

    // Load recent scores
    loadRecentScores() {
        console.log('loadRecentScores called');
        if (typeof leaderboardManager !== 'undefined') {
            console.log('LeaderboardManager available, getting scores...');
            const scores = leaderboardManager.getRecentScores();
            console.log('Got scores from leaderboard:', scores);
            this.recentScores = scores;
            console.log('Updated recentScores state:', this.recentScores);
        } else {
            console.warn('LeaderboardManager not available');
            this.recentScores = [];
        }
    },

    // Format score for display
    formatScore(score) {
        return score.toLocaleString() + ' pts';
    },

    // Check for previous high score
    checkLastHighScore() {
        if (this.artist && typeof storageManager !== 'undefined') {
            const highScore = storageManager.getArtistHighScore(this.artist);
            this.lastHighScore = highScore?.score || null;
        }
    },

    // Start new game
    async startGame() {
        console.log('Starting game with artist:', this.artist);
        if (!this.validateArtist()) {
            return;
        }

        this.isLoading = true;
        this.error = null;
        this.score = 0;
        this.currentRound = 0;
        this.lastGuess = null;

        try {
            if (typeof gameManager === 'undefined') {
                throw new Error('Game manager not loaded');
            }
            
            const success = await gameManager.initializeGame(this.artist);
            
            if (success) {
                this.currentScreen = 'game';
                await this.startRound();
            } else {
                throw new Error('Could not find artist');
            }
        } catch (error) {
            console.error('Game start error:', error);
            this.error = 'Could not find artist. Please try another name.';
        } finally {
            this.isLoading = false;
        }
    },

    // Validate artist input
    validateArtist() {
        if (!this.artist.trim()) {
            this.error = 'Please enter an artist name';
            return false;
        }
        return true;
    },

    // Start new round
    async startRound() {
        console.log('Starting new round...');
        const roundData = await gameManager.startNextRound();
        
        if (roundData.gameOver) {
            this.handleGameOver(roundData);
            return;
        }

        this.currentOptions = roundData.options;
        this.currentRound = roundData.currentRound;
        this.lastGuess = null;
        
        // Start score update interval
        if (this.scoreUpdateInterval) {
            clearInterval(this.scoreUpdateInterval);
        }
        this.scoreUpdateInterval = setInterval(() => {
            // Force Alpine to update the score display
            this.$nextTick(() => {});
        }, 100);
        
        await this.playTrackPreview(roundData.previewUrl);
    },

    // Play track preview
    async playTrackPreview(previewUrl) {
        console.log('Playing preview:', previewUrl);
        try {
            if (!previewUrl) {
                console.error('No preview URL provided');
                return;
            }
            
            // Ensure audio is initialized
            if (!audioManager.isInitialized) {
                console.log('Reinitializing audio manager...');
                audioManager.initialize();
            }
            
            await audioManager.playPreview(previewUrl);
            this.isPlaying = true;
            
            // Double check playback started
            setTimeout(() => {
                if (!this.isPlaying) {
                    console.warn('Playback may not have started, attempting replay...');
                    audioManager.resume();
                }
            }, 1000);
        } catch (error) {
            console.error('Error playing preview:', error);
        }
    },

    // Submit guess
    async submitGuess(option) {
        console.log('Submitting guess:', option);
        const result = gameManager.submitGuess(option);
        this.score = result.score;
        this.lastGuess = {
            guess: option,
            isCorrect: result.isCorrect,
            correctAnswer: result.correctAnswer,
            pointsEarned: result.pointsEarned
        };
        
        // Clear score update interval
        if (this.scoreUpdateInterval) {
            clearInterval(this.scoreUpdateInterval);
            this.scoreUpdateInterval = null;
        }
        
        // Pause audio
        audioManager.pause();
        this.isPlaying = false;
        
        // Wait and proceed to next round
        setTimeout(async () => {
            await this.startRound();
        }, 2000);
    },

    // Handle game over
    handleGameOver(gameData) {
        console.log('Game over:', gameData);
        this.currentScreen = 'final';
        this.score = gameData.finalScore;
        
        // Load leaderboard scores
        if (typeof leaderboardManager !== 'undefined') {
            try {
                // Get current scores
                const scores = leaderboardManager.getArtistScores(this.artist);
                
                // Format scores and identify current score position
                this.leaderboardScores = scores.map(score => ({
                    ...score,
                    formattedDate: leaderboardManager.formatDate(score.date),
                    // Mark as "you" if this is a previous score from the same session
                    isYou: this.playerName && score.playerName === this.playerName.trim() && 
                           score.score === this.score
                }));
                
                console.log('Loaded leaderboard scores:', this.leaderboardScores);
            } catch (error) {
                console.error('Error loading leaderboard:', error);
                this.leaderboardScores = [];
            }
        } else {
            console.warn('Leaderboard manager not available');
            this.leaderboardScores = [];
        }
        
        // Save high score to local storage
        if (gameData.finalScore > 0) {
            storageManager.saveHighScore(this.artist, gameData.finalScore);
        }
    },

    // Save score to leaderboard
    async saveScore() {
        if (!this.playerName.trim()) {
            this.error = 'Please enter your name';
            return;
        }
        
        if (this.scoreSaved) {
            return;
        }

        try {
            const position = leaderboardManager.addScore(
                this.artist,
                this.score,
                this.playerName.trim()
            );

            // Refresh leaderboard display
            const scores = leaderboardManager.getArtistScores(this.artist);
            this.leaderboardScores = scores.map(score => ({
                ...score,
                formattedDate: leaderboardManager.formatDate(score.date),
                isYou: score.playerName === this.playerName.trim() && 
                       score.score === this.score
            }));

            // Refresh recent scores
            this.loadRecentScores();

            this.scoreSaved = true;
            
            // Show success message
            this.error = position <= 10 ? 
                `Score saved! You're #${position} on the leaderboard!` : 
                'Score saved!';
        } catch (error) {
            console.error('Error saving score:', error);
            this.error = 'Failed to save score. Please try again.';
        }
    },

    // Reset game
    resetGame() {
        if (this.scoreUpdateInterval) {
            clearInterval(this.scoreUpdateInterval);
            this.scoreUpdateInterval = null;
        }
        
        this.currentScreen = 'welcome';
        this.score = 0;
        this.currentRound = 0;
        this.currentOptions = [];
        this.audioProgress = 0;
        this.isPlaying = false;
        this.error = null;
        this.artist = '';
        this.lastGuess = null;
        this.playerName = '';
        this.leaderboardScores = [];
        this.scoreSaved = false;
        audioManager.pause();
        this.checkLastHighScore();
    },

    // Search for artist suggestions
    async searchArtists() {
        if (!this.artist) {
            this.suggestions = [];
            this.selectedIndex = -1;
            return;
        }

        try {
            const suggestions = await musicManager.getArtistSuggestions(this.artist);
            this.suggestions = suggestions;
            this.selectedIndex = -1;
        } catch (error) {
            console.error('Error getting suggestions:', error);
            this.suggestions = [];
        }
    },

    // Handle keyboard navigation
    selectNextSuggestion() {
        if (this.suggestions.length === 0) return;
        this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
    },

    selectPrevSuggestion() {
        if (this.suggestions.length === 0) return;
        this.selectedIndex = this.selectedIndex <= 0 ? 
            this.suggestions.length - 1 : this.selectedIndex - 1;
    },

    // Handle suggestion selection
    selectSuggestion(suggestion) {
        this.artist = suggestion.name;
        this.closeSuggestions();
        this.startGame();
    },

    // Handle enter key
    handleEnterKey() {
        if (this.selectedIndex >= 0 && this.suggestions[this.selectedIndex]) {
            this.selectSuggestion(this.suggestions[this.selectedIndex]);
        } else {
            this.startGame();
        }
    },

    // Close suggestions dropdown
    closeSuggestions() {
        this.suggestions = [];
        this.selectedIndex = -1;
    }
};

// Initialize game data immediately
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM Content Loaded - initializing game...');
        window.gameData.init().catch(error => {
            console.error('Failed to initialize game:', error);
        });
    });
} else {
    console.log('DOM already loaded - initializing game...');
    window.gameData.init().catch(error => {
        console.error('Failed to initialize game:', error);
    });
}

// Make sure Alpine is available and initialized properly
document.addEventListener('alpine:init', () => {
    console.log('Alpine.js initialized');
    try {
        Alpine.data('gameData', () => window.gameData);
    } catch (error) {
        console.error('Failed to initialize Alpine data:', error);
    }
});

// Debug logging
console.log('App.js fully loaded');

// Force refresh of recent scores after a short delay
setTimeout(() => {
    if (window.gameData) {
        console.log('Forcing refresh of recent scores');
        window.gameData.loadRecentScores();
    }
}, 1000); 