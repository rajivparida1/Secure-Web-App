// dashboard.js (Static-friendly version without backend API calls)
document.addEventListener('DOMContentLoaded', function () {
  initializeDashboard();
});

function initializeDashboard() {
  initLogoutHandler();
  updateLastLoginInfo();
  initSecurityAlert();
  initQuickActions();
}

// ------------------
// LOGOUT FUNCTION
// ------------------
function initLogoutHandler() {
  const logoutBtn = document.querySelector('.btn-danger');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // Clear dummy auth (localStorage)
      localStorage.removeItem('authToken');
      window.location.href = 'login.html';
    });
  }
}

// ------------------
// LAST LOGIN INFO (Static Mock)
// ------------------
function updateLastLoginInfo() {
  const summaryEl = document.querySelector('.dashboard-section p strong');
  if (summaryEl) {
    const lastLogin = 'New York, US at 10:30 AM'; // Static fallback info
    summaryEl.textContent = lastLogin;
  }
}

// ------------------
// SECURITY ALERT MOCK
// ------------------
function initSecurityAlert() {
  const alertBox = document.querySelector('.alert-box');
  if (alertBox) {
    alertBox.style.display = 'flex';
    alertBox.querySelector('button').addEventListener('click', () => {
      alert('Please review the login attempt manually.');
    });
  }
}

// ------------------
// QUICK ACTION BUTTONS
// ------------------
function initQuickActions() {
  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`Feature '${btn.textContent.trim()}' is currently under construction.`);
    });
  });
}
