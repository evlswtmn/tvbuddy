/**
 * TVBuddy Background Service Worker
 * Handles extension lifecycle and background tasks
 */

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TVBuddy installed successfully!');

    // Set default storage values
    chrome.storage.local.set({
      searchHistory: [],
      favorites: [],
      settings: {
        notifications: true,
        theme: 'light'
      }
    });
  } else if (details.reason === 'update') {
    console.log('TVBuddy updated to version', chrome.runtime.getManifest().version);
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStoredData') {
    chrome.storage.local.get(request.key, (data) => {
      sendResponse({ data: data[request.key] });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'saveData') {
    chrome.storage.local.set({ [request.key]: request.value }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('TVBuddy service worker loaded');
