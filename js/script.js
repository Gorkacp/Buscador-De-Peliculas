const API_KEY = '5d6cf565'; // Tu clave de API
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;
let currentPage = 1;
let currentQuery = '';
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
  loadRecommended(); // Películas recomendadas al inicio
  loadCategory('Action', 'actionList'); // Cargar películas por categorías
  loadCategory('Comedy', 'comedyList');
  loadCategory('Drama', 'dramaList');
  loadCategory('Horror', 'horrorList');

  const searchButton = document.getElementById('searchButton');
  const searchBar = document.getElementById('searchBar');
  const navInicio = document.querySelector('nav a[href="#inicio"]'); // Enlace "Inicio"

  searchButton.addEventListener('click', () => handleSearch(searchBar.value.trim()));

  searchBar.addEventListener('input', () => {
    const query = searchBar.value.trim();
    if (query.length >= 1) {
      handleSearch(query); // Activar búsqueda con 1 letra
    } else {
      resetSearch(); // Restablecer la vista cuando el campo de búsqueda está vacío
    }
  });

  // Evento para el enlace "Inicio"
  navInicio.addEventListener('click', (e) => {
    e.preventDefault(); // Evitar el comportamiento predeterminado del enlace
    resetSearch(); // Restablecer la vista inicial
    window.scrollTo(0, 0); // Volver al inicio de la página
  });

  // Activar scroll infinito para cargar más películas
  window.addEventListener('scroll', loadMoreMovies);
});

// Manejar la búsqueda
function handleSearch(query) {
  if (query.length > 0) {
    currentQuery = query;
    currentPage = 1;
    isLoading = false;

    hideCategorySections();

    const resultsSection = document.getElementById('resultsSection');
    const resultsList = document.getElementById('resultsList');
    resultsSection.style.display = 'block'; // Mostrar la sección de resultados
    resultsList.innerHTML = ''; // Limpiar resultados anteriores

    // Mostrar GIF de carga
    toggleLoading(true);
    fetchMovies(query, resultsList, currentPage);
  }
}

// Restablecer vista cuando no haya texto en la barra de búsqueda o al pulsar Inicio
function resetSearch() {
  const resultsSection = document.getElementById('resultsSection');
  const resultsList = document.getElementById('resultsList');

  resultsSection.style.display = 'none'; // Ocultar la sección de resultados
  resultsList.innerHTML = ''; // Limpiar resultados anteriores
  showCategorySections(); // Mostrar nuevamente todas las categorías
  currentQuery = ''; // Resetear la búsqueda
  currentPage = 1; // Volver a la primera página
}

// Mostrar las categorías
function showCategorySections() {
  const categories = ['recommendedSection', 'actionSection', 'comedySection', 'dramaSection', 'horrorSection'];
  categories.forEach(category => {
    const categorySection = document.getElementById(category);
    if (categorySection) {
      categorySection.style.display = 'block'; // Mostrar cada categoría
    }
  });
}

// Ocultar las secciones de categorías
function hideCategorySections() {
  const categories = ['recommendedSection', 'actionSection', 'comedySection', 'dramaSection', 'horrorSection'];
  categories.forEach(category => {
    const categorySection = document.getElementById(category);
    if (categorySection) {
      categorySection.style.display = 'none'; // Ocultar cada categoría
    }
  });
}

// Cargar películas recomendadas
function loadRecommended() {
  fetchMovies('Marvel', document.getElementById('recommendedList')); // Puedes cambiar el término "Marvel" por cualquier categoría
}

// Cargar películas por categorías
function loadCategory(keyword, containerId) {
  fetchMovies(keyword, document.getElementById(containerId));
}

// Obtener películas desde la API
function fetchMovies(query, container, page = 1) {
  const url = `${API_URL}&s=${encodeURIComponent(query)}&page=${page}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.Response === 'True') {
        container.innerHTML += data.Search.map(movie => createMovieCard(movie)).join('');
        isLoading = false;
      } else if (page === 1 && container === document.getElementById('resultsList')) {
        container.innerHTML = `<p>No se encontraron resultados para "${query}".</p>`;
        isLoading = false;
      }
      // Ocultar GIF de carga
      toggleLoading(false);
    })
    .catch(error => {
      console.error('Error al cargar películas:', error);
      if (page === 1 && container === document.getElementById('resultsList')) {
        container.innerHTML = `<p>Error al cargar los datos. Por favor, intenta nuevamente.</p>`;
      }
      // Ocultar GIF de carga
      toggleLoading(false);
    });
}

// Crear tarjeta de película
function createMovieCard(movie) {
  const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x200?text=No+Image';
  return `
    <div class="movie-card" onclick="showMovieDetails('${movie.imdbID}')">
      <img src="${poster}" alt="${movie.Title}">
    </div>
  `;
}

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

// Función que detecta el scroll infinito y carga más películas
function loadMoreMovies() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
    isLoading = true;
    currentPage++;
    if (currentQuery) {
      fetchMovies(currentQuery, document.getElementById('resultsList'), currentPage);
    } else {
      fetchMovies('Marvel', document.getElementById('recommendedList'), currentPage); // O cualquier otra categoría
    }
  }
}

// Mostrar u ocultar el GIF de carga
function toggleLoading(show) {
  const loadingContainer = document.getElementById('loadingContainer');
  loadingContainer.style.display = show ? 'block' : 'none';
}
