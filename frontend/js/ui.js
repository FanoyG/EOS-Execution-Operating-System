// ── CYCLE BLOCKS ──
export function renderCycleBlocks(state) {
  const s = state.settings;
  state.cycles[0].name = 'Block 1 — ' + (s.block1 || 'Learn');
  state.cycles[0].desc = 'Study & understand';
  state.cycles[1].name = 'Block 2 — ' + (s.block2 || 'Practice');
  state.cycles[1].desc = 'Hands-on work';
  state.cycles[2].name = 'Block 3 — ' + (s.block3 || 'Integrate');
  state.cycles[2].desc = 'Review & connect';

  const container = document.getElementById('cycleBlocks');
  container.innerHTML = state.cycles.map((c, i) => `
    <div class="cycle-block ${c.done ? 'done' : ''} ${i === state.currentBlock && !c.done ? 'active-block' : ''}" onclick="toggleCycle(${i})">
      <div class="block-check">
        ${c.done ? '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      </div>
      <div>
        <div class="block-name">${c.name}</div>
        <div class="block-desc">${c.desc}</div>
      </div>
    </div>
  `).join('');

  const done = state.cycles.filter(c => c.done).length;
  document.getElementById('cyclesDoneNum').textContent = done;
  document.getElementById('cyclesRemNum').textContent = 3 - done;
}

export function toggleCycle(i, state, save, updateDonuts) {
  state.cycles[i].done = !state.cycles[i].done;
  if (state.cycles[i].done) state.stats.blocksTotal++;
  save();
  renderCycleBlocks(state);
  updateDonuts(state);
}

// ── MISSION CARD ──
export function renderMissionCard(state) {
  const locked = state.tasks.filter(t => !t.completed);
  if (!state.locked || locked.length === 0) {
    document.getElementById('missionTitle').textContent = 'No task locked yet';
    document.getElementById('missionOutcome').textContent = 'Head to Task Locker to plan your day first.';
    document.getElementById('missionResource').href = '#';
    document.getElementById('missionResourceText').textContent = 'Go to Task Locker';
    document.getElementById('missionResource').onclick = (e) => { e.preventDefault(); window.navigateTo('locker'); };
    return;
  }
  const t = locked[0];
  document.getElementById('missionTitle').textContent = t.name;
  document.getElementById('missionOutcome').textContent = t.outcome || 'No outcome defined';
  if (t.resource) {
    document.getElementById('missionResource').href = t.resource;
    document.getElementById('missionResourceText').textContent = 'Open Resource';
    document.getElementById('missionResource').onclick = null;
  } else {
    document.getElementById('missionResource').href = '#';
    document.getElementById('missionResourceText').textContent = 'Start Execution';
    document.getElementById('missionResource').onclick = (e) => { e.preventDefault(); startExecution(); };
  }
}

// ── DASHBOARD TASKS ──
export function renderDashboardTasks(state) {
  const el = document.getElementById('dashboardTasks');
  if (!state.locked || state.tasks.length === 0) {
    el.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; padding: 8px 0;">Lock tasks in Task Locker to see them here.</p>';
    return;
  }
  const priorities = { high: 'dot-red', medium: 'dot-amber', low: 'dot-blue' };
  const tags = { high: 'tag-red', medium: 'tag-amber', low: 'tag-blue' };
  el.innerHTML = state.tasks.slice(0, state.settings.maxTasks || 3).map((t, i) => `
    <div class="task-item ${t.completed ? 'completed' : ''}">
      <div class="task-dot ${priorities[t.priority] || 'dot-amber'}"></div>
      <div class="task-body">
        <div class="task-name" style="${t.completed ? 'text-decoration: line-through;' : ''}">${t.name}</div>
        <div class="task-meta">
          <span class="tag ${tags[t.priority] || 'tag-amber'}">${t.priority || 'medium'}</span>
          <span>${t.completed ? 'Completed' : 'Not started'}</span>
        </div>
      </div>
      ${!t.completed ? `<button class="btn btn-ghost" style="padding:6px 12px; font-size:12px;" onclick="startTask(${i})">Execute</button>` : ''}
    </div>
  `).join('');
}

