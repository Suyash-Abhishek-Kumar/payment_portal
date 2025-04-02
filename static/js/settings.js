// Settings page functionality

// Function to initialize settings page
function initializeSettingsPage() {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }
  
  // Load user profile data
  loadUserProfile();
  
  // Initialize profile form
  initializeProfileForm();
  
  // Initialize password form
  initializePasswordForm();
  
  // Initialize notification preferences
  initializeNotificationPreferences();
  
  // Initialize appearance settings
  initializeAppearanceSettings();
}

// Function to load user profile data
function loadUserProfile() {
  const profileNameField = document.getElementById('profileName');
  const profileEmailField = document.getElementById('profileEmail');
  
  if (!profileNameField || !profileEmailField) return;
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (currentUser) {
    profileNameField.value = currentUser.name || '';
    profileEmailField.value = currentUser.email || '';
  }
}

// Function to initialize profile form
function initializeProfileForm() {
  const profileForm = document.getElementById('profileForm');
  const profileSuccessMsg = document.getElementById('profileSuccessMsg');
  const profileErrorMsg = document.getElementById('profileErrorMsg');
  
  if (!profileForm) return;
  
  profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const address = document.getElementById('profileAddress').value;
    
    // Basic validation
    if (!name || !email) {
      showProfileError('Name and email are required');
      return;
    }
    
    // Email format validation
    if (!validateEmail(email)) {
      showProfileError('Please enter a valid email address');
      return;
    }
    
    // Update user data in localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
      currentUser.name = name;
      currentUser.email = email;
      
      // Add optional fields if provided
      if (phone) currentUser.phone = phone;
      if (address) currentUser.address = address;
      
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // Update display name in navigation
      const userNameElement = document.getElementById('userName');
      if (userNameElement) {
        userNameElement.textContent = name;
      }
      
      // Show success message
      if (profileSuccessMsg) {
        profileSuccessMsg.style.display = 'block';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          profileSuccessMsg.style.display = 'none';
        }, 3000);
      }
    }
  });
  
  // Function to show profile error
  function showProfileError(message) {
    if (profileErrorMsg) {
      profileErrorMsg.textContent = message;
      profileErrorMsg.style.display = 'block';
      
      // Hide error after 3 seconds
      setTimeout(() => {
        profileErrorMsg.style.display = 'none';
      }, 3000);
    }
  }
}

// Function to initialize password form
function initializePasswordForm() {
  const passwordForm = document.getElementById('passwordForm');
  const passwordSuccessMsg = document.getElementById('passwordSuccessMsg');
  const passwordErrorMsg = document.getElementById('passwordErrorMsg');
  
  if (!passwordForm) return;
  
  passwordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showPasswordError('All fields are required');
      return;
    }
    
    // Password match validation
    if (newPassword !== confirmPassword) {
      showPasswordError('New passwords do not match');
      return;
    }
    
    // Password strength validation
    if (newPassword.length < 8) {
      showPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    // In a real app, this would send a request to the server to update the password
    
    // Show success message
    if (passwordSuccessMsg) {
      passwordSuccessMsg.style.display = 'block';
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        passwordSuccessMsg.style.display = 'none';
      }, 3000);
    }
    
    // Reset form
    passwordForm.reset();
  });
  
  // Function to show password error
  function showPasswordError(message) {
    if (passwordErrorMsg) {
      passwordErrorMsg.textContent = message;
      passwordErrorMsg.style.display = 'block';
      
      // Hide error after 3 seconds
      setTimeout(() => {
        passwordErrorMsg.style.display = 'none';
      }, 3000);
    }
  }
}

// Function to initialize notification preferences
function initializeNotificationPreferences() {
  const notificationForm = document.getElementById('notificationForm');
  const notificationSuccessMsg = document.getElementById('notificationSuccessMsg');
  
  if (!notificationForm) return;
  
  notificationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const smsNotifications = document.getElementById('smsNotifications').checked;
    const pushNotifications = document.getElementById('pushNotifications').checked;
    
    // In a real app, this would send a request to the server to update notification preferences
    
    // Store preferences in localStorage
    const preferences = {
      emailNotifications,
      smsNotifications,
      pushNotifications
    };
    
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
    
    // Show success message
    if (notificationSuccessMsg) {
      notificationSuccessMsg.style.display = 'block';
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        notificationSuccessMsg.style.display = 'none';
      }, 3000);
    }
  });
  
  // Load saved preferences if they exist
  const savedPreferences = localStorage.getItem('notificationPreferences');
  
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    
    if (document.getElementById('emailNotifications')) {
      document.getElementById('emailNotifications').checked = preferences.emailNotifications;
    }
    
    if (document.getElementById('smsNotifications')) {
      document.getElementById('smsNotifications').checked = preferences.smsNotifications;
    }
    
    if (document.getElementById('pushNotifications')) {
      document.getElementById('pushNotifications').checked = preferences.pushNotifications;
    }
  }
}

// Function to initialize appearance settings
function initializeAppearanceSettings() {
  const appearanceForm = document.getElementById('appearanceForm');
  const appearanceSuccessMsg = document.getElementById('appearanceSuccessMsg');
  
  if (!appearanceForm) return;
  
  appearanceForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const themeColor = document.getElementById('themeColor').value;
    const fontSize = document.getElementById('fontSize').value;
    
    // In a real app, this would update the app's appearance
    
    // Store appearance settings in localStorage
    const appearanceSettings = {
      themeColor,
      fontSize
    };
    
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    
    // Show success message
    if (appearanceSuccessMsg) {
      appearanceSuccessMsg.style.display = 'block';
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        appearanceSuccessMsg.style.display = 'none';
      }, 3000);
    }
  });
  
  // Load saved appearance settings if they exist
  const savedAppearanceSettings = localStorage.getItem('appearanceSettings');
  
  if (savedAppearanceSettings) {
    const settings = JSON.parse(savedAppearanceSettings);
    
    if (document.getElementById('themeColor')) {
      document.getElementById('themeColor').value = settings.themeColor;
    }
    
    if (document.getElementById('fontSize')) {
      document.getElementById('fontSize').value = settings.fontSize;
    }
  }
}

// Helper function to validate email format
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Initialize settings page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeSettingsPage);
