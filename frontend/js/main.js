// ============================================================
// js/main.js - Core JavaScript for Udaan Platform
// ============================================================

// =====================
// API Configuration
// =====================
// Change this if your backend runs on a different port
const API_BASE = 'http://localhost:5000/api';

// =====================
// Navbar - Scroll Effect & Hamburger Menu
// =====================
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  // Add scrolled class to navbar when user scrolls
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Show/hide scroll-to-top button
    const scrollBtn = document.getElementById('scroll-top');
    if (scrollBtn) {
      if (window.scrollY > 300) {
        scrollBtn.classList.add('visible');
      } else {
        scrollBtn.classList.remove('visible');
      }
    }
  });

  // Hamburger toggle for mobile menu
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu?.classList.toggle('open');
  });

  // Close mobile menu when a link is clicked
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('open');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar?.contains(e.target)) {
      hamburger?.classList.remove('active');
      navMenu?.classList.remove('open');
    }
  });

  // =====================
  // Active Nav Link
  // =====================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // =====================
  // Update Login/Logout Nav
  // =====================
  updateNavAuth();

  // =====================
  // Scroll to top button
  // =====================
  const scrollBtn = document.getElementById('scroll-top');
  scrollBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // =====================
  // Animate elements on scroll (Intersection Observer)
  // =====================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards and sections for animation
  document.querySelectorAll('.feature-card, .subject-card, .step-card, .learning-card, .activity-card, .stat-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});

// =====================
// Auth Helpers
// =====================

// Update navbar based on login state
function updateNavAuth() {
  const user = getCurrentUser();
  const loginLink = document.getElementById('nav-login-link');
  const dashLink = document.getElementById('nav-dashboard-link');
  const logoutLink = document.getElementById('nav-logout-link');

  if (user) {
    loginLink?.classList.add('d-none');
    dashLink?.classList.remove('d-none');
    logoutLink?.classList.remove('d-none');
    if (dashLink) dashLink.textContent = user.name.split(' ')[0]; // Show first name
  } else {
    loginLink?.classList.remove('d-none');
    dashLink?.classList.add('d-none');
    logoutLink?.classList.add('d-none');
  }
}

// Get current logged-in user from localStorage
function getCurrentUser() {
  try {
    const data = localStorage.getItem('udaan_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Get auth token
function getToken() {
  return localStorage.getItem('udaan_token');
}

// Logout user
function logout() {
  localStorage.removeItem('udaan_user');
  localStorage.removeItem('udaan_token');
  showToast('Logged out successfully', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1000);
}

// Redirect if not logged in
function requireAuth(redirectTo = 'login.html') {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to continue', 'warning');
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 1000);
    return false;
  }
  return true;
}

// =====================
// Toast Notification System
// =====================
function showToast(message, type = 'info', duration = 3500) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Icon map
  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    info: 'fa-circle-info',
    warning: 'fa-triangle-exclamation'
  };

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// =====================
// Loading Overlay
// =====================
function showLoading(message = 'Loading...') {
  let overlay = document.getElementById('loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="spinner"></div>
      <p>${message}</p>
    `;
    document.body.appendChild(overlay);
  }
  overlay.querySelector('p').textContent = message;
  overlay.classList.add('active');
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay?.classList.remove('active');
}

// =====================
// API Helper Function
// =====================
// Makes API calls with auth header automatically
async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json' };

  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const result = await response.json();
    return { ok: response.ok, status: response.status, data: result };
  } catch (error) {
    console.error('API Error:', error);
    return { ok: false, status: 0, data: { message: 'Network error. Is the server running?' } };
  }
}

// =====================
// Form Validation Helpers
// =====================
function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function showFieldError(field, message) {
  field.classList.add('is-invalid');
  const existing = field.parentElement.querySelector('.field-error');
  if (existing) existing.remove();
  const error = document.createElement('div');
  error.className = 'field-error';
  error.style.cssText = 'color: #EF4444; font-size: 0.78rem; margin-top: 0.35rem;';
  error.textContent = message;
  field.parentElement.appendChild(error);
}

function clearFieldErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(f => f.classList.remove('is-invalid'));
  form.querySelectorAll('.field-error').forEach(e => e.remove());
}

// =====================
// Progress Tracking - Update user progress
// =====================
async function trackProgress(type, value = null, subject = null) {
  const user = getCurrentUser();
  if (!user) return; // Only track for logged-in users

  try {
    await apiCall('/progress', 'POST', { type, value, subject }, true);
  } catch (err) {
    // Silent fail - don't interrupt user experience
    console.log('Progress tracking error:', err);
  }
}

// =====================
// Seed Quiz Questions (call once)
// =====================
async function seedQuizData() {
  const result = await apiCall('/quizzes/seed', 'POST');
  if (result.ok) {
    showToast('Quiz questions loaded!', 'success');
  }
}

// =====================
// Number Counter Animation
// =====================
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

// Expose functions globally for inline HTML use
window.logout = logout;
window.showToast = showToast;
window.getCurrentUser = getCurrentUser;
window.getToken = getToken;
window.apiCall = apiCall;
window.requireAuth = requireAuth;
window.trackProgress = trackProgress;
