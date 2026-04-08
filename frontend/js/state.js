// ── STATE ──
export let state = {
  tasks: [],
  locked: false,
  cycles: [
    { id: 1, name: 'Block 1', desc: '', done: false },
    { id: 2, name: 'Block 2', desc: '', done: false },
    { id: 3, name: 'Block 3', desc: '', done: false }
  ],
  activeTaskIndex: 0,
  currentBlock: 0,
  timerRunning: false,
  timerSeconds: 45 * 60,
  timerMax: 45 * 60,
  breakSeconds: 10 * 60,
  timerInterval: null,
  streak: [],
  reviews: [],
  stats: { blocksTotal: 0, tasksTotal: 0 },
  settings: {
    name: 'Fanoy',
    email: '',
    blockDuration: 45,
    breakDuration: 10,
    maxTasks: 3,
    block1: 'Learn',
    block2: 'Practice',
    block3: 'Integrate'
  }
};

// ── PERSIST ──
export function save() { try { localStorage.setItem('eos_state', JSON.stringify(state)); } catch(e) {} }
export function load() {
  try {
    const s = localStorage.getItem('eos_state');
    if (s) { 
      const parsed = JSON.parse(s); 
      Object.assign(state, parsed);
      // Reset timer state on load
      if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
      }
      state.timerRunning = false;
    }
  } catch(e) {}
}