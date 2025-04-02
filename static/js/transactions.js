// Transactions page functionality

// Sample transactions data (in a real app, this would come from an API)
const sampleTransactions = [
  { id: 1, description: "Grocery Shopping", amount: -78.45, date: "2023-06-10", category: "Groceries" },
  { id: 2, description: "Salary Deposit", amount: 2850.00, date: "2023-06-08", category: "Income" },
  { id: 3, description: "Electric Bill", amount: -85.20, date: "2023-06-07", category: "Utilities" },
  { id: 4, description: "Gas Station", amount: -45.80, date: "2023-06-07", category: "Transportation" },
  { id: 5, description: "Restaurant", amount: -32.50, date: "2023-06-06", category: "Food & Dining" },
  { id: 6, description: "Movie Tickets", amount: -28.75, date: "2023-06-05", category: "Entertainment" },
  { id: 7, description: "Phone Bill", amount: -65.00, date: "2023-06-04", category: "Utilities" },
  { id: 8, description: "Freelance Work", amount: 350.00, date: "2023-06-03", category: "Income" },
  { id: 9, description: "Online Shopping", amount: -124.99, date: "2023-06-02", category: "Shopping" },
  { id: 10, description: "ATM Withdrawal", amount: -200.00, date: "2023-06-01", category: "Cash" }
];

// Function to initialize transactions page
function initializeTransactionsPage() {
  const currentUser = localStorage.getItem('currentUser');
  
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }
  
  // Load all transactions
  loadTransactions(sampleTransactions);
  
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
    const isPositive = transaction.amount > 0;
    
    const transactionElement = document.createElement('div');
    transactionElement.className = 'transaction-item';
    transactionElement.innerHTML = `
      <div>
        <i class="fas ${getCategoryIcon(transaction.category)} transaction-icon"></i>
        <span>${transaction.description}</span>
        <small class="text-muted d-block">${transaction.date} • ${transaction.category}</small>
      </div>
      <div class="${isPositive ? 'amount-positive' : 'amount-negative'}">
        ${isPositive ? '+' : ''}${formatCurrency(transaction.amount)}
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
    const categories = [...new Set(sampleTransactions.map(t => t.category))];
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }
  
  // Handle filter form submission
  filterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const category = categoryFilter.value;
    const typeFilter = document.getElementById('typeFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    let filteredTransactions = [...sampleTransactions];
    
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
    resetButton.addEventListener('click', function() {
      filterForm.reset();
      loadTransactions(sampleTransactions);
    });
  }
}

// Function to initialize search
function initializeSearch() {
  const searchInput = document.getElementById('searchTransactions');
  
  if (!searchInput) return;
  
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    if (!searchTerm) {
      loadTransactions(sampleTransactions);
      return;
    }
    
    const filteredTransactions = sampleTransactions.filter(transaction => 
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
  
  periodSelector.addEventListener('change', function() {
    const period = this.value;
    let filteredTransactions = [...sampleTransactions];
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
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Initialize transactions page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTransactionsPage);
