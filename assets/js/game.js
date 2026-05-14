const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const world = {
  width: 1600,
  height: 1200,
  tileSize: 80,
  rows: 15,
  cols: 20,
};

const player = {
  x: world.width / 2,
  y: world.height / 2,
  size: 32,
  speed: 220,
  color: '#57c7ff',
};

const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
};

const input = {
  left: false,
  right: false,
  up: false,
  down: false,
};

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  camera.width = canvas.clientWidth;
  camera.height = canvas.clientHeight;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function update(delta) {
  const move = player.speed * delta;
  if (input.left) player.x -= move;
  if (input.right) player.x += move;
  if (input.up) player.y -= move;
  if (input.down) player.y += move;

  player.x = clamp(player.x, player.size / 2, world.width - player.size / 2);
  player.y = clamp(player.y, player.size / 2, world.height - player.size / 2);

  camera.x = clamp(player.x - camera.width / 2, 0, world.width - camera.width);
  camera.y = clamp(player.y - camera.height / 2, 0, world.height - camera.height);
}

function drawGrid() {
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1;

  for (let x = 0; x <= world.width; x += world.tileSize) {
    const drawX = x - camera.x;
    if (drawX >= -world.tileSize && drawX <= camera.width + world.tileSize) {
      ctx.beginPath();
      ctx.moveTo(drawX, -camera.y);
      ctx.lineTo(drawX, world.height - camera.y);
      ctx.stroke();
    }
  }

  for (let y = 0; y <= world.height; y += world.tileSize) {
    const drawY = y - camera.y;
    if (drawY >= -world.tileSize && drawY <= camera.height + world.tileSize) {
      ctx.beginPath();
      ctx.moveTo(-camera.x, drawY);
      ctx.lineTo(world.width - camera.x, drawY);
      ctx.stroke();
    }
  }
}

function drawWorld() {
  ctx.fillStyle = '#101010';
  ctx.fillRect(0, 0, camera.width, camera.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, world.width, world.height);

  drawGrid();

  ctx.fillStyle = '#202020';
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = player.color;
  ctx.fillRect(
    player.x - player.size / 2,
    player.y - player.size / 2,
    player.size,
    player.size,
  );

  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#ffffffcc';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText(`Position: ${Math.round(player.x)}, ${Math.round(player.y)}`, 16, 24);
  ctx.fillText('Use arrow keys or WASD to move the cube.', 16, 44);
}

let lastTime = performance.now();
function loop(timestamp) {
  const delta = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  update(delta);
  drawWorld();
  drawHUD();
  requestAnimationFrame(loop);
}

function setInput(event, value) {
  switch (event.code) {
    case 'ArrowLeft':
    case 'KeyA':
      input.left = value;
      break;
    case 'ArrowRight':
    case 'KeyD':
      input.right = value;
      break;
    case 'ArrowUp':
    case 'KeyW':
      input.up = value;
      break;
    case 'ArrowDown':
    case 'KeyS':
      input.down = value;
      break;
  }
}

window.addEventListener('keydown', (event) => {
  setInput(event, true);
});

window.addEventListener('keyup', (event) => {
  setInput(event, false);
});

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
  resizeCanvas();
  requestAnimationFrame(loop);
});
