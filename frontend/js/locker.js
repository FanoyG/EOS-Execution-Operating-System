// ── LOCKER ──
import { state, save } from './state.js';
import { renderDashboardTasks, renderMissionCard, updateDonuts, renderStreak, renderCycleBlocks, showToast, openEditModal, openDeleteModal, closeDeleteModal } from './ui.js';

let editingIndex = null;
let deleteIndex = null;

export function addLockerTask() {
  if (state.locked) { showToast('Tasks are locked. Unlock first.'); return; }
  const name = document.getElementById('taskNameInput').value.trim();
  if (!name) { showToast('Please enter a task name.'); return; }
  const maxT = state.settings.maxTasks || 3;
  if (state.tasks.length >= maxT) { showToast(`Max ${maxT} tasks allowed. Keep it focused.`); return; }
  state.tasks.push({
    name,
    outcome: document.getElementById('taskOutcomeInput').value.trim(),
    resource: document.getElementById('taskResourceInput').value.trim(),
    priority: document.getElementById('taskPriorityInput').value,
    completed: false,
    notes: '',
    partial: false
  });
  document.getElementById('taskNameInput').value = '';
  document.getElementById('taskOutcomeInput').value = '';
  document.getElementById('taskResourceInput').value = '';
  save();
  renderLockerTasks(state);
  renderDashboardTasks(state);
  renderMissionCard(state);
  updateDonuts(state);
  showToast('Task added to locker!');
}

export function renderLockerTasks(state) {
  const el = document.getElementById('lockerTaskList');
  document.getElementById('taskCount').textContent = state.tasks.length + ' task' + (state.tasks.length !== 1 ? 's' : '');
  if (state.tasks.length === 0) {
    el.innerHTML = '<p style="color: var(--text-muted); font-size: 14px; padding: 16px 0; text-align: center;">No tasks yet. Add your first task →</p>';
    return;
  }
  const pColors = { high: '#E85D4A', medium: '#F6A928', low: '#4F83E6' };
  el.innerHTML = state.tasks.map((t, i) => `
    <div class="locker-task ${state.locked ? 'locked' : ''}">
      <div class="locker-num">${i + 1}</div>
      <div style="flex:1">
        <div class="locker-name">${t.name}</div>
        ${t.outcome ? `<div class="locker-outcome">${t.outcome}</div>` : ''}
        <div style="margin-top: 4px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          <span class="tag ${t.priority === 'high' ? 'tag-red' : t.priority === 'low' ? 'tag-blue' : 'tag-amber'}">${t.priority}</span>
          ${t.resource ? `<a href="${t.resource}" target="_blank" style="font-size:11px; color: var(--blue); text-decoration:none;">Resource ↗</a>` : ''}
          ${t.completed ? '<span class="tag tag-green">Completed</span>' : ''}
          ${t.partial ? '<span class="tag tag-amber">Partial</span>' : ''}
        </div>
      </div>
      ${!state.locked ? `<div class="task-actions">
        <button type="button" class="action-btn edit-btn" data-index="${i}" aria-label="Edit task">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#E57373" d="M42.583,9.067l-3.651-3.65c-0.555-0.556-1.459-0.556-2.015,0l-1.718,1.72l5.664,5.664l1.72-1.718C43.139,10.526,43.139,9.625,42.583,9.067"></path>
            <path fill="#FF9800" d="M4.465 21.524H40.471999999999994V29.535H4.465z" transform="rotate(134.999 22.469 25.53)"></path>
            <path fill="#B0BEC5" d="M34.61 7.379H38.616V15.392H34.61z" transform="rotate(-45.02 36.61 11.385)"></path>
            <path fill="#FFC107" d="M6.905 35.43L5 43 12.571 41.094z"></path>
            <path fill="#37474F" d="M5.965 39.172L5 43 8.827 42.035z"></path>
          </svg>
        </button>
        <button type="button" class="action-btn delete-btn" data-index="${i}" aria-label="Delete task">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
            <path fill="#9575CD" d="M34,12l-6-6h-8l-6,6h-3v28c0,2.2,1.8,4,4,4h18c2.2,0,4-1.8,4-4V12H34z"></path>
            <path fill="#7454B3" d="M24.5 39h-1c-.8 0-1.5-.7-1.5-1.5v-19c0-.8.7-1.5 1.5-1.5h1c.8 0 1.5.7 1.5 1.5v19C26 38.3 25.3 39 24.5 39zM31.5 39L31.5 39c-.8 0-1.5-.7-1.5-1.5v-19c0-.8.7-1.5 1.5-1.5l0 0c.8 0 1.5.7 1.5 1.5v19C33 38.3 32.3 39 31.5 39zM16.5 39L16.5 39c-.8 0-1.5-.7-1.5-1.5v-19c0-.8.7-1.5 1.5-1.5l0 0c.8 0 1.5.7 1.5 1.5v19C18 38.3 17.3 39 16.5 39z"></path>
            <path fill="#B39DDB" d="M11,8h26c1.1,0,2,0.9,2,2v2H9v-2C9,8.9,9.9,8,11,8z"></path>
          </svg>
        </button>
      </div>` : ''}
    </div>
  `).join('');

  // form visibility
  document.getElementById('addTaskForm').style.opacity = state.locked ? '0.5' : '1';
  document.getElementById('addTaskForm').style.pointerEvents = state.locked ? 'none' : '';
  document.getElementById('lockerWarning').style.display = state.locked ? 'flex' : 'none';
  document.getElementById('lockBtn').style.display = state.locked ? 'none' : 'flex';
  document.getElementById('unlockBtn').style.display = state.locked ? 'flex' : 'none';
  const badge = document.getElementById('lockStatusBadge');
  badge.textContent = state.locked ? 'Locked' : 'Unlocked';
  badge.className = 'lock-badge ' + (state.locked ? '' : 'unlocked');
}

