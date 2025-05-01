// Sample recipients data (in a real app, this would come from an API)
const sampleRecipients = [
  { id: 7, name: "Alice Smith", accountNumber: "4587******9012", bank: "Chase Bank", recentTransfer: true },
  { id: 2, name: "Bob Johnson", accountNumber: "3256******7891", bank: "Bank of America", recentTransfer: true },
  { id: 3, name: "Carol Williams", accountNumber: "7812******3456", bank: "Wells Fargo", recentTransfer: true },
  { id: 4, name: "David Brown", accountNumber: "9145******6789", bank: "Citibank", recentTransfer: false },
  { id: 5, name: "Emma Davis", accountNumber: "6234******1234", bank: "TD Bank", recentTransfer: false }
];

// Helper function to format currency in INR
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Function to initialize transfers page
function initializeTransfersPage() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = '/login';
    return;
  }

  loadRecentRecipients();
  loadRecipientOptions();
  initializeTransferForm();
}

// Function to load recent recipients
function loadRecentRecipients() {
  const recentRecipientsContainer = document.getElementById('recentRecipients');
  if (!recentRecipientsContainer) return;

  const recentRecipients = sampleRecipients.filter(recipient => recipient.recentTransfer);

  if (recentRecipients.length === 0) {
    recentRecipientsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users empty-state-icon"></i>
        <p>No recent recipients</p>
      </div>
    `;
    return;
  }

  recentRecipientsContainer.innerHTML = '';
  recentRecipients.forEach(recipient => {
    const recipientElement = document.createElement('div');
    recipientElement.className = 'recent-recipient';
    recipientElement.setAttribute('data-recipient-id', recipient.id);

    const initials = recipient.name.split(' ').map(name => name[0]).join('');
    recipientElement.innerHTML = `
      <div class="recipient-avatar">${initials}</div>
      <span>${recipient.name}</span>
      <small class="text-muted">${recipient.bank}</small>
    `;

    recipientElement.addEventListener('click', function() {
      const recipientId = this.getAttribute('data-recipient-id');
      selectRecipient(recipientId);
    });

    recentRecipientsContainer.appendChild(recipientElement);
  });
}

// Function to load recipient options into the select dropdown
function loadRecipientOptions() {
  const recipientSelect = document.getElementById('recipientSelect');
  if (!recipientSelect) return;

  recipientSelect.innerHTML = '<option value="">Select a recipient</option>';
  sampleRecipients.forEach(recipient => {
    const option = document.createElement('option');
    option.value = recipient.id;
    option.textContent = `${recipient.name} - ${recipient.bank}`;
    recipientSelect.appendChild(option);
  });
}

// Function to select a recipient from recent recipients
function selectRecipient(recipientId) {
  const recipientSelect = document.getElementById('recipientSelect');
  if (recipientSelect) {
    recipientSelect.value = recipientId;
    // Trigger change event to update details
    const event = new Event('change');
    recipientSelect.dispatchEvent(event);
  }
}

// Function to initialize the transfer form and handle submission
function initializeTransferForm() {
  const transferForm = document.getElementById('transferForm');
  const recipientSelect = document.getElementById('recipientSelect');
  const transferAmount = document.getElementById('transferAmount');
  const transferDescription = document.getElementById('transferDescription');
  const recipientDetails = document.getElementById('recipientDetails');
  const transferErrorMsg = document.getElementById('transferErrorMsg');
  const transferSuccessMsg = document.getElementById('transferSuccessMsg');
  const accountType = document.getElementById('fromAccount').value;

  if (!transferForm) return;

  // Show recipient details when recipient is selected
  if (recipientSelect) {
    recipientSelect.addEventListener('change', function() {
      const recipientId = this.value;
      if (!recipientId) {
        if (recipientDetails) recipientDetails.innerHTML = '';
        return;
      }
      const recipient = sampleRecipients.find(r => r.id == recipientId);
      if (recipient && recipientDetails) {
        recipientDetails.innerHTML = `
          <div class="card mt-3">
            <div class="card-body">
              <h5 class="card-title">${recipient.name}</h5>
              <p class="card-text">
                <strong>Bank:</strong> ${recipient.bank}<br>
                <strong>Account:</strong> ${recipient.accountNumber}
              </p>
            </div>
          </div>
        `;
      }
    });
  }

  // Handle transfer form submission (calls backend API)
  transferForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (transferErrorMsg) transferErrorMsg.style.display = 'none';
    if (transferSuccessMsg) transferSuccessMsg.style.display = 'none';

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const receiverId = recipientSelect.value;
    const amount = parseFloat(transferAmount.value);
    const description = transferDescription.value || 'Fund Transfer';
    if (!currentUser || !receiverId || !amount) {
      showTransferError('Please fill all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: receiverId,
          amount: amount,
          account_type: accountType,
          description: description
        })
      });
    
      const data = await response.json();
      if (response.ok) {
        if (transferSuccessMsg) {
          transferSuccessMsg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Successfully transferred ${formatCurrency(amount)} to ${recipientSelect.options[recipientSelect.selectedIndex].text}
          `;
          transferSuccessMsg.style.display = 'block';
        }
        transferForm.reset();
        if (recipientDetails) recipientDetails.innerHTML = '';
        setTimeout(() => {
          if (transferSuccessMsg) transferSuccessMsg.style.display = 'none';
          window.location.reload();
        }, 2000);
      } else {
        showTransferError(data.error || 'Transfer failed');
      }
    } catch (error) {
      showTransferError('Failed to connect to server');
    }
  });

  // Function to show transfer error
  function showTransferError(message) {
    if (transferErrorMsg) {
      transferErrorMsg.textContent = message;
      transferErrorMsg.style.display = 'block';
      setTimeout(() => {
        transferErrorMsg.style.display = 'none';
      }, 3000);
    }
  }
}

// Function to load QR codes for the user (if needed elsewhere)
async function loadQRCodes(userId) {
  try {
    const response = await fetch(`http://localhost:5000/api/qr-codes/${userId}`);
    const qrCodes = await response.json();
    qrCodes.forEach(qr => {
      const img = document.createElement('img');
      img.src = `data:${qr.mime_type};base64,${btoa(qr.image_data)}`;
      document.getElementById('qrGallery').appendChild(img);
    });
  } catch (error) {
    console.error('QR load error:', error);
  }
}

// Initialize transfers page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeTransfersPage);
