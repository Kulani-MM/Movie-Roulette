const API_KEY = "4b9183c91440057cc3ea56d70825ba1b";

// currently hardcoded movie list
const movies = [
  {
    title: "Final Destination Bloodlines",
    description: "Plagued by a violent recurring nightmare...",
    poster: "https://via.placeholder.com/200x300?text=Horror",
    genre: "horror",
  },
  {
    title: "The Love Code",
    description: "A quirky coder falls in love with her AI assistant...",
    poster: "https://via.placeholder.com/200x300?text=Romance",
    genre: "romance",
  },
  {
    title: "Spy & Sprint",
    description: "An ex-agent becomes a track coach...",
    poster: "https://via.placeholder.com/200x300?text=Action",
    genre: "action",
  },
];

document.getElementById("spin").addEventListener("click", () => {
  const selectedGenre = document.getElementById("genreSelect").value;

  const filteredMovies =
    selectedGenre === "all"
      ? movies
      : movies.filter((movie) => movie.genre === selectedGenre);

  const randomIndex = Math.floor(Math.random() * filteredMovies.length);
  const movie = filteredMovies[randomIndex];

  if (!movie) {
    document.getElementById(
      "movie"
    ).innerHTML = `<p>No movies found in this genre 😢</p>`;
    return;
  }

  document.getElementById("movie").innerHTML = `
    <h2>${movie.title}</h2>
    <p>${movie.description}</p>
    <img src="${movie.poster}" alt="${movie.title} Poster">
  `;
});
