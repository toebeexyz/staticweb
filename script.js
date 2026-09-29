const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  started: false,
  gameOver: false,
  score: 0,
  best: 0,
  birdX: 124,
  birdY: 240,
  birdSize: 20,
  birdVel: 0,
  gravity: 0.42,
  flapBoost: -7.6,
  spawnTimer: 0,
  lastTime: 0,
  pipes: [],
};

function reset() {
  state.started = false;
  state.gameOver = false;
  state.score = 0;
  state.birdY = canvas.height / 2;
  state.birdVel = 0;
  state.spawnTimer = 0;
  state.pipes = [];
}

function addPipe() {
  const gap = 150;
  const minTop = 55;
  const maxTop = canvas.height - gap - 80;
  const topHeight = minTop + Math.random() * (maxTop - minTop);
  const width = 60;

  state.pipes.push({
    x: canvas.width + 10,
    width,
    topHeight,
    gap,
    scored: false,
  });
}

function flap() {
  if (state.gameOver) {
    reset();
  }

  if (!state.started) {
    state.started = true;
  }

  state.birdVel = state.flapBoost;
}

function hitPipe(pipe) {
  const birdLeft = state.birdX;
  const birdRight = state.birdX + state.birdSize;
  const birdTop = state.birdY;
  const birdBottom = state.birdY + state.birdSize;

  const overlapX = birdRight > pipe.x && birdLeft < pipe.x + pipe.width;
  const hitTop = birdTop < pipe.topHeight;
  const hitBottom = birdBottom > pipe.topHeight + pipe.gap;

  return overlapX && (hitTop || hitBottom);
}

function endGame() {
  state.gameOver = true;
  state.best = Math.max(state.best, state.score);
}

function update(delta) {
  if (!state.started || state.gameOver) {
    return;
  }

  state.birdVel += state.gravity * (delta / 16.67);
  state.birdY += state.birdVel * (delta / 16.67);

  state.spawnTimer += delta;
  if (state.spawnTimer > 1400) {
    addPipe();
    state.spawnTimer = 0;
  }

  for (const pipe of state.pipes) {
    pipe.x -= 3 * (delta / 16.67);

    if (!pipe.scored && pipe.x + pipe.width < state.birdX) {
      pipe.scored = true;
      state.score += 1;
    }

    if (hitPipe(pipe)) {
      endGame();
      break;
    }
  }

  state.pipes = state.pipes.filter((pipe) => pipe.x + pipe.width > -20);

  if (state.birdY < 0 || state.birdY + state.birdSize > canvas.height - 52) {
    endGame();
  }
}

function drawBackground() {
  ctx.fillStyle = '#171714';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPipe(pipe) {
  const topHeight = pipe.topHeight;
  const bottomY = pipe.topHeight + pipe.gap;
  const bottomHeight = canvas.height - 52 - bottomY;

  ctx.fillStyle = 'rgba(219, 151, 57, 0.17)';
  ctx.shadowColor = 'rgba(235, 165, 67, 0.62)';
  ctx.shadowBlur = 18;

  roundRect(pipe.x, 0, pipe.width, topHeight, 18);
  ctx.fill();

  roundRect(pipe.x, bottomY, pipe.width, bottomHeight, 18);
  ctx.fill();

  ctx.shadowBlur = 0;
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBird() {
  ctx.save();
  ctx.translate(state.birdX, state.birdY);

  const grad = ctx.createRadialGradient(
    state.birdSize * 0.28,
    state.birdSize * 0.28,
    1,
    state.birdSize * 0.52,
    state.birdSize * 0.52,
    state.birdSize * 1.8
  );
  grad.addColorStop(0, 'rgba(255, 224, 163, 0.88)');
  grad.addColorStop(0.28, 'rgba(238, 174, 81, 0.58)');
  grad.addColorStop(0.7, 'rgba(191, 119, 37, 0.16)');
  grad.addColorStop(1, 'rgba(191, 119, 37, 0)');

  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(255, 190, 90, 0.92)';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.ellipse(
    state.birdSize / 2,
    state.birdSize / 2,
    state.birdSize / 2,
    state.birdSize / 2.1,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.restore();
}

function drawGround() {
  ctx.fillStyle = 'rgba(195, 139, 57, 0.11)';
  ctx.fillRect(0, canvas.height - 52, canvas.width, 52);
  ctx.fillStyle = 'rgba(237, 177, 87, 0.35)';
  ctx.fillRect(0, canvas.height - 52, canvas.width, 2);
}

function drawScore() {
  ctx.fillStyle = '#f0b45a';
  ctx.font = '700 24px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(String(state.score), 18, 36);

  ctx.font = '600 12px "Courier New", monospace';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#a29b8d';
  ctx.fillText('BEST ' + String(state.best), canvas.width - 18, 24);
}

function drawStart() {
  ctx.fillStyle = '#f0b45a';
  ctx.textAlign = 'center';
  ctx.font = '700 28px "Courier New", monospace';
  ctx.fillText('Tap or press space', canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '600 16px "Courier New", monospace';
  ctx.fillStyle = '#b7ad9a';
  ctx.fillText('to begin', canvas.width / 2, canvas.height / 2 + 18);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(14, 13, 11, 0.68)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#f0b45a';
  ctx.textAlign = 'center';
  ctx.font = '700 32px "Courier New", monospace';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = '600 18px "Courier New", monospace';
  ctx.fillText('Score: ' + state.score, canvas.width / 2, canvas.height / 2 + 22);
  ctx.fillText('Click to retry', canvas.width / 2, canvas.height / 2 + 52);
}

function draw() {
  drawBackground();

  for (const pipe of state.pipes) {
    drawPipe(pipe);
  }

  drawGround();
  drawBird();
  drawScore();

  if (!state.started && !state.gameOver) {
    drawStart();
  }

  if (state.gameOver) {
    drawGameOver();
  }

}

function tick(time) {
  const delta = time - state.lastTime || 16.67;
  state.lastTime = time;
  update(delta);
  draw();
  requestAnimationFrame(tick);
}

canvas.addEventListener('pointerdown', flap);
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    flap();
  }
});

reset();
requestAnimationFrame(tick);
