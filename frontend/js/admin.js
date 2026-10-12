// ============================================================
// js/admin.js - Admin Panel Logic
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check admin authentication
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    showToast('Admin access required', 'error');
    setTimeout(() => window.location.href = 'login.html', 1200);
    return;
  }

  // Show admin name
  const adminNameEl = document.getElementById('admin-name');
  if (adminNameEl) adminNameEl.textContent = user.name;

  // Load dashboard stats
  await loadAdminStats();

  // Setup navigation
  setupAdminNav();

  // Setup add quiz form
  setupAddQuizForm();
});

// =====================
// Admin Stats
// =====================
async function loadAdminStats() {
  const result = await apiCall('/admin/stats', 'GET', null, true);
  if (result.ok) {
    const s = result.data.stats;
    setAdminStat('total-students', s.totalStudents);
    setAdminStat('total-quizzes', s.totalQuizzes);
    setAdminStat('total-feedback', s.totalFeedback);
    setAdminStat('avg-score', `${s.averageScore}%`);
  }
}

function setAdminStat(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// =====================
// Navigation Tabs
// =====================
function setupAdminNav() {
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const panel = item.dataset.panel;
      showAdminPanel(panel);

      document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Load data for the panel
      switch (panel) {
        case 'users': loadUsers(); break;
        case 'feedback': loadFeedback(); break;
        case 'results': loadResults(); break;
        case 'quizzes': loadQuestions(); break;
      }
    });
  });
}

function showAdminPanel(panel) {
  document.querySelectorAll('.admin-panel-content').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`panel-${panel}`);
  if (target) target.classList.add('active');
}

// =====================
// Load Users
// =====================
async function loadUsers() {
  const container = document.getElementById('users-table-body');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';

  const result = await apiCall('/admin/users', 'GET', null, true);

  if (result.ok && result.data.users.length > 0) {
    container.innerHTML = result.data.users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.age || '—'}</td>
        <td>${u.studentClass || '—'}</td>
        <td>${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteUser('${u._id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  } else {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--gray)">No students registered yet.</td></tr>';
  }
}

// =====================
// Delete User
// =====================
async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;
  const result = await apiCall(`/admin/users/${id}`, 'DELETE', null, true);
  if (result.ok) {
    showToast('Student deleted', 'success');
    loadUsers();
  } else {
    showToast('Failed to delete student', 'error');
  }
}

// =====================
// Load Feedback
// =====================
async function loadFeedback() {
  const container = document.getElementById('feedback-table-body');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';

  const result = await apiCall('/admin/feedback', 'GET', null, true);

  if (result.ok && result.data.feedbacks.length > 0) {
    const stars = (n) => '⭐'.repeat(n);
    container.innerHTML = result.data.feedbacks.map(f => `
      <tr>
        <td><strong>${f.name}</strong></td>
        <td>${f.email || '—'}</td>
        <td>${stars(f.rating)} (${f.rating}/5)</td>
        <td style="max-width:250px;">${f.message}</td>
        <td>${new Date(f.createdAt).toLocaleDateString('en-IN')}</td>
      </tr>
    `).join('');
  } else {
    container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray)">No feedback submitted yet.</td></tr>';
  }
}

// =====================
// Load Quiz Results
// =====================
async function loadResults() {
  const container = document.getElementById('results-table-body');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';

  const result = await apiCall('/admin/results', 'GET', null, true);

  if (result.ok && result.data.results.length > 0) {
    container.innerHTML = result.data.results.map(r => `
      <tr>
        <td><strong>${r.studentName}</strong></td>
        <td>${r.subject}</td>
        <td>${r.score}/${r.totalQuestions}</td>
        <td>
          <span class="badge ${r.percentage >= 60 ? 'badge-green' : r.percentage >= 40 ? 'badge-amber' : 'badge-red'}">
            ${r.percentage}%
          </span>
        </td>
        <td>${new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
      </tr>
    `).join('');
  } else {
    container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray)">No quiz results yet.</td></tr>';
  }
}

// =====================
// Load Quiz Questions
// =====================
async function loadQuestions() {
  const container = document.getElementById('questions-table-body');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--gray)"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</td></tr>';

  const result = await apiCall('/quizzes', 'GET', null, true);

  if (result.ok && result.data.quizzes.length > 0) {
    container.innerHTML = result.data.quizzes.map(q => `
      <tr>
        <td><span class="badge badge-blue">${q.subject}</span></td>
        <td style="max-width:300px;">${q.question}</td>
        <td>${q.options[q.correctAnswer]}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteQuestion('${q._id}')">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');
  } else {
    container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:2rem;color:var(--gray)">No questions added. <button class="btn btn-primary btn-sm" onclick="seedQuestions()">Seed Sample Questions</button></td></tr>';
  }
}

// =====================
// Delete Question
// =====================
async function deleteQuestion(id) {
  if (!confirm('Delete this quiz question?')) return;
  const result = await apiCall(`/quizzes/${id}`, 'DELETE', null, true);
  if (result.ok) {
    showToast('Question deleted', 'success');
    loadQuestions();
    loadAdminStats();
  } else {
    showToast('Failed to delete question', 'error');
  }
}

// =====================
// Seed Sample Questions
// =====================
async function seedQuestions() {
  showLoading('Seeding questions...');
  const result = await apiCall('/quizzes/seed', 'POST');
  hideLoading();
  if (result.ok) {
    showToast(result.data.message, 'success');
    loadQuestions();
    loadAdminStats();
  } else {
    showToast('Seeding failed: ' + result.data.message, 'error');
  }
}

// =====================
// Add Quiz Question Form
// =====================
function setupAddQuizForm() {
  const form = document.getElementById('add-question-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const subject = document.getElementById('q-subject').value;
    const question = document.getElementById('q-question').value.trim();
    const option1 = document.getElementById('q-opt1').value.trim();
    const option2 = document.getElementById('q-opt2').value.trim();
    const option3 = document.getElementById('q-opt3').value.trim();
    const option4 = document.getElementById('q-opt4').value.trim();
    const correctAnswer = parseInt(document.getElementById('q-correct').value);

    if (!subject || !question || !option1 || !option2 || !option3 || !option4) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...';
    submitBtn.disabled = true;

    const result = await apiCall('/quizzes', 'POST', {
      subject,
      question,
      options: [option1, option2, option3, option4],
      correctAnswer,
      difficulty: 'easy'
    }, true);

    submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Question';
    submitBtn.disabled = false;

    if (result.ok) {
      showToast('Question added successfully!', 'success');
      form.reset();
      loadQuestions();
      loadAdminStats();
    } else {
      showToast(result.data.message || 'Failed to add question', 'error');
    }
  });
}

// Expose to window for inline handlers
window.deleteUser = deleteUser;
window.deleteQuestion = deleteQuestion;
window.seedQuestions = seedQuestions;
