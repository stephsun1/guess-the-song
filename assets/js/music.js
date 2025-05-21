// iTunes API Integration Module

class MusicManager {
    constructor() {
        this.isInitialized = false;
        this.apiBase = 'https://itunes.apple.com';
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
        this.searchCache = new Map(); // Cache for search results
        this.searchDebounceTimeout = null;
    }

    // Initialize Music API
    async initialize() {
        if (this.isInitialized) {
            console.log('MusicManager already initialized');
            return true;
        }

        try {
            console.log('Testing iTunes API connection...');
            // Test the API with a simple search
            const testUrl = `${this.apiBase}/search?term=test&limit=1`;
            const response = await fetch(this.getProxiedUrl(testUrl));
            
            if (!response.ok) {
                throw new Error(`API test failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data || typeof data !== 'object') {
                throw new Error('Invalid API response format');
            }

            this.isInitialized = true;
            console.log('MusicManager initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize MusicManager:', error);
            this.isInitialized = false;
            throw new Error('Failed to connect to music service');
        }
    }

    // Helper method to create proxied URL
    getProxiedUrl(url) {
        // Only use proxy in production (GitHub Pages)
        if (window.location.hostname.includes('github.io')) {
            return `${this.corsProxy}${encodeURIComponent(url)}`;
        }
        return url;
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
            const url = `${this.apiBase}/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=5`;
            const response = await fetch(this.getProxiedUrl(url));

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

    // Search for an artist
    async searchArtist(artistName) {
        if (!this.isInitialized) {
            throw new Error('Music Manager not initialized');
        }

        try {
            console.log('Searching for artist:', artistName);
            const url = `${this.apiBase}/search?term=${encodeURIComponent(artistName)}&entity=musicArtist&attribute=artistTerm&limit=5`;
            const finalUrl = this.getProxiedUrl(url);
            console.log('Search URL:', finalUrl);
            
            const response = await fetch(finalUrl);
            console.log('Search response status:', response.status);

            if (!response.ok) {
                throw new Error(`Artist search failed with status ${response.status}`);
            }

            const data = await response.json();
            console.log('Search results:', data.results);
            
            // Look for exact or close matches first
            const exactMatch = data.results.find(a => 
                a.artistName.toLowerCase() === artistName.toLowerCase()
            );
            
            // If no exact match, take the first result
            const artist = exactMatch || data.results[0];
            
            if (artist) {
                console.log('Found artist:', artist.artistName);
                return {
                    id: artist.artistId,
                    name: artist.artistName,
                    type: 'artist'
                };
            }
            
            console.log('No artist found, trying fallback data');
            // Fallback to test data with more flexible matching
            const fallbackArtist = testData.artists.find(a => 
                a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                artistName.toLowerCase().includes(a.name.toLowerCase())
            );
            
            if (fallbackArtist) {
                console.log('Found artist in fallback data:', fallbackArtist.name);
            } else {
                console.log('Artist not found in fallback data either');
            }
            
            return fallbackArtist || null;
        } catch (error) {
            console.error('Artist search error:', error);
            // More flexible fallback search
            const fallbackArtist = testData.artists.find(a => 
                a.name.toLowerCase().includes(artistName.toLowerCase()) ||
                artistName.toLowerCase().includes(a.name.toLowerCase())
            );
            return fallbackArtist || null;
        }
    }

    // Get artist's top tracks
    async getArtistTracks(artistId) {
        if (!this.isInitialized) {
            throw new Error('Music Manager not initialized');
        }

        try {
            const url = `${this.apiBase}/lookup?id=${artistId}&entity=song&limit=25`;
            const response = await fetch(this.getProxiedUrl(url));

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
            const url = `${this.apiBase}/lookup?id=${trackId}&entity=song`;
            const response = await fetch(this.getProxiedUrl(url));

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
}

// Export singleton instance
window.musicManager = new MusicManager(); 