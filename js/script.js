const API_KEY = '5d6cf565'; 
const API_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;
let currentPage = 1;
let currentQuery = '';
let currentType = 'movie'; // Tipo por defecto es "movie"
let isLoading = false;
let moviesData = []; // Array para almacenar las películas cargadas

document.addEventListener('DOMContentLoaded', () => {
  // Cargar contenido inicial
  loadRecommended();
  ['Action', 'Comedy', 'Drama', 'Horror'].forEach(category => loadCategory(category, `${category.toLowerCase()}List`));

  // Eventos para búsqueda y navegación
  const searchButton = document.getElementById('searchButton');
  const searchBar = document.getElementById('searchBar');
  const navInicio = document.querySelector('nav a[href="#inicio"]');

  // Evento para los filtros de tipo de contenido
  const typeRadios = document.getElementsByName('type');
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentType = e.target.value; // Actualiza el tipo de contenido según la selección
    });
  });

  searchButton.addEventListener('click', () => handleSearch(searchBar.value.trim()));
  searchBar.addEventListener('input', () => handleSearch(searchBar.value.trim()));
  navInicio.addEventListener('click', (e) => {
    e.preventDefault();
    resetSearch();
    window.scrollTo(0, 0);
  });

  // Scroll infinito
  window.addEventListener('scroll', loadMoreMovies);

  // Botones para generar gráficos
  document.getElementById('mostRatedButton').addEventListener('click', () => {
    resetChart(); // Destruir gráfico anterior
    generateReport('imdbRating'); // Generar el informe con base en la valoración IMDB
  });

  document.getElementById('mostVotedButton').addEventListener('click', () => {
    resetChart(); // Destruir gráfico anterior
    generateReport('imdbVotes'); // Generar el informe con base en votos
  });
});

// Manejar la búsqueda
function handleSearch(query) {
  if (query.length === 0) {
    resetSearch();
    return;
  }
  currentQuery = query;
  currentPage = 1;
  isLoading = false;
  moviesData = []; // Limpiar los datos de películas al hacer una nueva búsqueda

  hideCategorySections();

  const resultsSection = document.getElementById('resultsSection');
  const resultsList = document.getElementById('resultsList');
  resultsSection.style.display = 'block';
  resultsList.innerHTML = ''; // Limpiar la lista de resultados

  toggleLoading(true);
  fetchMovies(query, resultsList, currentPage, currentType); // Modificado para pasar el tipo de contenido
}

// Resetear la vista
function resetSearch() {
  const resultsSection = document.getElementById('resultsSection');
  const resultsList = document.getElementById('resultsList');
  resultsSection.style.display = 'none';
  resultsList.innerHTML = '';
  showCategorySections();
  currentQuery = '';
  currentPage = 1;

  // Limpiar los datos de películas anteriores
  moviesData = [];
  resetChart(); // Limpiar el gráfico cuando se resetee la búsqueda
}

// Mostrar y ocultar categorías
function showCategorySections() {
  ['recommendedSection', 'actionSection', 'comedySection', 'dramaSection', 'horrorSection'].forEach(category => {
    document.getElementById(category).style.display = 'block';
  });
}

function hideCategorySections() {
  ['recommendedSection', 'actionSection', 'comedySection', 'dramaSection', 'horrorSection'].forEach(category => {
    document.getElementById(category).style.display = 'none';
  });
}

// Cargar películas recomendadas
function loadRecommended() {
  fetchMovies('Marvel', document.getElementById('recommendedList'), 1, 'movie'); // Solo películas por defecto
}

// Cargar películas por categoría
function loadCategory(keyword, containerId) {
  fetchMovies(keyword, document.getElementById(containerId), 1, 'movie'); // Solo películas por defecto
}

// Obtener películas desde la API
function fetchMovies(query, container, page = 1, type = 'movie') {
  const url = `${API_URL}&s=${encodeURIComponent(query)}&page=${page}&type=${type}`; // Incluye el tipo en la URL
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.Response === 'True') {
        container.innerHTML += data.Search.map(movie => createMovieCard(movie)).join('');
        moviesData.push(...data.Search);
        isLoading = false;
      } else if (page === 1 && container === document.getElementById('resultsList')) {
        container.innerHTML = `<p>No se encontraron resultados para "${query}".</p>`;
      }
      toggleLoading(false);
    })
    .catch(() => {
      if (page === 1 && container === document.getElementById('resultsList')) {
        container.innerHTML = `<p>Error al cargar los datos.</p>`;
      }
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

// Mostrar detalles de una película
function showMovieDetails(imdbID) {
  const modal = document.getElementById('movieModal');
  const modalContent = document.getElementById('modalDetails');
  modal.classList.remove('hidden');

  fetch(`${API_URL}&i=${imdbID}`)
    .then(response => response.json())
    .then(movie => {
      if (movie.Response === 'True') {
        modalContent.innerHTML = `
          <div class="movie-details">
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150x200?text=No+Image'}" alt="${movie.Title}">
            <div>
              <h3>${movie.Title}</h3>
              <p><strong>Director:</strong> ${movie.Director}</p>
              <p><strong>Actores:</strong> ${movie.Actors}</p>
              <p><strong>Genero:</strong> ${movie.Genre}</p>
              <p><strong>Descripción:</strong> ${movie.Plot}</p>
              <p><strong>Año:</strong> ${movie.Year}</p>
            </div>
          </div>
        `;
      }
    })
    .catch(() => {
      modalContent.innerHTML = `<p>Error al cargar los detalles.</p>`;
    });
}

// Cerrar el modal
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('movieModal').classList.add('hidden');
});

// Scroll infinito
function loadMoreMovies() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
    isLoading = true;
    currentPage++;
    if (currentQuery) {
      fetchMovies(currentQuery, document.getElementById('resultsList'), currentPage, currentType); // Modificado para pasar el tipo de contenido
    }
  }
}

// Mostrar y ocultar cargando
function toggleLoading(show) {
  document.getElementById('loadingContainer').style.display = show ? 'block' : 'none';
}

// Generar informes
function generateReport(type) {
  const movieData = [];
  Promise.all(
    moviesData.map(movie =>
      fetch(`${API_URL}&i=${movie.imdbID}`)
        .then(response => response.json())
        .then(details => {
          if (details.Response === 'True') {
            const value = type === 'imdbRating' ? parseFloat(details.imdbRating) : parseInt(details.imdbVotes.replace(/,/g, ''));
            if (!isNaN(value)) movieData.push({ title: details.Title, value });
          }
        })
    )
  ).then(() => {
    const top5 = movieData.sort((a, b) => b.value - a.value).slice(0, 5);
    renderChart(top5.map(m => m.value), top5.map(m => m.title), type);
  });
}

// Render gráfico
function renderChart(data, labels, type) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (window.chartInstance) window.chartInstance.destroy(); // Destruir gráfico anterior
  window.chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: type === 'imdbRating' ? 'Rating IMDB' : 'Votes IMDB',
        data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    }
  });
}

// Resetear gráfico
function resetChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  if (window.chartInstance) window.chartInstance.destroy();
}
