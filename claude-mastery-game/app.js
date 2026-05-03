// ── STATE ──────────────────────────────────────────────────────────────
const DEFAULT_GAME_STATE = {
  xp: 0,
  achievements: [],
  streak: 0,
  maxStreak: 0,
  modules: {}
};

// Per-module state: { completed, stars, bestScore, attempts }
MODULES.forEach(m => {
  DEFAULT_GAME_STATE.modules[m.id] = { completed: false, stars: 0, bestScore: 0, attempts: 0 };
});

let gs = JSON.parse(localStorage.getItem('claude_gs')) || deepClone(DEFAULT_GAME_STATE);
let qs = null; // quiz state, set in startModule()
let currentScreen = 'home';

// ── PERSISTENCE ────────────────────────────────────────────────────────
function saveGS() { localStorage.setItem('claude_gs', JSON.stringify(gs)); }

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

// ── NAVIGATION ─────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  currentScreen = id;

  const navbar = document.getElementById('navbar');
  if (id === 'home') {
    navbar.classList.add('hidden');
  } else {
    navbar.classList.remove('hidden');
    document.getElementById('nav-xp-count').textContent = gs.xp;
  }

  if (id === 'modules') renderModules();
  if (id === 'profile') renderProfile();
}

function goBack() {
  if (currentScreen === 'quiz') {
    if (qs && qs.timer) clearInterval(qs.timer);
    showScreen('modules');
  } else {
    showScreen('modules');
  }
}

// ── HOME ───────────────────────────────────────────────────────────────
function initHome() {
  spawnParticles();
}

function spawnParticles() {
  const container = document.getElementById('particles');
  const colors = ['#7C3AED', '#2563EB', '#059669', '#EC4899', '#F59E0B', '#0EA5E9', '#FBBF24'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 8}s;
    `;
    container.appendChild(p);
  }
}

// ── MODULES SCREEN ─────────────────────────────────────────────────────
function renderModules() {
  const grid = document.getElementById('modules-grid');
  grid.innerHTML = '';

  const level = getCurrentLevel();
  document.getElementById('level-badge').textContent = level.name;

  const xpInLevel = gs.xp - level.minXP;
  const levelRange = level.maxXP - level.minXP;
  const pct = Math.min(100, Math.round((xpInLevel / levelRange) * 100));
  document.getElementById('xp-bar-fill').style.width = pct + '%';
  document.getElementById('xp-current').textContent = gs.xp + ' XP';
  document.getElementById('xp-next').textContent = level.maxXP + ' XP';

  updateJourneyBanner();

  MODULES.forEach((mod, idx) => {
    const mState = gs.modules[mod.id];
    const isLocked = idx > 0 && !gs.modules[MODULES[idx - 1].id].completed;
    const card = document.createElement('div');
    card.className = 'module-card' + (isLocked ? ' locked' : '');
    card.style.cssText = `--module-gradient: linear-gradient(135deg, ${mod.colorStart}, ${mod.colorEnd}); animation-delay: ${idx * 0.07}s`;
    if (!isLocked) card.onclick = () => startModule(mod.id);

    const stars = starsHTML(mState.stars);
    const statusText = isLocked ? 'VERROUILLÉ' : (mState.completed ? 'TERMINÉ' : 'NOUVEAU');
    const statusClass = isLocked ? 'locked' : (mState.completed ? 'done' : 'new');

    card.innerHTML = `
      <div class="module-color-bar" style="background: linear-gradient(180deg, ${mod.colorStart}, ${mod.colorEnd})"></div>
      <div class="module-card-inner">
        <div class="module-icon-wrap" style="background: linear-gradient(135deg, ${mod.colorStart}, ${mod.colorEnd})">
          ${mod.icon}
        </div>
        <div class="module-info">
          <div class="module-title">${mod.title}</div>
          <div class="module-subtitle">${mod.subtitle}</div>
        </div>
        <div class="module-meta">
          <div class="module-stars">${stars}</div>
          <div class="module-status ${statusClass}">${statusText}</div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function starsHTML(count) {
  let s = '';
  for (let i = 0; i < 3; i++) s += i < count ? '⭐' : '☆';
  return s;
}

// ── JOURNEY BANNER ─────────────────────────────────────────────────────
function updateJourneyBanner() {
  // Map modules to journey phases
  // Phase 0 (Outils): skills, prompting
  // Phase 1 (Communication): cowork, routines, design
  // Phase 2 (Armée): agents
  // Phase 3 (AI CEO): vision
  const phases = [
    ['skills', 'prompting'],
    ['cowork', 'routines', 'design'],
    ['agents'],
    ['vision']
  ];

  let currentPhase = 0;
  phases.forEach((ids, i) => {
    const allDone = ids.every(id => gs.modules[id] && gs.modules[id].completed);
    if (allDone) currentPhase = Math.min(i + 1, 3);
  });

  const mottos = [
    'Maîtrisez les outils avant de diriger.',
    'Communiquez avec précision, déléguez avec confiance.',
    'Votre armée prend forme — vous approchez du sommet.',
    '✨ Vous opérez au niveau vision. Top 1% atteint.'
  ];

  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('js-' + i);
    if (!el) continue;
    el.classList.remove('done', 'active');
    if (i < currentPhase) el.classList.add('done');
    else if (i === currentPhase) el.classList.add('active');
  }

  const motto = document.getElementById('journey-motto');
  if (motto) motto.textContent = mottos[currentPhase];
}