export function deleteTask(index) {
  state.tasks.splice(index, 1);
  save();
  renderLockerTasks(state);
  renderDashboardTasks(state);
  renderMissionCard(state);
  updateDonuts(state);
}

export function confirmDeleteTask(index) {
  deleteIndex = index;
  const task = state.tasks[index];
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const taskNameEl = document.getElementById('deleteTaskName');

  if (confirmBtn) confirmBtn.dataset.index = index;
  if (taskNameEl) taskNameEl.textContent = task ? `“${task.name}”` : 'this task';

  openDeleteModal();
}

export function performDeleteTask() {
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  const index = confirmBtn ? parseInt(confirmBtn.dataset.index, 10) : deleteIndex;
  if (Number.isNaN(index)) return;

  const taskName = state.tasks[index]?.name || 'Task';
  state.tasks.splice(index, 1);
  save();
  renderLockerTasks(state);
  renderDashboardTasks(state);
  renderMissionCard(state);
  updateDonuts(state);
  deleteIndex = null;
  if (confirmBtn) confirmBtn.removeAttribute('data-index');
  closeDeleteModal();
  showToast(`Deleted ${taskName}.`);
}

export function cancelDeleteTask() {
  deleteIndex = null;
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) confirmBtn.removeAttribute('data-index');
  closeDeleteModal();
}

export function startEditTask(index) {
  if (state.locked) {
    showToast("Unlock tasks to edit");
    return;
  }

  editingIndex = index;
  const task = state.tasks[index];
  openEditModal(task);
}

export function saveEditedTask() {
  if (editingIndex === null) return;

  const task = state.tasks[editingIndex];

  task.name = document.getElementById('editName').value;
  task.outcome = document.getElementById('editOutcome').value;
  task.resource = document.getElementById('editResource').value;

  save();
  renderLockerTasks(state);

  editingIndex = null;
}

export function lockTasks() {
  if (state.tasks.length === 0) { showToast('Add at least one task before locking.'); return; }
  state.locked = true;
  // mark today as execution day in streak
  const today = new Date().toDateString();
  if (!state.streak.includes(today)) state.streak.push(today);
  save(); renderLockerTasks(state); renderStreak(state); renderDashboardTasks(state); renderMissionCard(state);
  document.getElementById('lockerDot').style.display = 'none';
  showToast('Tasks locked! Time to execute.');
}

export function unlockTasks() {
  state.locked = false;
  state.tasks.forEach(t => { t.completed = false; t.partial = false; });
  state.cycles.forEach(c => c.done = false);
  state.activeTaskIndex = 0;
  state.currentBlock = 0;
  clearInterval(state.timerInterval);
  state.timerRunning = false;
  state.timerSeconds = (state.settings.blockDuration || 45) * 60;
  save(); renderLockerTasks(state); renderDashboardTasks(state); renderMissionCard(state); renderCycleBlocks(state); updateDonuts(state);
  showToast('Tasks unlocked. Ready to edit.');
}

export function clearLocker() {
  if (!confirm('Clear all tasks from the locker?')) return;
  state.tasks = []; state.locked = false;
  state.activeTaskIndex = 0;
  save(); renderLockerTasks(state); renderDashboardTasks(state); renderMissionCard(state); updateDonuts(state);
  showToast('Locker cleared.');
}