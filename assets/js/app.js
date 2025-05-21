// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Alpine.js data
    window.gameData = {
        currentScreen: 'welcome', // welcome, game, feedback, final
        artist: '',
        score: 0,
        round: 0,
        totalRounds: 10,
        isPlaying: false,

        // Methods
        startGame() {
            if (!this.artist.trim()) {
                alert('Please enter an artist name');
                return;
            }
            // This will be implemented in Phase 2 with Spotify API
            console.log('Starting game with artist:', this.artist);
        },

        // Placeholder for game logic
        submitGuess(option) {
            console.log('Selected option:', option);
        },

        // Navigation methods
        goToScreen(screen) {
            this.currentScreen = screen;
        }
    };
});

// Debug logging
console.log('App initialized'); 