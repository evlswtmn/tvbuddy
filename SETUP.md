# TVBuddy Setup Guide

Follow these steps to load and test your Chrome extension locally.

## Prerequisites

- Google Chrome browser (or any Chromium-based browser like Edge, Brave, etc.)
- The TVBuddy source code on your computer

## Loading the Extension in Chrome

### Step 1: Open Chrome Extensions Page

1. Open Google Chrome
2. Navigate to `chrome://extensions` by either:
   - Typing it in the address bar, OR
   - Menu (⋮) → More Tools → Extensions

### Step 2: Enable Developer Mode

1. Look for the **"Developer mode"** toggle in the top-right corner
2. Click to enable it (it should turn blue/on)

### Step 3: Load the Extension

1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. Navigate to your `tvbuddy` folder
3. Select the entire `tvbuddy` folder and click **"Select Folder"** or **"Open"**

### Step 4: Verify Installation

You should now see:
- TVBuddy listed in your extensions
- An icon in your Chrome toolbar (may be a default puzzle piece if icons aren't added yet)
- Status showing "Enabled"

## Testing the Extension

### Test the Popup

1. Click the TVBuddy icon in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon and pin TVBuddy
2. The popup should open with a purple gradient background
3. Try searching for a TV show (e.g., "Breaking Bad", "Friends", "The Office")
4. You should see show information including rating, genres, and summary

### Check for Errors

1. Go to `chrome://extensions`
2. Look for any error messages under TVBuddy
3. Click "Errors" if any appear to see details
4. Check the browser console (F12) for any JavaScript errors

## Updating the Extension

When you make code changes:

1. Go to `chrome://extensions`
2. Find TVBuddy
3. Click the **refresh icon (⟳)** button
4. Your changes will be reloaded

**Pro tip:** Install the [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) extension to reload with a keyboard shortcut!

## Debugging Tips

### Popup Not Showing?
- Check that the extension is enabled
- Look for errors in chrome://extensions
- Verify all file paths in manifest.json are correct

### Search Not Working?
1. Right-click the extension icon → Inspect popup
2. This opens DevTools for the popup
3. Check the Console tab for errors
4. Verify the API call is being made in the Network tab

### Service Worker Issues?
1. Go to chrome://extensions
2. Click "Inspect views: service worker" under TVBuddy
3. Check the console for errors

## Adding Icons (Optional)

Currently, the extension uses a default icon. To add custom icons:

1. Create or download three PNG files:
   - icon16.png (16x16 pixels)
   - icon48.png (48x48 pixels)
   - icon128.png (128x128 pixels)

2. Place them in: `assets/icons/`

3. Reload the extension

See `assets/icons/README.md` for more details on creating icons.

## Testing on Different Sites

Try opening the extension on various websites:
- IMDb
- Netflix
- Your favorite TV show's website
- Any random webpage

The extension should work consistently everywhere!

## Uninstalling (If Needed)

1. Go to `chrome://extensions`
2. Find TVBuddy
3. Click **"Remove"**
4. Confirm deletion

## Next Steps

Once you've verified everything works:

1. ✅ Test all search functionality
2. ✅ Try different TV shows
3. ✅ Check error handling (search for nonsense)
4. ✅ Verify the UI looks good
5. 🎨 Add custom icons (optional)
6. 🚀 Start adding new features!

## Need Help?

Common issues and solutions:

**"Manifest file is missing or unreadable"**
- Make sure you selected the `tvbuddy` folder, not a subfolder
- Check that manifest.json exists in the root

**"Could not load icon"**
- This is normal if you haven't added icons yet
- The extension will still work, just with a default icon

**API calls failing**
- Check your internet connection
- Verify in DevTools → Network tab
- TVMaze API is free and doesn't require authentication

## Current Features

✅ TV show search
✅ Show information display (rating, genres, status)
✅ Show images and summaries
✅ Clean, modern UI
✅ Responsive design

Enjoy using TVBuddy! 📺
