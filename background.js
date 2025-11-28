// Background service worker for TV Buddy

// TMDB API configuration
// Note: Users should get their own API key from https://www.themoviedb.org/settings/api
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY'; // This should be replaced by users
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Search for a movie or TV show
async function searchContent(query, type) {
  try {
    const searchType = type === 'tv' ? 'tv' : 'movie';
    const url = `${TMDB_BASE_URL}/search/${searchType}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error searching content:', error);
    return null;
  }
}

// Get recommendations based on a movie or TV show ID
async function getRecommendations(id, type) {
  try {
    const contentType = type === 'tv' ? 'tv' : 'movie';
    const url = `${TMDB_BASE_URL}/${contentType}/${id}/recommendations?api_key=${TMDB_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Get similar content
async function getSimilarContent(id, type) {
  try {
    const contentType = type === 'tv' ? 'tv' : 'movie';
    const url = `${TMDB_BASE_URL}/${contentType}/${id}/similar?api_key=${TMDB_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error('Error getting similar content:', error);
    return [];
  }
}

// Get trending content as fallback
async function getTrendingContent(type) {
  try {
    const contentType = type === 'tv' ? 'tv' : 'movie';
    const url = `${TMDB_BASE_URL}/trending/${contentType}/week?api_key=${TMDB_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    return data.results || [];
  } catch (error) {
    console.error('Error getting trending content:', error);
    return [];
  }
}

// Main function to get recommendations
async function getRecommendationsForContent(title, type) {
  // First, search for the content
  const content = await searchContent(title, type);

  if (!content) {
    // If no content found, return trending
    return {
      recommendations: await getTrendingContent(type),
      source: 'trending',
      currentContent: null
    };
  }

  // Get both recommendations and similar content
  const [recommendations, similar] = await Promise.all([
    getRecommendations(content.id, type),
    getSimilarContent(content.id, type)
  ]);

  // Combine and deduplicate
  const combined = [...recommendations, ...similar];
  const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

  // Limit to 10 recommendations
  const limited = unique.slice(0, 10);

  return {
    recommendations: limited,
    source: 'recommendations',
    currentContent: content
  };
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRecommendations') {
    getRecommendationsForContent(request.title, request.type)
      .then(sendResponse)
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

// Check if API key is set
chrome.runtime.onInstalled.addListener(() => {
  if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY') {
    console.warn('TV Buddy: Please set your TMDB API key in background.js');
  }
});
