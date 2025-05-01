// Dashboard functionality

// Sample account data (in a real app, this would come from an API)
const sampleAccountData = {
  balance: 5432.10,
  savingsBalance: 7890.45,
  creditLimit: 10000,
  creditUsed: 2150.75,
  recentTransactions: [
    { id: 1, description: "Coffee Shop", amount: -4.50, date: "2023-06-09", category: "Food & Dining" },
    { id: 2, description: "Salary Deposit", amount: 2850.00, date: "2023-06-08", category: "Income" },
    { id: 3, description: "Electric Bill", amount: -85.20, date: "2023-06-07", category: "Utilities" },
    { id: 4, description: "Grocery Store", amount: -68.35, date: "2023-06-05", category: "Groceries" }
  ]
};

// Function to initialize dashboard
// Function to initialize dashboard
function initializeDashboard() {
  const currentUser = localStorage.getItem('currentUser'); // Get logged-in user info from localStorage

  if (!currentUser) {
      window.location.href = '/login'; // Redirect to login if user is not logged in
      return;
  }

  const userId = JSON.parse(currentUser).id; // Assume currentUser contains user ID

  // Fetch account summary data from the backend API
  fetch(`http://127.0.0.1:5000/api/account/${userId}`)
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              console.error(data.error);
              alert("Error fetching account summary: " + data.error);
          } else {
              updateAccountSummaries(data); // Pass fetched data to updateAccountSummaries()
          }
      })
      .catch(error => {
          console.error('Error:', error);
          alert("Failed to fetch account summary.");
      });

  // Load recent transactions (this can be implemented later)
  loadRecentTransactions();
}

// Function to update account summaries dynamically
function updateAccountSummaries(accountData) {
  const mainBalance = parseFloat(accountData.main_balance) || 0;
  const savingsBalance = parseFloat(accountData.savings_balance) || 0;
  const creditBalance = parseFloat(accountData.credit_balance) || 0;

  document.getElementById('mainBalance').textContent = 
      `₹${mainBalance.toFixed(2)}`;
  
  document.getElementById('savingsBalance').textContent = 
      `₹${savingsBalance.toFixed(2)}`;
  
  document.getElementById('creditUsed').textContent = 
      `₹${creditBalance.toFixed(2)}`;
    
  const available = accountData.credit_balance > 0 ? 0 : -accountData.credit_balance;
  document.getElementById('creditAvailable').textContent = `₹${available.toFixed(2)}`;

  // Update credit usage progress bar
  const creditProgressBar = document.getElementById('creditProgressBar');
  if (creditProgressBar) {
      const percentage = Math.min((accountData.credit_balance / 10000) * 100, 100); // Example: assuming a credit limit of 10,000
      creditProgressBar.style.width = `${percentage}%`;

      // Change color based on usage
      if (percentage > 80) {
          creditProgressBar.className = 'progress-bar bg-danger';
      } else if (percentage > 50) {
          creditProgressBar.className = 'progress-bar bg-warning';
      } else {
          creditProgressBar.className = 'progress-bar bg-success';
      }
  }
}

// Function to load recent transactions
function loadRecentTransactions() {
  const recentTransactionsList = document.getElementById('recentTransactionsList');
  
  if (!recentTransactionsList) return;
  
  recentTransactionsList.innerHTML = '';
  
  if (sampleAccountData.recentTransactions.length === 0) {
    recentTransactionsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exchange-alt empty-state-icon"></i>
        <p>No recent transactions</p>
      </div>
    `;
    return;
  }
  
  sampleAccountData.recentTransactions.forEach(transaction => {
    const isPositive = transaction.amount > 0;
    
    const transactionElement = document.createElement('div');
    transactionElement.className = 'transaction-item';
    transactionElement.innerHTML = `
      <div>
        <i class="fas ${isPositive ? 'fa-arrow-down' : 'fa-arrow-up'} transaction-icon"></i>
        <span>${transaction.description}</span>
        <small class="text-muted d-block">${transaction.date}</small>
      </div>
      <div class="${isPositive ? 'amount-positive' : 'amount-negative'}">
        ${isPositive ? '+' : ''}${formatCurrency(transaction.amount)}
      </div>
    `;
    
    recentTransactionsList.appendChild(transactionElement);
  });
}

// Function to initialize quick actions
function initializeQuickActions() {
  const quickActions = document.querySelectorAll('.quick-action');
  
  quickActions.forEach(action => {
    action.addEventListener('click', function() {
      const actionType = this.getAttribute('data-action');
      
      switch(actionType) {
        case 'transfer':
          window.location.href = '/transfers';
          break;
        case 'pay-bill':
          window.location.href = '/transfers';
          break;
        case 'transactions':
          window.location.href = '/transactions';
          break;
        case 'settings':
          window.location.href = '/settings';
          break;
      }
    });
  });
}

// Function to update spending chart
function updateSpendingChart() {
  const spendingChartCanvas = document.getElementById('spendingChart');
  
  if (!spendingChartCanvas) return;
  
  // Clear any existing chart
  if (window.spendingChart) {
    window.spendingChart.destroy();
  }
  
  // Sample spending data (in a real app, this would come from an API)
  const spendingData = {
    labels: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
    datasets: [{
      data: [120, 90, 150, 200, 80, 60],
      backgroundColor: [
        '#3498db',
        '#2ecc71',
        '#f39c12',
        '#e74c3c',
        '#9b59b6',
        '#1abc9c'
      ]
    }]
  };
  
  // Create chart using Chart.js
  window.spendingChart = new Chart(spendingChartCanvas, {
    type: 'doughnut',
    data: spendingData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#6c757d'
          }
        }
      }
    }
  });
}

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

  document.addEventListener('DOMContentLoaded', function () {
    const pieCtx = document.getElementById('spendingPieChart').getContext('2d');
      new Chart(pieCtx, {
        type: 'pie',
          data: {
            labels: ['Food & Dining', 'Bills & Utilities', 'Transportation', 'Shopping'],
            datasets: [{
              data: [348.52, 280.00, 185.75, 142.99],
              backgroundColor: ['#007bff', '#28a745', '#ffc107', '#17a2b8'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              }
            }
          }
          });
  });

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);
