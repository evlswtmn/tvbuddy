# 📺 TV Buddy

A Chrome extension that recommends shows and movies based on what you're currently streaming.

## Features

- 🎬 **Smart Detection**: Automatically detects what you're watching on popular streaming platforms
- 🎯 **Personalized Recommendations**: Get tailored suggestions based on your current content
- 🌐 **Multi-Platform Support**: Works with Netflix, Disney+, Hulu, Prime Video, HBO Max, YouTube, and more
- ⚡ **Real-time Updates**: Recommendations update as you watch different content
- 🎨 **Beautiful UI**: Clean, modern interface with content posters and ratings

## Supported Streaming Platforms

- Netflix
- Disney+
- Hulu
- Amazon Prime Video
- HBO Max / Max
- YouTube
- Peacock
- Paramount+
- Apple TV+

## Installation

### Step 1: Generate Icons

Before loading the extension, you need to generate the icon files:

1. Open `icons/generate-icons.html` in your browser
2. Right-click on each displayed icon
3. Save them as `icon16.png`, `icon48.png`, and `icon128.png` in the `icons/` directory

See `icons/README.md` for more details.

### Step 2: Get a TMDB API Key

TV Buddy uses The Movie Database (TMDB) API to fetch recommendations:

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Go to Settings > API
4. Request an API key (choose "Developer" option)
5. Copy your API key

### Step 3: Configure the Extension

1. Open `background.js` in a text editor
2. Find the line: `const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';`
3. Replace `'YOUR_TMDB_API_KEY'` with your actual TMDB API key

### Step 4: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `tvbuddy` directory
5. The TV Buddy extension should now appear in your extensions list

## Usage

1. **Navigate to a streaming platform** (e.g., Netflix, Disney+)
2. **Start watching** a show or movie
3. **Click the TV Buddy icon** in your browser toolbar
4. **View recommendations** based on what you're watching!

### Tips

- The extension works best when content is actively playing
- Click the "🔄 Refresh" button to manually update recommendations
- Recommendations are based on similar content and genres

## How It Works

1. **Content Detection**: The extension uses content scripts to detect the title of what you're watching on supported streaming platforms
2. **API Lookup**: The background service worker searches TMDB for the detected content
3. **Recommendations**: Based on the found content, the extension fetches similar shows/movies
4. **Display**: Results are shown in a beautiful popup with posters, ratings, and descriptions

## Development

### Project Structure

```
tvbuddy/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls
├── content.js            # Content script for detecting streams
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styling
├── icons/                # Extension icons
│   ├── generate-icons.html
│   └── README.md
└── README.md             # This file
```

### Modifying the Extension

- **Add more platforms**: Edit `content.js` to add detection for additional streaming services
- **Change API provider**: Modify `background.js` to use a different API (e.g., OMDb, TVMaze)
- **Customize UI**: Edit `popup.html` and `popup.css` to change the appearance
- **Adjust detection**: Modify selectors in `content.js` if streaming platforms update their HTML

## Troubleshooting

### No content detected

- Make sure you're on a supported streaming platform
- Ensure content is actively playing
- Try clicking the refresh button
- Check the browser console for errors

### No recommendations showing

- Verify your TMDB API key is correctly set in `background.js`
- Check your internet connection
- Open the browser console to see any error messages
- Make sure the detected title is correct

### Icons not showing

- Ensure you've generated the PNG icons using the HTML generator
- Check that icon files are in the `icons/` directory with correct names
- Try reloading the extension

## Privacy

TV Buddy:
- Does NOT collect or store personal data
- Does NOT track your viewing history
- Only sends content titles to TMDB API for recommendations
- All data stays local to your browser

## License

MIT License - feel free to modify and distribute

## Contributing

Contributions are welcome! Feel free to:
- Add support for more streaming platforms
- Improve content detection accuracy
- Enhance the UI/UX
- Fix bugs

## Credits

- Movie and TV data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Built with vanilla JavaScript (no frameworks needed!)

---

**Enjoy discovering your next favorite show! 📺✨**
