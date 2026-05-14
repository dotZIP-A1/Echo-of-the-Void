const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const spriteSheet = {
  image: new Image(),
  frames: [
    { x: 0, y: 0, w: 64, h: 64 },
    { x: 64, y: 0, w: 64, h: 64 },
    { x: 128, y: 0, w: 64, h: 64 },
    { x: 192, y: 0, w: 64, h: 64 },
    { x: 256, y: 0, w: 64, h: 64 },
    { x: 320, y: 0, w: 64, h: 64 },
    { x: 384, y: 0, w: 64, h: 64 },
    { x: 448, y: 0, w: 64, h: 64 },
    { x: 512, y: 0, w: 64, h: 64 },
    { x: 576, y: 0, w: 64, h: 64 },
    { x: 640, y: 0, w: 64, h: 64 },
    { x: 704, y: 0, w: 64, h: 64 },
    { x: 768, y: 0, w: 64, h: 64 },
    { x: 832, y: 0, w: 64, h: 64 },
    { x: 896, y: 0, w: 64, h: 64 },
    { x: 960, y: 0, w: 64, h: 64 },
    { x: 1024, y: 0, w: 64, h: 64 },
  ],
  loaded: false,
};

spriteSheet.image.src = 'assets/sprites/characters/character1.png';
spriteSheet.image.onload = () => {
  spriteSheet.loaded = true;
};

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
  width: 64,
  height: 64,
  speed: 220,
  facing: 'down',
  moving: false,
  animationTime: 0,
  frameSpeed: 0.08,
  blinkTime: 0,
  blinkDuration: 0.12,
  nextBlink: Math.random() * 2 + 2,
  blinking: false,
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

const animation = {
  idle: 2,
  walkHorizontal: [3, 4, 5, 6, 7, 8, 9],
  walkVertical: [11, 12, 13, 14, 15, 16],
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

function updateMovement(delta) {
  const move = player.speed * delta;
  let moved = false;

  if (input.left) {
    player.x -= move;
    player.facing = 'left';
    moved = true;
  } else if (input.right) {
    player.x += move;
    player.facing = 'right';
    moved = true;
  }

  if (input.up) {
    player.y -= move;
    if (!moved) player.facing = 'up';
    moved = true;
  } else if (input.down) {
    player.y += move;
    if (!moved) player.facing = 'down';
    moved = true;
  }

  player.moving = moved;
  if (player.moving) {
    player.animationTime += delta;
  } else {
    player.animationTime = 0;
  }

  if (player.blinking) {
    player.blinkTime += delta;
    if (player.blinkTime >= player.blinkDuration) {
      player.blinking = false;
      player.blinkTime = 0;
      player.nextBlink = Math.random() * 2 + 2;
    }
  } else {
    player.nextBlink -= delta;
    if (player.nextBlink <= 0) {
      player.blinking = true;
      player.blinkTime = 0;
    }
  }
}

function update(delta) {
  updateMovement(delta);

  player.x = clamp(player.x, player.width / 2, world.width - player.width / 2);
  player.y = clamp(player.y, player.height / 2, world.height - player.height / 2);

  camera.x = clamp(player.x - camera.width / 2, 0, world.width - camera.width);
  camera.y = clamp(player.y - camera.height / 2, 0, world.height - camera.height);
}

function getBodyFrame() {
  if (!player.moving) {
    return animation.idle;
  }

  let frames = animation.walkVertical;
  if (player.facing === 'left' || player.facing === 'right') {
    frames = animation.walkHorizontal;
  }

  const index = Math.floor(player.animationTime / player.frameSpeed) % frames.length;
  return frames[index];
}

function getHeadFrame() {
  return player.blinking ? 1 : 0;
}

function drawSpriteFrame(frameIndex, drawX, drawY, flip = false) {
  const frame = spriteSheet.frames[frameIndex];
  if (flip) {
    ctx.save();
    ctx.translate(drawX + frame.w, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(
      spriteSheet.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      0,
      0,
      frame.w,
      frame.h,
    );
    ctx.restore();
  } else {
    ctx.drawImage(
      spriteSheet.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      drawX,
      drawY,
      frame.w,
      frame.h,
    );
  }
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

function drawPlayer() {
  const bodyFrameIndex = getBodyFrame();
  const headFrameIndex = getHeadFrame();
  const drawX = player.x - player.width / 2;
  const drawY = player.y - player.height / 2;
  const flip = player.facing === 'left';

  if (spriteSheet.loaded) {
    drawSpriteFrame(bodyFrameIndex, drawX, drawY, flip);
    drawSpriteFrame(headFrameIndex, drawX, drawY, flip);
  } else {
    ctx.fillStyle = player.color;
    ctx.fillRect(drawX, drawY, player.width, player.height);
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
  drawPlayer();

  ctx.restore();
}

function drawHUD() {
  ctx.fillStyle = '#ffffffcc';
  ctx.font = '14px Inter, system-ui, sans-serif';
  ctx.fillText(`Position: ${Math.round(player.x)}, ${Math.round(player.y)}`, 16, 24);
  ctx.fillText(`Facing: ${player.facing}`, 16, 44);
  ctx.fillText('Use arrow keys or WASD to move the sprite.', 16, 64);
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
