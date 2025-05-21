# Guess the Song Game 🎵

A web-based music guessing game where players test their knowledge of their favorite artists' songs. Players input an artist's name, listen to a 15-second song snippet, and guess the correct song title from multiple-choice options.

## Features

### Core Functionality
- 🎤 **Artist Input**: Players enter their favorite artist's name
- 🎵 **Song Preview**: 15-second song snippets from the artist's catalog
- 📝 **Multiple Choice**: Four options to choose from for each song
- 📊 **Score Tracking**: Points system for correct guesses
- 💬 **Feedback System**: Immediate feedback on correct/incorrect answers

### Technical Implementation
- **Frontend**: Built with HTML, CSS, and JavaScript
- **API Integration**: Utilizes Spotify API for song data and previews
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Clean, intuitive design with smooth transitions

## Game Flow
1. Player enters an artist's name on the welcome screen
2. Game fetches the artist's top tracks from Spotify
3. For each round:
   - Plays a 15-second snippet
   - Displays 4 multiple-choice options
   - Player selects their guess
   - Feedback is shown and score is updated
4. Final score and "superfan" status displayed at the end

## Technical Requirements
- Spotify API credentials (will need to be set up)
- Modern web browser with JavaScript enabled
- Internet connection for API calls and audio playback

## Project Structure
```
guess-the-song/
├── README.md
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── app.js
│       ├── spotify.js
│       └── game.js
```

## Development Status
- [ ] Project Setup
- [ ] Frontend UI Implementation
- [ ] Spotify API Integration
- [ ] Game Logic Implementation
- [ ] Score Tracking System
- [ ] Feedback Mechanism
- [ ] Testing & Bug Fixes
- [ ] Final Polish & Deployment

## UI Screens
1. **Welcome Screen**
   - Clean, minimal design
   - Artist name input field
   - "Start" button
   - Game title and brief instructions

2. **Game Screen**
   - Round number indicator
   - Score display
   - 4 multiple-choice options
   - Audio player controls

3. **Feedback Screen**
   - Correct/incorrect indication
   - Score update
   - "Next round" button
   - Visual feedback (green for correct, red for incorrect)

4. **Final Score Screen**
   - Total score display
   - "Superfan" status message
   - "Play again" button
   - Personalized message with artist name

## Next Steps
1. Set up basic project structure
2. Create HTML/CSS for the welcome screen
3. Implement Spotify API integration
4. Build game logic and scoring system
5. Add audio playback functionality
6. Implement feedback system
7. Polish UI and transitions

---
*This README will be updated throughout development to reflect current project status and implementation details.* 