'use strict';

/*
  FLOPPY FISH
  A flappy-style game, underwater. Plain JavaScript, no libraries.

  Every game is the same three steps, repeated about 60 times a second:
    1. read INPUT    (did the player tap?)
    2. UPDATE        (move everything a tiny bit)
    3. DRAW          (paint the new picture)

  This file is laid out in that order. Read it top to bottom.
*/

// ---------------------------------------------------------------------------
// 1. SETTINGS - change these numbers and reload to feel the difference
// ---------------------------------------------------------------------------

const CONFIG = {
  gravity: 1300,        // how fast the fish sinks (pixels per second, per second)
  swimPower: 390,       // upward speed you get from one tap
  maxFallSpeed: 520,    // water is thick, so sinking tops out
  startSpeed: 150,      // how fast the pillars slide left at score 0
  speedPerPoint: 4,     // extra speed for every point you score
  maxSpeed: 290,
  pillarWidth: 66,
  gapSize: 165,         // the opening you swim through
  pillarSpacing: 230,   // distance between one pillar and the next
  floorHeight: 46       // the sand at the bottom
};

// The game always thinks in a 400 x 600 world. resize() stretches that world
// to fit whatever screen it is on, so the math never has to change.
const W = 400;
const H = 600;
const FLOOR_Y = H - CONFIG.floorHeight;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  const dpr = window.devicePixelRatio || 1; // sharp on phone and retina screens
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
  canvas.width = Math.floor(W * scale * dpr);
  canvas.height = Math.floor(H * scale * dpr);
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// ---------------------------------------------------------------------------
// 2. STATE - everything the game needs to remember
// ---------------------------------------------------------------------------

// The game is always in exactly one of these three modes.
const READY = 'ready';
const PLAYING = 'playing';
const GAME_OVER = 'gameover';

let mode = READY;
let clock = 0;          // seconds since the page loaded, used for animation
let score = 0;
let best = loadBest();
let scroll = 0;         // how far the world has scrolled, for the background
let shake = 0;          // screen shake time left after a crash
let deadFor = 0;        // seconds since the crash
let scorePop = 0;       // makes the score bounce when it goes up

const fish = { x: 110, y: H / 2, vy: 0, radius: 15, angle: 0 };
let pillars = [];       // each one: { x, gapY, passed }
let bubbles = [];       // each one: { x, y, r, vy, life }

function loadBest() {
  // localStorage can be blocked (private browsing), so never trust it.
  try {
    return Number(localStorage.getItem('floppy-fish-best')) || 0;
  } catch (err) {
    return 0;
  }
}

function saveBest() {
  try {
    localStorage.setItem('floppy-fish-best', String(best));
  } catch (err) {
    // No storage, no problem. The best score just lasts until reload.
  }
}

// Which fish look is selected. The list of looks lives in skins.js.
let skinIndex = loadSkin();

function loadSkin() {
  try {
    const saved = Number(localStorage.getItem('floppy-fish-skin')) || 0;
    return saved >= 0 && saved < SKINS.length ? saved : 0;
  } catch (err) {
    return 0;
  }
}

function changeSkin(direction) {
  skinIndex = (skinIndex + direction + SKINS.length) % SKINS.length;
  try {
    localStorage.setItem('floppy-fish-skin', String(skinIndex));
  } catch (err) {
    // Fine. The choice just will not be remembered next time.
  }
}

function resetGame() {
  mode = READY;
  score = 0;
  deadFor = 0;
  shake = 0;
  fish.y = H / 2;
  fish.vy = 0;
  fish.angle = 0;
  pillars = [];
}

function addPillar(x) {
  // Pick a random height for the gap, but keep it away from the edges.
  const margin = 70;
  const lowest = margin + CONFIG.gapSize / 2;
  const highest = FLOOR_Y - margin - CONFIG.gapSize / 2;
  const gapY = lowest + Math.random() * (highest - lowest);
  pillars.push({ x: x, gapY: gapY, passed: false });
}

function addBubbles(x, y, count) {
  for (let i = 0; i < count; i++) {
    bubbles.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 16,
      r: 1.5 + Math.random() * 3.5,
      vy: -(30 + Math.random() * 60),
      life: 1
    });
  }
}

// ---------------------------------------------------------------------------
// 3. INPUT - one button does everything
// ---------------------------------------------------------------------------

function tap() {
  if (mode === READY) {
    mode = PLAYING;
    addPillar(W + 80);
  }
  if (mode === PLAYING) {
    fish.vy = -CONFIG.swimPower;
    addBubbles(fish.x - 12, fish.y + 6, 5);
  } else if (mode === GAME_OVER && deadFor > 0.6) {
    // The short wait stops a panic tap from skipping the score screen.
    resetGame();
  }
}

