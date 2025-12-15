const API_KEY = "850845cd76c3f18a3789b93083fe0024";

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
  }
}

loadGenres();

document.getElementById("spin").addEventListener("click", async () => {
  const loader = document.getElementById("loader");
  loader.style.display = "block";

  const movieContainer = document.getElementById("movie");
  movieContainer.innerHTML = "";

  try {
    const selectedGenre = document.getElementById("genreSelect").value;

    const url = selectedGenre
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${selectedGenre}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();
    const movies = data.results;

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

    const trailerLink = youtubeTrailer
      ? `<p><a href="https://www.youtube.com/watch?v=${youtubeTrailer.key}" target="_blank" rel="noopener noreferrer" class="trailer-btn">🎥 Watch Trailer</a></p>`
      : `<p><em>No trailer available.</em></p>`;

    movieContainer.innerHTML = `
      <h2>${randomMovie.title}</h2>
      <p><strong>Release Year:</strong> ${new Date(
        randomMovie.release_date
      ).getFullYear()}</p>
      <p><strong>Runtime:</strong> ${details.runtime} minutes</p>
      <p><strong>Rating:</strong> ⭐ ${randomMovie.vote_average.toFixed(
        1
      )}/10</p>

      <p>${randomMovie.overview}</p>
      <img src="https://image.tmdb.org/t/p/w200${
        randomMovie.poster_path
      }" alt="${randomMovie.title} Poster">
      ${trailerLink}
    `;
  } catch (error) {
    console.error(error);
    movieContainer.innerHTML = "<p>Something went wrong. Try again.</p>";
  } finally {
    loader.style.display = "none";
  }
});
