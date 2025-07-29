const API_KEY = "4b9183c91440057cc3ea56d70825ba1b";

document.getElementById("spin").addEventListener("click", async () => {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`
  );
  const data = await response.json();
  const movies = [
    {
      title: "Final Destination Bloodlines",
      description: "Plagued by a violent recurring nightmare...",
      poster: "link-to-image",
      genre: "horror",
    },
    {
      title: "The Love Code",
      description: "A quirky coder falls in love with her AI assistant...",
      poster: "link-to-image",
      genre: "romance",
    },
    {
      title: "Spy & Sprint",
      description: "An ex-agent becomes a track coach...",
      poster: "link-to-image",
      genre: "action",
    },
  ];


  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  function getRandomMovie() {
    const selectedGenre = document.getElementById("genreSelect").value;

    const filteredMovies =
      selectedGenre === "all"
        ? movies
        : movies.filter((movie) => movie.genre === selectedGenre);

    const randomIndex = Math.floor(Math.random() * filteredMovies.length);
    return filteredMovies[randomIndex];
  }


  document.getElementById("movie").innerHTML = `
    <h2>${randomMovie.title}</h2>
    <p>${randomMovie.overview}</p>
    <img src="https://image.tmdb.org/t/p/w200${randomMovie.poster_path}" alt="${randomMovie.title} Poster">
  `;
});
