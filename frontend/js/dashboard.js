// ============================================================
// js/dashboard.js - Student Dashboard Logic
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to view your dashboard', 'warning');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return;
  }

  // Show user info
  displayUserInfo(user);

  // Load progress data
  await loadDashboardData(user);
});

// =====================
// Display User Info
// =====================
function displayUserInfo(user) {
  const nameEl = document.getElementById('dashboard-name');
  const emailEl = document.getElementById('dashboard-email');
  const classEl = document.getElementById('dashboard-class');
  const avatarEl = document.getElementById('dashboard-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  if (classEl) classEl.textContent = user.studentClass ? `Class ${user.studentClass}` : 'Student';

  // Set avatar initials
  if (avatarEl) {
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    avatarEl.textContent = initials;
  }
}

// =====================
// Load Dashboard Data from API
// =====================
async function loadDashboardData(user) {
  showLoadingState();

  const result = await apiCall(`/progress/${user.id}`, 'GET', null, true);

  if (result.ok) {
    displayStats(result.data.progress, result.data.recentResults);
  } else {
    // Show default stats if API fails
    displayStats(null, []);
    if (result.status === 0) {
      showToast('Dashboard working in offline mode', 'info');
    }
  }
}

// =====================
// Display Stats Cards
// =====================
function displayStats(progress, recentResults) {
  const p = progress || {};

  // Update stat cards
  animateValue('stat-lessons', p.lessonsCompleted || 0);
  animateValue('stat-quizzes', p.quizzesTaken || 0);
  animateValue('stat-activities', p.activitiesCompleted || 0);
  animateValue('stat-points', p.learningPoints || 0);

  // Best score
  const bestScoreEl = document.getElementById('stat-best-score');
  if (bestScoreEl) bestScoreEl.textContent = `${p.bestScore || 0}%`;

  // Subjects explored
  const subjectsEl = document.getElementById('stat-subjects');
  if (subjectsEl) subjectsEl.textContent = (p.subjectsExplored || []).length;

  // Update progress bars
  updateProgressBars(p);

  // Recent quiz results
  displayRecentResults(recentResults || []);

  // Subjects explored list
  displaySubjectsExplored(p.subjectsExplored || []);

  // Welcome message
  const lastActiveEl = document.getElementById('last-active');
  if (lastActiveEl && p.lastActive) {
    const date = new Date(p.lastActive);
    lastActiveEl.textContent = `Last active: ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
}

// =====================
// Progress Bars
// =====================
function updateProgressBars(p) {
  // Overall progress (based on points out of 500)
  const overall = Math.min(((p.learningPoints || 0) / 500) * 100, 100);
  setProgressBar('progress-overall', overall);

  // Quiz performance (best score)
  setProgressBar('progress-quiz', p.bestScore || 0);

  // Lessons (out of 20 assumed total)
  const lessonPct = Math.min(((p.lessonsCompleted || 0) / 20) * 100, 100);
  setProgressBar('progress-lessons', lessonPct);

  // Activities (out of 10 total)
  const actPct = Math.min(((p.activitiesCompleted || 0) / 10) * 100, 100);
  setProgressBar('progress-activities', actPct);

  // Subjects (out of 5 total)
  const subjPct = Math.min((((p.subjectsExplored || []).length) / 5) * 100, 100);
  setProgressBar('progress-subjects', subjPct);
}

function setProgressBar(id, percent) {
  const fill = document.getElementById(id);
  if (fill) {
    setTimeout(() => {
      fill.style.width = `${Math.round(percent)}%`;
    }, 100);
    // Update label
    const label = document.getElementById(`${id}-label`);
    if (label) label.textContent = `${Math.round(percent)}%`;
  }
}

// =====================
// Recent Quiz Results
// =====================
function displayRecentResults(results) {
  const container = document.getElementById('recent-results');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding:2rem;">
        <i class="fa-solid fa-clipboard-question"></i>
        <h3>No quizzes taken yet</h3>
        <p>Take a quiz to see your results here!</p>
        <a href="quiz.html" class="btn btn-primary btn-sm" style="margin-top:1rem;">Take a Quiz</a>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(r => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:0.85rem 0;border-bottom:1px solid var(--gray-light);">
      <div>
        <div style="font-weight:600;font-size:0.9rem;">${r.subject}</div>
        <div style="font-size:0.78rem;color:var(--gray);">${new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;color:${r.percentage >= 60 ? 'var(--success)' : r.percentage >= 40 ? 'var(--warning)' : 'var(--danger)'};">${r.percentage}%</div>
        <div style="font-size:0.78rem;color:var(--gray);">${r.score}/${r.totalQuestions} correct</div>
      </div>
    </div>
  `).join('');
}

// =====================
// Subjects Explored Tags
// =====================
function displaySubjectsExplored(subjects) {
  const container = document.getElementById('subjects-explored');
  if (!container) return;

  if (subjects.length === 0) {
    container.innerHTML = '<p style="color:var(--gray);font-size:0.88rem;">No subjects explored yet. Visit the Learning Hub!</p>';
    return;
  }

  const colors = {
    'English': '#EFF6FF',
    'Mathematics': '#ECFDF5',
    'Science': '#FFFBEB',
    'General Knowledge': '#F5F3FF',
    'Computer Basics': '#FDF2F8'
  };

  container.innerHTML = subjects.map(s => `
    <span style="display:inline-block;padding:0.35rem 0.85rem;border-radius:50px;font-size:0.82rem;font-weight:600;background:${colors[s] || '#EFF6FF'};margin:0.25rem;">
      ${s}
    </span>
  `).join('');
}

// =====================
// Animate number values
// =====================
function animateValue(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 50);
}

// =====================
// Loading state
// =====================
function showLoadingState() {
  ['stat-lessons', 'stat-quizzes', 'stat-activities', 'stat-points'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '...';
      el.style.color = 'var(--gray)';
    }
  });
}
