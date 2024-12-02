const API_URL = "https://www.omdbapi.com/?apikey=5d6cf565";
let debounceTimer;

// Mostrar u ocultar el indicador de carga
function toggleLoading(show) {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = show ? "block" : "none";
}

// Buscar películas dinámicamente al escribir en el input
function searchMovies() {
    const query = document.getElementById("search").value.trim();

    // Si no hay texto, limpia la lista de películas
    if (query.length === 0) {
        document.getElementById("movieList").innerHTML = "";
        return;
    }

    // Evita enviar demasiadas solicitudes con un temporizador (debounce)
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        toggleLoading(true);

        fetch(`${API_URL}&s=${query}`)
            .then(response => response.json())
            .then(data => {
                toggleLoading(false);

                if (data.Response === "True") {
                    displayMovies(data.Search);
                } else {
                    document.getElementById("movieList").innerHTML = `<p>No se encontraron resultados para "${query}".</p>`;
                }
            })
            .catch(error => {
                toggleLoading(false);
                console.error("Error al buscar películas:", error);
            });
    }, 500); // Esperar 500ms antes de realizar la búsqueda
}

// Mostrar las películas encontradas
function displayMovies(movies) {
    const movieList = document.getElementById("movieList");
    movieList.innerHTML = ""; // Limpiar la lista anterior

    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.className = "movie-item";
        movieElement.innerHTML = `
            <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150x200"}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <p>Año: ${movie.Year}</p>
        `;
        movieList.appendChild(movieElement);
    });
}

// Generar informes según el filtro seleccionado
function generateReport(type) {
    const movieList = document.querySelectorAll(".movie-item");
    const movies = Array.from(movieList).map(movie => movie.querySelector("h3").innerText);

    const movieData = [];
    const labels = [];

    // Obtener detalles de cada película para el informe
    Promise.all(
        movies.map(title =>
            fetch(`${API_URL}&t=${title}`)
                .then(response => response.json())
                .then(details => {
                    if (details.Response === "True") {
                        const value =
                            type === "imdbRating"
                                ? parseFloat(details.imdbRating)
                                : parseInt(details.imdbVotes.replace(/,/g, ""));
                        if (!isNaN(value)) {
                            movieData.push({ value, title: details.Title });
                        }
                    }
                })
        )
    ).then(() => {
        // Ordenar las películas por valor (IMDB Rating o Votes)
        movieData.sort((a, b) => b.value - a.value);

        // Tomar las 5 mejores
        const top5Movies = movieData.slice(0, 5);
        const top5Values = top5Movies.map(movie => movie.value);
        const top5Labels = top5Movies.map(movie => movie.title);

        renderChart(top5Values, top5Labels, type);
    });
}

// Renderizar el gráfico
function renderChart(data, labels, type) {
    const ctx = document.getElementById("chart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: type === "imdbRating" ? "Valoración IMDB" : "Votos IMDB",
                    data: data,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                    borderColor: "rgba(54, 162, 235, 1)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}