export function startTask(i, state, save) {
  state.activeTaskIndex = i;
  save();
  startExecution();
}

// ── DONUTS ──
export function updateDonuts(state) {
  const total = state.tasks.length;
  if (total === 0) {
    setDonut('donutCompleted', 'donutCompPct', 0, '#E85D4A');
    setDonut('donutInProgress', 'donutInPct', 0, '#4F83E6');
    setDonut('donutNotStarted', 'donutNotPct', 100, '#BBBBBB');
    return;
  }
  const completed = state.tasks.filter(t => t.completed).length;
  const active = state.currentBlock > 0 && !state.tasks[state.activeTaskIndex]?.completed ? 1 : 0;
  const notStarted = total - completed - active;
  setDonut('donutCompleted', 'donutCompPct', Math.round(completed/total*100), '#E85D4A');
  setDonut('donutInProgress', 'donutInPct', Math.round(active/total*100), '#4F83E6');
  setDonut('donutNotStarted', 'donutNotPct', Math.round(notStarted/total*100), '#BBBBBB');
}

function setDonut(circleId, textId, pct, color) {
  const circumference = 157;
  const offset = circumference - (pct / 100) * circumference;
  const el = document.getElementById(circleId);
  if (el) { el.style.strokeDashoffset = offset; el.setAttribute('stroke', color); }
  const t = document.getElementById(textId);
  if (t) t.textContent = pct + '%';
}

// ── STREAK ──
export function renderStreak(state) {
  const today = new Date().toDateString();
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    last7.push(d.toDateString());
  }
  const days = ['S','M','T','W','T','F','S'];
  const container = document.getElementById('streakDots');
  container.innerHTML = last7.map((d, i) => {
    const hit = state.streak.includes(d);
    const isToday = d === today;
    return `<div class="streak-dot ${hit ? 'hit' : ''} ${isToday && !hit ? 'today' : ''}" title="${d}">${days[new Date(d).getDay()]}</div>`;
  }).join('');

  let count = 0;
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (state.streak.includes(d.toDateString())) count++;
    else if (i > 0) break;
  }
  document.getElementById('streakCount').textContent = count + ' day' + (count !== 1 ? 's' : '');
}

// ── LOCKER ──
// Moved to locker.js

// ── EXECUTION ──
export function renderExecution(state) {
  const hasLocked = state.locked && state.tasks.length > 0;
  document.getElementById('noTaskState').style.display = hasLocked ? 'none' : 'block';
  document.getElementById('execActiveState').style.display = hasLocked ? 'block' : 'none';
  if (!hasLocked) return;

  const i = state.activeTaskIndex < state.tasks.length ? state.activeTaskIndex : 0;
  const task = state.tasks[i];

  if (task.completed) {
    // find next
    const next = state.tasks.findIndex((t, idx) => idx > i && !t.completed);
    if (next !== -1) { state.activeTaskIndex = next; save(); renderExecution(state); return; }
  }

  document.getElementById('execTaskName').textContent = task ? task.name : '—';
  document.getElementById('execStatusTag').textContent = task && !task.completed ? 'In Progress' : 'Done';
  document.getElementById('execStatusTag').className = 'tag ' + (task && task.completed ? 'tag-green' : 'tag-amber');

  // blocks
  const s = state.settings;
  const blockNames = [s.block1 || 'Learn', s.block2 || 'Practice', s.block3 || 'Integrate'];
  const execBlocks = document.getElementById('execBlocks');
  execBlocks.innerHTML = blockNames.map((name, bi) => {
    const done = state.cycles[bi]?.done;
    const active = bi === state.currentBlock && !done;
    return `
      <div class="cycle-block ${done ? 'done' : ''} ${active ? 'active-block' : ''}" onclick="selectBlock(${bi})">
        <div class="block-check">
          ${done ? '<svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
        </div>
        <div>
          <div class="block-name">Block ${bi+1} — ${name}</div>
          <div class="block-desc">${done ? 'Completed' : active ? 'Active' : 'Pending'}</div>
        </div>
      </div>
    `;
  }).join('');

  renderTimerDisplay(state);
}