window.addEventListener('keydown', function (event) {
  if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
    event.preventDefault(); // do not scroll the page
    if (!event.repeat) tap();
  }
  // On the title screen you can pick a fish.
  if (mode === READY) {
    if (event.code === 'KeyS' || event.code === 'ArrowRight') changeSkin(1);
    if (event.code === 'KeyA' || event.code === 'ArrowLeft') changeSkin(-1);
  }
});

// The < and > arrows on the title screen sit at these spots in the 400 x 600 world.
const ARROW_Y = 360;
const ARROW_LEFT_X = W / 2 - 110;
const ARROW_RIGHT_X = W / 2 + 110;

window.addEventListener('pointerdown', function (event) {
  event.preventDefault();
  if (mode === READY) {
    // Turn the screen position of the tap into a position inside our game world.
    const box = canvas.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * W;
    const y = ((event.clientY - box.top) / box.height) * H;
    if (Math.abs(y - ARROW_Y) < 32) {
      if (Math.abs(x - ARROW_LEFT_X) < 38) { changeSkin(-1); return; }
      if (Math.abs(x - ARROW_RIGHT_X) < 38) { changeSkin(1); return; }
    }
  }
  tap();
});

// ---------------------------------------------------------------------------
// 4. UPDATE - move the world forward by dt seconds
// ---------------------------------------------------------------------------

function currentSpeed() {
  return Math.min(CONFIG.maxSpeed, CONFIG.startSpeed + score * CONFIG.speedPerPoint);
}

function update(dt) {
  clock += dt;
  shake = Math.max(0, shake - dt);
  scorePop = Math.max(0, scorePop - dt * 4);

  if (mode === READY) {
    // Hover in place, bobbing gently, while we wait for the first tap.
    fish.y = H / 2 + Math.sin(clock * 3) * 10;
    fish.angle = Math.sin(clock * 3 + 1) * 0.12;
    scroll += 60 * dt;
  }

  if (mode === PLAYING) {
    const speed = currentSpeed();
    scroll += speed * dt;

    // Physics: gravity changes speed, speed changes position.
    fish.vy = Math.min(CONFIG.maxFallSpeed, fish.vy + CONFIG.gravity * dt);
    fish.y += fish.vy * dt;

    // Bumping the surface is allowed. It just stops you.
    if (fish.y < fish.radius) {
      fish.y = fish.radius;
      fish.vy = 0;
    }

    // Point the nose where the fish is heading.
    const targetAngle = Math.max(-0.5, Math.min(1.1, fish.vy / 420));
    fish.angle += (targetAngle - fish.angle) * Math.min(1, dt * 10);

    // Slide every pillar left, and score the ones we get past.
    for (const pillar of pillars) {
      pillar.x -= speed * dt;
      if (!pillar.passed && pillar.x + CONFIG.pillarWidth < fish.x - fish.radius) {
        pillar.passed = true;
        score += 1;
        scorePop = 1;
      }
    }

    // Remove pillars that left the screen, add new ones on the right.
    pillars = pillars.filter(function (pillar) {
      return pillar.x + CONFIG.pillarWidth > -20;
    });
    const last = pillars[pillars.length - 1];
    if (last && last.x < W - CONFIG.pillarSpacing + CONFIG.pillarWidth) {
      addPillar(last.x + CONFIG.pillarSpacing);
    }

    if (hitSomething()) crash();
  }

  if (mode === GAME_OVER) {
    deadFor += dt;
    // Sink slowly to the sand and roll over.
    fish.vy = Math.min(140, fish.vy + 500 * dt);
    fish.y = Math.min(FLOOR_Y - fish.radius + 3, fish.y + fish.vy * dt);
    fish.angle += (Math.PI - fish.angle) * Math.min(1, dt * 4);
  }

  // Bubbles float up and fade out in every mode.
  if (Math.random() < dt * 2) {
    addBubbles(Math.random() * W, FLOOR_Y, 1); // a few rise from the sand
  }
  for (const bubble of bubbles) {
    bubble.y += bubble.vy * dt;
    bubble.x += Math.sin(clock * 4 + bubble.r * 10) * 12 * dt;
    if (mode === PLAYING) bubble.x -= currentSpeed() * 0.5 * dt;
    bubble.life -= dt * 0.45;
  }
  bubbles = bubbles.filter(function (bubble) {
    return bubble.life > 0 && bubble.y > -10;
  });
}

