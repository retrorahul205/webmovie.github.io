document.addEventListener('DOMContentLoaded', function() {
  displayFavorites();
  updateUserInfo();
});

function displayFavorites() {
  const favoritesContainer = document.getElementById('favorites-container');
  const favorites = getFavorites();
  
  if (favorites.length === 0) {
      favoritesContainer.innerHTML = `
          <div class="no-favorites">
              <p>You haven't added any movies to your favorites yet.</p>
              <p>Go to the movies page and click the heart icon to add movies to your favorites.</p>
          </div>
      `;
      return;
  }
  
  favoritesContainer.innerHTML = '';
  
  favorites.forEach(movie => {
      const movieElement = document.createElement('div');
      movieElement.className = 'movie-card';
      
      const imgPath = movie.poster_path 
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : 'placeholder.svg?height=750&width=500';
      
      movieElement.innerHTML = `
          <a href="movie.html?id=${movie.id}">
              <img src="${imgPath}" alt="${movie.title}">
              <div class="movie-info">
                  <h3>${movie.title}</h3>
                  <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
              </div>
          </a>
          <button class="remove-favorite-btn" data-id="${movie.id}">X</button>
      `;
      
      favoritesContainer.appendChild(movieElement);
  });
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-favorite-btn').forEach(button => {
      button.addEventListener('click', function(e) {
          e.preventDefault();
          const movieId = parseInt(this.getAttribute('data-id'));
          removeFromFavorites(movieId);
      });
  });
}

function getFavorites() {
  const favorites = localStorage.getItem('favoriteMovies');
  return favorites ? JSON.parse(favorites) : [];
}

function removeFromFavorites(movieId) {
  let favorites = getFavorites();
  
  // Find movie to get its title for the alert
  const movie = favorites.find(m => m.id === movieId);
  const movieTitle = movie ? movie.title : 'Movie';
  
  favorites = favorites.filter(movie => movie.id !== movieId);
  localStorage.setItem('favoriteMovies', JSON.stringify(favorites));
  
  // Show alert
  alert(`"${movieTitle}" has been removed from your favorites!`);
  
  displayFavorites();
}

function updateUserInfo() {
  const userInfoElement = document.getElementById('user-info');
  if (!userInfoElement) return; // Skip if element doesn't exist
  
  const user = localStorage.getItem('user');
  
  if (user) {
      const userData = JSON.parse(user);
      userInfoElement.innerHTML = `
          <span>Welcome, ${userData.username}</span>
          <a href="#" id="logout-btn">Logout</a>
      `;
      
      document.getElementById('logout-btn').addEventListener('click', function(e) {
          e.preventDefault();
          localStorage.removeItem('user');
          window.location.href = 'login.html';
      });
  }
}