export function selectBlock(i, state, save, renderExecution, renderCycleBlocks) {
  if (state.cycles[i]?.done) return;
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  state.currentBlock = i;
  state.timerSeconds = (state.settings.blockDuration || 45) * 60;
  state.timerMax = state.timerSeconds;
  save();
  renderExecution(state);
  renderCycleBlocks(state);
}

export function renderTimerDisplay(state) {
  const s = state.settings;
  const blockNames = [s.block1 || 'Learn', s.block2 || 'Practice', s.block3 || 'Integrate'];
  const mins = Math.floor(state.timerSeconds / 60);
  const secs = state.timerSeconds % 60;
  document.getElementById('timerDisplay').textContent = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
  document.getElementById('timerBlockLabel').textContent = `Block ${state.currentBlock + 1} — ${blockNames[state.currentBlock] || ''}`;
  const pct = state.timerMax > 0 ? ((state.timerMax - state.timerSeconds) / state.timerMax * 100) : 0;
  document.getElementById('timerFill').style.width = pct + '%';
  const btn = document.getElementById('timerStartBtn');
  if (btn) btn.innerHTML = state.timerRunning
    ? '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause'
    : '<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polygon points="5,3 19,12 5,21"/></svg>Start Block';
}

export function toggleTimer(state, renderTimerDisplay, completeBlock) {
  if (state.timerRunning) {
    clearInterval(state.timerInterval);
    state.timerRunning = false;
  } else {
    state.timerRunning = true;
    if (!state.timerMax || state.timerMax === 0) {
      state.timerSeconds = (state.settings.blockDuration || 45) * 60;
      state.timerMax = state.timerSeconds;
    }
    state.timerInterval = setInterval(() => {
      if (state.timerSeconds > 0) {
        state.timerSeconds--;
        renderTimerDisplay(state);
      } else {
        clearInterval(state.timerInterval);
        state.timerRunning = false;
        completeBlock(state);
      }
    }, 1000);
  }
  renderTimerDisplay(state);
}

export function completeBlock(state, save, renderExecution, renderCycleBlocks, updateDonuts, showToast) {
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  state.cycles[state.currentBlock].done = true;
  state.stats.blocksTotal++;
  const next = state.cycles.findIndex((c, i) => i > state.currentBlock && !c.done);
  state.currentBlock = next !== -1 ? next : state.currentBlock;
  state.timerSeconds = (state.settings.blockDuration || 45) * 60;
  state.timerMax = state.timerSeconds;
  save();
  renderExecution(state);
  renderCycleBlocks(state);
  updateDonuts(state);
  showToast('Block completed! Great work.');
}

export function markPartial(state, save, completeBlock, showToast) {
  const i = state.activeTaskIndex;
  if (state.tasks[i]) { state.tasks[i].partial = true; }
  save();
  completeBlock(state);
  showToast('Marked as partial. Keep going!');
}

export function takeBreak(state, renderTimerDisplay, showToast) {
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  state.timerSeconds = (state.settings.breakDuration || 10) * 60;
  state.timerMax = state.timerSeconds;
  renderTimerDisplay(state);
  showToast('Break started. Rest well!');
}

