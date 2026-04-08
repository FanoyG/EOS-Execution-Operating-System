import { state, save, load } from './state.js';
import {
  renderCycleBlocks, toggleCycle, renderMissionCard, renderDashboardTasks, startTask,
  updateDonuts, renderStreak, renderExecution, selectBlock, renderTimerDisplay,
  toggleTimer, completeBlock, markPartial, takeBreak, completeCurrentTask,
  skipTask, startExecution, loadReviewInputs, saveReview, renderPastReviews,
  renderInsights, renderWeeklyChart, syncSettingsInputs, saveSettings,
  resetAll, logout, showToast, closeEditModal, closeDeleteModal
} from './ui.js';
import { addLockerTask, renderLockerTasks, deleteTask, confirmDeleteTask, lockTasks, unlockTasks, clearLocker, startEditTask, saveEditedTask, performDeleteTask, cancelDeleteTask } from './locker.js';

// ── INIT ──
export function init() {
  load();
  syncSettingsInputs(state);
  updateDate();
  updateGreeting(state);
  renderCycleBlocks(state);
  renderLockerTasks(state);
  renderDashboardTasks(state);
  renderMissionCard(state);
  updateDonuts(state);
  renderStreak(state);
  renderExecution(state);
  renderPastReviews(state);
  renderInsights(state);
  renderWeeklyChart();
  loadReviewInputs(state);
}

// ── NAVIGATION ──
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  locker: 'Task Locker',
  execution: 'Execution Mode',
  review: 'Review & Gaps',
  insights: 'Insights',
  settings: 'Settings'
};

export function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  if (pg) pg.classList.add('active');
  const nav = document.querySelector('[data-page="' + page + '"]');
  if (nav) nav.classList.add('active');
  document.getElementById('pageTitle').textContent = PAGE_TITLES[page] || page;
  if (page === 'execution') renderExecution(state);
  if (page === 'insights') { renderInsights(state); renderWeeklyChart(); }
}

// ── DATE / GREETING ──
function updateDate() {
  const now = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('dayName').textContent = days[now.getDay()];
  document.getElementById('todayDate').textContent = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
}

function updateGreeting(state) {
  const h = new Date().getHours();
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const name = state.settings.name || 'Fanoy';
  document.getElementById('greetingText').textContent = greet + ', ' + name + ' 👋';
  document.getElementById('userName').textContent = name;
  document.getElementById('userAvatar').textContent = name.substring(0,2).toUpperCase();
  document.getElementById('userEmail').textContent = state.settings.email || 'your@email.com';
  const subs = {
    morning: "Here's your mission for today.",
    afternoon: "Keep the momentum going.",
    evening: "Time to review and plan tomorrow."
  };
  document.getElementById('greetingSub').textContent = h < 12 ? subs.morning : h < 17 ? subs.afternoon : subs.evening;
}

// ── START ──
window.addEventListener('load', () => {
  init();
  setTimeout(() => updateDonuts(state), 600);

  // Navigation event listeners
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  navItems.forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Locker button event listeners
  document.getElementById('addTaskBtn').addEventListener('click', addLockerTask);
  document.getElementById('lockBtn').addEventListener('click', lockTasks);
  document.getElementById('unlockBtn').addEventListener('click', unlockTasks);
  document.getElementById('clearLockerBtn').addEventListener('click', clearLocker);

  // Modal button event listeners
  document.getElementById('saveEditBtn')
    .addEventListener('click', () => {
      saveEditedTask();
      closeEditModal();
    });

  document.getElementById('cancelEditBtn')
    .addEventListener('click', closeEditModal);

  document.getElementById('confirmDeleteBtn')
    .addEventListener('click', performDeleteTask);

  document.getElementById('cancelDeleteBtn')
    .addEventListener('click', cancelDeleteTask);

  // Event delegation for task action buttons
  document.getElementById('lockerTaskList').addEventListener('click', (e) => {
    let node = e.target;
    while (node && node !== document.body) {
      if (node.classList && (node.classList.contains('delete-btn') || node.classList.contains('edit-btn'))) {
        const index = parseInt(node.dataset.index, 10);
        if (Number.isNaN(index)) return;

        if (node.classList.contains('delete-btn')) {
          confirmDeleteTask(index);
        }

        if (node.classList.contains('edit-btn')) {
          startEditTask(index);
        }
        return;
      }
      node = node.parentElement;
    }
  });

  // Global functions for onclick handlers
  window.navigateTo = navigateTo;
  window.startExecution = startExecution;
  window.toggleCycle = (i) => toggleCycle(i, state, save, updateDonuts);
  window.startTask = (i) => startTask(i, state, save);
  window.addLockerTask = addLockerTask;
  window.deleteTask = deleteTask;
  window.lockTasks = lockTasks;
  window.unlockTasks = unlockTasks;
  window.selectBlock = (i) => selectBlock(i, state, save, renderExecution, renderCycleBlocks);
  window.toggleTimer = () => toggleTimer(state, renderTimerDisplay, (s) => completeBlock(s, save, renderExecution, renderCycleBlocks, updateDonuts, showToast));
  window.markPartial = () => markPartial(state, save, (s) => completeBlock(s, save, renderExecution, renderCycleBlocks, updateDonuts, showToast), showToast);
  window.takeBreak = () => takeBreak(state, renderTimerDisplay, showToast);
  window.completeCurrentTask = () => completeCurrentTask(state, save, renderExecution, renderLockerTasks, renderDashboardTasks, renderMissionCard, renderCycleBlocks, updateDonuts, showToast);
  window.skipTask = () => skipTask(state, save, renderExecution, renderCycleBlocks, showToast);
  window.saveReview = () => saveReview(state, save, renderPastReviews, renderInsights, showToast);
  window.saveSettings = () => saveSettings(state, save, updateGreeting, renderCycleBlocks, renderExecution, showToast);
  window.clearLocker = clearLocker;
  window.resetAll = () => resetAll(showToast);
  window.logout = () => logout(showToast);
});
