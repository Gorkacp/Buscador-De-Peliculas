document.getElementById('showMoreRecommended').addEventListener('click', function() {
    toggleCategory('recommended');
    loadMoreMovies('recommended');
  });
  
  document.getElementById('showMoreAction').addEventListener('click', function() {
    toggleCategory('action');
    loadMoreMovies('action');
  });
  
  document.getElementById('showMoreComedy').addEventListener('click', function() {
    toggleCategory('comedy');
    loadMoreMovies('comedy');
  });
  
  document.getElementById('showMoreDrama').addEventListener('click', function() {
    toggleCategory('drama');
    loadMoreMovies('drama');
  });
  
  document.getElementById('showMoreHorror').addEventListener('click', function() {
    toggleCategory('horror');
    loadMoreMovies('horror');
  });
  
  // Función para alternar la clase de expansión de cada categoría
  function toggleCategory(category) {
    const container = document.getElementById(`${category}List`);
    container.classList.toggle('expanded');  // Alterna la clase "expanded"
  }
  
  // Función para cargar más películas de la API
  function loadMoreMovies(category) {
    fetchMoviesFromAPI(category).then(movies => {
      const container = document.getElementById(`${category}List`);
  
      // Añadir las películas al contenedor
      movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        container.appendChild(movieCard);
      });
    }).catch(error => {
      console.error('Error al cargar películas:', error);
    });
  }
  
  // Función para obtener películas desde la API
  function fetchMoviesFromAPI(category) {
    const apiKey = 'your_api_key_here'; // Reemplaza con tu clave de API
    const baseUrl = 'https://www.omdbapi.com/?apikey=' + apiKey;
    let query = '';
  
    // Define la consulta según la categoría
    switch (category) {
      case 'recommended':
        query = '&s=recommendations';  // Asegúrate de usar una categoría o palabra clave válida
        break;
      case 'action':
        query = '&s=action';
        break;
      case 'comedy':
        query = '&s=comedy';
        break;
      case 'drama':
        query = '&s=drama';
        break;
      case 'horror':
        query = '&s=horror';
        break;
      default:
        query = '&s=all';
    }
  
    // Realiza la solicitud de la API
    return fetch(baseUrl + query)
      .then(response => response.json())
      .then(data => {
        if (data.Response === 'True') {
          return data.Search;  // Retorna las películas encontradas
        } else {
          throw new Error('No se encontraron películas');
        }
      })
      .catch(error => {
        console.error('Error en la solicitud a la API:', error);
        return [];
      });
  }
  
  // Función para crear una tarjeta de película
  function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
  
    const movieImage = document.createElement('img');
    movieImage.src = movie.Poster; // Usa el valor Poster de la API
    movieImage.alt = movie.Title;
    movieImage.classList.add('movie-poster');
    movieCard.appendChild(movieImage);
  
    const movieTitle = document.createElement('h3');
    movieTitle.textContent = movie.Title;
    movieCard.appendChild(movieTitle);
  
    const movieRating = document.createElement('div');
    movieRating.classList.add('movie-rating');
    movieRating.textContent = `Rating: ${movie.imdbRating || 'N/A'}`;
    movieCard.appendChild(movieRating);
  
    return movieCard;
  }
  