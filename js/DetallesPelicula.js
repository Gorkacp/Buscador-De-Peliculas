// movieDetails.js
// Mostrar detalles de la película en el modal
function showMovieDetails(imdbID) {
    const modal = document.getElementById('movieModal');
    const modalContent = document.getElementById('modalDetails');
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Obtener detalles de la película desde la API
    fetch(`${API_URL}&i=${imdbID}`)
      .then(response => response.json())
      .then(movie => {
        if (movie.Response === 'True') {
          const rating = parseFloat(movie.imdbRating);
          const fullStars = Math.floor(rating / 2);
          const emptyStars = 5 - fullStars;
  
          const starElements = [];
          for (let i = 0; i < fullStars; i++) {
            starElements.push('<span class="star full">★</span>');
          }
          for (let i = 0; i < emptyStars; i++) {
            starElements.push('<span class="star empty">★</span>');
          }
  
          modalContent.innerHTML = `
            <div class="movie-details">
              <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x200?text=No+Image'}" alt="${movie.Title}">
              <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p><strong>Director:</strong> ${movie.Director}</p>
                <p><strong>Actors:</strong> ${movie.Actors}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p><strong>Plot:</strong> ${movie.Plot}</p>
                <p><strong>Year:</strong> ${movie.Year}</p>
                <div class="movie-rating">
                  <p><strong>Rating:</strong> ${rating}</p>
                  <div class="stars">${starElements.join('')}</div>
                </div>
              </div>
            </div>
          `;
        } else {
          modalContent.innerHTML = `<p>No se encontraron detalles para esta película.</p>`;
        }
      })
      .catch(error => {
        modalContent.innerHTML = `<p>Error al cargar los detalles de la película.</p>`;
        console.error(error);
      });
  }
// Cerrar el modal
document.getElementById('closeModal').addEventListener('click', () => {
    const modal = document.getElementById('movieModal');
    modal.classList.add('hidden');
  });