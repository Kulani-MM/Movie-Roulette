const API_KEY = "850845cd76c3f18a3789b93083fe0024";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
  history: JSON.parse(localStorage.getItem("movieHistory")) || [],
  currentMovie: null,
  isHistorySidebarOpen: false,
  notInterested: JSON.parse(localStorage.getItem("notInterested")) || [],
  alreadyWatched: JSON.parse(localStorage.getItem("alreadyWatched")) || [],
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
  genreSelect: document.getElementById("genreSelect"),
  yearRange: document.getElementById("yearRange"),
  minRating: document.getElementById("minRating"),
  spinBtn: document.getElementById("spin"),
  loader: document.getElementById("loader"),
  errorMessage: document.getElementById("errorMessage"),
  movieContainer: document.getElementById("movie"),
  historySidebar: document.getElementById("historySidebar"),
  toggleHistoryBtn: document.getElementById("toggleHistory"),
  closeHistoryBtn: document.getElementById("closeHistory"),
  clearHistoryBtn: document.getElementById("clearHistory"),
  historyList: document.getElementById("historyList"),
  historyCount: document.getElementById("historyCount"),
  emptyHistory: document.getElementById("emptyHistory"),
  themeBtn: document.getElementById("themeBtn"),
  themeMenu: document.getElementById("themeMenu"),
  themeOptions: document.querySelectorAll(".theme-option"),
};

