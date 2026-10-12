// ============================================================
// js/quiz.js - Interactive Quiz Logic
// ============================================================

// Quiz state
let quizState = {
  subject: '',
  questions: [],
  currentIndex: 0,
  selectedAnswers: {},
  startTime: null,
  submitted: false
};

// Local fallback questions in case backend is offline
const fallbackQuestions = {
  'English': [
    { _id: 'e1', question: 'How many letters are in the English alphabet?', options: ['24', '25', '26', '27'], correctAnswer: 2 },
    { _id: 'e2', question: 'Which of these is a vowel?', options: ['B', 'C', 'A', 'D'], correctAnswer: 2 },
    { _id: 'e3', question: 'What is the opposite of "big"?', options: ['Large', 'Small', 'Tall', 'Wide'], correctAnswer: 1 },
    { _id: 'e4', question: 'Which word is a noun?', options: ['Run', 'Quickly', 'Happy', 'Book'], correctAnswer: 3 },
    { _id: 'e5', question: 'Choose the correct spelling:', options: ['Beutiful', 'Beautifull', 'Beautiful', 'Beautyful'], correctAnswer: 2 },
  ],
  'Mathematics': [
    { _id: 'm1', question: 'What is 7 + 8?', options: ['13', '14', '15', '16'], correctAnswer: 2 },
    { _id: 'm2', question: 'What is 12 × 3?', options: ['34', '36', '35', '37'], correctAnswer: 1 },
    { _id: 'm3', question: 'What is 100 ÷ 5?', options: ['15', '25', '20', '10'], correctAnswer: 2 },
    { _id: 'm4', question: 'What is 15 - 7?', options: ['6', '7', '8', '9'], correctAnswer: 2 },
    { _id: 'm5', question: 'What is the value of 2³?', options: ['6', '8', '9', '12'], correctAnswer: 1 },
  ],
  'Science': [
    { _id: 's1', question: 'What do plants need to make their food?', options: ['Moonlight', 'Sunlight', 'Firelight', 'Starlight'], correctAnswer: 1 },
    { _id: 's2', question: 'How many legs does a spider have?', options: ['6', '8', '10', '4'], correctAnswer: 1 },
    { _id: 's3', question: 'What is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Mars'], correctAnswer: 2 },
    { _id: 's4', question: 'What gas do plants absorb from the air?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctAnswer: 2 },
    { _id: 's5', question: 'What is the boiling point of water?', options: ['90°C', '95°C', '100°C', '110°C'], correctAnswer: 2 },
  ],
  'General Knowledge': [
    { _id: 'g1', question: 'What is the capital of India?', options: ['Mumbai', 'Chennai', 'New Delhi', 'Kolkata'], correctAnswer: 2 },
    { _id: 'g2', question: 'How many states are there in India?', options: ['26', '27', '28', '29'], correctAnswer: 2 },
    { _id: 'g3', question: 'Who is the Father of the Nation of India?', options: ['Nehru', 'Gandhi', 'Bose', 'Tilak'], correctAnswer: 1 },
    { _id: 'g4', question: 'Which is the largest ocean in the world?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 3 },
    { _id: 'g5', question: 'In which sport is the term "century" used?', options: ['Football', 'Cricket', 'Hockey', 'Tennis'], correctAnswer: 1 },
  ],
  'Computer Basics': [
    { _id: 'c1', question: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Power Unit', 'Core Processing Unit', 'Central Power Unit'], correctAnswer: 0 },
    { _id: 'c2', question: 'Which device is used to input data by clicking?', options: ['Keyboard', 'Monitor', 'Mouse', 'Speaker'], correctAnswer: 2 },
    { _id: 'c3', question: 'What does WWW stand for?', options: ['World Wide Web', 'World Web Wide', 'Wide World Web', 'Web World Wide'], correctAnswer: 0 },
    { _id: 'c4', question: 'Which key is used to delete text to the left?', options: ['Delete', 'Backspace', 'Escape', 'Enter'], correctAnswer: 1 },
    { _id: 'c5', question: 'What is used to store permanent data in a computer?', options: ['RAM', 'CPU', 'Hard Drive', 'Monitor'], correctAnswer: 2 },
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  setupSubjectButtons();
  setupQuizNavigation();
});

// =====================
// Subject Selection
// =====================
function setupSubjectButtons() {
  document.querySelectorAll('.subject-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const subject = btn.dataset.subject;
      loadQuiz(subject);
    });
  });
}

