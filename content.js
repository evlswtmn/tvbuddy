// Content script to detect currently playing content on streaming platforms

const detectContent = () => {
  const hostname = window.location.hostname;
  let title = null;
  let type = null;

  // Netflix detection
  if (hostname.includes('netflix.com')) {
    // Try multiple selectors for Netflix
    const titleElement = document.querySelector('.video-title') ||
                        document.querySelector('.ellipsize-text') ||
                        document.querySelector('[data-uia="video-title"]') ||
                        document.querySelector('.PlayerControlsNeo__title');

    if (titleElement) {
      title = titleElement.textContent.trim();
    } else {
      // Try to get from page title
      const pageTitle = document.title;
      if (pageTitle && pageTitle !== 'Netflix') {
        title = pageTitle.replace(' - Netflix', '').trim();
      }
    }
  }

  // Disney+ detection
  else if (hostname.includes('disneyplus.com')) {
    const titleElement = document.querySelector('[data-testid="video-title"]') ||
                        document.querySelector('.title-field');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // Hulu detection
  else if (hostname.includes('hulu.com')) {
    const titleElement = document.querySelector('.PlayerMetadata__title') ||
                        document.querySelector('[class*="Title"]');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // Prime Video detection
  else if (hostname.includes('primevideo.com')) {
    const titleElement = document.querySelector('.title') ||
                        document.querySelector('[data-automation-id="title"]') ||
                        document.querySelector('h1');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // HBO Max / Max detection
  else if (hostname.includes('hbomax.com') || hostname.includes('max.com')) {
    const titleElement = document.querySelector('[data-testid="player-title"]') ||
                        document.querySelector('.video-player__title');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // YouTube detection
  else if (hostname.includes('youtube.com')) {
    const titleElement = document.querySelector('.ytp-title-link') ||
                        document.querySelector('h1.title');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // Peacock detection
  else if (hostname.includes('peacocktv.com')) {
    const titleElement = document.querySelector('[class*="Title"]');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // Paramount+ detection
  else if (hostname.includes('paramountplus.com')) {
    const titleElement = document.querySelector('.video-player-title');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // Apple TV+ detection
  else if (hostname.includes('apple.com')) {
    const titleElement = document.querySelector('.video-title') ||
                        document.querySelector('h1');
    if (titleElement) {
      title = titleElement.textContent.trim();
    }
  }

  // Determine type (movie or TV show) based on context
  if (title) {
    // Check for episode indicators
    const bodyText = document.body.textContent.toLowerCase();
    if (bodyText.includes('season') || bodyText.includes('episode') || bodyText.includes('s:') || bodyText.includes('e:')) {
      type = 'tv';
    } else {
      type = 'movie';
    }
  }

  return { title, type, platform: hostname };
};

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getContent') {
    const content = detectContent();
    sendResponse(content);
  }
  return true;
});

// Store the current content in storage when detected
const storeContent = () => {
  const content = detectContent();
  if (content.title) {
    chrome.storage.local.set({ currentContent: content });
  }
};

// Monitor for content changes
let lastTitle = null;
const checkInterval = setInterval(() => {
  const content = detectContent();
  if (content.title && content.title !== lastTitle) {
    lastTitle = content.title;
    storeContent();
  }
}, 3000); // Check every 3 seconds

// Initial detection
storeContent();
