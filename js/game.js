/**
 * Sudoku Game Controller & UI Interactions
 */

class SudokuGame {
  constructor() {
    this.engine = new window.SudokuEngine();
    this.boardEl = document.getElementById('board');
    this.timerEl = document.getElementById('timer-text');
    this.mistakesEl = document.getElementById('mistakes-count');
    this.notesToggleBtn = document.getElementById('btn-notes');
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.winModal = document.getElementById('win-modal');

    // State
    this.difficulty = 'medium';
    this.initialBoard = null;
    this.currentBoard = null;
    this.solutionBoard = null;
    this.notes = []; // 9x9 array of Set
    this.selectedCell = null; // [r, c]
    this.isNotesMode = false;
    this.history = [];
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.hintsUsed = 0;
    this.isPaused = false;
    this.isGameOver = false;

    // Timer
    this.timerSeconds = 0;
    this.timerInterval = null;

    this.init();
  }

  init() {
    this.initTheme();
    this.initNotesArray();
    this.buildBoardDOM();
    this.bindEvents();

    if (!this.loadSavedGame()) {
      this.startNewGame(this.difficulty);
    }
  }

  initNotesArray() {
    this.notes = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set())
    );
  }

  initTheme() {
    const savedTheme = localStorage.getItem('sudoku_theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('sudoku_theme', nextTheme);
    this.updateThemeIcon(nextTheme);
  }

  updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (!themeIcon) return;
    if (theme === 'dark') {
      themeIcon.innerHTML = `<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
    } else {
      themeIcon.innerHTML = `<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
  }

  buildBoardDOM() {
    this.boardEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        // Notes 3x3 container
        const notesGrid = document.createElement('div');
        notesGrid.className = 'notes-grid';
        for (let n = 1; n <= 9; n++) {
          const span = document.createElement('span');
          span.dataset.num = n;
          notesGrid.appendChild(span);
        }
        cell.appendChild(notesGrid);

        // Value span
        const valSpan = document.createElement('span');
        valSpan.className = 'cell-value';
        cell.appendChild(valSpan);

        cell.addEventListener('click', () => this.handleCellClick(r, c));
        this.boardEl.appendChild(cell);
      }
    }
  }

  startNewGame(difficulty = this.difficulty) {
    this.difficulty = difficulty;
    this.isGameOver = false;
    this.selectedCell = null;
    this.history = [];
    this.mistakes = 0;
    this.hintsUsed = 0;
    this.initNotesArray();

    // Generate puzzle
    const { puzzle, solution } = this.engine.generatePuzzle(difficulty);
    this.initialBoard = this.engine.cloneBoard(puzzle);
    this.currentBoard = this.engine.cloneBoard(puzzle);
    this.solutionBoard = solution;

    this.resetTimer();
    this.startTimer();
    this.renderBoard();
    this.updateNumpadCounts();
    this.updateMistakesDisplay();
    this.updateDifficultyTabs();
    this.saveGame();
  }

  renderBoard() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.getCellElement(r, c);
        const valSpan = cell.querySelector('.cell-value');
        const notesGrid = cell.querySelector('.notes-grid');
        const val = this.currentBoard[r][c];
        const isInitial = this.initialBoard[r][c] !== 0;

        cell.className = 'cell';

        if (val !== 0) {
          valSpan.textContent = val;
          valSpan.style.display = 'block';
          notesGrid.style.display = 'none';

          if (isInitial) {
            cell.classList.add('fixed');
          } else {
            cell.classList.add('user-value');
            if (val !== this.solutionBoard[r][c]) {
              cell.classList.add('error');
            }
          }
        } else {
          valSpan.textContent = '';
          valSpan.style.display = 'none';
          notesGrid.style.display = 'grid';

          // Render notes
          const cellNotes = this.notes[r][c];
          notesGrid.querySelectorAll('span').forEach((span, idx) => {
            const num = idx + 1;
            span.textContent = cellNotes.has(num) ? num : '';
          });
        }
      }
    }
    this.highlightRelatedCells();
  }

  getCellElement(r, c) {
    return this.boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  }

  handleCellClick(r, c) {
    if (this.isPaused || this.isGameOver) return;
    this.selectedCell = [r, c];
    this.highlightRelatedCells();
  }

  highlightRelatedCells() {
    // Clear all previous highlight classes
    this.boardEl.querySelectorAll('.cell').forEach(el => {
      el.classList.remove('selected', 'highlighted', 'matching');
    });

    if (!this.selectedCell) return;

    const [selR, selC] = this.selectedCell;
    const selVal = this.currentBoard[selR][selC];
    const boxR = Math.floor(selR / 3) * 3;
    const boxC = Math.floor(selC / 3) * 3;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.getCellElement(r, c);
        const val = this.currentBoard[r][c];

        if (r === selR && c === selC) {
          cell.classList.add('selected');
        } else if (
          r === selR || 
          c === selC || 
          (r >= boxR && r < boxR + 3 && c >= boxC && c < boxC + 3)
        ) {
          cell.classList.add('highlighted');
        }

        if (selVal !== 0 && val === selVal) {
          cell.classList.add('matching');
        }
      }
    }
  }

  inputNumber(num) {
    if (this.isPaused || this.isGameOver || !this.selectedCell) return;

    const [r, c] = this.selectedCell;
    if (this.initialBoard[r][c] !== 0) return; // Cannot edit original clue

    if (this.isNotesMode) {
      // Toggle note
      const prevNotes = new Set(this.notes[r][c]);
      if (this.notes[r][c].has(num)) {
        this.notes[r][c].delete(num);
      } else {
        this.notes[r][c].add(num);
      }

      this.history.push({
        type: 'notes',
        r,
        c,
        prevNotes,
        newNotes: new Set(this.notes[r][c]),
        prevVal: this.currentBoard[r][c],
        newVal: this.currentBoard[r][c]
      });

      this.renderCell(r, c);
      this.saveGame();
    } else {
      // Normal digit input
      const prevVal = this.currentBoard[r][c];
      const prevNotes = new Set(this.notes[r][c]);

      // If user inputs same number, leave it or clear
      if (prevVal === num) return;

      this.currentBoard[r][c] = num;
      this.notes[r][c].clear();

      const isCorrect = (num === this.solutionBoard[r][c]);

      if (!isCorrect) {
        this.mistakes++;
        this.updateMistakesDisplay();
      } else {
        // Automatically remove this number from notes in same row, col, and 3x3 box
        this.removeNoteFromPeers(r, c, num);
      }

      this.history.push({
        type: 'value',
        r,
        c,
        prevVal,
        newVal: num,
        prevNotes,
        newNotes: new Set()
      });

      this.renderBoard();
      this.updateNumpadCounts();
      this.saveGame();

      // Check win condition
      if (this.checkWinCondition()) {
        this.handleGameWon();
      }
    }
  }

  removeNoteFromPeers(row, col, num) {
    const boxR = Math.floor(row / 3) * 3;
    const boxC = Math.floor(col / 3) * 3;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (r === row || c === col || (r >= boxR && r < boxR + 3 && c >= boxC && c < boxC + 3)) {
          this.notes[r][c].delete(num);
        }
      }
    }
  }

  erase() {
    if (this.isPaused || this.isGameOver || !this.selectedCell) return;
    const [r, c] = this.selectedCell;
    if (this.initialBoard[r][c] !== 0) return;

    const prevVal = this.currentBoard[r][c];
    const prevNotes = new Set(this.notes[r][c]);

    if (prevVal === 0 && prevNotes.size === 0) return;

    this.currentBoard[r][c] = 0;
    this.notes[r][c].clear();

    this.history.push({
      type: 'erase',
      r,
      c,
      prevVal,
      newVal: 0,
      prevNotes,
      newNotes: new Set()
    });

    this.renderBoard();
    this.updateNumpadCounts();
    this.saveGame();
  }

  undo() {
    if (this.isPaused || this.isGameOver || this.history.length === 0) return;

    const lastAction = this.history.pop();
    const { r, c, prevVal, prevNotes } = lastAction;

    this.currentBoard[r][c] = prevVal;
    this.notes[r][c] = new Set(prevNotes);
    this.selectedCell = [r, c];

    this.renderBoard();
    this.updateNumpadCounts();
    this.saveGame();
  }

  giveHint() {
    if (this.isPaused || this.isGameOver) return;

    let targetR = -1;
    let targetC = -1;

    // 1. If currently selected cell is empty or incorrect, use it
    if (this.selectedCell) {
      const [r, c] = this.selectedCell;
      if (this.initialBoard[r][c] === 0 && this.currentBoard[r][c] !== this.solutionBoard[r][c]) {
        targetR = r;
        targetC = c;
      }
    }

    // 2. Otherwise find the first empty or wrong cell
    if (targetR === -1) {
      const emptyCells = [];
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (this.currentBoard[r][c] !== this.solutionBoard[r][c]) {
            emptyCells.push([r, c]);
          }
        }
      }
      if (emptyCells.length === 0) return;
      const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      targetR = r;
      targetC = c;
    }

    const correctVal = this.solutionBoard[targetR][targetC];
    this.selectedCell = [targetR, targetC];
    this.hintsUsed++;

    const prevVal = this.currentBoard[targetR][targetC];
    const prevNotes = new Set(this.notes[targetR][targetC]);

    this.currentBoard[targetR][targetC] = correctVal;
    this.notes[targetR][targetC].clear();
    this.removeNoteFromPeers(targetR, targetC, correctVal);

    this.history.push({
      type: 'hint',
      r: targetR,
      c: targetC,
      prevVal,
      newVal: correctVal,
      prevNotes,
      newNotes: new Set()
    });

    this.renderBoard();
    this.updateNumpadCounts();
    this.saveGame();

    if (this.checkWinCondition()) {
      this.handleGameWon();
    }
  }

  renderCell(r, c) {
    const cell = this.getCellElement(r, c);
    const valSpan = cell.querySelector('.cell-value');
    const notesGrid = cell.querySelector('.notes-grid');
    const val = this.currentBoard[r][c];

    if (val !== 0) {
      valSpan.textContent = val;
      valSpan.style.display = 'block';
      notesGrid.style.display = 'none';
      if (val !== this.solutionBoard[r][c]) {
        cell.classList.add('error');
      } else {
        cell.classList.remove('error');
      }
    } else {
      valSpan.textContent = '';
      valSpan.style.display = 'none';
      notesGrid.style.display = 'grid';
      cell.classList.remove('error');

      const cellNotes = this.notes[r][c];
      notesGrid.querySelectorAll('span').forEach((span, idx) => {
        const num = idx + 1;
        span.textContent = cellNotes.has(num) ? num : '';
      });
    }
  }

  toggleNotesMode() {
    this.isNotesMode = !this.isNotesMode;
    this.notesToggleBtn.classList.toggle('active', this.isNotesMode);
  }

  updateNumpadCounts() {
    const counts = Array(10).fill(0);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.currentBoard[r][c];
        if (val >= 1 && val <= 9 && val === this.solutionBoard[r][c]) {
          counts[val]++;
        }
      }
    }

    for (let n = 1; n <= 9; n++) {
      const btn = document.querySelector(`.num-btn[data-num="${n}"]`);
      if (btn) {
        const remaining = 9 - counts[n];
        const countSpan = btn.querySelector('.count');
        if (countSpan) countSpan.textContent = remaining > 0 ? remaining : '✓';
        if (remaining <= 0) {
          btn.classList.add('completed');
        } else {
          btn.classList.remove('completed');
        }
      }
    }
  }

  updateMistakesDisplay() {
    if (this.mistakesEl) {
      this.mistakesEl.textContent = this.mistakes;
    }
  }

  updateDifficultyTabs() {
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === this.difficulty);
    });
  }

  checkWinCondition() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.currentBoard[r][c] !== this.solutionBoard[r][c]) {
          return false;
        }
      }
    }
    return true;
  }

  handleGameWon() {
    this.isGameOver = true;
    this.stopTimer();
    localStorage.removeItem('sudoku_save_state');

    if (window.triggerConfetti) {
      window.triggerConfetti();
    }

    const finalTime = this.formatTime(this.timerSeconds);
    document.getElementById('modal-time').textContent = finalTime;
    document.getElementById('modal-diff').textContent = this.difficulty.toUpperCase();
    document.getElementById('modal-mistakes').textContent = this.mistakes;
    document.getElementById('modal-hints').textContent = this.hintsUsed;

    setTimeout(() => {
      this.winModal.classList.add('active');
    }, 400);
  }

  // Timer controls
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.timerSeconds++;
        this.renderTimer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.timerSeconds = 0;
    this.renderTimer();
  }

  renderTimer() {
    if (this.timerEl) {
      this.timerEl.textContent = this.formatTime(this.timerSeconds);
    }
  }

  formatTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    this.pauseOverlay.classList.toggle('active', this.isPaused);
  }

  // Save & Load
  saveGame() {
    if (this.isGameOver) return;
    const state = {
      difficulty: this.difficulty,
      initialBoard: this.initialBoard,
      currentBoard: this.currentBoard,
      solutionBoard: this.solutionBoard,
      notes: this.notes.map(row => row.map(set => Array.from(set))),
      mistakes: this.mistakes,
      hintsUsed: this.hintsUsed,
      timerSeconds: this.timerSeconds
    };
    localStorage.setItem('sudoku_save_state', JSON.stringify(state));
  }

  loadSavedGame() {
    const raw = localStorage.getItem('sudoku_save_state');
    if (!raw) return false;
    try {
      const state = JSON.parse(raw);
      if (!state.initialBoard || !state.currentBoard || !state.solutionBoard) return false;

      this.difficulty = state.difficulty || 'medium';
      this.initialBoard = state.initialBoard;
      this.currentBoard = state.currentBoard;
      this.solutionBoard = state.solutionBoard;
      this.mistakes = state.mistakes || 0;
      this.hintsUsed = state.hintsUsed || 0;
      this.timerSeconds = state.timerSeconds || 0;
      this.notes = state.notes.map(row => row.map(arr => new Set(arr)));

      this.renderBoard();
      this.updateNumpadCounts();
      this.updateMistakesDisplay();
      this.updateDifficultyTabs();
      this.renderTimer();
      this.startTimer();
      return true;
    } catch (e) {
      console.error('Error loading saved game:', e);
      return false;
    }
  }

  // Event Listeners
  bindEvents() {
    // Theme toggle
    document.getElementById('btn-theme')?.addEventListener('click', () => this.toggleTheme());

    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const diff = e.target.dataset.diff;
        if (diff !== this.difficulty || this.isGameOver) {
          this.startNewGame(diff);
        }
      });
    });

    // New Game button
    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.startNewGame(this.difficulty);
    });

    // Action buttons
    document.getElementById('btn-undo')?.addEventListener('click', () => this.undo());
    document.getElementById('btn-erase')?.addEventListener('click', () => this.erase());
    this.notesToggleBtn?.addEventListener('click', () => this.toggleNotesMode());
    document.getElementById('btn-hint')?.addEventListener('click', () => this.giveHint());

    // Number Pad
    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num, 10);
        this.inputNumber(num);
      });
    });

    // Timer / Pause click
    document.getElementById('btn-timer')?.addEventListener('click', () => this.togglePause());
    document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePause());

    // Modal play again button
    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.winModal.classList.remove('active');
      this.startNewGame(this.difficulty);
    });

    // Physical Keyboard Support
    window.addEventListener('keydown', (e) => {
      if (this.isPaused) {
        if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') this.togglePause();
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        this.inputNumber(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        this.erase();
      } else if (e.key === 'n' || e.key === 'N') {
        this.toggleNotesMode();
      } else if (e.key === 'h' || e.key === 'H') {
        this.giveHint();
      } else if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        this.undo();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        this.handleArrowNavigation(e.key);
      }
    });
  }

  handleArrowNavigation(key) {
    if (!this.selectedCell) {
      this.selectedCell = [0, 0];
    } else {
      let [r, c] = this.selectedCell;
      if (key === 'ArrowUp') r = (r - 1 + 9) % 9;
      if (key === 'ArrowDown') r = (r + 1) % 9;
      if (key === 'ArrowLeft') c = (c - 1 + 9) % 9;
      if (key === 'ArrowRight') c = (c + 1) % 9;
      this.selectedCell = [r, c];
    }
    this.highlightRelatedCells();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.sudokuApp = new SudokuGame();
});
