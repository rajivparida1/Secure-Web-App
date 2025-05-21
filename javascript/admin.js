// static/js/admin.js

document.addEventListener('DOMContentLoaded', function() {
    // Verify admin privileges before initializing
    verifyAdminPrivileges().then(() => {
        initializeAdminComponents();
        setupRealTimeMonitoring();
    }).catch(() => {
        window.location.href = '/dashboard'; // Redirect if not admin
    });
});

// ----------------------
// ADMIN CORE FUNCTIONALITY
// ----------------------

async function verifyAdminPrivileges() {
    try {
        const response = await fetch('/api/auth/verify-admin', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error('Not an admin');
        }
        
        const data = await response.json();
        updateAdminUI(data.user);
    } catch (error) {
        console.error('Admin verification failed:', error);
        throw error;
    }
}

function updateAdminUI(user) {
    // Update admin badge and privileges
    document.querySelectorAll('.admin-badge').forEach(el => {
        el.textContent = user.role.toUpperCase();
    });
    
    // Set privilege-based UI elements
    if (user.role === 'superadmin') {
        document.querySelectorAll('.superadmin-only').forEach(el => {
            el.style.display = 'block';
        });
    }
}

// ----------------------
// ADMIN UI COMPONENTS
// ----------------------

function initializeAdminComponents() {
    initUserManagement();
    initSecurityEvents();
    initSystemControls();
    initAuditLogs();
    setupLiveStats();
    
    // Admin-specific sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('admin-sidebar');
    }
}

function initUserManagement() {
    const userTable = document.querySelector('#userManagementTable');
    if (!userTable) return;
    
    // Enable DataTable functionality
    new simpleDatatables.DataTable(userTable, {
        perPage: 10,
        perPageSelect: [5, 10, 15, 20],
        columns: [
            { select: 0, sort: 'asc' }, // Name
            { select: 1, type: 'string' }, // Email
            { select: 2, type: 'string' }, // Role
            { select: 3, type: 'string' }, // Status
            { select: 4, type: 'date', format: 'MMM D, YYYY h:mm A' }, // Last Active
            { select: 5, sortable: false } // Actions
        ],
        labels: {
            placeholder: "Search users...",
            perPage: "{select} users per page",
            noRows: "No users found",
            info: "Showing {start} to {end} of {rows} users"
        }
    });
    
    // Role change handlers
    document.querySelectorAll('.role-select').forEach(select => {
        select.addEventListener('change', function() {
            const userId = this.getAttribute('data-user-id');
            const newRole = this.value;
            
            updateUserRole(userId, newRole);
        });
    });
    
    // Bulk action handlers
    document.getElementById('bulkActions').addEventListener('change', function() {
        const action = this.value;
        if (action) {
            const selectedUsers = Array.from(
                document.querySelectorAll('.user-checkbox:checked')
            ).map(checkbox => checkbox.getAttribute('data-user-id'));
            
            if (selectedUsers.length > 0) {
                performBulkAction(action, selectedUsers);
            }
            
            this.value = '';
        }
    });
}

function initSecurityEvents() {
    const eventsTable = document.querySelector('#securityEventsTable');
    if (!eventsTable) return;
    
    // Real-time event streaming
    const eventSource = new EventSource('/api/admin/security-events/stream');
    
    eventSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        addSecurityEventToTable(data);
    };
    
    // Critical alert highlighting
    eventsTable.addEventListener('click', function(e) {
        if (e.target.classList.contains('alert-critical')) {
            showEventDetailsModal(e.target.getAttribute('data-event-id'));
        }
    });
}

// ----------------------
// ADMIN API INTERACTIONS
// ----------------------

async function updateUserRole(userId, newRole) {
    try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ role: newRole })
        });
        
        if (!response.ok) {
            throw new Error('Role update failed');
        }
        
        showToast('User role updated successfully', 'success');
        logAdminAction(`Changed role for user ${userId} to ${newRole}`);
    } catch (error) {
        showToast('Failed to update user role', 'error');
        console.error('Role update error:', error);
    }
}

async function performBulkAction(action, userIds) {
    const confirmation = confirm(`Are you sure you want to ${action} ${userIds.length} users?`);
    if (!confirmation) return;
    
    try {
        const response = await fetch('/api/admin/users/bulk-action', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ action, userIds })
        });
        
        if (!response.ok) {
            throw new Error('Bulk action failed');
        }
        
        showToast(`Bulk ${action} completed for ${userIds.length} users`, 'success');
        logAdminAction(`Performed ${action} on ${userIds.length} users`);
        
        // Refresh the table
        document.querySelector('#refreshUsers').click();
    } catch (error) {
        showToast(`Bulk ${action} failed`, 'error');
        console.error('Bulk action error:', error);
    }
}

// ----------------------
// REAL-TIME MONITORING
// ----------------------

function setupRealTimeMonitoring() {
    // System health stats
    const healthSocket = new WebSocket(`wss://${window.location.host}/api/admin/system-health`);
    
    healthSocket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        updateSystemHealthDashboard(data);
    };
    
    // Live traffic monitor
    const trafficCanvas = document.getElementById('trafficChart');
    if (trafficCanvas) {
        const trafficCtx = trafficCanvas.getContext('2d');
        const trafficChart = new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels: Array(60).fill().map((_, i) => `${i}s`),
                datasets: [{
                    label: 'Requests/sec',
                    data: Array(60).fill(0),
                    borderColor: '#3498db',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
        
        const trafficSocket = new WebSocket(`wss://${window.location.host}/api/admin/live-traffic`);
        trafficSocket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            trafficChart.data.datasets[0].data.shift();
            trafficChart.data.datasets[0].data.push(data.requestsPerSecond);
            trafficChart.update();
        };
    }
}

// ----------------------
// UTILITY FUNCTIONS
// ----------------------

function showEventDetailsModal(eventId) {
    fetch(`/api/admin/security-events/${eventId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // Populate modal with event details
        document.getElementById('eventDetailsTitle').textContent = `Event #${eventId}`;
        document.getElementById('eventType').textContent = data.type;
        document.getElementById('eventSeverity').textContent = data.severity;
        document.getElementById('eventTimestamp').textContent = new Date(data.timestamp).toLocaleString();
        document.getElementById('eventDetails').textContent = data.details;
        document.getElementById('eventActions').innerHTML = data.recommendedActions.map(action => 
            `<li>${action}</li>`
        ).join('');
        
        // Show modal
        new bootstrap.Modal(document.getElementById('eventDetailsModal')).show();
    });
}

function logAdminAction(action) {
    fetch('/api/admin/audit-logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action })
    });
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toastId = `toast-${Date.now()}`;
    
    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type}`;
    toast.role = 'alert';
    toast.id = toastId;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }, 100);
}

// Initialize on window load
window.addEventListener('load', function() {
    // Check for admin-specific query parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('alert')) {
        showToast(urlParams.get('alert'), 'warning');
    }
});