// Popup script for TV Buddy

const currentContentDiv = document.getElementById('currentContent');
const recommendationList = document.getElementById('recommendationList');
const errorDiv = document.getElementById('error');
const refreshBtn = document.getElementById('refreshBtn');

// Show error message
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

// Hide error message
function hideError() {
  errorDiv.classList.add('hidden');
}

// Display current content
function displayCurrentContent(content) {
  if (!content || !content.title) {
    currentContentDiv.innerHTML = `
      <div class="no-content">
        <p>No streaming content detected</p>
        <p class="hint">Navigate to a streaming platform and start watching something!</p>
      </div>
    `;
    return;
  }

  const posterUrl = content.poster_path
    ? `https://image.tmdb.org/t/p/w200${content.poster_path}`
    : 'https://via.placeholder.com/200x300?text=No+Image';

  const title = content.name || content.title || content.originalTitle;
  const year = content.release_date
    ? new Date(content.release_date).getFullYear()
    : (content.first_air_date ? new Date(content.first_air_date).getFullYear() : '');

  const rating = content.vote_average ? `⭐ ${content.vote_average.toFixed(1)}` : '';

  currentContentDiv.innerHTML = `
    <div class="content-card current">
      <h3>Currently Watching:</h3>
      <div class="content-info">
        <img src="${posterUrl}" alt="${title}" class="poster">
        <div class="details">
          <h4>${title}</h4>
          ${year ? `<p class="year">${year}</p>` : ''}
          ${rating ? `<p class="rating">${rating}</p>` : ''}
          ${content.overview ? `<p class="overview">${content.overview.substring(0, 150)}...</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Display recommendations
function displayRecommendations(recommendations, source) {
  if (!recommendations || recommendations.length === 0) {
    recommendationList.innerHTML = `
      <div class="no-recommendations">
        <p>No recommendations available at the moment</p>
      </div>
    `;
    return;
  }

  const sourceText = source === 'trending' ? 'Trending Now' : 'You Might Also Like';
  document.querySelector('#recommendations h2').textContent = sourceText;

  recommendationList.innerHTML = recommendations.map(item => {
    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
      : 'https://via.placeholder.com/200x300?text=No+Image';

    const title = item.name || item.title;
    const year = item.release_date
      ? new Date(item.release_date).getFullYear()
      : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : '');

    const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : '';

    return `
      <div class="recommendation-card">
        <img src="${posterUrl}" alt="${title}" class="poster">
        <div class="rec-details">
          <h4>${title}</h4>
          ${year ? `<span class="year">${year}</span>` : ''}
          ${rating ? `<span class="rating">${rating}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Load recommendations
async function loadRecommendations() {
  hideError();
  currentContentDiv.innerHTML = '<div class="loading">Detecting what you\'re watching...</div>';
  recommendationList.innerHTML = '<div class="loading">Loading recommendations...</div>';

  try {
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we're on a supported streaming platform
    const supportedPlatforms = [
      'netflix.com', 'disneyplus.com', 'hulu.com', 'primevideo.com',
      'hbomax.com', 'max.com', 'youtube.com', 'peacocktv.com',
      'paramountplus.com', 'apple.com'
    ];

    const isSupported = supportedPlatforms.some(platform => tab.url.includes(platform));

    if (!isSupported) {
      currentContentDiv.innerHTML = `
        <div class="no-content">
          <p>Please navigate to a supported streaming platform</p>
          <p class="hint">Supported: Netflix, Disney+, Hulu, Prime Video, HBO Max, YouTube, and more</p>
        </div>
      `;
      recommendationList.innerHTML = '';
      return;
    }

    // Get content from the page
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getContent' });

    if (!response || !response.title) {
      // Try to get from storage
      const stored = await chrome.storage.local.get('currentContent');
      if (stored.currentContent && stored.currentContent.title) {
        // Use stored content
        const result = await chrome.runtime.sendMessage({
          action: 'getRecommendations',
          title: stored.currentContent.title,
          type: stored.currentContent.type || 'movie'
        });

        if (result.error) {
          throw new Error(result.error);
        }

        displayCurrentContent(result.currentContent);
        displayRecommendations(result.recommendations, result.source);
      } else {
        currentContentDiv.innerHTML = `
          <div class="no-content">
            <p>No streaming content detected</p>
            <p class="hint">Start playing a show or movie!</p>
          </div>
        `;
        recommendationList.innerHTML = '';
      }
      return;
    }

    // Get recommendations from background script
    const result = await chrome.runtime.sendMessage({
      action: 'getRecommendations',
      title: response.title,
      type: response.type || 'movie'
    });

    if (result.error) {
      throw new Error(result.error);
    }

    displayCurrentContent(result.currentContent);
    displayRecommendations(result.recommendations, result.source);

  } catch (error) {
    console.error('Error loading recommendations:', error);
    showError('Failed to load recommendations. Please try again.');
    currentContentDiv.innerHTML = `
      <div class="no-content">
        <p>Error detecting content</p>
        <p class="hint">${error.message}</p>
      </div>
    `;
    recommendationList.innerHTML = '';
  }
}

// Event listeners
refreshBtn.addEventListener('click', loadRecommendations);

// Load recommendations when popup opens
loadRecommendations();
