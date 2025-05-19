// Initialize Swiper
let swiper;

let movies=[];
// Fetch movies from our JSON API
async function fetchMovies() {
    try {
        const response = await fetch('movies.json');
        if (!response.ok) {
            throw new Error('Failed to fetch movies');
        }
        const data = await response.json();
        movies = data.results;
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        document.getElementById('movies-grid').innerHTML = `
            <div class="loading">
                Error loading movies. Please try again later.
            </div>
        `;
        return [];
    }
}

// Set up the featured movie in the hero section
function setupFeaturedMovie(movie) {
    const homeImage = document.getElementById('home-image');
    const homeTitle = document.getElementById('home-title');
    const releaseDate = document.getElementById('release-date');
    const featuredMovieLink = document.getElementById('featured-movie-link');
    
    // Set the backdrop image
    const backdropUrl = movie.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : 'https://via.placeholder.com/1920x1080?text=No+Backdrop';
    
    homeImage.src = backdropUrl;
    homeImage.alt = movie.title;
    
    // Set the title and release date
    homeTitle.textContent = movie.title;
    releaseDate.textContent = `Release: ${new Date(movie.release_date).getFullYear()}`;
    
    // Set the link to the movie detail page
    featuredMovieLink.href = `movie.html?id=${movie.id}`;
}

// Create movie cards for the popular section (swiper)
function setupPopularMovies(movies) {
    const popularMoviesContainer = document.getElementById('popular-movies');
    
    // Take the top 10 movies for the popular section
    const popularMovies = movies.slice(0, 10);
    
    // Create a slide for each popular movie
    popularMovies.forEach(movie => {
        const imageUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';
            
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="movie-box">
                <img src="${imageUrl}" alt="${movie.title}" class="movie-box-img">
                <div class="box-text">
                    <h2 class="movie-title">${movie.title}</h2>
                    <span class="movie-type">${new Date(movie.release_date).getFullYear()}</span>
                    <a href="movie.html?id=${movie.id}" class="watch-btn play-btn">
                        <i class='bx bx-right-arrow'></i>
                    </a>
                </div>
            </div>
        `;
        
        popularMoviesContainer.appendChild(slide);
    });
    
    // Initialize Swiper
    swiper = new Swiper('.popular-content', {
        slidesPerView: 1,
        spaceBetween: 10,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            280: {
                slidesPerView: 1,
                spaceBetween: 10,
            },
            320: {
                slidesPerView: 2,
                spaceBetween: 10,
            },
            510: {
                slidesPerView: 2,
                spaceBetween: 10,
            },
            758: {
                slidesPerView: 3,
                spaceBetween: 15,
            },
            900: {
                slidesPerView: 4,
                spaceBetween: 20,
            },
        },
    });
}

// Create movie cards for the movies grid
function setupMoviesGrid(movies) {
    const moviesGrid = document.getElementById('movies-grid');
    
    // Clear any existing content
    moviesGrid.innerHTML = '';
    
    // Create a card for each movie
    movies.forEach(movie => {
        const imageUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';
            
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-box';
        movieCard.innerHTML = `
            <img src="${imageUrl}" alt="${movie.title}" class="movie-box-img">
            <div class="box-text">
                <h2 class="movie-title">${movie.title}</h2>
                <span class="movie-type">${new Date(movie.release_date).getFullYear()}</span>
                <a href="movie.html?id=${movie.id}" class="watch-btn play-btn">
                    <i class='bx bx-right-arrow'></i>
                </a>
            </div>
        `;
        
        moviesGrid.appendChild(movieCard);
    });
}

// Set up search functionality
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    
    searchInput.addEventListener('keyup', async (e) => {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm.length > 0) {
                const movies = await fetchMovies();
                const filteredMovies = movies.filter(movie => 
                    movie.title.toLowerCase().includes(searchTerm)
                );
                
                setupMoviesGrid(filteredMovies);
                
                // Scroll to movies section
                document.getElementById('movies').scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
}

// Initialize the page
async function init() {
    const movies = await fetchMovies();
    
    if (movies.length > 0) {
        // Set up the featured movie (first movie with a backdrop)

        const randomIndex = Math.floor(Math.random() * movies.length);
        const randomMovie = movies[randomIndex];
        setupFeaturedMovie(randomMovie);

        
        // Set up the popular movies section
        setupPopularMovies(movies);
        
        // Set up the movies grid
        setupMoviesGrid(movies);
        
        // Set up search functionality
        setupSearch();
    }
}

// Run the initialization when the page loads
document.addEventListener('DOMContentLoaded', init);