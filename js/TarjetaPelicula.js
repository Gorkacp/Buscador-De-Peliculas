// Crear tarjeta de película
function createMovieCard(movie) {
    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x200?text=No+Image';
    return `
      <div class="movie-card" onclick="showMovieDetails('${movie.imdbID}')">
        <img src="${poster}" alt="${movie.Title}">
      </div>
    `;
  }
  