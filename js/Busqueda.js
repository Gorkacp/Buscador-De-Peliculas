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

  searchButton.addEventListener('click', () => handleSearch(searchBar.value.trim()));

  searchBar.addEventListener('input', () => {
    if (searchBar.value.trim().length >= 3) {
      handleSearch(searchBar.value.trim());
    }
  });
});

// Manejar la búsqueda
function handleSearch(query) {
  if (query.length > 0) {
    currentQuery = query;
    currentPage = 1;
    isLoading = false;

    // Mostrar resultados sin eliminar categorías
    const resultsSection = document.getElementById('results');
    resultsSection.style.display = 'block';
    resultsSection.querySelector('h2').textContent = `Resultados para "${query}"`;
    const resultsList = document.getElementById('resultsList');
    resultsList.innerHTML = ''; // Limpiar resultados anteriores

    // Cargar primeros resultados de la búsqueda
    fetchMovies(query, resultsList, currentPage);
  }
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
      } else if (page === 1 && container === document.getElementById('resultsList')) {
        container.innerHTML = `<p>No se encontraron resultados para "${query}".</p>`;
      }
      isLoading = false;
    })
    .catch(error => {
      console.error('Error al cargar películas:', error);
      if (page === 1 && container === document.getElementById('resultsList')) {
        container.innerHTML = `<p>Error al cargar los datos. Por favor, intenta nuevamente.</p>`;
      }
      isLoading = false;
    });
}
