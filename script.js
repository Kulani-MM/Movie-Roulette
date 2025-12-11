const API_KEY = "4b9183c91440057cc3ea56d70825ba1b";

// LocalStorage keys
const WATCHLIST_KEY = "movieRouletteWatchlist";
const HISTORY_KEY = "movieRouletteHistory";

// State management
let watchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY)) || [];
let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
let currentMovie = null;

// Initialize app
async function loadGenres() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
    );
    const data = await res.json();

    const select = document.getElementById("genreSelect");

    data.genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load genres:", err);
    showError("Failed to load genres. Please refresh the page.");
  }
}

// Utility: Show error message
function showError(message) {
  const movieContainer = document.getElementById("movie");
  movieContainer.innerHTML = `
    <div class="error-message">
      <p>⚠️ ${message}</p>
      <button onclick="location.reload()" class="retry-btn">🔄 Retry</button>
    </div>
  `;
  movieContainer.classList.add('fade-in');
}

// Spin for a movie
document.getElementById("spin").addEventListener("click", async () => {
  const loader = document.getElementById("loader");
  loader.style.display = "flex";

  const movieContainer = document.getElementById("movie");
  movieContainer.innerHTML = "";
  movieContainer.classList.remove('fade-in');

  try {
    const selectedGenre = document.getElementById("genreSelect").value;
    const minRating = parseFloat(document.getElementById("ratingFilter").value);
    const yearRange = document.getElementById("yearFilter").value;

    // Build API URL with filters
    let url = selectedGenre
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

    // Add year filter if selected
    if (yearRange) {
      const [startYear, endYear] = yearRange.split('-');
      url += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
    }

    // Add rating filter
    if (minRating > 0) {
      url += `&vote_average.gte=${minRating}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    let movies = data.results;

    // Filter out movies without posters
    movies = movies.filter(m => m.poster_path);

    if (movies.length === 0) {
      throw new Error("No movies found with these filters. Try adjusting your criteria.");
    }

    const randomMovie = movies[Math.floor(Math.random() * movies.length)];

    // Get movie details (runtime, etc.)
    const detailsRes = await fetch(
      `https://api.themoviedb.org/3/movie/${randomMovie.id}?api_key=${API_KEY}`
    );
    const details = await detailsRes.json();

    // Get trailer info
    const trailerRes = await fetch(
      `https://api.themoviedb.org/3/movie/${randomMovie.id}/videos?api_key=${API_KEY}`
    );
    const trailerData = await trailerRes.json();

    const youtubeTrailer = trailerData.results.find(
      (vid) => vid.site === "YouTube" && vid.type === "Trailer"
    );

    currentMovie = {
      id: randomMovie.id,
      title: randomMovie.title,
      year: new Date(randomMovie.release_date).getFullYear(),
      runtime: details.runtime,
      rating: randomMovie.vote_average,
      overview: randomMovie.overview,
      poster: randomMovie.poster_path,
      trailer: youtubeTrailer ? youtubeTrailer.key : null
    };

    // Add to history
    addToHistory(currentMovie);

    // Display movie
    displayMovie(currentMovie);

  } catch (error) {
    console.error(error);
    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    loader.style.display = "none";
  }
});