export function completeCurrentTask(state, save, renderExecution, renderLockerTasks, renderDashboardTasks, renderMissionCard, renderCycleBlocks, updateDonuts, showToast) {
  const i = state.activeTaskIndex;
  if (state.tasks[i]) {
    state.tasks[i].notes = document.getElementById('execNotes').value;
    state.tasks[i].completed = true;
    state.stats.tasksTotal++;
  }
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  state.cycles.forEach(c => c.done = false);
  state.currentBlock = 0;
  state.timerSeconds = (state.settings.blockDuration || 45) * 60;
  state.timerMax = state.timerSeconds;
  document.getElementById('execNotes').value = '';
  const next = state.tasks.findIndex((t, idx) => idx > i && !t.completed);
  state.activeTaskIndex = next !== -1 ? next : i;
  save();
  renderExecution(state); renderLockerTasks(state); renderDashboardTasks(state); renderMissionCard(state);
  renderCycleBlocks(state); updateDonuts(state);
  showToast('Task completed! Amazing work!');
}

export function skipTask(state, save, renderExecution, renderCycleBlocks, showToast) {
  const next = state.tasks.findIndex((t, i) => i > state.activeTaskIndex && !t.completed);
  if (next !== -1) {
    state.activeTaskIndex = next;
    clearInterval(state.timerInterval);
    state.timerRunning = false;
    state.cycles.forEach(c => c.done = false);
    state.currentBlock = 0;
    state.timerSeconds = (state.settings.blockDuration || 45) * 60;
    state.timerMax = state.timerSeconds;
    save(); renderExecution(state); renderCycleBlocks(state);
    showToast('Moved to next task.');
  } else {
    showToast('No more tasks. Review your day!');
    window.navigateTo('review');
  }
}

export function startExecution() { window.navigateTo('execution'); }

// ── REVIEW ──
export function loadReviewInputs(state) {
  const today = new Date().toDateString();
  const r = state.reviews.find(r => r.date === today);
  if (r) {
    document.getElementById('reviewRecall').value = r.recall || '';
    document.getElementById('reviewConfused').value = r.confused || '';
    document.getElementById('reviewForgot').value = r.forgot || '';
    document.getElementById('reviewTomorrow').value = r.tomorrow || '';
  }
}

export function saveReview(state, save, renderPastReviews, renderInsights, showToast) {
  const today = new Date().toDateString();
  const data = {
    date: today,
    recall: document.getElementById('reviewRecall').value,
    confused: document.getElementById('reviewConfused').value,
    forgot: document.getElementById('reviewForgot').value,
    tomorrow: document.getElementById('reviewTomorrow').value
  };
  const idx = state.reviews.findIndex(r => r.date === today);
  if (idx !== -1) state.reviews[idx] = data; else state.reviews.unshift(data);
  state.stats.reviewsTotal = (state.stats.reviewsTotal || 0) + 1;
  // pre-fill next task locker
  if (data.tomorrow) {
    document.getElementById('lockerDot').style.display = 'block';
  }
  save(); renderPastReviews(state); renderInsights(state);
  showToast('Review saved. See you tomorrow!');
}

export function renderPastReviews(state) {
  const el = document.getElementById('pastReviews');
  if (state.reviews.length === 0) {
    el.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; text-align: center; padding: 16px 0;">No reviews saved yet.</p>';
    return;
  }
  el.innerHTML = state.reviews.slice(0, 3).map(r => `
    <div style="padding: 12px 0; border-bottom: 1px solid var(--border);">
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">${r.date}</div>
      <div style="font-size: 13px; font-weight: 500; color: var(--text);">${r.recall ? r.recall.substring(0, 60) + (r.recall.length > 60 ? '...' : '') : 'No recall written'}</div>
      ${r.tomorrow ? `<div style="font-size: 12px; color: var(--blue); margin-top: 4px;">→ ${r.tomorrow}</div>` : ''}
    </div>
  `).join('');
}

// ── INSIGHTS ──
export function renderInsights(state) {
  document.getElementById('insightBlocks').textContent = state.stats.blocksTotal || 0;
  document.getElementById('insightTasks').textContent = state.stats.tasksTotal || 0;
  document.getElementById('insightReviews').textContent = state.reviews.length;
}

