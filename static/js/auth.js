// User Authentication functions

// DOM Elements for Login page
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginErrorMsg = document.getElementById('loginErrorMsg');

// DOM Elements for Signup page
const signupForm = document.getElementById('signupForm');
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPassword = document.getElementById('signupPassword');
const signupConfirmPassword = document.getElementById('signupConfirmPassword');
const signupErrorMsg = document.getElementById('signupErrorMsg');

// Sample users array for demonstration
const sampleUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "test1234"
  }
];

// Function to handle login
function handleLogin(e) {
  if (loginForm) {
    e.preventDefault();
    
    // Basic validation
    if (!loginEmail.value || !loginPassword.value) {
      showError(loginErrorMsg, "Please fill in all fields");
      return;
    }
    
    // Email format validation
    if (!validateEmail(loginEmail.value)) {
      showError(loginErrorMsg, "Please enter a valid email address");
      return;
    }
    
    // Check credentials via server request
    fetch('/api/login', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      email: loginEmail.value,
      password: loginPassword.value
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
      const user = data.user;

      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      }));

      // Redirect to dashboard
      window.location.href = "/dashboard";
      } else {
      showError(loginErrorMsg, data.message || "Invalid email or password");
      }
    })
    .catch(error => {
      console.error('Error during login:', error);
      showError(loginErrorMsg, "An error occurred. Please try again later.");
    });
    
    if (user) {
      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      }));
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } else {
      showError(loginErrorMsg, "Invalid email or password");
    }
  }
}

// Function to handle signup
function handleSignup(e) {
  if (signupForm) {
    e.preventDefault();
    
    // Basic validation
    if (!signupName.value || !signupEmail.value || !signupPassword.value || !signupConfirmPassword.value) {
      showError(signupErrorMsg, "Please fill in all fields");
      return;
    }
    
    // Email format validation
    if (!validateEmail(signupEmail.value)) {
      showError(signupErrorMsg, "Please enter a valid email address");
      return;
    }
    
    // Password match validation
    if (signupPassword.value !== signupConfirmPassword.value) {
      showError(signupErrorMsg, "Passwords do not match");
      return;
    }
    
    // Password strength validation
    if (signupPassword.value.length < 8) {
      showError(signupErrorMsg, "Password must be at least 8 characters long");
      return;
    }
    
    // Create new user via server request
    fetch('/api/signup', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({
      name: signupName.value,
      email: signupEmail.value,
      password: signupPassword.value
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
      const newUser = data.user;

      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }));

      // Redirect to dashboard
      window.location.href = "/dashboard";
      } else {
      showError(signupErrorMsg, data.message || "Email already in use or an error occurred during signup");
      }
    })
    .catch(error => {
      console.error('Error during signup:', error);
      showError(signupErrorMsg, "An error occurred. Please try again later.");
    });
    
    // Store user info in localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }));
    
    // Redirect to dashboard
    window.location.href = "/dashboard";
  }
}

// Helper function to show error messages
function showError(element, message) {
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
    
    // Hide the error message after 3 seconds
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
}

// Helper function to validate email format
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Function to check if user is logged in
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  
  // Protect authenticated pages
  if (!currentUser && window.location.pathname !== '/' && 
      window.location.pathname !== '/login' && 
      window.location.pathname !== '/signup') {
    window.location.href = '/login';
  }
  
  // Redirect logged in users from login/signup pages
  if (currentUser && (window.location.pathname === '/login' || 
                       window.location.pathname === '/signup')) {
    window.location.href = '/dashboard';
  }
  
  // Update navigation based on auth status
  updateNavigation(!!currentUser);
}

// Function to update navigation based on auth status
function updateNavigation(isLoggedIn) {
  const authNav = document.getElementById('authNav');
  const mainNav = document.getElementById('mainNav');
  
  if (authNav && mainNav) {
    if (isLoggedIn) {
      authNav.style.display = 'none';
      mainNav.style.display = 'flex';
      
      // Update user name in navigation if available
      const userNameElement = document.getElementById('userName');
      if (userNameElement) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.name) {
          userNameElement.textContent = currentUser.name;
        }
      }
    } else {
      authNav.style.display = 'flex';
      mainNav.style.display = 'none';
    }
  }
}

// Function to handle logout
function logout() {
  console.log('Logout function called');
  localStorage.removeItem('currentUser');
  window.location.href = '/login';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
