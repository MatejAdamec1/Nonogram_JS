let gridSize = 5;

function createGrid() {
  const grid = document.getElementById("nonogram-container");
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const field = document.createElement("div");
      field.classList.add("field");
      grid.appendChild(field);
    }
  }
}

function createSolution(size) {
  let solution = [];

  for (let i = 0; i < size; i++) {
    solution[i] = [];
    for (let j = 0; j < size; j++) {
      solution[i][j] = Math.random() < 0.5 ? 1 : 0;
    }
  }

  return solution;
}

function isSolutionValid(solution) {
  if (solution === null){
    return false;
  }

  let rowSums = solution.map(row => row.reduce((a, b) => a + b, 0));
  let colSums = solution[0].map((_, colIndex) => solution.reduce((sum, row) => sum + row[colIndex], 0));

  return rowSums.every(sum => sum > 0) && colSums.every(sum => sum > 0);
}

function prepareGame(size) {
  let solution;
  do {
    solution = createSolution(size);
  } while (!isSolutionValid(solution));
  const clues = createClues(solution);

  createGrid();

  renderClues(clues.rows, "row-hints");
  renderClues(clues.columns, "column-hints");

  return { solution, clues };
}

function getLineClues(line) {
  const clues = [];
  let start = null;

  for (let i = 0; i <= line.length; i++) {
    if (line[i] === 1) {
      if (start === null) {
        start = i;
      }
    } else if (start !== null) {
      clues.push({
        length: i - start,
        start: start,
        end: i - 1
      });

      start = null;
    }
  }

  return clues;
}

function createClues(solution) {
  const rows = [];
  const columns = [];

  for (let row = 0; row < solution.length; row++) {
    rows.push(getLineClues(solution[row]));
  }

  for (let col = 0; col < solution[0].length; col++) {
    const column = [];

    for (let row = 0; row < solution.length; row++) {
      column.push(solution[row][col]);
    }

    columns.push(getLineClues(column));
  }

  return { rows, columns };
}

function renderClues(lines, containerId) {
  const container = document.getElementById(containerId);
  container.replaceChildren();

  for (const line of lines) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("clue-line");

    if (line.length === 0) {
      const span = document.createElement("span");
      span.classList.add("hint");
      span.textContent = "0";
      wrapper.appendChild(span);
    }

    for (const clue of line) {
      const span = document.createElement("span");
      span.classList.add("hint");
      span.textContent = clue.length;

      clue.element = span;
      wrapper.appendChild(span);
    }

    container.appendChild(wrapper);
  }
}

const { solution, clues } = prepareGame(gridSize);
const fields = document.querySelectorAll(".field");
const grid = document.getElementById("nonogram-container");

