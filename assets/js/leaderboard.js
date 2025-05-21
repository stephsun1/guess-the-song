// Leaderboard Management Module

class LeaderboardManager {
    constructor() {
        console.log('Initializing LeaderboardManager');
        this.storageKey = 'artistLeaderboards';
        this.recentScoresKey = 'recentScores';
        this.maxRecentScores = 10; // Keep track of 10 most recent scores
        
        // Initialize storage if needed
        if (!localStorage.getItem(this.recentScoresKey)) {
            console.log('Initializing storage with empty arrays');
            localStorage.setItem(this.storageKey, JSON.stringify({}));
            localStorage.setItem(this.recentScoresKey, JSON.stringify([]));
        }
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

        // Add to recent scores
        this.addRecentScore(artistName, score, playerName);

        // Return position in leaderboard (1-based)
        return leaderboards[normalizedArtist].findIndex(s => s === newScore) + 1;
    }

    // Add a score to recent scores
    addRecentScore(artistName, score, playerName) {
        console.log('Adding new score:', { artistName, score, playerName });
        const recentScores = this.getRecentScores();
        
        // Add new score with artist name
        const newScore = {
            playerName,
            artistName,
            score,
            date: new Date().toISOString()
        };
        
        recentScores.unshift(newScore);

        // Keep only the most recent scores
        const updatedScores = recentScores.slice(0, this.maxRecentScores);
        
        // Save to localStorage
        localStorage.setItem(this.recentScoresKey, JSON.stringify(updatedScores));
        console.log('Updated recent scores:', updatedScores);
    }

    // Get recent scores across all artists
    getRecentScores() {
        console.log('Getting recent scores...');
        try {
            const data = localStorage.getItem(this.recentScoresKey);
            console.log('Raw recent scores data:', data);
            
            if (!data) {
                console.log('No recent scores found, returning empty array');
                return [];
            }
            
            const scores = JSON.parse(data);
            
            if (!Array.isArray(scores)) {
                console.warn('Invalid scores data format, resetting to empty array');
                localStorage.setItem(this.recentScoresKey, JSON.stringify([]));
                return [];
            }
            
            // Add timeAgo to each score
            return scores.map(score => ({
                ...score,
                timeAgo: this.formatTimeAgo(score.date)
            }));
        } catch (error) {
            console.error('Error getting recent scores:', error);
            return [];
        }
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

    // Format time ago
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'just now';
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        
        return this.formatDate(dateString);
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
        localStorage.removeItem(this.recentScoresKey);
    }
}

// Create and export singleton instance
window.leaderboardManager = new LeaderboardManager();

// Verify initialization
console.log('LeaderboardManager initialized:', window.leaderboardManager);
console.log('Initial recent scores:', window.leaderboardManager.getRecentScores()); 