// Leaderboard Management Module

class LeaderboardManager {
    constructor() {
        this.storageKey = 'artistLeaderboards';
    }

    // Get all scores for an artist
    getArtistScores(artistName) {
        const leaderboards = this.getAllLeaderboards();
        const normalizedArtist = artistName.toLowerCase();
        return leaderboards[normalizedArtist] || [];
    }

    // Add a new score for an artist
    addScore(artistName, score, playerName = 'Anonymous') {
        const leaderboards = this.getAllLeaderboards();
        const normalizedArtist = artistName.toLowerCase();
        
        // Initialize artist's leaderboard if it doesn't exist
        if (!leaderboards[normalizedArtist]) {
            leaderboards[normalizedArtist] = [];
        }

        // Add new score
        const newScore = {
            playerName,
            score,
            date: new Date().toISOString()
        };

        leaderboards[normalizedArtist].push(newScore);

        // Sort scores in descending order
        leaderboards[normalizedArtist].sort((a, b) => b.score - a.score);

        // Keep only top 10 scores
        leaderboards[normalizedArtist] = leaderboards[normalizedArtist].slice(0, 10);

        // Save to localStorage
        this.saveLeaderboards(leaderboards);

        // Return position in leaderboard (1-based)
        return leaderboards[normalizedArtist].findIndex(s => s === newScore) + 1;
    }

    // Get formatted date string
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Get all leaderboards from storage
    getAllLeaderboards() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : {};
    }

    // Save leaderboards to storage
    saveLeaderboards(leaderboards) {
        localStorage.setItem(this.storageKey, JSON.stringify(leaderboards));
    }

    // Clear all leaderboards (for testing)
    clearLeaderboards() {
        localStorage.removeItem(this.storageKey);
    }
}

// Export singleton instance
window.leaderboardManager = new LeaderboardManager(); 