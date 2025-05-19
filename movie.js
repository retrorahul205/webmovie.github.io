// Get movie ID from URL parameters
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch movie details from our JSON API
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch('movies.json');
        if (!response.ok) {
            throw new Error('Failed to fetch movies');
        }
        const data = await response.json();
        
        // Find the movie with the matching ID
        const movie = data.results.find(m => m.id.toString() === movieId);
        
        if (movie) {
            // Store all movies for similar movies section
            movie.allMovies = data.results;
            return movie;
        }
        
        throw new Error('Movie not found');
    } catch (error) {
        console.error('Error fetching movie details:', error);
        document.body.innerHTML = `
            <div class="container" style="text-align: center; padding: 50px; margin-top: 100px;">
                <h1>Error</h1>
                <p>Failed to load movie details. Please try again later.</p>
                <a href="index.html" class="back-button">
                    <i class='bx bx-left-arrow-alt'></i>
                    Back to Movies
                </a>
            </div>
        `;
        return null;
    }
}

// Helper function to handle image paths
function getImageUrl(path) {
    // If path starts with http or https, it's already a full URL
    if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
        return path;
    }
    
    // If path starts with /, it's a TMDB path and needs the base URL
    if (path && path.startsWith('/')) {
        return `https://image.tmdb.org/t/p/original${path}`;
    }
    
    // If no valid path, return placeholder
    return 'https://via.placeholder.com/500x750?text=No+Image';
}

// Display movie details on the page
function displayMovieDetails(movie) {
    // Set page title
    document.title = `${movie.title} - EntertainHub`;
    
    // Set movie title
    document.getElementById('movie-title').textContent = movie.title;
    
    // Set backdrop image - handle TMDB paths
    const backdropUrl = getImageUrl(movie.backdrop_path);
    
    document.getElementById('backdrop').innerHTML = `
        <img src="${backdropUrl}" alt="${movie.title} backdrop">
    `;
    
    // Set movie metadata
    document.getElementById('movie-meta').innerHTML = `
        <span><i class='bx bx-calendar'></i> ${new Date(movie.release_date).getFullYear()}</span>
        <span><i class='bx bx-star'></i> ${movie.vote_average.toFixed(1)}</span>
        <span><i class='bx bx-time'></i> ${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m</span>
    `;
    
    // Set movie poster - handle TMDB paths
    const posterUrl = getImageUrl(movie.poster_path);
    
    document.getElementById('movie-poster').innerHTML = `
        <img src="${posterUrl}" alt="${movie.title} poster">
    `;
    
    // Set movie overview
    document.getElementById('movie-overview').textContent = movie.overview;
    
    // Set movie genres
    const genresContainer = document.getElementById('movie-genres');
    genresContainer.innerHTML = '';
    
    if (movie.genres && movie.genres.length > 0) {
        movie.genres.forEach(genre => {
            const genreTag = document.createElement('span');
            genreTag.className = 'genre-tag';
            genreTag.textContent = genre.name;
            genresContainer.appendChild(genreTag);
        });
    } else {
        genresContainer.innerHTML = '<span class="genre-tag">No genres available</span>';
    }
    
    // Set movie cast with real data
    const castContainer = document.getElementById('movie-cast');
    castContainer.innerHTML = '';

    if (movie.actors && movie.actors.length > 0) {
        movie.actors.forEach(actor => {
            const castItem = document.createElement('div');
            castItem.className = 'cast-item';
            
            // Use direct image URL if available, otherwise use placeholder
            const imgUrl = actor.profile_path || 'https://via.placeholder.com/80x80?text=No+Image';
                
            castItem.innerHTML = `
                <a href="${actor.wiki_url}" target="_blank" class="actor-link">
                    <img src="${imgUrl}" alt="${actor.name}" class="cast-img">
                    <p class="cast-name">${actor.name}</p>
                    <p class="cast-character">${actor.character || ''}</p>
                </a>
            `;
            
            castContainer.appendChild(castItem);
        });
    } else {
        castContainer.innerHTML = '<p>No cast information available</p>';
    }

    // Embed YouTube Trailer
    const youtubeContainer = document.getElementById('youtube-player');
    if (movie.youtubeEmbedId) {
        youtubeContainer.innerHTML = `
            <iframe width="100%" height="400" 
                src="https://www.youtube.com/embed/${movie.youtubeEmbedId}" 
                frameborder="0" 
                allowfullscreen 
                title="${movie.title} Trailer">
            </iframe>
        `;
    } else {
        youtubeContainer.innerHTML = '<p>No trailer available</p>';
    }

    // Display similar movies
    displaySimilarMovies(movie);

    // Update favorite button state
    updateFavoriteButtonState(movie);
}