// Collision: the fish is treated as a circle, each pillar half as a rectangle.
function circleTouchesRect(cx, cy, radius, rx, ry, rw, rh) {
  // Find the point on the rectangle that is closest to the circle's center.
  const nearestX = Math.max(rx, Math.min(cx, rx + rw));
  const nearestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  // If that point is inside the circle, they overlap.
  return dx * dx + dy * dy < radius * radius;
}

function hitSomething() {
  if (fish.y + fish.radius >= FLOOR_Y) return true;

  const half = CONFIG.gapSize / 2;
  const r = fish.radius - 2; // slightly forgiving feels more fair
  for (const pillar of pillars) {
    const topHeight = pillar.gapY - half;
    const bottomY = pillar.gapY + half;
    if (circleTouchesRect(fish.x, fish.y, r, pillar.x, 0, CONFIG.pillarWidth, topHeight)) return true;
    if (circleTouchesRect(fish.x, fish.y, r, pillar.x, bottomY, CONFIG.pillarWidth, FLOOR_Y - bottomY)) return true;
  }
  return false;
}

function crash() {
  mode = GAME_OVER;
  deadFor = 0;
  shake = 0.35;
  fish.vy = -120; // a little bounce off whatever we hit
  addBubbles(fish.x, fish.y, 14);
  if (score > best) {
    best = score;
    saveBest();
  }
}

// ---------------------------------------------------------------------------
// 5. DRAW - paint one frame, back to front
// ---------------------------------------------------------------------------

function draw() {
  ctx.save();

  if (shake > 0) {
    const power = shake * 22;
    ctx.translate((Math.random() - 0.5) * power, (Math.random() - 0.5) * power);
  }

  drawWater();
  drawLightRays();
  drawSeaweed(0.3, 34, 'rgba(10, 70, 80, 0.55)');  // far away, slow
  drawSeaweed(0.6, 52, 'rgba(14, 110, 95, 0.75)'); // closer, faster
  for (const pillar of pillars) drawPillar(pillar);
  drawSand();
  drawBubbles();
  drawFish();

  ctx.restore();

  drawText();
}

function drawWater() {
  const water = ctx.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0, '#2bb5e0');
  water.addColorStop(0.45, '#0f6f9e');
  water.addColorStop(1, '#06304f');
  ctx.fillStyle = water;
  ctx.fillRect(-20, -20, W + 40, H + 40);
}

