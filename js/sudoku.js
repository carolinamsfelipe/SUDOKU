/**
 * Sudoku Core Logic: Generator, Solver & Validator
 */

class SudokuEngine {
  constructor() {
    this.BLANK = 0;
  }

  // Create an empty 9x9 board
  createEmptyBoard() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  // Deep clone a 9x9 board
  cloneBoard(board) {
    return board.map(row => [...row]);
  }

  // Check if placing num at (row, col) is valid
  isValid(board, row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === num) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = startRow + r;
        const curC = startCol + c;
        if ((curR !== row || curC !== col) && board[curR][curC] === num) {
          return false;
        }
      }
    }

    return true;
  }

  // Shuffle array utility (Fisher-Yates)
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Find next empty cell
  findEmptyCell(board) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === this.BLANK) {
          return [r, c];
        }
      }
    }
    return null;
  }

  // Solve a board using randomized backtracking (generates a full valid board)
  solveRandom(board) {
    const empty = this.findEmptyCell(board);
    if (!empty) return true;

    const [row, col] = empty;
    const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of numbers) {
      if (this.isValid(board, row, col, num)) {
        board[row][col] = num;
        if (this.solveRandom(board)) return true;
        board[row][col] = this.BLANK;
      }
    }
    return false;
  }

  // Standard solver for checking solutions
  solve(board) {
    const empty = this.findEmptyCell(board);
    if (!empty) return true;

    const [row, col] = empty;
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(board, row, col, num)) {
        board[row][col] = num;
        if (this.solve(board)) return true;
        board[row][col] = this.BLANK;
      }
    }
    return false;
  }

  // Count number of solutions (stops if count reaches limit)
  countSolutions(board, limit = 2) {
    let count = 0;

    const search = (b) => {
      const empty = this.findEmptyCell(b);
      if (!empty) {
        count++;
        return;
      }

      const [row, col] = empty;
      for (let num = 1; num <= 9; num++) {
        if (this.isValid(b, row, col, num)) {
          b[row][col] = num;
          search(b);
          b[row][col] = this.BLANK;
          if (count >= limit) return;
        }
      }
    };

    search(this.cloneBoard(board));
    return count;
  }

  // Fill diagonal 3x3 blocks independently (guaranteed valid & fast)
  fillDiagonalBlocks(board) {
    for (let box = 0; box < 9; box += 3) {
      const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          board[box + r][box + c] = nums[idx++];
        }
      }
    }
  }

  // Generate a complete valid board
  generateSolvedBoard() {
    const board = this.createEmptyBoard();
    this.fillDiagonalBlocks(board);
    this.solveRandom(board);
    return board;
  }

  // Generate a puzzle with a given difficulty
  generatePuzzle(difficulty = 'medium') {
    const clueCount = {
      easy: 38,
      medium: 30,
      hard: 25,
      expert: 22
    }[difficulty] || 30;

    const solution = this.generateSolvedBoard();
    const puzzle = this.cloneBoard(solution);

    // List of all 81 positions
    const positions = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    const shuffledPositions = this.shuffle(positions);

    let cluesRemaining = 81;

    for (const [row, col] of shuffledPositions) {
      if (cluesRemaining <= clueCount) break;

      const temp = puzzle[row][col];
      puzzle[row][col] = this.BLANK;

      // Verify that the puzzle still has a unique solution
      if (this.countSolutions(puzzle, 2) !== 1) {
        puzzle[row][col] = temp; // restore
      } else {
        cluesRemaining--;
      }
    }

    return {
      puzzle,
      solution
    };
  }

  // Validate complete board
  isBoardCompleteAndValid(board) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val === this.BLANK) return false;
        if (!this.isValid(board, r, c, val)) return false;
      }
    }
    return true;
  }

  // Get conflicting cells for a specific position
  getConflicts(board, row, col) {
    const val = board[row][col];
    if (val === this.BLANK) return [];

    const conflicts = [];

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === val) {
        conflicts.push([row, c]);
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === val) {
        conflicts.push([r, col]);
      }
    }

    // Check box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = startRow + r;
        const curC = startCol + c;
        if ((curR !== row || curC !== col) && board[curR][curC] === val) {
          conflicts.push([curR, curC]);
        }
      }
    }

    return conflicts;
  }
}

// Export for ES modules or attach to window for classic script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SudokuEngine;
} else {
  window.SudokuEngine = SudokuEngine;
}
