// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  // Security Alert - Review Button
  const reviewBtn = document.querySelector('.btn-outline');
  if (reviewBtn) {
    reviewBtn.addEventListener('click', () => {
      alert("Redirecting you to login history for review...");
      // For demo, just alert — replace with actual redirect or modal as needed
      // window.location.href = 'review-alert.html';
    });
  }

  // Quick Actions buttons
  const quickActionButtons = document.querySelectorAll('.btn-action');
  quickActionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const action = button.textContent.trim();
      switch (action) {
        case '🔐 Change Password':
          alert('Redirecting to Change Password page...');
          // window.location.href = 'change-password.html';
          break;
        case '📱 Setup 2FA':
          alert('Redirecting to Setup Two-Factor Authentication...');
          // window.location.href = 'setup-2fa.html';
          break;
        case '💻 Manage Devices':
          alert('Redirecting to Manage Devices page...');
          // window.location.href = 'manage-devices.html';
          break;
        default:
          alert(`You clicked on: ${action}`);
      }
    });
  });

});
