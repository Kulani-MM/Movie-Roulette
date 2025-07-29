const API_KEY = "4b9183c91440057cc3ea56d70825ba1b";

document.getElementById("spin").addEventListener("click", async () => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
  );
  const data = await response.json();
  const movies = data.results;

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];

  document.getElementById("movie").innerHTML = `
    <h2>${randomMovie.title}</h2>
    <p>${randomMovie.overview}</p>
    <img src="https://image.tmdb.org/t/p/w200${randomMovie.poster_path}" alt="${randomMovie.title} Poster">
  `;
});