// ============================================
// API FUNCTIONS
// ============================================
const API = {
  async fetchGenres() {
    const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    if (!response.ok) throw new Error("Failed to load genres");
    const data = await response.json();
    return data.genres;
  },

  async fetchMovies(filters) {
    const { genre, yearRange, minRating } = filters;
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&vote_count.gte=100`;

    if (genre) {
      url += `&with_genres=${genre}`;
    }

    if (yearRange) {
      const [startYear, endYear] = yearRange.split("-");
      url += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
    }

    if (minRating && minRating > 0) {
      url += `&vote_average.gte=${minRating}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();
    return data.results;
  },

  async fetchMovieDetails(movieId) {
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch movie details");
    return await response.json();
  },

  async fetchMovieVideos(movieId) {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch movie videos");
    return await response.json();
  },

  async fetchMovieCredits(movieId) {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`);
    if (!response.ok) throw new Error("Failed to fetch movie credits");
    return await response.json();
  },
};

// ============================================
// HISTORY MANAGEMENT
// ============================================
const History = {
  add(movie) {
    // Prevent duplicates by checking if movie already exists
    const existingIndex = state.history.findIndex((m) => m.id === movie.id);
    if (existingIndex !== -1) {
      // Move to front if already exists
      state.history.splice(existingIndex, 1);
    }

    // Add to front of history
    state.history.unshift(movie);

    // Keep only last 20 movies
    if (state.history.length > 20) {
      state.history = state.history.slice(0, 20);
    }

    this.save();
    this.render();
  },

  remove(movieId) {
    state.history = state.history.filter((m) => m.id !== movieId);
    this.save();
    this.render();
  },

  clear() {
    if (confirm("Are you sure you want to clear all history?")) {
      state.history = [];
      this.save();
      this.render();
    }
  },

  save() {
    localStorage.setItem("movieHistory", JSON.stringify(state.history));
    elements.historyCount.textContent = state.history.length;
  },

  render() {
    elements.historyList.innerHTML = "";

    if (state.history.length === 0) {
      elements.emptyHistory.style.display = "block";
      elements.historyList.style.display = "none";
      return;
    }

    elements.emptyHistory.style.display = "none";
    elements.historyList.style.display = "flex";

    state.history.forEach((movie) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.innerHTML = `
        <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/60x90?text=No+Image'">
        <div class="history-item-info">
          <h4>${movie.title}</h4>
          <p>⭐ ${movie.vote_average.toFixed(1)} | ${movie.release_year}</p>
        </div>
        <button class="remove-history-btn" data-id="${movie.id}" aria-label="Remove from history">×</button>
      `;

      // Click on item to view movie
      historyItem.addEventListener("click", (e) => {
        if (!e.target.classList.contains("remove-history-btn")) {
          UI.displayMovie(movie);
          UI.toggleHistorySidebar();
        }
      });

      // Remove button
      const removeBtn = historyItem.querySelector(".remove-history-btn");
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        History.remove(movie.id);
      });

      elements.historyList.appendChild(historyItem);
    });
  },
};

// ============================================
// UI FUNCTIONS
// ============================================
const UI = {
  showLoader() {
    elements.loader.style.display = "block";
    elements.movieContainer.innerHTML = "";
    elements.errorMessage.style.display = "none";
  },

  hideLoader() {
    elements.loader.style.display = "none";
  },

  showError(message) {
    elements.errorMessage.textContent = `⚠️ ${message}`;
    elements.errorMessage.style.display = "block";
    elements.movieContainer.innerHTML = "";
    setTimeout(() => {
      elements.errorMessage.style.display = "none";
    }, 5000);
  },

  displayMovie(movieData) {
    const {
      title,
      overview,
      vote_average,
      release_year,
      runtime,
      poster_path,
      genres,
      director,
      cast,
      trailerKey,
    } = movieData;

    const trailerLink = trailerKey
      ? `<p><a href="https://www.youtube.com/watch?v=${trailerKey}" target="_blank" rel="noopener noreferrer" class="trailer-btn">🎥 Watch Trailer</a></p>`
      : `<p><em>No trailer available.</em></p>`;

    const genresList = genres ? genres.map((g) => g.name).join(", ") : "N/A";
    const castList = cast ? cast.slice(0, 5).join(", ") : "N/A";

    const isWatched = state.alreadyWatched.includes(movieData.id);
    const watchedBadge = isWatched ? '<span class="watched-badge">✓ Watched</span>' : '';

    elements.movieContainer.innerHTML = `
      <h2>${title} ${watchedBadge}</h2>
      <p><strong>Director:</strong> ${director || "N/A"}</p>
      <p><strong>Release Year:</strong> ${release_year}</p>
      <p><strong>Runtime:</strong> ${runtime ? `${runtime} minutes` : "N/A"}</p>
      <p><strong>Rating:</strong> ⭐ ${vote_average.toFixed(1)}/10</p>
      <p><strong>Genres:</strong> ${genresList}</p>
      <p><strong>Cast:</strong> ${castList}</p>
      <p>${overview || "No overview available."}</p>
      <img src="${IMAGE_BASE_URL}${poster_path}" alt="${title} Poster" onerror="this.style.display='none'">
      ${trailerLink}

      <div class="action-buttons">
        <button id="shareBtn" class="action-btn share-btn" aria-label="Share movie">
          <span>🔗</span> Share
        </button>
        <button id="notInterestedBtn" class="action-btn not-interested-btn" aria-label="Not interested">
          <span>👎</span> Not Interested
        </button>
        <button id="alreadyWatchedBtn" class="action-btn ${isWatched ? 'watched-active' : ''}" aria-label="Mark as watched">
          <span>${isWatched ? '✓' : '👁'}</span> ${isWatched ? 'Watched' : 'Mark as Watched'}
        </button>
        <button id="spinAgainBtn" class="action-btn spin-again-btn" aria-label="Spin for another movie">
          <span>🎲</span> Spin Again
        </button>
      </div>
    `;

    state.currentMovie = movieData;

    // Add event listeners for action buttons
    this.attachActionListeners();
  },

  attachActionListeners() {
    const shareBtn = document.getElementById("shareBtn");
    const notInterestedBtn = document.getElementById("notInterestedBtn");
    const alreadyWatchedBtn = document.getElementById("alreadyWatchedBtn");
    const spinAgainBtn = document.getElementById("spinAgainBtn");

    if (shareBtn) {
      shareBtn.addEventListener("click", () => MovieActions.share());
    }
    if (notInterestedBtn) {
      notInterestedBtn.addEventListener("click", () => MovieActions.notInterested());
    }
    if (alreadyWatchedBtn) {
      alreadyWatchedBtn.addEventListener("click", () => MovieActions.toggleWatched());
    }
    if (spinAgainBtn) {
      spinAgainBtn.addEventListener("click", spinForMovie);
    }
  },

  toggleHistorySidebar() {
    state.isHistorySidebarOpen = !state.isHistorySidebarOpen;
    if (state.isHistorySidebarOpen) {
      elements.historySidebar.classList.add("active");
    } else {
      elements.historySidebar.classList.remove("active");
    }
  },
};

// ============================================
// MOVIE ACTIONS
// ============================================
const MovieActions = {
  share() {
    if (!state.currentMovie) return;

    const { title, release_year, vote_average } = state.currentMovie;
    const shareText = `Check out this movie: ${title} (${release_year}) - ⭐ ${vote_average.toFixed(1)}/10`;
    const shareUrl = window.location.href;

    // Try native Web Share API first
    if (navigator.share) {
      navigator.share({
        title: `Movie Roulette - ${title}`,
        text: shareText,
        url: shareUrl,
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          this.showShareMenu();
        }
      });
    } else {
      this.showShareMenu();
    }
  },

  showShareMenu() {
    if (!state.currentMovie) return;

    const { title, release_year, vote_average } = state.currentMovie;
    const shareText = `Check out this movie: ${title} (${release_year}) - ⭐ ${vote_average.toFixed(1)}/10`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(window.location.href);

    const shareLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      copy: 'copy'
    };

    // Create share modal
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
      <div class="share-modal-content">
        <h3>Share this movie</h3>
        <div class="share-options">
          <button class="share-option-btn" data-platform="twitter">
            <span>🐦</span> Twitter
          </button>
          <button class="share-option-btn" data-platform="facebook">
            <span>📘</span> Facebook
          </button>
          <button class="share-option-btn" data-platform="whatsapp">
            <span>💬</span> WhatsApp
          </button>
          <button class="share-option-btn" data-platform="copy">
            <span>📋</span> Copy Link
          </button>
        </div>
        <button class="close-share-btn">Close</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    modal.querySelectorAll('.share-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.getAttribute('data-platform');
        if (platform === 'copy') {
          navigator.clipboard.writeText(shareText + ' ' + window.location.href);
          btn.innerHTML = '<span>✓</span> Copied!';
          setTimeout(() => {
            modal.remove();
          }, 1000);
        } else {
          window.open(shareLinks[platform], '_blank', 'width=600,height=400');
          modal.remove();
        }
      });
    });

    modal.querySelector('.close-share-btn').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  notInterested() {
    if (!state.currentMovie) return;

    const movieId = state.currentMovie.id;

    if (!state.notInterested.includes(movieId)) {
      state.notInterested.push(movieId);
      localStorage.setItem("notInterested", JSON.stringify(state.notInterested));
    }

    // Show feedback
    UI.showError("Movie marked as not interested. You won't see it again!");

    // Spin for a new movie
    setTimeout(() => {
      spinForMovie();
    }, 1000);
  },

  toggleWatched() {
    if (!state.currentMovie) return;

    const movieId = state.currentMovie.id;
    const index = state.alreadyWatched.indexOf(movieId);

    if (index === -1) {
      state.alreadyWatched.push(movieId);
    } else {
      state.alreadyWatched.splice(index, 1);
    }

    localStorage.setItem("alreadyWatched", JSON.stringify(state.alreadyWatched));

    // Re-render the movie to update the button
    UI.displayMovie(state.currentMovie);
  }
};

// ============================================
// MAIN FUNCTIONALITY
// ============================================
async function loadGenres() {
  try {
    const genres = await API.fetchGenres();
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.name;
      elements.genreSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load genres:", error);
    UI.showError("Failed to load genres. Please refresh the page.");
  }
}

async function spinForMovie() {
  UI.showLoader();

  try {
    const filters = {
      genre: elements.genreSelect.value,
      yearRange: elements.yearRange.value,
      minRating: parseFloat(elements.minRating.value),
    };

    const movies = await API.fetchMovies(filters);

    if (!movies || movies.length === 0) {
      UI.hideLoader();
      UI.showError("No movies found with these filters. Try different options!");
      return;
    }

    // Filter out movies marked as "not interested"
    const filteredMovies = movies.filter(movie => !state.notInterested.includes(movie.id));

    if (filteredMovies.length === 0) {
      UI.hideLoader();
      UI.showError("No new movies found. Try clearing your 'Not Interested' list or changing filters!");
      return;
    }

    const randomMovie = filteredMovies[Math.floor(Math.random() * filteredMovies.length)];

    // Fetch additional details
    const [details, videos, credits] = await Promise.all([
      API.fetchMovieDetails(randomMovie.id),
      API.fetchMovieVideos(randomMovie.id),
      API.fetchMovieCredits(randomMovie.id),
    ]);

    const youtubeTrailer = videos.results.find(
      (vid) => vid.site === "YouTube" && vid.type === "Trailer"
    );

    const director = credits.crew.find((person) => person.job === "Director");
    const cast = credits.cast.slice(0, 5).map((actor) => actor.name);

    const movieData = {
      id: randomMovie.id,
      title: randomMovie.title,
      overview: randomMovie.overview,
      vote_average: randomMovie.vote_average,
      release_year: new Date(randomMovie.release_date).getFullYear(),
      runtime: details.runtime,
      poster_path: randomMovie.poster_path,
      genres: details.genres,
      director: director ? director.name : null,
      cast: cast,
      trailerKey: youtubeTrailer ? youtubeTrailer.key : null,
    };

    UI.displayMovie(movieData);
    History.add(movieData);
    UI.hideLoader();
  } catch (error) {
    console.error("Error fetching movie:", error);
    UI.hideLoader();
    UI.showError("Something went wrong. Please try again!");
  }
}

// ============================================
// THEME MANAGEMENT
// ============================================
const Theme = {
  current: localStorage.getItem("theme") || "default",

  apply(themeName) {
    document.body.setAttribute("data-theme", themeName);
    this.current = themeName;
    localStorage.setItem("theme", themeName);

    // Update active theme option
    elements.themeOptions.forEach((option) => {
      if (option.getAttribute("data-theme") === themeName) {
        option.classList.add("active");
      } else {
        option.classList.remove("active");
      }
    });
  },

  toggle() {
    elements.themeMenu.classList.toggle("active");
  },

  init() {
    this.apply(this.current);
  },
};

// ============================================
// EVENT LISTENERS
// ============================================
elements.spinBtn.addEventListener("click", spinForMovie);
elements.toggleHistoryBtn.addEventListener("click", UI.toggleHistorySidebar);
elements.closeHistoryBtn.addEventListener("click", UI.toggleHistorySidebar);
elements.clearHistoryBtn.addEventListener("click", () => History.clear());

// Theme switcher
elements.themeBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  Theme.toggle();
});

elements.themeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const theme = option.getAttribute("data-theme");
    Theme.apply(theme);
    Theme.toggle();
  });
});

// Close theme menu when clicking outside
document.addEventListener("click", (e) => {
  if (!elements.themeMenu.contains(e.target) && !elements.themeBtn.contains(e.target)) {
    elements.themeMenu.classList.remove("active");
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (state.isHistorySidebarOpen) {
      UI.toggleHistorySidebar();
    }
    if (elements.themeMenu.classList.contains("active")) {
      elements.themeMenu.classList.remove("active");
    }
  }
  if (e.key === "h" && e.ctrlKey) {
    e.preventDefault();
    UI.toggleHistorySidebar();
  }
});

// ============================================
// INITIALIZATION
// ============================================
(function init() {
  loadGenres();
  History.render();
  Theme.init();
  elements.historyCount.textContent = state.history.length;
})();