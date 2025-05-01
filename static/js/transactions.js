// Transactions page functionality

let sampleTransactions = [];

async function fetchTransactions() {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    console.error('No current user found.');
    return [];
  }

  try {
    const user = JSON.parse(currentUser);
    const response = await fetch(`/api/transactions/${user.id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    sampleTransactions = await response.json();
    return sampleTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const transactions = await fetchTransactions();
  loadTransactions(transactions);
});

// Function to initialize transactions page
async function initializeTransactionsPage() {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }
  
  // Fetch and load all transactions
  const transactions = await fetchTransactions();
  loadTransactions(transactions);
  
  // Initialize filter form
  initializeFilters();
  
  // Initialize search functionality
  initializeSearch();
  
  // Update period selector
  initializePeriodSelector();
}

// Function to load transactions
function loadTransactions(transactions) {
  const transactionsList = document.getElementById('transactionsList');
  
  if (!transactionsList) return;
  
  transactionsList.innerHTML = '';
  
  if (transactions.length === 0) {
    transactionsList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-receipt empty-state-icon"></i>
        <p>No transactions found</p>
      </div>
    `;
    return;
  }
  
  transactions.forEach(transaction => {
    const isPositive = transaction[1] > 0;
    
    const transactionElement = document.createElement('div');
    transactionElement.className = 'transaction-item';
    transactionElement.innerHTML = `
      <div>
        <i class="fas ${getCategoryIcon(transaction[4])} transaction-icon"></i>
        <span>${transaction[2]}</span>
        <small class="text-muted d-block">${transaction[3]} • ${transaction[4]}</small>
      </div>
      <div class="${isPositive ? 'amount-positive' : 'amount-negative'}">
        ${isPositive ? '+₹' : '-₹'}${Math.abs(transaction[1])}
      </div>
    `;
    
    transactionsList.appendChild(transactionElement);
  });
}

// Function to initialize filters
function initializeFilters() {
  const filterForm = document.getElementById('filterForm');
  
  if (!filterForm) return;
  
  // Populate category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    fetchTransactions().then(transactions => {
      const categories = [...new Set(transactions.map(t => t.category))];
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      });
    });
  }
  
  // Handle filter form submission
  filterForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const category = categoryFilter.value;
    const typeFilter = document.getElementById('typeFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let filteredTransactions = await fetchTransactions();
    
    // Filter by category
    if (category) {
      filteredTransactions = filteredTransactions.filter(t => t.category === category);
    }
    
    // Filter by type (income/expense)
    if (typeFilter === 'income') {
      filteredTransactions = filteredTransactions.filter(t => t.amount > 0);
    } else if (typeFilter === 'expense') {
      filteredTransactions = filteredTransactions.filter(t => t.amount < 0);
    }
    
    // Filter by date range
    if (startDate) {
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= new Date(startDate));
    }
    
    if (endDate) {
      filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= new Date(endDate));
    }
    
    // Update transactions list
    loadTransactions(filteredTransactions);
  });
  
  // Reset filters
  const resetButton = document.getElementById('resetFilters');
  if (resetButton) {
    resetButton.addEventListener('click', async function() {
      filterForm.reset();
      const transactions = await fetchTransactions();
      loadTransactions(transactions);
    });
  }
}

// Function to initialize search
function initializeSearch() {
  const searchInput = document.getElementById('searchTransactions');
  
  if (!searchInput) return;
  
  searchInput.addEventListener('input', async function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    if (!searchTerm) {
      const transactions = await fetchTransactions();
      loadTransactions(transactions);
      return;
    }
    
    const transactions = await fetchTransactions();
    const filteredTransactions = transactions.filter(transaction => 
      transaction.description.toLowerCase().includes(searchTerm) ||
      transaction.category.toLowerCase().includes(searchTerm)
    );
    
    loadTransactions(filteredTransactions);
  });
}

// Function to initialize period selector
function initializePeriodSelector() {
  const periodSelector = document.getElementById('periodSelector');
  
  if (!periodSelector) return;
  
  periodSelector.addEventListener('change', async function() {
    const period = this.value;
    let filteredTransactions = await fetchTransactions();
    const today = new Date();
    
    switch(period) {
      case 'week':
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= oneWeekAgo);
        break;
      case 'month':
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(today.getMonth() - 1);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= oneMonthAgo);
        break;
      case 'quarter':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= threeMonthsAgo);
        break;
      case 'year':
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= oneYearAgo);
        break;
    }
    
    loadTransactions(filteredTransactions);
  });
}

// Helper function to get icon for transaction category
function getCategoryIcon(category) {
  switch(category) {
    case 'Groceries':
      return 'fa-shopping-basket';
    case 'Income':
      return 'fa-money-bill-wave';
    case 'Utilities':
      return 'fa-bolt';
    case 'Transportation':
      return 'fa-car';
    case 'Food & Dining':
      return 'fa-utensils';
    case 'Entertainment':
      return 'fa-film';
    case 'Shopping':
      return 'fa-shopping-bag';
    case 'Cash':
      return 'fa-money-bill';
    default:
      return 'fa-receipt';
  }
}

// Helper function to format currency
// function formatCurrency(amount) {
//   try {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 2
//     }).format(amount);
//   } catch (error) {
//     console.error('Currency formatting error:', error);
//     return `₹${amount.toFixed(2)}`; // Fallback to manual formatting
//   }
// }

// Initialize transactions page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTransactionsPage);
