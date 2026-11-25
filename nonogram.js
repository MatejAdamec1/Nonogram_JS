let lives = 3;
const livesElement = document.getElementById("lives");

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
    resetGame();
});

let drag = null;

function stopDrag() {
    drag = null;
}

function updateLineClues(lineClues, lineIndex, isColumn) {
  for (const clue of lineClues) {
    let completed = true;

    for (let i = clue.start; i <= clue.end; i++) {
      const row = isColumn ? i : lineIndex;
      const col = isColumn ? lineIndex : i;
      const field = fields[row * gridSize + col];

      if (
        !field.classList.contains("filled") ||
        field.classList.contains("error")
      ) {
        completed = false;
        break;
      }
    }

    clue.element.classList.toggle("completed", completed);
  }
}

function markField(field, button) {
    if (lives <= 0 || field.classList.contains("finished") ||
        field.classList.contains("filled") || field.classList.contains("marked")) {
        return;
    }

    const index = Array.prototype.indexOf.call(fields, field);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const isFilled = solution[row][col] === 1;
    const isCorrect = isFilled === (button === 0);

    field.classList.add(isFilled ? "filled" : "marked");
    if (!isCorrect) {
        stopDrag();
        field.classList.add("error");
        lives -= 1;
        updateLives();
    }
    updateLineClues(clues.rows[row], row, false);
    updateLineClues(clues.columns[col], col, true);

    if (lives > 0) {
        checkWin();
    }
}

grid.addEventListener("pointerdown", (event) => {
    if ((event.button !== 0 && event.button !== 2) || drag || lives <= 0) {
        return;
    }
    const field = event.target.closest(".field");
    if (!field || field.classList.contains("finished")) {
        return;
    }
    event.preventDefault();
    drag = { pointerId: event.pointerId, button: event.button };
    markField(field, drag.button);
});

document.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) {
        return;
    }
    const buttonMask = drag.button === 0 ? 1 : 2;
    if (!(event.buttons & buttonMask)) {
        stopDrag();
        return;
    }
    const field = document.elementFromPoint(event.clientX, event.clientY)?.closest(".field");
    if (field && grid.contains(field)) {
        markField(field, drag.button);
    }
});

document.addEventListener("pointerup", (event) => {
    if (drag && event.pointerId === drag.pointerId) {
        stopDrag();
    }
});
document.addEventListener("pointercancel", stopDrag);
window.addEventListener("blur", stopDrag);
grid.addEventListener("contextmenu", (event) => event.preventDefault());

async function updateLives() {
    livesElement.textContent = `Lives: ${lives}`;
    if (lives <= 0) {
        await gameOver();
    }
}

function checkWin() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const field = fields[row * gridSize + col];
            if (solution[row][col] === 1 && !field.classList.contains("filled")) {
                return;
            }
        }
    }

    fields.forEach((field) => {
        field.classList.add("finished");
    });

    stopDrag();
    showWinMessage();
}

async function gameOver() {
    await showLoseMessage();
    resetGame();
}

function resetGame() {
    stopDrag();
    fields.forEach((field) => {
        field.classList.remove("filled");
        field.classList.remove("marked");
        field.classList.remove("finished");
        field.classList.remove("error");
    });
    document.querySelectorAll(".hint.completed").forEach((hint) => {
        hint.classList.remove("completed");
    });
    lives = 3;
    updateLives();
}

async function showLoseMessage() {
    await new Promise(r => setTimeout(r, 100));
    alert("Game over! You have no lives left.");
}

async function showWinMessage() {
    await new Promise(r => setTimeout(r, 100));
    alert("Congratulations! You solved the nonogram!");
}
