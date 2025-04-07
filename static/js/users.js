function initializeUsers() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
  }

  document.addEventListener('DOMContentLoaded', initializeDashboard);