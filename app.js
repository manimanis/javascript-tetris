document.addEventListener('DOMContentLoaded', () => {
  const width = 12;
  const height = 20;
  const grid = document.querySelector('#grid');

  createGrid("#grid", width * height);

  const squares = Array.from(document.querySelectorAll('#grid div'));
  const scoreSpan = document.querySelector('#score');
  const startBtn = document.querySelector('#start-button');
  let TIMER_DELAY = 250;
 
  startBtn.addEventListener('click', (e) => {
    if (!bGameStarted) {
      startGame();
    } else {
      stopGame();
    }
  });

  const rotateRight = function (shape) {
    return shape.map((coords) => [3 - coords[1], coords[0]]);
  };

  const rotateLeft = function (shape) {
    return shape.map((coords) => [coords[1], 3 - coords[0]]);
  };

  const coordsToIndex = (x, y) => y * width + x;

  const draw = (shape, x, y, shapeName, on = true) => {
    const origin = y * width + x;
    shape.forEach(coords => {
      const idx = coordsToIndex(x + coords[0], y + coords[1]);
      if (on) {
        squares[idx].classList.add(shapeName);
      } else {
        squares[idx].classList.remove(shapeName);
      }
    });
  };

  const canMove = (shape, x, y) => {
    return shape.every(coords => {
      const idx = coordsToIndex(x + coords[0], y + coords[1]);
      return (x + coords[0] >= 0) && (y + coords[0] >= 0) &&
        (x + coords[0] < width) && (y + coords[1] < height) &&
        !squares[idx].classList.contains('taken');
    });
  };

  const setTaken = (shape, x, y) => {
    shape.forEach(coords => {
      const idx = coordsToIndex(x + coords[0], y + coords[1]);
      squares[idx].classList.add('taken');
    });
  };

  const resetGrid = () => {
    squares.forEach(square => square.removeAttribute('class'));
  };

  const startGame = () => {
    bGameStarted = true;
    bGameOver = false;
    score = 0;

    resetGrid();
    updateScore(score);
    spawnNewShape();

    startBtn.textContent = 'Stop Game';

    timerID = setTimeout(gameTimer, TIMER_DELAY);

    document.addEventListener('keydown', (e) => {
      if (!bGameStarted) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      let rotShape = curShapeCoords;
      let newX = curX;
      let newY = curY;
      if (e.keyCode === 37) {
        newX--;
      } else if (e.keyCode === 39) {
        newX++;
      } else if (e.keyCode === 38) {
        rotShape = rotateRight(curShapeCoords);
      } else if (e.keyCode === 40) {
        newY++;
      }

      if (canMove(rotShape, newX, newY)) {
        draw(curShapeCoords, curX, curY, curShapeName, false);
        curShapeCoords = rotShape;
        curX = newX;
        curY = newY;
        draw(curShapeCoords, curX, curY, curShapeName);
      }
    });
  };

  const stopGame = () => {
    bGameStarted = false;
    if (timerID) {
      clearTimeout(timerID);
    }
  };

  const gameOver = () => {
    stopGame();
    startBtn.textContent = 'Start Game';
    alert('Game over');
  };

  const spawnNewShape = () => {
    curX = 4;
    curY = 0;
    curShapeName = selectShape();
    curShapeCoords = allShapes[curShapeName];

    draw(curShapeCoords, curX, curY, curShapeName);
    if (!canMove(curShapeCoords, curX, curY)) {
      gameOver();
    }
  };

  const getCompletedLines = () => {
    const lines = [];
    for (let line = 0; line < height; line++) {
      let fullLine = true;
      for (let col = 0; col < width; col++) {
        const idx = coordsToIndex(col, line);
        if (!squares[idx].classList.contains('taken')) {
          fullLine = false;
          break;
        }
      }
      if (fullLine) {
        lines.push(line);
      }
    }
    return lines;
  };

  const removeLines = (lines) => {
    let curLine = height - 1;
    for (let line = height - 1; line >= 0; line--) {
      if (lines.includes(line)) {
        continue;
      }
      if (curLine !== line) {
        for (let col = 0; col < width; col++) {
          const square = squares[coordsToIndex(col, curLine)];
          const square1 = squares[coordsToIndex(col, line)];
          square.removeAttribute('class');
          square1.classList.forEach(cssClass => square.classList.add(cssClass));
        }
      }
      curLine--;
    }

    for (let line = curLine; line >= 0; line--) {
      for (let col = 0; col < width; col++) {
        const square = squares[coordsToIndex(col, line)];
        square.removeAttribute('class');
      }
    }
  };

  const gameTimer = () => {
    const canMoveDown = canMove(curShapeCoords, curX, curY + 1);
    if (canMoveDown) {
      draw(curShapeCoords, curX, curY, curShapeName, false);
      curY++;
      draw(curShapeCoords, curX, curY, curShapeName);
    } else {
      setTaken(curShapeCoords, curX, curY);
      const completedLines = getCompletedLines();
      if (completedLines.length) {
        score += (completedLines.length + 1) * (completedLines.length + 1);
        removeLines(completedLines);
      } else {
        score += 1;
      }
      updateScore(score);
      spawnNewShape();
    }
    if (!bGameOver && bGameStarted) {
      timerID = setTimeout(gameTimer, TIMER_DELAY);
    }
  };

  const updateScore = (newScore) => scoreSpan.textContent = newScore;

  const selectShape = () => shapesNames[Math.floor(Math.random() * shapesNames.length)];

  const lShape = [[1, 0], [2, 0], [1, 1], [1, 2]];
  const zShape = [[0, 1], [1, 1], [1, 0], [2, 0]];
  const tShape = [[1, 0], [0, 1], [1, 1], [2, 1]];
  const sShape = [[0, 0], [1, 0], [0, 1], [1, 1]];
  const iShape = [[1, 0], [1, 1], [1, 2], [1, 3]];

  const allShapes = { lShape, zShape, tShape, sShape, iShape };
  const shapesNames = Object.keys(allShapes);
  // Current shape
  let curShapeName;
  let curShapeCoords;
  // Current shape position
  let curX, curY;
  // Is game over
  let bGameOver = false;
  let bGameStarted = false;
  let score = 0;
  let timerID = null;
});