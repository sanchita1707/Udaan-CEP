// ============================================================
// js/auth.js - Login & Registration Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // =====================
  // Registration Form
  // =====================
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors(registerForm);

      // Gather form data
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirmPassword = document.getElementById('reg-confirm-password').value;
      const age = document.getElementById('reg-age').value;
      const studentClass = document.getElementById('reg-class').value.trim();

      // Validate
      let hasError = false;

      if (!name || name.length < 2) {
        showFieldError(document.getElementById('reg-name'), 'Please enter your full name');
        hasError = true;
      }

      if (!validateEmail(email)) {
        showFieldError(document.getElementById('reg-email'), 'Please enter a valid email');
        hasError = true;
      }

      if (!validatePassword(password)) {
        showFieldError(document.getElementById('reg-password'), 'Password must be at least 6 characters');
        hasError = true;
      }

      if (password !== confirmPassword) {
        showFieldError(document.getElementById('reg-confirm-password'), 'Passwords do not match');
        hasError = true;
      }

      if (hasError) return;

      // Show loading state on button
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';
      submitBtn.disabled = true;

      // Call API
      const result = await apiCall('/users/register', 'POST', {
        name, email, password, age: parseInt(age) || undefined, studentClass
      });

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (result.ok) {
        // Save user data to localStorage
        localStorage.setItem('udaan_token', result.data.token);
        localStorage.setItem('udaan_user', JSON.stringify(result.data.user));
        showToast(result.data.message, 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);
      } else {
        showToast(result.data.message || 'Registration failed', 'error');
        const errDiv = document.getElementById('auth-error');
        if (errDiv) {
          errDiv.textContent = result.data.message || 'Registration failed. Please try again.';
          errDiv.style.display = 'flex';
        }
      }
    });

    // Toggle password visibility
    setupPasswordToggle('reg-password', 'toggle-pass');
    setupPasswordToggle('reg-confirm-password', 'toggle-confirm-pass');
  }

  // =====================
  // Login Form
  // =====================
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFieldErrors(loginForm);

      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      // Validate
      if (!validateEmail(email)) {
        showFieldError(document.getElementById('login-email'), 'Please enter a valid email');
        return;
      }
      if (!password) {
        showFieldError(document.getElementById('login-password'), 'Please enter your password');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
      submitBtn.disabled = true;

      const result = await apiCall('/users/login', 'POST', { email, password });

      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;

      if (result.ok) {
        localStorage.setItem('udaan_token', result.data.token);
        localStorage.setItem('udaan_user', JSON.stringify(result.data.user));
        showToast(result.data.message, 'success');
        setTimeout(() => {
          // Redirect admin to admin panel
          if (result.data.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 1200);
      } else {
        showToast(result.data.message || 'Login failed', 'error');
        const errDiv = document.getElementById('auth-error');
        if (errDiv) {
          errDiv.textContent = result.data.message || 'Invalid email or password.';
          errDiv.style.display = 'flex';
        }
      }
    });

    setupPasswordToggle('login-password', 'toggle-pass');
  }

  // If already logged in, redirect to dashboard
  const user = getCurrentUser();
  if (user && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
    window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
  }
});

// =====================
// Password Toggle Helper
// =====================
function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (!input || !toggle) return;

  toggle.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      toggle.querySelector('i').className = 'fa-solid fa-eye-slash';
    } else {
      input.type = 'password';
      toggle.querySelector('i').className = 'fa-solid fa-eye';
    }
  });
}