// =====================
// Load Quiz Questions
// =====================
async function loadQuiz(subject) {
  quizState = { subject, questions: [], currentIndex: 0, selectedAnswers: {}, startTime: null, submitted: false };

  const quizArea = document.getElementById('quiz-area');
  const subjectSelect = document.getElementById('subject-select');
  
  if (quizArea) quizArea.style.display = 'none';

  // Show loading
  showQuizLoading(true);

  // Try to fetch from API first
  const result = await apiCall(`/quizzes?subject=${encodeURIComponent(subject)}`);

  let questions = [];
  if (result.ok && result.data.quizzes && result.data.quizzes.length > 0) {
    questions = result.data.quizzes;
  } else {
    // Use fallback questions
    questions = fallbackQuestions[subject] || [];
    if (result.status === 0) {
      showToast('Using offline quiz mode', 'info');
    }
  }

  showQuizLoading(false);

  if (questions.length === 0) {
    showToast('No questions found for this subject', 'warning');
    return;
  }

  // Shuffle and limit to 5 questions
  quizState.questions = shuffleArray(questions).slice(0, 5);
  quizState.startTime = Date.now();
  quizState.submitted = false;

  renderQuestion();
  if (quizArea) quizArea.style.display = 'block';

  // Track that user explored this subject
  trackProgress('subject', null, subject);
}

