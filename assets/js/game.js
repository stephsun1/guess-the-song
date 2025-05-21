// Game Logic Module

class GameManager {
    constructor() {
        this.currentRound = 0;
        this.totalRounds = 10;
        this.score = 0;
        this.currentTrack = null;
        this.options = [];
        this.tracks = [];
        this.usedTracks = new Set();
        
        // Time-based scoring
        this.roundStartTime = null;
        this.maxScore = 100;  // Maximum score per round
        this.minScore = 10;   // Minimum score per round
        this.gracePeriod = 5000; // 5 seconds before score starts decreasing
        this.scoreDecayRate = 5; // Points deducted per second
    }

    // Initialize new game
    async initializeGame(artistName) {
        this.currentRound = 0;
        this.score = 0;
        this.tracks = [];
        this.usedTracks.clear();
        this.roundStartTime = null;
        
        try {
            const artist = await musicManager.searchArtist(artistName);
            if (!artist) throw new Error('Artist not found');
            
            this.tracks = await musicManager.getArtistTracks(artist.id);
            if (!this.tracks?.length) throw new Error('No tracks found');
            
            console.log('Game initialized with tracks:', this.tracks);
            return true;
        } catch (error) {
            console.error('Game initialization error:', error);
            return false;
        }
    }

    // Get random tracks for options
    getRandomTracks(exclude) {
        const options = [];
        const available = this.tracks.filter(t => t.id !== exclude.id);
        
        // Ensure we have enough tracks for options
        if (available.length < 3) {
            // If we don't have enough tracks, use what we have and possibly duplicate some
            const trackPool = [...available];
            while (trackPool.length < 3) {
                // Add tracks from the beginning again if we run out
                trackPool.push(...available);
            }
            
            // Get 3 random tracks from our pool
            while (options.length < 3) {
                const index = Math.floor(Math.random() * trackPool.length);
                options.push(trackPool[index].name);
                trackPool.splice(index, 1);
            }
        } else {
            // Normal case - we have enough tracks
            while (options.length < 3) {
                const index = Math.floor(Math.random() * available.length);
                options.push(available[index].name);
                available.splice(index, 1);
            }
        }
        
        // Add correct answer at random position
        const position = Math.floor(Math.random() * 4);
        options.splice(position, 0, exclude.name);
        
        // Verify we have exactly 4 options
        if (options.length !== 4) {
            console.error('Invalid number of options generated:', options);
            // Fix the options array if something went wrong
            while (options.length < 4) {
                options.push(exclude.name);
            }
            while (options.length > 4) {
                options.pop();
            }
        }
        
        // Ensure correct answer is in the options
        if (!options.includes(exclude.name)) {
            console.error('Correct answer missing from options, fixing...');
            options[Math.floor(Math.random() * 4)] = exclude.name;
        }
        
        return options;
    }

    // Start next round
    async startNextRound() {
        if (this.currentRound >= this.totalRounds) {
            return {
                gameOver: true,
                finalScore: this.score,
                totalRounds: this.currentRound
            };
        }

        // Find an unused track
        const availableTracks = this.tracks.filter(t => !this.usedTracks.has(t.id));
        if (availableTracks.length === 0) {
            return {
                gameOver: true,
                finalScore: this.score,
                totalRounds: this.currentRound,
                message: "No more tracks available!"
            };
        }

        this.currentRound++;
        this.currentTrack = availableTracks[Math.floor(Math.random() * availableTracks.length)];
        this.usedTracks.add(this.currentTrack.id);
        
        const options = this.getRandomTracks(this.currentTrack);
        
        // Start timing for this round
        this.roundStartTime = Date.now();
        
        return {
            gameOver: false,
            currentRound: this.currentRound,
            options: options,
            previewUrl: this.currentTrack.previewUrl
        };
    }

    // Calculate score based on time taken
    calculateTimeScore() {
        if (!this.roundStartTime) return this.minScore;
        
        const timeTaken = Date.now() - this.roundStartTime;
        
        // If within grace period, award full points
        if (timeTaken <= this.gracePeriod) {
            return this.maxScore;
        }
        
        // Calculate score decay after grace period
        const timeOverGrace = timeTaken - this.gracePeriod;
        const deduction = Math.floor((timeOverGrace / 1000) * this.scoreDecayRate);
        const timeScore = Math.max(this.maxScore - deduction, this.minScore);
        
        return timeScore;
    }

    // Submit guess
    submitGuess(guess) {
        const isCorrect = guess === this.currentTrack?.name;
        const timeScore = this.calculateTimeScore();
        
        if (isCorrect) {
            this.score += timeScore;
        }
        
        // Reset round timer
        this.roundStartTime = null;
        
        return {
            isCorrect,
            correctAnswer: this.currentTrack?.name,
            score: this.score,
            pointsEarned: isCorrect ? timeScore : 0,
            timeTaken: this.roundStartTime ? Date.now() - this.roundStartTime : 0
        };
    }

    // Get current game state
    getGameState() {
        return {
            currentRound: this.currentRound,
            totalRounds: this.totalRounds,
            score: this.score,
            options: this.options,
            currentTimeScore: this.calculateTimeScore()
        };
    }
}

// Export singleton instance
window.gameManager = new GameManager(); 