// Display movie card
function displayMovie(movie) {
  const movieContainer = document.getElementById("movie");
  const isInWatchlist = watchlist.some(m => m.id === movie.id);

  const trailerLink = movie.trailer
    ? `<a href="https://www.youtube.com/watch?v=${movie.trailer}" target="_blank" rel="noopener noreferrer" class="trailer-btn">🎥 Watch Trailer</a>`
    : `<span class="no-trailer">No trailer available</span>`;

  const watchlistBtn = isInWatchlist
    ? `<button onclick="removeFromWatchlist(${movie.id})" class="watchlist-btn active">⭐ In Watchlist</button>`
    : `<button onclick="addToWatchlist(${movie.id})" class="watchlist-btn">➕ Add to Watchlist</button>`;

  movieContainer.innerHTML = `
    <div class="movie-content">
      <img src="https://image.tmdb.org/t/p/w300${movie.poster}" alt="${movie.title} Poster" class="movie-poster">

      <div class="movie-info">
        <h2>${movie.title}</h2>

        <div class="movie-meta">
          <span class="meta-item">📅 ${movie.year}</span>
          <span class="meta-item">⏱️ ${movie.runtime} min</span>
          <span class="meta-item rating">⭐ ${movie.rating.toFixed(1)}/10</span>
        </div>

        <p class="movie-overview">${movie.overview}</p>

        <div class="movie-actions">
          ${trailerLink}
          ${watchlistBtn}
          <button onclick="shareMovie()" class="share-btn">🔗 Share</button>
          <button onclick="document.getElementById('spin').click()" class="spin-again-btn">🎲 Spin Again</button>
        </div>
      </div>
    </div>
  `;

  movieContainer.classList.add('fade-in');
}

// Watchlist functions
function addToWatchlist(movieId) {
  if (!currentMovie || currentMovie.id !== movieId) return;

  if (!watchlist.some(m => m.id === movieId)) {
    watchlist.unshift(currentMovie);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    displayMovie(currentMovie); // Refresh display
    renderWatchlist();
  }
}

window.addToWatchlist = addToWatchlist;

function removeFromWatchlist(movieId) {
  watchlist = watchlist.filter(m => m.id !== movieId);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  displayMovie(currentMovie); // Refresh display
  renderWatchlist();
}

window.removeFromWatchlist = removeFromWatchlist;

function renderWatchlist() {
  const watchlistSection = document.getElementById("watchlist-section");
  const watchlistContainer = document.getElementById("watchlist");

  if (watchlist.length === 0) {
    watchlistSection.style.display = "none";
    return;
  }

  watchlistSection.style.display = "block";
  watchlistContainer.innerHTML = watchlist.map(movie => `
    <div class="history-item">
      <img src="https://image.tmdb.org/t/p/w92${movie.poster}" alt="${movie.title}">
      <div class="history-info">
        <strong>${movie.title}</strong>
        <span>${movie.year} • ⭐ ${movie.rating.toFixed(1)}</span>
      </div>
      <button onclick="removeFromWatchlist(${movie.id})" class="remove-btn">✕</button>
    </div>
  `).join('');
}

// History functions
function addToHistory(movie) {
  // Avoid duplicates in recent history
  history = history.filter(m => m.id !== movie.id);
  history.unshift(movie);

  // Keep only last 10
  if (history.length > 10) {
    history = history.slice(0, 10);
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const historySection = document.getElementById("history-section");
  const historyList = document.getElementById("history-list");

  if (history.length === 0) {
    historySection.style.display = "none";
    return;
  }

  historySection.style.display = "block";
  historyList.innerHTML = history.map(movie => `
    <div class="history-item">
      <img src="https://image.tmdb.org/t/p/w92${movie.poster}" alt="${movie.title}">
      <div class="history-info">
        <strong>${movie.title}</strong>
        <span>${movie.year} • ⭐ ${movie.rating.toFixed(1)}</span>
      </div>
    </div>
  `).join('');
}

document.getElementById("clear-history").addEventListener("click", () => {
  if (confirm("Clear all viewing history?")) {
    history = [];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
  }
});

// Share function
function shareMovie() {
  if (!currentMovie) return;

  const shareText = `Check out "${currentMovie.title}" (${currentMovie.year}) - ⭐ ${currentMovie.rating.toFixed(1)}/10`;
  const shareUrl = currentMovie.trailer
    ? `https://www.youtube.com/watch?v=${currentMovie.trailer}`
    : window.location.href;

  if (navigator.share) {
    navigator.share({
      title: currentMovie.title,
      text: shareText,
      url: shareUrl
    }).catch(() => console.log('Share cancelled'));
  } else {
    // Fallback: Copy to clipboard
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
      alert('Movie details copied to clipboard!');
    });
  }
}

window.shareMovie = shareMovie;

// Initialize on load
loadGenres();
renderWatchlist();
renderHistory();