// =====================
// Render Current Question
// =====================
function renderQuestion() {
  const { questions, currentIndex, selectedAnswers } = quizState;
  const question = questions[currentIndex];

  if (!question) return;

  // Update question counter
  const counter = document.getElementById('quiz-counter');
  if (counter) counter.textContent = `Question ${currentIndex + 1} of ${questions.length}`;

  // Update progress bar
  const progressFill = document.getElementById('quiz-progress-fill');
  if (progressFill) {
    const percent = ((currentIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${percent}%`;
  }

  // Subject badge
  const subjectBadge = document.getElementById('quiz-subject-badge');
  if (subjectBadge) subjectBadge.textContent = quizState.subject;

  // Display question text
  const questionText = document.getElementById('quiz-question-text');
  if (questionText) questionText.textContent = question.question;

  // Display options
  const optionsContainer = document.getElementById('quiz-options');
  if (!optionsContainer) return;

  optionsContainer.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];

  question.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    if (selectedAnswers[currentIndex] === index) {
      btn.classList.add('selected');
    }
    btn.innerHTML = `
      <span class="option-label">${labels[index]}</span>
      <span>${option}</span>
    `;
    btn.addEventListener('click', () => selectOption(index, btn, optionsContainer, question));
    optionsContainer.appendChild(btn);
  });

  // Update navigation buttons
  updateNavButtons();
}

// =====================
// Handle Option Selection
// =====================
function selectOption(index, btn, container, question) {
  if (quizState.submitted) return; // Don't allow changes after submit

  // Remove selection from all options
  container.querySelectorAll('.option-btn').forEach(b => {
    b.classList.remove('selected', 'correct', 'wrong');
    b.querySelector('.option-label').style.background = '';
  });

  // Mark selected
  quizState.selectedAnswers[quizState.currentIndex] = index;
  btn.classList.add('selected');

  updateNavButtons();
}

// =====================
// Navigation Buttons Setup
// =====================
function setupQuizNavigation() {
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (quizState.currentIndex > 0) {
      quizState.currentIndex--;
      renderQuestion();
    }
  });

  document.getElementById('next-btn')?.addEventListener('click', () => {
    if (quizState.currentIndex < quizState.questions.length - 1) {
      quizState.currentIndex++;
      renderQuestion();
    }
  });

  document.getElementById('submit-btn')?.addEventListener('click', submitQuiz);
  document.getElementById('retry-btn')?.addEventListener('click', () => {
    // Reset and reload same subject
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'none';
    document.querySelectorAll('.subject-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('quiz-intro').style.display = 'block';
  });
}

// =====================
// Update Nav Button States
// =====================
function updateNavButtons() {
  const { currentIndex, questions, selectedAnswers } = quizState;
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document.getElementById('submit-btn');

  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.style.display = currentIndex < questions.length - 1 ? 'flex' : 'none';

  // Show submit only on last question when all answered
  const answeredAll = Object.keys(selectedAnswers).length === questions.length;
  if (submitBtn) {
    submitBtn.style.display = currentIndex === questions.length - 1 ? 'flex' : 'none';
  }
}

// =====================
// Submit Quiz & Calculate Score
// =====================
async function submitQuiz() {
  const { questions, selectedAnswers, subject, startTime } = quizState;
  
  // Check unanswered questions
  const unanswered = questions.length - Object.keys(selectedAnswers).length;
  if (unanswered > 0) {
    showToast(`Please answer all ${unanswered} remaining question(s)`, 'warning');
    return;
  }

  quizState.submitted = true;

  // Calculate score
  let score = 0;
  questions.forEach((q, i) => {
    if (selectedAnswers[i] === q.correctAnswer) score++;
  });

  const percentage = Math.round((score / questions.length) * 100);
  const timeTaken = Math.round((Date.now() - startTime) / 1000);

  // Show correct/wrong indicators on current view
  showAnswerFeedback();

  // Show result after short delay
  setTimeout(() => {
    showResult(score, questions.length, percentage);
  }, 1500);

  // Save result to backend (if logged in)
  const user = getCurrentUser();
  if (user) {
    await apiCall('/quizzes/results', 'POST', {
      subject, score, totalQuestions: questions.length, timeTaken
    }, true);
  }
}

// =====================
// Show Answer Feedback
// =====================
function showAnswerFeedback() {
  const { questions, currentIndex, selectedAnswers } = quizState;
  const optionsContainer = document.getElementById('quiz-options');
  if (!optionsContainer) return;

  const buttons = optionsContainer.querySelectorAll('.option-btn');
  const currentQuestion = questions[currentIndex];
  const selectedIdx = selectedAnswers[currentIndex];

  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === currentQuestion.correctAnswer) {
      btn.classList.add('correct');
    } else if (index === selectedIdx && selectedIdx !== currentQuestion.correctAnswer) {
      btn.classList.add('wrong');
    }
  });
}

// =====================
// Display Results
// =====================
function showResult(score, total, percentage) {
  const quizArea = document.getElementById('quiz-area');
  const resultDiv = document.getElementById('quiz-result');
  if (!resultDiv) return;

  // Hide quiz, show result
  quizArea.style.display = 'none';
  resultDiv.style.display = 'block';

  // Determine grade
  let grade, circleClass, message, emoji;
  if (percentage >= 80) {
    grade = 'Excellent!'; circleClass = 'result-excellent'; message = 'Outstanding performance! You are a star learner! 🌟'; emoji = '🏆';
  } else if (percentage >= 60) {
    grade = 'Good Job!'; circleClass = 'result-good'; message = 'Well done! Keep practicing to score even higher! 👍'; emoji = '😊';
  } else if (percentage >= 40) {
    grade = 'Keep Trying!'; circleClass = 'result-average'; message = 'Good effort! Review the lessons and try again. 📚'; emoji = '📖';
  } else {
    grade = 'Keep Practicing!'; circleClass = 'result-poor'; message = 'Don\'t give up! Learning takes practice. You\'ve got this! 💪'; emoji = '🌱';
  }

  resultDiv.innerHTML = `
    <div class="quiz-result">
      <div class="result-circle ${circleClass}">
        <span>${percentage}%</span>
        <small style="font-size:0.6rem;font-weight:500;">Score</small>
      </div>
      <h2 style="margin-bottom:0.5rem;">${emoji} ${grade}</h2>
      <p style="color:var(--gray);margin-bottom:1.5rem;">${message}</p>
      <div style="background:var(--bg);border-radius:12px;padding:1.25rem;margin-bottom:1.75rem;text-align:left;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
          <span style="font-size:0.9rem;color:var(--gray);">Correct Answers</span>
          <strong style="color:var(--success);">${score} / ${total}</strong>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.9rem;color:var(--gray);">Wrong Answers</span>
          <strong style="color:var(--danger);">${total - score} / ${total}</strong>
        </div>
      </div>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="loadQuiz('${quizState.subject}')">
          <i class="fa-solid fa-rotate-right"></i> Try Again
        </button>
        <a href="dashboard.html" class="btn btn-outline">
          <i class="fa-solid fa-gauge-high"></i> View Dashboard
        </a>
      </div>
    </div>
  `;
}

// =====================
// Helper: Shuffle array
// =====================
function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// =====================
// Show loading in quiz area
// =====================
function showQuizLoading(show) {
  const intro = document.getElementById('quiz-intro');
  const loadingDiv = document.getElementById('quiz-loading');
  if (show) {
    if (intro) intro.style.display = 'none';
    if (loadingDiv) loadingDiv.style.display = 'flex';
  } else {
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (intro) intro.style.display = 'block';
  }
}
