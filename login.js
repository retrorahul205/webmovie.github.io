document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      // Simple validation
      if (username && password) {
        // In a real app, you would validate with a server
        // For demo purposes, we'll just store in localStorage
        localStorage.setItem('user', JSON.stringify({ username }));
        
        // Redirect to home page
        window.location.href = 'index.html';
      }
    });
  });