// ── QUIZ START ──────────────────────────────────────────────────────────
function startModule(moduleId) {
  const mod = MODULES.find(m => m.id === moduleId);
  gs.modules[moduleId].attempts++;
  saveGS();

  const shuffled = [...mod.questions].map((q, i) => i).sort(() => Math.random() - 0.5);

  qs = {
    moduleId,
    mod,
    questions: shuffled.map(i => mod.questions[i]),
    index: 0,
    lives: 3,
    xpEarned: 0,
    correct: 0,
    streak: 0,
    maxStreak: 0,
    timer: null,
    timeLeft: 30,
    answered: false,
    newAchievements: [],
    questionStartTime: null
  };

  document.getElementById('quiz-module-icon').textContent = mod.icon;
  document.getElementById('quiz-module-name').textContent = mod.title;
  document.getElementById('q-total').textContent = qs.questions.length;

  updateLivesUI();
  document.getElementById('quiz-xp-earned').textContent = '0';
  document.getElementById('explanation-panel').classList.add('hidden');
  document.getElementById('streak-display').classList.add('hidden');

  showScreen('quiz');
  showQuestion();
}

// ── QUESTION DISPLAY ───────────────────────────────────────────────────
function showQuestion() {
  const q = qs.questions[qs.index];
  qs.answered = false;
  qs.questionStartTime = Date.now();

  // Progress
  const pct = (qs.index / qs.questions.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = pct + '%';
  document.getElementById('q-current').textContent = qs.index + 1;

  // Question text
  document.getElementById('question-text').textContent = q.q;

  // Answers
  const grid = document.getElementById('answers-grid');
  grid.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.innerHTML = `<span class="answer-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick = () => selectAnswer(i);
    grid.appendChild(btn);
  });

  // Hide explanation
  document.getElementById('explanation-panel').classList.add('hidden');
  document.getElementById('streak-display').classList.add('hidden');

  // Start timer
  startTimer();
}

// ── TIMER ──────────────────────────────────────────────────────────────
function startTimer() {
  if (qs.timer) clearInterval(qs.timer);
  qs.timeLeft = 30;
  updateTimerUI(30);

  qs.timer = setInterval(() => {
    qs.timeLeft--;
    updateTimerUI(qs.timeLeft);
    if (qs.timeLeft <= 0) {
      clearInterval(qs.timer);
      if (!qs.answered) timeOut();
    }
  }, 1000);
}

function updateTimerUI(t) {
  document.getElementById('timer-text').textContent = t;
  const circumference = 163.36;
  const offset = circumference * (1 - t / 30);
  const circle = document.getElementById('timer-circle');
  circle.style.strokeDashoffset = offset;
  circle.style.stroke = t > 15 ? '#10B981' : t > 7 ? '#F59E0B' : '#EF4444';
}

function timeOut() {
  if (qs.answered) return;
  qs.answered = true;
  qs.streak = 0;
  loseLife();
  const q = qs.questions[qs.index];
  highlightAnswers(-1, q.correct);
  showExplanation(false, q.explain);
}

// ── ANSWER SELECTION ───────────────────────────────────────────────────
function selectAnswer(idx) {
  if (qs.answered) return;
  qs.answered = true;
  clearInterval(qs.timer);

  const q = qs.questions[qs.index];
  const correct = idx === q.correct;
  const elapsed = (Date.now() - qs.questionStartTime) / 1000;

  highlightAnswers(idx, q.correct);

  if (correct) {
    qs.correct++;
    qs.streak++;
    gs.streak = Math.max(gs.streak, qs.streak);
    qs.maxStreak = Math.max(qs.maxStreak, qs.streak);

    const baseXP = 100;
    const timeBonus = Math.round(Math.max(0, (30 - elapsed) / 30) * 50);
    const streakBonus = (qs.streak - 1) * 10;
    const gained = baseXP + timeBonus + streakBonus;
    qs.xpEarned += gained;

    floatXP('+' + gained + ' XP', true);
    pulseCard();
    document.getElementById('quiz-xp-earned').textContent = qs.xpEarned;

    // Streak display
    if (qs.streak >= 2) {
      const sd = document.getElementById('streak-display');
      document.getElementById('streak-count').textContent = qs.streak;
      sd.classList.remove('hidden');
    }

    // Speed achievement
    if (elapsed < 5) checkAndGrantAchievement('speed_5s');

    // First answer ever
    const totalAnswered = Object.values(gs.modules).reduce((s, m) => s + m.attempts, 0);
    if (totalAnswered <= 1 && qs.index === 0) checkAndGrantAchievement('first_answer');

  } else {
    qs.streak = 0;
    loseLife();
    shakeCard();
    floatXP('-1 ❤️', false);
  }

  // Streak achievements
  if (qs.streak >= 3) checkAndGrantAchievement('streak_3');
  if (qs.streak >= 5) checkAndGrantAchievement('streak_5');

  showExplanation(correct, q.explain);
}

function highlightAnswers(selected, correct) {
  const btns = document.querySelectorAll('.answer-btn');
  btns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correct) btn.classList.add('correct');
    else if (i === selected && i !== correct) btn.classList.add('wrong');
  });
}

// ── LIVES ──────────────────────────────────────────────────────────────
function loseLife() {
  if (qs.lives > 0) qs.lives--;
  updateLivesUI();
}

function updateLivesUI() {
  const container = document.getElementById('quiz-lives');
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const h = document.createElement('span');
    h.className = 'life-heart' + (i >= qs.lives ? ' lost' : '');
    h.textContent = '❤️';
    container.appendChild(h);
  }
  if (qs.lives === 0) {
    setTimeout(showGameOver, 1200);
  }
}

// ── EXPLANATION ────────────────────────────────────────────────────────
function showExplanation(correct, text) {
  const panel = document.getElementById('explanation-panel');
  document.getElementById('explanation-icon').textContent = correct ? '✅' : '❌';
  document.getElementById('explanation-text').textContent = text;
  panel.classList.remove('hidden');

  document.getElementById('btn-continue').onclick = () => {
    if (qs.lives === 0) return;
    advanceQuestion();
  };
}

function advanceQuestion() {
  qs.index++;
  if (qs.index >= qs.questions.length) {
    endModule();
  } else {
    showQuestion();
  }
}

// ── CARD ANIMATIONS ────────────────────────────────────────────────────
function shakeCard() {
  const card = document.getElementById('quiz-card');
  card.classList.remove('shake');
  void card.offsetWidth;
  card.classList.add('shake');
  setTimeout(() => card.classList.remove('shake'), 500);
}

function pulseCard() {
  const card = document.getElementById('quiz-card');
  card.classList.remove('pulse-correct');
  void card.offsetWidth;
  card.classList.add('pulse-correct');
  setTimeout(() => card.classList.remove('pulse-correct'), 500);
}

// ── GAME OVER ──────────────────────────────────────────────────────────
function showGameOver() {
  clearInterval(qs.timer);
  const overlay = document.createElement('div');
  overlay.className = 'game-over-overlay';
  overlay.id = 'game-over-overlay';
  overlay.innerHTML = `
    <div class="game-over-card">
      <div class="game-over-icon">💔</div>
      <div class="game-over-title">Perdu !</div>
      <div class="game-over-sub">Vous avez épuisé vos 3 vies.<br>Réessayez pour maîtriser ce module !</div>
      <div class="game-over-btns">
        <button class="btn-primary" onclick="retryModule()">Réessayer</button>
        <button class="btn-secondary" onclick="exitToModules()">Modules</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function retryModule() {
  const overlay = document.getElementById('game-over-overlay');
  if (overlay) overlay.remove();
  startModule(qs.moduleId);
}

function exitToModules() {
  const overlay = document.getElementById('game-over-overlay');
  if (overlay) overlay.remove();
  clearInterval(qs.timer);
  showScreen('modules');
}

// ── END MODULE ─────────────────────────────────────────────────────────
function endModule() {
  clearInterval(qs.timer);

  const total = qs.questions.length;
  const correct = qs.correct;
  const stars = correct >= 8 ? 3 : correct >= 6 ? 2 : correct >= 4 ? 1 : 0;

  // Update game state
  gs.xp += qs.xpEarned;
  const mState = gs.modules[qs.moduleId];
  const wasCompleted = mState.completed;
  if (correct >= 4) {
    mState.completed = true;
    if (stars > mState.stars) mState.stars = stars;
  }
  if (correct > mState.bestScore) mState.bestScore = correct;

  // Module achievement
  if (mState.completed) {
    checkAndGrantAchievement(qs.mod.achievementId);
    if (stars === 3) checkAndGrantAchievement('perfect_module');
    if (qs.lives === 1) checkAndGrantAchievement('survivor');
    // Check all modules
    if (MODULES.every(m => gs.modules[m.id].completed)) checkAndGrantAchievement('all_modules');
  }

  const levelBefore = getCurrentLevel(gs.xp - qs.xpEarned);
  const levelAfter = getCurrentLevel();
  saveGS();

  // Show level up if leveled up
  if (levelAfter.name !== levelBefore.name) {
    showLevelUp(levelAfter, () => showResults(correct, total, stars));
  } else {
    showResults(correct, total, stars);
  }
}

// ── LEVEL UP ───────────────────────────────────────────────────────────
function showLevelUp(level, callback) {
  triggerConfetti();
  const overlay = document.createElement('div');
  overlay.className = 'level-up-overlay';
  overlay.innerHTML = `
    <div class="level-up-card">
      <div class="level-up-bg">
        <div class="level-up-icon">${level.avatar}</div>
        <div class="level-up-label">NIVEAU SUPÉRIEUR !</div>
        <div class="level-up-name">${level.name}</div>
        <button class="level-up-btn" onclick="this.closest('.level-up-overlay').remove(); (${callback})()">
          Continuer →
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ── RESULTS ────────────────────────────────────────────────────────────
function showResults(correct, total, stars) {
  showScreen('results');

  // Stars
  let starsStr = '';
  for (let i = 0; i < 3; i++) {
    starsStr += `<span style="animation: pop-in 0.4s ${0.1 + i*0.15}s cubic-bezier(0.34,1.56,0.64,1) both; display:inline-block">${i < stars ? '⭐' : '☆'}</span>`;
  }
  document.getElementById('results-stars').innerHTML = starsStr;

  const titles = ['Courage !', 'Bon début !', 'Très bien !', 'Parfait !'];
  const subs = ['Réessayez, vous pouvez faire mieux.', 'Continuez à apprendre !', 'Vous maîtrisez le sujet !', 'Score parfait ! Impressionnant !'];
  document.getElementById('results-title').textContent = titles[stars];
  document.getElementById('results-subtitle').textContent = subs[stars];

  document.getElementById('result-xp').textContent = '+' + qs.xpEarned;
  document.getElementById('result-correct').textContent = correct + '/' + total;
  document.getElementById('result-streak').textContent = qs.maxStreak;

  // New achievements
  const earned = document.getElementById('achievements-earned');
  earned.innerHTML = '';
  if (qs.newAchievements.length > 0) {
    const title = document.createElement('p');
    title.style.cssText = 'font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px;';
    title.textContent = 'Succès débloqués';
    earned.appendChild(title);
    qs.newAchievements.forEach((id, i) => {
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (!ach) return;
      const el = document.createElement('div');
      el.className = 'achievement-unlocked';
      el.style.animationDelay = (0.2 + i * 0.15) + 's';
      el.innerHTML = `
        <div class="achievement-unlocked-icon">${ach.icon}</div>
        <div class="achievement-unlocked-info">
          <div class="achievement-unlocked-name">${ach.name}</div>
          <div class="achievement-unlocked-desc">${ach.desc}</div>
        </div>
        <div class="achievement-unlocked-new">NOUVEAU</div>
      `;
      earned.appendChild(el);
    });
  }

  if (stars >= 2) triggerConfetti();

  document.getElementById('btn-retry').onclick = () => startModule(qs.moduleId);
}

// ── PROFILE ────────────────────────────────────────────────────────────
function renderProfile() {
  const level = getCurrentLevel();
  document.getElementById('profile-avatar').textContent = level.avatar;
  document.getElementById('profile-level').textContent = level.name;
  document.getElementById('profile-xp').textContent = gs.xp + ' XP total';

  // Module progress
  const list = document.getElementById('module-progress-list');
  list.innerHTML = '';
  MODULES.forEach(mod => {
    const mState = gs.modules[mod.id];
    const pct = Math.round((mState.bestScore / mod.questions.length) * 100);
    const el = document.createElement('div');
    el.className = 'module-progress-item';
    el.innerHTML = `
      <div class="mpi-icon">${mod.icon}</div>
      <div class="mpi-info">
        <div class="mpi-name">${mod.title}</div>
        <div class="mpi-bar-wrap">
          <div class="mpi-bar" style="width: ${pct}%; background: linear-gradient(90deg, ${mod.colorStart}, ${mod.colorEnd})"></div>
        </div>
      </div>
      <div class="mpi-stars">${starsHTML(mState.stars)}</div>
    `;
    list.appendChild(el);
  });

  // Achievements grid
  const unlockedIds = new Set(gs.achievements);
  document.getElementById('achievements-count').textContent = `(${unlockedIds.size}/${ACHIEVEMENTS.length})`;
  const grid = document.getElementById('achievements-grid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const unlocked = unlockedIds.has(ach.id);
    const el = document.createElement('div');
    el.className = 'achievement-item' + (unlocked ? ' unlocked' : ' locked');
    el.innerHTML = `
      <div class="achievement-item-icon">${ach.icon}</div>
      <div class="achievement-item-name">${ach.name}</div>
      <div class="achievement-item-desc">${ach.desc}</div>
    `;
    grid.appendChild(el);
  });
}

// ── ACHIEVEMENTS ───────────────────────────────────────────────────────
function checkAndGrantAchievement(id) {
  if (gs.achievements.includes(id)) return;
  gs.achievements.push(id);
  if (qs) qs.newAchievements.push(id);
  saveGS();
}

// ── UTILS ──────────────────────────────────────────────────────────────
function getCurrentLevel(xp) {
  const x = xp !== undefined ? xp : gs.xp;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (x >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

// ── XP FLOAT ───────────────────────────────────────────────────────────
function floatXP(text, isGood) {
  const container = document.getElementById('xp-floats');
  const el = document.createElement('div');
  el.className = 'xp-float';
  el.textContent = text;
  el.style.color = isGood ? '#10B981' : '#EF4444';
  el.style.left = (40 + Math.random() * 30) + '%';
  el.style.top = '40%';
  container.appendChild(el);
  setTimeout(() => el.remove(), 1600);
}

// ── CONFETTI ───────────────────────────────────────────────────────────
function triggerConfetti() {
  const container = document.getElementById('confetti');
  const colors = ['#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EC4899', '#60A5FA', '#34D399'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetto';
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 6;
    const isCircle = Math.random() > 0.5;
    c.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px; height: ${size}px;
      background: ${color};
      border-radius: ${isCircle ? '50%' : '2px'};
      animation-duration: ${Math.random() * 1.5 + 1.5}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    container.appendChild(c);
  }
  setTimeout(() => container.innerHTML = '', 4000);
}

// ── RESET ──────────────────────────────────────────────────────────────
function resetGame() {
  if (!confirm('Êtes-vous sûr ? Toute votre progression sera effacée.')) return;
  localStorage.removeItem('claude_gs');
  gs = deepClone(DEFAULT_GAME_STATE);
  saveGS();
  showScreen('modules');
}

// ── INIT ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHome();
  // Ensure defaults exist for all modules
  MODULES.forEach(m => {
    if (!gs.modules[m.id]) {
      gs.modules[m.id] = { completed: false, stars: 0, bestScore: 0, attempts: 0 };
    }
  });
  saveGS();
});
