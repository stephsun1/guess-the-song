// Audio Playback Module

class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.duration = 15000; // 15 seconds in milliseconds
        this.progressCallback = null;
        this.currentPreviewUrl = null;
        this.isInitialized = false;
    }

    // Initialize audio player
    initialize() {
        if (this.isInitialized) {
            console.log('Audio Manager already initialized');
            return;
        }

        console.log('Initializing Audio Manager...');
        
        // Add all event listeners
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onPlaybackEnded());
        this.audio.addEventListener('error', (e) => this.handleError(e));
        this.audio.addEventListener('canplay', () => this.onCanPlay());
        this.audio.addEventListener('waiting', () => console.log('Audio is buffering...'));
        this.audio.addEventListener('playing', () => {
            console.log('Audio started playing');
            this.isPlaying = true;
        });
        this.audio.addEventListener('pause', () => {
            console.log('Audio paused');
            this.isPlaying = false;
        });
        
        // Set audio properties
        this.audio.crossOrigin = "anonymous";  // Allow CORS audio loading
        this.audio.preload = "auto";  // Preload audio data
        this.audio.volume = 1.0;  // Ensure volume is at maximum
        
        // Test audio context
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            console.log('Audio Context state:', audioContext.state);
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
        } catch (error) {
            console.error('Audio Context error:', error);
        }
        
        this.isInitialized = true;
        console.log('Audio Manager initialized');
    }

    // Load and play a track preview
    async playPreview(previewUrl) {
        try {
            console.log('Attempting to play preview:', previewUrl);
            
            if (!previewUrl) {
                throw new Error('No preview URL provided');
            }

            if (!this.isInitialized) {
                console.warn('Audio Manager not initialized, initializing now...');
                this.initialize();
            }

            // Reset state
            this.pause();
            this.currentPreviewUrl = previewUrl;
            
            // Load and play
            console.log('Setting audio source...');
            this.audio.src = previewUrl;
            
            // Force a load before playing
            console.log('Loading audio...');
            this.audio.load();
            
            // Create a promise to handle both successful load and errors
            console.log('Attempting playback...');
            const playAttempt = await this.audio.play();
            
            if (playAttempt !== undefined) {
                this.isPlaying = true;
                console.log('Playback started successfully');
            }
        } catch (error) {
            console.error('Playback error:', error);
            this.handleError(error);
        }
    }

    // Handle audio errors
    handleError(error) {
        console.error('Audio error:', error);
        console.error('Audio error details:', {
            error: error.message,
            currentSrc: this.audio.src,
            readyState: this.audio.readyState,
            networkState: this.audio.networkState,
            error: this.audio.error ? this.audio.error.code : null
        });
        
        this.isPlaying = false;
        
        // Try to reload the audio if it failed
        if (this.currentPreviewUrl) {
            console.log('Attempting to reload audio...');
            this.audio.src = this.currentPreviewUrl;
            this.audio.load();
        }
    }

    // Handle when audio is ready to play
    onCanPlay() {
        console.log('Audio is ready to play');
        console.log('Audio properties:', {
            duration: this.audio.duration,
            source: this.audio.src,
            volume: this.audio.volume,
            muted: this.audio.muted,
            readyState: this.audio.readyState
        });
    }

    // Pause playback
    pause() {
        console.log('Pausing audio');
        this.audio.pause();
        this.isPlaying = false;
    }

    // Resume playback
    resume() {
        if (!this.currentPreviewUrl) {
            console.warn('No audio source to resume');
            return;
        }

        console.log('Resuming audio');
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    this.isPlaying = true;
                    console.log('Playback resumed successfully');
                })
                .catch(error => {
                    console.error('Error resuming playback:', error);
                    this.handleError(error);
                });
        }
    }

    // Set progress callback
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    // Update progress
    updateProgress() {
        if (this.progressCallback && this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressCallback(progress);
            
            // Log progress every 25%
            if (progress % 25 < 1) {
                console.log(`Playback progress: ${Math.round(progress)}%`);
            }
        }
    }

    // Handle playback ended
    onPlaybackEnded() {
        this.isPlaying = false;
        console.log('Playback ended');
    }
}

// Export singleton instance
window.audioManager = new AudioManager(); 