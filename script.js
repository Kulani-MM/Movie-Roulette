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
  const genreId = document.getElementById("genreSelect").value;
  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}`;

  if (genreId) {
    url += `&with_genres=${genreId}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const movies = data.results;

    if (movies.length === 0) {
      document.getElementById("movie").innerHTML = "<p>No movies found.</p>";
      return;
    }

    const randomMovie = movies[Math.floor(Math.random() * movies.length)];

    document.getElementById("movie").innerHTML = `
      <h2>${randomMovie.title}</h2>
      <p>${randomMovie.overview}</p>
      <img 
        src="https://image.tmdb.org/t/p/w300${randomMovie.poster_path}" 
        alt="${randomMovie.title} poster"
        onerror="this.style.display='none'"
      >
    `;
  } catch (err) {
    console.error("Failed to fetch movie:", err);
    document.getElementById("movie").innerHTML = "<p>Error loading movie.</p>";
  }
});
