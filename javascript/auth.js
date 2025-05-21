// auth.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // Toggle password visibility
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            button.textContent = input.type === 'password' ? '👁️' : '🙈';
        });
    });

    // ========================
    // REGISTER FORM HANDLING
    // ========================
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordMatchError = document.getElementById('passwordMatchError');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text span');
        const requirements = document.querySelectorAll('.password-requirements li');

        // Validate password strength
        passwordInput.addEventListener('input', () => {
            const value = passwordInput.value;
            const checks = {
                length: value.length >= 8,
                uppercase: /[A-Z]/.test(value),
                lowercase: /[a-z]/.test(value),
                number: /[0-9]/.test(value),
                special: /[\W]/.test(value),
            };

            // Update checklist UI
            requirements.forEach(req => {
                const key = req.dataset.requirement;
                req.classList.toggle('met', checks[key]);
            });

            // Update strength meter
            const strength = Object.values(checks).filter(Boolean).length;
            strengthBar.style.width = `${(strength / 5) * 100}%`;
            strengthBar.setAttribute('data-strength', strength); // ✅ THIS IS THE FIX

            const strengthLevels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
            strengthText.textContent = strengthLevels[strength - 1] || 'Weak';

        });

        // Confirm password match
        confirmPasswordInput.addEventListener('input', () => {
            const match = passwordInput.value === confirmPasswordInput.value;
            passwordMatchError.textContent = match ? '' : 'Passwords do not match.';
        });

        // Register submit handler
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = registerForm.name.value.trim();
            const email = registerForm.email.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const agreed = registerForm.terms.checked;

            if (!name || !email || !password || !confirmPassword) {
                alert('Please fill in all fields.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            if (!agreed) {
                alert('You must agree to the Terms and Privacy Policy.');
                return;
            }

            alert('Registration successful! (Simulated)');
            registerForm.reset();
        });
    }

    // ========================
    // LOGIN FORM HANDLING
    // ========================
    if (loginForm) {
        const emailInput = loginForm.email;
        const passwordInput = loginForm.password;

        const lastLogin = localStorage.getItem('lastLogin');
        if (lastLogin) {
            const lastLoginInfo = document.getElementById('lastLoginInfo');
            if (lastLoginInfo) {
                lastLoginInfo.textContent = new Date(parseInt(lastLogin, 10)).toLocaleString();
            }
        }

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                alert('Please enter both email and password.');
                return;
            }

            alert('Login successful! (Simulated)');

            localStorage.setItem('lastLogin', Date.now());

            loginForm.reset();
        });
    }
});