// Find and display similar movies based on genres
function displaySimilarMovies(currentMovie) {
    // Create similar movies section if it doesn't exist
    if (!document.getElementById('similar-movies-section')) {
        const movieInfo = document.querySelector('.movie-info');
        
        const similarMoviesSection = document.createElement('div');
        similarMoviesSection.className = 'movie-section';
        similarMoviesSection.id = 'similar-movies-section';
        similarMoviesSection.innerHTML = `
            <h2>Similar Movies</h2>
            <div id="similar-movies" class="similar-movies-list"></div>
        `;
        
        movieInfo.appendChild(similarMoviesSection);
    }
    
    const similarMoviesContainer = document.getElementById('similar-movies');
    similarMoviesContainer.innerHTML = '';
    
    // Get current movie genres
    const currentGenreIds = currentMovie.genres.map(genre => genre.id);
    
    // Find movies with similar genres (at least one matching genre)
    const similarMovies = currentMovie.allMovies.filter(movie => {
        if (movie.id === currentMovie.id) return false; // Skip current movie
        
        // Check if this movie shares at least one genre with current movie
        const movieGenreIds = movie.genres.map(genre => genre.id);
        return movieGenreIds.some(genreId => currentGenreIds.includes(genreId));
    });
    
    // Sort by number of matching genres (most similar first)
    similarMovies.sort((a, b) => {
        const aMatchCount = a.genres.filter(genre => currentGenreIds.includes(genre.id)).length;
        const bMatchCount = b.genres.filter(genre => currentGenreIds.includes(genre.id)).length;
        return bMatchCount - aMatchCount;
    });
    
    // Display up to 4 similar movies
    const moviesToShow = similarMovies.slice(0, 4);
    
    if (moviesToShow.length > 0) {
        moviesToShow.forEach(movie => {
            // Handle TMDB paths for similar movie posters
            const posterUrl = getImageUrl(movie.poster_path);
                
            const similarMovieItem = document.createElement('div');
            similarMovieItem.className = 'similar-movie-item';
            similarMovieItem.innerHTML = `
                <a href="movie.html?id=${movie.id}">
                    <img src="${posterUrl}" alt="${movie.title}" class="similar-movie-img">
                    <p class="similar-movie-title">${movie.title}</p>
                    <p class="similar-movie-rating"><i class='bx bx-star'></i> ${movie.vote_average.toFixed(1)}</p>
                </a>
            `;
            
            similarMoviesContainer.appendChild(similarMovieItem);
        });
    } else {
        similarMoviesContainer.innerHTML = '<p>No similar movies found</p>';
    }
}

// Favorites functionality
function getFavorites() {
    const favorites = localStorage.getItem('favoriteMovies');
    return favorites ? JSON.parse(favorites) : [];
}

function isMovieInFavorites(movieId) {
    const favorites = getFavorites();
    return favorites.some(movie => movie.id === parseInt(movieId));
}

function updateFavoriteButtonState(movie) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const isInFavorites = isMovieInFavorites(movie.id);
    
    if (isInFavorites) {
        favoriteBtn.innerHTML = `
            <i class='bx bxs-heart' style="color:white;"></i>
            <span>Remove from Favorites</span>
        `;
        favoriteBtn.classList.add('remove-favorite');
    } else {
        favoriteBtn.innerHTML = `
            <i class='bx bxs-happy-heart-eyes'></i>
            <span>Add to Favorites</span>
        `;
        favoriteBtn.classList.remove('remove-favorite');
    }
}

function toggleFavorite(movie) {
    const favorites = getFavorites();
    const isInFavorites = isMovieInFavorites(movie.id);
    
    if (isInFavorites) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(item => item.id !== movie.id);
        localStorage.setItem('favoriteMovies', JSON.stringify(updatedFavorites));
        alert(`"${movie.title}" has been removed from your favorites!`);
    } else {
        // Add to favorites
        const movieToAdd = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date
        };
        favorites.push(movieToAdd);
        localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
        alert(`"${movie.title}" has been added to your favorites!`);
    }
    
    // Update button state
    updateFavoriteButtonState(movie);
}

// Initialize the page
async function init() {
    const movieId = getMovieIdFromUrl();
    
    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }
    
    const movie = await fetchMovieDetails(movieId);
    if (movie) {
        // Add runtime and genres if they don't exist (for demo purposes)
        if (!movie.runtime) {
            movie.runtime = Math.floor(Math.random() * 60) + 90; // Random runtime between 90-150 minutes
        }
        
        if (!movie.genres) {
            movie.genres = [
                { id: 1, name: "Action" },
                { id: 2, name: "Drama" },
                { id: 3, name: "Sci-Fi" }
            ];
        }
        
        displayMovieDetails(movie);
        
        // Add event listener to favorite button
        const favoriteBtn = document.getElementById('favoriteBtn');
        favoriteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleFavorite(movie);
        });
    }
}

// Run the initialization when the page loads
document.addEventListener('DOMContentLoaded', init);