export function renderWeeklyChart() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const chart = document.getElementById('weeklyChart');
  const labels = document.getElementById('weeklyDays');
  const vals = days.map(() => Math.floor(Math.random() * 3));
  chart.innerHTML = vals.map((v, i) => `
    <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;">
      <div style="width:100%; background: ${v > 0 ? 'var(--red)' : 'var(--bg)'}; border-radius: 4px 4px 0 0; height: ${v === 0 ? 8 : v * 26}px; border: 1px solid ${v > 0 ? 'var(--red-dark)' : 'var(--border)'}; transition: height 0.5s ease; opacity: ${0.4 + v*0.3};"></div>
    </div>
  `).join('');
  labels.innerHTML = days.map(d => `<div style="flex:1; text-align:center; font-size:11px; color: var(--text-muted);">${d}</div>`).join('');
}

// ── SETTINGS ──
export function syncSettingsInputs(state) {
  const s = state.settings;
  document.getElementById('settingName').value = s.name || 'Fanoy';
  document.getElementById('settingEmail').value = s.email || '';
  document.getElementById('settingBlockDuration').value = s.blockDuration || 45;
  document.getElementById('settingBreakDuration').value = s.breakDuration || 10;
  document.getElementById('settingMaxTasks').value = s.maxTasks || 3;
  document.getElementById('block1Name').value = s.block1 || 'Learn';
  document.getElementById('block2Name').value = s.block2 || 'Practice';
  document.getElementById('block3Name').value = s.block3 || 'Integrate';
}

export function saveSettings(state, save, updateGreeting, renderCycleBlocks, renderExecution, showToast) {
  state.settings.name = document.getElementById('settingName').value.trim() || 'Fanoy';
  state.settings.email = document.getElementById('settingEmail').value.trim();
  state.settings.blockDuration = parseInt(document.getElementById('settingBlockDuration').value) || 45;
  state.settings.breakDuration = parseInt(document.getElementById('settingBreakDuration').value) || 10;
  state.settings.maxTasks = parseInt(document.getElementById('settingMaxTasks').value) || 3;
  state.settings.block1 = document.getElementById('block1Name').value.trim() || 'Learn';
  state.settings.block2 = document.getElementById('block2Name').value.trim() || 'Practice';
  state.settings.block3 = document.getElementById('block3Name').value.trim() || 'Integrate';
  state.timerSeconds = state.settings.blockDuration * 60;
  state.timerMax = state.timerSeconds;
  save(); updateGreeting(state); renderCycleBlocks(state); renderExecution(state);
  showToast('Settings saved!');
}

export function resetAll(showToast) {
  if (!confirm('Reset ALL app data? This cannot be undone.')) return;
  localStorage.removeItem('eos_state');
  location.reload();
}

export function logout(showToast) { if (confirm('Log out?')) { showToast('Goodbye!'); setTimeout(() => {}, 1500); } }

// ── TOAST ──
export function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── MODAL ──
export function openEditModal(task) {
  const editModal = document.getElementById('editModal');
  editModal.classList.remove('hidden');
  editModal.classList.add('show');

  document.getElementById('editName').value = task.name || '';
  document.getElementById('editOutcome').value = task.outcome || '';
  document.getElementById('editResource').value = task.resource || '';
}

export function closeEditModal() {
  const editModal = document.getElementById('editModal');
  editModal.classList.add('hidden');
  editModal.classList.remove('show');
}

export function openDeleteModal() {
  const deleteModal = document.getElementById('deleteConfirmModal');
  deleteModal.classList.remove('hidden');
  deleteModal.classList.add('show');
}

export function closeDeleteModal() {
  const deleteModal = document.getElementById('deleteConfirmModal');
  deleteModal.classList.add('hidden');
  deleteModal.classList.remove('show');
}