function drawLightRays() {
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    const sway = Math.sin(clock * 0.6 + i * 1.7) * 30;
    const topX = 30 + i * 90 + sway;
    ctx.beginPath();
    ctx.moveTo(topX, -10);
    ctx.lineTo(topX + 34, -10);
    ctx.lineTo(topX - 90, H);
    ctx.lineTo(topX - 170, H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// Parallax: things far away scroll slower than things close up.
function drawSeaweed(depth, height, color) {
  const spacing = 58;
  const offset = (scroll * depth) % spacing;
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  for (let x = -offset - spacing; x < W + spacing; x += spacing) {
    const id = Math.round((x + scroll * depth) / spacing); // stable per plant
    const h = height + (id % 3) * 14;
    const sway = Math.sin(clock * 1.8 + id) * 10;
    ctx.beginPath();
    ctx.moveTo(x, FLOOR_Y + 4);
    ctx.quadraticCurveTo(x + sway, FLOOR_Y - h / 2, x + sway * 1.6, FLOOR_Y - h);
    ctx.stroke();
  }
}

function drawPillar(pillar) {
  const half = CONFIG.gapSize / 2;
  const w = CONFIG.pillarWidth;
  drawRock(pillar.x, -20, w, pillar.gapY - half + 20, false);
  drawRock(pillar.x, pillar.gapY + half, w, FLOOR_Y - (pillar.gapY + half) + 10, true);
}

function drawRock(x, y, w, h, capOnTop) {
  // The column.
  const stone = ctx.createLinearGradient(x, 0, x + w, 0);
  stone.addColorStop(0, '#3d5a73');
  stone.addColorStop(0.35, '#6f93ab');
  stone.addColorStop(1, '#2a3f55');
  ctx.fillStyle = stone;
  ctx.fillRect(x, y, w, h);

  // Darker bands so it reads as stacked stone.
  ctx.fillStyle = 'rgba(10, 25, 40, 0.22)';
  for (let bandY = y + 14; bandY < y + h - 10; bandY += 34) {
    ctx.fillRect(x, bandY, w, 4);
  }

  // The coral cap on the end that faces the gap.
  const capY = capOnTop ? y : y + h - 20;
  ctx.fillStyle = '#ff6f91';
  roundedRect(x - 6, capY, w + 12, 20, 9);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  roundedRect(x - 2, capY + 3, w * 0.5, 5, 3);
  ctx.fill();
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSand() {
  ctx.fillStyle = '#e8cf95';
  ctx.fillRect(-20, FLOOR_Y, W + 40, H - FLOOR_Y + 20);
  ctx.fillStyle = '#d4b673';
  const spacing = 36;
  const offset = scroll % spacing;
  for (let x = -offset - spacing; x < W + spacing; x += spacing) {
    ctx.beginPath();
    ctx.ellipse(x + 10, FLOOR_Y + 16, 11, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 28, FLOOR_Y + 32, 8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f6e3b4';
  ctx.fillRect(-20, FLOOR_Y, W + 40, 4);
}

function drawBubbles() {
  ctx.lineWidth = 1.5;
  for (const bubble of bubbles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, bubble.life)) * 0.7;
    ctx.strokeStyle = '#e6fbff';
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawFish() {
  const dead = mode === GAME_OVER;
  const wag = dead ? 0 : Math.sin(clock * 16) * 0.45;

  ctx.save();
  // Move the "pen" to the fish and tilt it. Now a skin can draw around (0, 0).
  ctx.translate(fish.x, fish.y);
  ctx.rotate(fish.angle);
  SKINS[skinIndex].draw(ctx, { wag: wag, dead: dead, time: clock });
  ctx.restore();
}

function drawText() {
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';

  if (mode === READY) {
    const bob = Math.sin(clock * 2) * 5;
    outlined('FLOPPY FISH', W / 2, 150 + bob, 'bold 46px system-ui, sans-serif', '#ffe66d');
    const blink = 0.55 + Math.sin(clock * 5) * 0.45;
    ctx.globalAlpha = blink;
    outlined('Tap or press Space to swim', W / 2, 400, 'bold 19px system-ui, sans-serif', '#ffffff');
    ctx.globalAlpha = 1;
    if (best > 0) {
      outlined('Best: ' + best, W / 2, 432, 'bold 16px system-ui, sans-serif', '#b9f5e6');
    }

    // Fish picker: < Name >
    outlined('<', ARROW_LEFT_X, ARROW_Y + 8, 'bold 30px system-ui, sans-serif', '#ffffff');
    outlined('>', ARROW_RIGHT_X, ARROW_Y + 8, 'bold 30px system-ui, sans-serif', '#ffffff');
    outlined(SKINS[skinIndex].name, W / 2, ARROW_Y + 6, 'bold 20px system-ui, sans-serif', '#ffe66d');
    outlined('Tap the arrows or press S to change fish', W / 2, 470, 'bold 13px system-ui, sans-serif', '#d9f4ff');
  }

  if (mode === PLAYING) {
    const size = Math.round(54 + scorePop * 18);
    outlined(String(score), W / 2, 90, 'bold ' + size + 'px system-ui, sans-serif', '#ffffff');
  }

  if (mode === GAME_OVER) {
    // The panel drops in over a fraction of a second.
    const t = Math.min(1, deadFor / 0.35);
    const ease = 1 - Math.pow(1 - t, 3);
    const panelY = -220 + ease * 390;

    ctx.fillStyle = 'rgba(4, 30, 50, 0.82)';
    roundedRect(W / 2 - 130, panelY, 260, 200, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 220, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    outlined('GAME OVER', W / 2, panelY + 48, 'bold 32px system-ui, sans-serif', '#ff6f91');
    outlined('Score: ' + score, W / 2, panelY + 96, 'bold 26px system-ui, sans-serif', '#ffffff');
    const bestLabel = score > 0 && score === best ? 'New best: ' + best + '!' : 'Best: ' + best;
    outlined(bestLabel, W / 2, panelY + 130, 'bold 20px system-ui, sans-serif', '#ffe66d');
    if (deadFor > 0.6) {
      ctx.globalAlpha = 0.55 + Math.sin(clock * 5) * 0.45;
      outlined('Tap to try again', W / 2, panelY + 172, 'bold 17px system-ui, sans-serif', '#b9f5e6');
      ctx.globalAlpha = 1;
    }
  }
}

function outlined(text, x, y, font, color) {
  ctx.font = font;
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(3, 25, 45, 0.85)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// ---------------------------------------------------------------------------
// 6. THE GAME LOOP - the heartbeat
// ---------------------------------------------------------------------------

let lastTime = performance.now();

function frame(now) {
  // dt is "seconds since the last frame". Multiplying movement by dt makes
  // the game run at the same speed on a slow laptop and a 120Hz phone.
  // The cap stops everything from teleporting after the tab was in the background.
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  update(dt);
  draw();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
