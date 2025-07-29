const API_KEY = "4b9183c91440057cc3ea56d70825ba1b";

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

    movieContainer.innerHTML = `
      <h2>${randomMovie.title}</h2>
      <p><strong>Rating:</strong> ⭐ ${randomMovie.vote_average}/10</p>
      <p>${randomMovie.overview}</p>
      <img src="https://image.tmdb.org/t/p/w200${randomMovie.poster_path}" alt="${randomMovie.title} Poster">
    `;
  } catch (error) {
    console.error(error);
    movieContainer.innerHTML = "<p>Something went wrong. Try again.</p>";
  } finally {
    loader.style.display = "none";
  }
});
