/**
 * TVBuddy Popup Script
 * Handles TV show search and display functionality
 */

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const showInfo = document.getElementById('showInfo');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const welcome = document.getElementById('welcome');

// TVMaze API base URL (free, no API key required)
const API_BASE_URL = 'https://api.tvmaze.com';

/**
 * Search for a TV show
 * @param {string} query - The search query
 */
async function searchShow(query) {
  if (!query.trim()) {
    showError('Please enter a TV show name');
    return;
  }

  showLoading();

  try {
    const response = await fetch(`${API_BASE_URL}/singlesearch/shows?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error('Show not found');
    }

    const show = await response.json();
    displayShow(show);
  } catch (err) {
    showError(err.message === 'Show not found'
      ? 'TV show not found. Try a different search!'
      : 'Something went wrong. Please try again.');
  }
}

/**
 * Display show information
 * @param {Object} show - The show data from API
 */
function displayShow(show) {
  hideAll();

  const rating = show.rating?.average || 'N/A';
  const genres = show.genres?.join(', ') || 'N/A';
  const status = show.status || 'Unknown';
  const premiered = show.premiered || 'Unknown';
  const summary = show.summary
    ? show.summary.replace(/<[^>]*>/g, '')
    : 'No summary available';

  showInfo.innerHTML = `
    <h2>${show.name}</h2>
    ${show.image?.medium ? `<img src="${show.image.medium}" alt="${show.name}">` : ''}
    <p><span class="label">Rating:</span> ⭐ ${rating}/10</p>
    <p><span class="label">Genres:</span> ${genres}</p>
    <p><span class="label">Status:</span> ${status}</p>
    <p><span class="label">Premiered:</span> ${premiered}</p>
    <p><span class="label">Summary:</span></p>
    <p>${summary}</p>
    ${show.officialSite ? `<p><a href="${show.officialSite}" target="_blank">Official Site</a></p>` : ''}
  `;

  results.classList.remove('hidden');
}

/**
 * Show loading state
 */
function showLoading() {
  hideAll();
  loading.classList.remove('hidden');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  hideAll();
  errorMessage.textContent = message;
  error.classList.remove('hidden');
}

/**
 * Hide all sections
 */
function hideAll() {
  loading.classList.add('hidden');
  results.classList.add('hidden');
  error.classList.add('hidden');
  welcome.classList.add('hidden');
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  searchShow(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchShow(searchInput.value);
  }
});

// Focus on input when popup opens
searchInput.focus();
