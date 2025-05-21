// Audio Playback Module

class AudioManager {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.duration = 15000; // 15 seconds in milliseconds
        this.progressCallback = null;
    }

    // Initialize audio player
    initialize() {
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onPlaybackEnded());
        console.log('Audio Manager initialized');
    }

    // Load and play a track preview
    async playPreview(previewUrl) {
        try {
            this.audio.src = previewUrl;
            await this.audio.play();
            this.isPlaying = true;
            console.log('Playing preview:', previewUrl);
        } catch (error) {
            console.error('Playback error:', error);
        }
    }

    // Pause playback
    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    // Resume playback
    resume() {
        this.audio.play();
        this.isPlaying = true;
    }

    // Set progress callback
    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    // Update progress
    updateProgress() {
        if (this.progressCallback) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressCallback(progress);
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