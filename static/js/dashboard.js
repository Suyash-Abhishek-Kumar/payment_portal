// Dashboard functionality

// Sample account data (in a real app, this would come from an API)
let sampleAccountData = {
  balance: 0,
  savingsBalance: 0,
  creditLimit: 0,
  creditUsed: 0,
  recentTransactions: []
};

const currentUser = localStorage.getItem('currentUser'); // Get logged-in user info from localStorage

// Function to initialize dashboard
async function initializeDashboard() {
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
  
      fetch(`http://127.0.0.1:5000/api/transactions/${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error(data.error);
          alert("Error fetching recent transactions: " + data.error);
        } else {
          sampleAccountData.recentTransactions = data.slice(0, 4) || []; // Update the transactions
          loadRecentTransactions(); // Call this after transactions are updated
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert("Failed to fetch recent transactions.");
      });

      loadUpcomingBills(userId); // Load upcoming bills for the user
      await loadSpendingAnalysis(userId);// Load spending analysis for the user

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
      `₹${(Math.abs(creditBalance.toFixed(2))).toFixed(2)}`;
    
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
    const isPositive = transaction[1] > 0;
    
    const transactionElement = document.createElement('div');
    transactionElement.className = 'transaction-item';
    transactionElement.innerHTML = `
      <div>
        <i class="fas ${isPositive ? 'fa-arrow-down' : 'fa-arrow-up'} transaction-icon"></i>
        <span>${transaction[2]}</span>
        <small class="text-muted d-block">${transaction[3]}</small>
      </div>
      <div class="${isPositive ? 'amount-positive' : 'amount-negative'}">
        ${isPositive ? '+₹' : '-₹'}${(Math.abs(transaction[1])).toFixed(2)}
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
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

  async function loadUpcomingBills(userId) {
    try {
      const response = await fetch(`http://localhost:5000/api/bills/${userId}`);
      const bills = await response.json();
      const billsContainer = document.getElementById('upcomingBills');
      if (!billsContainer) return;
  
      billsContainer.innerHTML = bills.length === 0 ? 
        `<div class="text-muted">No upcoming bills</div>` : 
        bills.map(bill => `
          <div class="bill-item d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded">
        <div>
          <h6 class="mb-1">${bill[1]}</h6>
          <small class="text-muted">Due ${new Date(bill[2]).toLocaleDateString('en-IN')}</small>
        </div>
        <div class="text-end">
          <div class="h5">₹${bill[3]}</div>
          <button class="btn btn-sm btn-success" onclick=payBill(${bill[0]})>
            Mark Paid
          </button>
        </div>
          </div>
        `).join('');
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  }
  
  // Function to handle bill payment
  async function payBill(billId) {
    if (!confirm('Are you sure you want to mark this bill as paid?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/bills/${billId}/pay`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Bill marked as paid!');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        loadUpcomingBills(currentUser.id); // Refresh list
      }
    } catch (error) {
      alert('Failed to update bill status');
    }
  }

  async function loadSpendingAnalysis(userId) {
    try {
      // 1. Update Pie Chart
      const newCanvas = document.createElement('canvas');
      const container = document.getElementById('spendingChartContainer');
      container.innerHTML = ''; // Clear any existing chart
      container.appendChild(newCanvas); // Add new canvas for the chart
      const ctx = newCanvas.getContext('2d'); // Get 2D context for the new canvas
      
      const response = await fetch(`http://localhost:5000/api/spending-analysis/${userId}`);
      const categories = await response.json();

      window.spendingChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: categories.map(c => c[0]),
          datasets: [{
            data: categories.map(c => c[1]),
            backgroundColor: [
              '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', 
              '#e74a3b', '#858796', '#6f42c1', '#fd7e14'
            ],
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: { padding: 10 }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ₹${value.toFixed(2)}`;
                }
              }
            }
          }
        }
      });
  
      // 2. Update Top Categories List
      const categoriesContainer = document.getElementById('topSpendingCategories');
      let totalSpent = 0;
      for (let i in categories) {
        totalSpent += parseFloat(categories[i][1]);
      }
      
      categoriesContainer.innerHTML = `
        <h6 class="text-muted mb-5">Top Spending Categories</h6>
        ${categories.map((category, index) => `
          <div class="d-flex justify-content-between mb-1">
            <span>${category[0]}</span>
            <span>₹${category[1]}</span>
          </div>
          <div class="progress mb-4" style="height: 8px;">
            <div class="progress-bar ${getProgressBarColor(index)}" 
                 style="width: ${(category[1] / totalSpent * 100)}%">
            </div>
          </div>
        `).join('')}
      `;
      
    } catch (error) {
      console.error('Error loading spending analysis:', error);
      document.getElementById('topSpendingCategories').innerHTML = `
        <div class="alert alert-danger">Failed to load spending data</div>
      `;
    }
  }
  
  // Helper function for progress bar colors
  function getProgressBarColor(index) {
    const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info'];
    return colors[index % colors.length];
  }
  

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);
