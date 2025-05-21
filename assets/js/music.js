// iTunes API Integration Module

class MusicManager {
    constructor() {
        this.isInitialized = false;
        this.apiBase = 'https://itunes.apple.com';
        this.searchCache = new Map(); // Cache for search results
        this.searchDebounceTimeout = null;
    }

    // Initialize Music API
    async initialize() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('Music Manager initialized');
    }

    // Search for artist suggestions
    async searchArtistSuggestions(query) {
        if (!query.trim() || query.length < 2) return [];
        
        // Check cache first
        const cacheKey = query.toLowerCase();
        if (this.searchCache.has(cacheKey)) {
            return this.searchCache.get(cacheKey);
        }

        try {
            const response = await fetch(
                `${this.apiBase}/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=5`
            );

            if (!response.ok) {
                throw new Error('Artist suggestion search failed');
            }

            const data = await response.json();
            const suggestions = data.results.map(artist => ({
                id: artist.artistId,
                name: artist.artistName
            }));
            
            // Cache the results
            this.searchCache.set(cacheKey, suggestions);
            
            return suggestions;
        } catch (error) {
            console.error('Artist suggestion search error:', error);
            return [];
        }
    }

    // Debounced search for suggestions
    async getArtistSuggestions(query) {
        return new Promise((resolve) => {
            if (this.searchDebounceTimeout) {
                clearTimeout(this.searchDebounceTimeout);
            }
            
            this.searchDebounceTimeout = setTimeout(async () => {
                const suggestions = await this.searchArtistSuggestions(query);
                resolve(suggestions);
            }, 300); // Wait 300ms before searching
        });
    }

    // Search for an artist
    async searchArtist(artistName) {
        if (!this.isInitialized) {
            throw new Error('Music Manager not initialized');
        }

        try {
            const response = await fetch(
                `${this.apiBase}/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&limit=1`
            );

            if (!response.ok) {
                throw new Error('Artist search failed');
            }

            const data = await response.json();
            const artist = data.results[0];
            
            return artist ? {
                id: artist.artistId,
                name: artist.artistName,
                type: 'artist'
            } : null;
        } catch (error) {
            console.error('Artist search error:', error);
            // Fallback to test data
            return testData.artists.find(a => 
                a.name.toLowerCase() === artistName.toLowerCase()
            );
        }
    }

    // Get artist's top tracks
    async getArtistTracks(artistId) {
        if (!this.isInitialized) {
            throw new Error('Music Manager not initialized');
        }

        try {
            const response = await fetch(
                `${this.apiBase}/lookup?id=${artistId}&entity=song&limit=25`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch artist tracks');
            }

            const data = await response.json();
            return data.results
                .filter(item => item.wrapperType === 'track' && item.previewUrl)
                .map(track => ({
                    id: track.trackId.toString(),
                    name: track.trackName,
                    previewUrl: track.previewUrl,
                    artistId: artistId.toString()
                }));
        } catch (error) {
            console.error('Track fetching error:', error);
            // Fallback to test data
            const artist = testData.artists.find(a => a.id === artistId);
            return artist ? testData.tracks.filter(t => t.artistId === artistId) : [];
        }
    }

    // Get preview URL for a track
    async getTrackPreview(trackId) {
        if (!this.isInitialized) {
            throw new Error('Music Manager not initialized');
        }

        try {
            const response = await fetch(
                `${this.apiBase}/lookup?id=${trackId}&entity=song`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch track preview');
            }

            const data = await response.json();
            return data.results[0]?.previewUrl || null;
        } catch (error) {
            console.error('Preview URL fetching error:', error);
            // Fallback to test data
            const track = testData.tracks.find(t => t.id === trackId);
            return track ? track.previewUrl : null;
        }
    }
}

// Export singleton instance
window.musicManager = new MusicManager(); 