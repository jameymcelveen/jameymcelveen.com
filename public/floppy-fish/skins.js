'use strict';

/*
  SKINS - every fish look lives in this file.

  A skin is just an object with a name and a draw function:

      { name: 'My Fish', draw: function (ctx, s) { ... } }

  HOW TO DRAW A FISH
  - ctx is the canvas pen. The game has already moved it to the fish, so
    (0, 0) is the CENTER of the fish.
  - +x is toward the nose, -x is toward the tail.
  - +y is DOWN and -y is UP. (Yes, down is positive. Canvas is weird.)
  - The invisible hitbox is a circle with radius 15. Keep your drawing
    roughly that size so crashes feel fair.

  The s object gives you three things:
      s.wag   a number that swings back and forth, perfect for tails and fins
      s.dead  true after a crash, so you can draw a sad face
      s.time  seconds since the page loaded, for pulsing and glowing

  TO MAKE YOUR OWN: find the skin named 'Your Fish' near the bottom, change
  the numbers, reload the page, and press S on the title screen until you see it.
*/

// ---------------------------------------------------------------------------
// Small helpers that skins can share
// ---------------------------------------------------------------------------

function skinEllipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function skinRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// A round eye. When the fish has crashed it turns into an X.
function skinEye(ctx, x, y, size, dead, iris) {
  skinEllipse(ctx, x, y, size, size, '#ffffff');
  if (dead) {
    const k = size * 0.55;
    ctx.strokeStyle = '#12303a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - k, y - k);
    ctx.lineTo(x + k, y + k);
    ctx.moveTo(x + k, y - k);
    ctx.lineTo(x - k, y + k);
    ctx.stroke();
  } else {
    skinEllipse(ctx, x + size * 0.25, y, size * 0.5, size * 0.5, iris || '#12303a');
    skinEllipse(ctx, x + size * 0.45, y - size * 0.25, size * 0.16, size * 0.16, '#ffffff');
  }
}

// ---------------------------------------------------------------------------
// The skins
// ---------------------------------------------------------------------------

const SKINS = [
  {
    name: 'Original',
    draw: function (ctx, s) {
      // Tail. We move the pen to the tail joint, then rotate by s.wag.
      ctx.save();
      ctx.translate(-15, 0);
      ctx.rotate(s.wag);
      ctx.fillStyle = '#ff5fa2';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-16, -12);
      ctx.lineTo(-11, 0);
      ctx.lineTo(-16, 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Top fin
      ctx.fillStyle = '#ff5fa2';
      ctx.beginPath();
      ctx.moveTo(-8, -11);
      ctx.quadraticCurveTo(-2, -25, 8, -12);
      ctx.closePath();
      ctx.fill();

      // Body and belly
      skinEllipse(ctx, 0, 0, 19, 15, '#19c2a8');
      ctx.fillStyle = '#b9f5e6';
      ctx.beginPath();
      ctx.ellipse(1, 6, 13, 7, 0, 0, Math.PI);
      ctx.fill();

      // Side fin, flapping
      ctx.save();
      ctx.translate(-2, 4);
      ctx.rotate(0.5 + s.wag * 0.8);
      skinEllipse(ctx, -5, 0, 7, 3.5, '#ff8fbd');
      ctx.restore();

      skinEye(ctx, 9, -4, 6.5, s.dead);

      // Surprised little mouth
      skinEllipse(ctx, 17, 4, 2, 3, '#0c6b5c');
    }
  },

  {
    name: 'Puffer',
    draw: function (ctx, s) {
      // Spikes first, so the body paints over their bases.
      ctx.fillStyle = '#e59a1f';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        if (Math.abs(Math.sin(a / 2)) > 0.93) continue; // none on the face
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(14, -3);
        ctx.lineTo(22, 0);
        ctx.lineTo(14, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Little fan tail
      ctx.save();
      ctx.translate(-15, 0);
      ctx.rotate(s.wag * 1.2);
      ctx.fillStyle = '#f2b13a';
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(-11, -9);
      ctx.quadraticCurveTo(-6, 0, -11, 9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Round body, cream belly, pink cheek
      skinEllipse(ctx, 0, 0, 17, 16, '#ffc94a');
      ctx.fillStyle = '#fff1b8';
      ctx.beginPath();
      ctx.ellipse(1, 5, 12, 9, 0, 0, Math.PI);
      ctx.fill();
      skinEllipse(ctx, 6, 5, 4, 3, 'rgba(255, 110, 130, 0.55)');

      // Fast little side fin
      ctx.save();
      ctx.translate(-3, 3);
      ctx.rotate(s.wag * 1.5);
      skinEllipse(ctx, -4, 0, 6, 3, '#f2b13a');
      ctx.restore();

      skinEye(ctx, 8, -5, 6, s.dead, '#2a1a0a');

      // Tiny round "o" mouth
      skinEllipse(ctx, 16, 3, 1.8, 2.2, '#8a4b12');
    }
  },

  {
    name: 'Angler',
    draw: function (ctx, s) {
      // The glowing lure on a stalk. It pulses using s.time.
      const glow = s.dead ? 0.15 : 0.65 + Math.sin(s.time * 6) * 0.35;
      ctx.strokeStyle = '#2a1f55';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(2, -13);
      ctx.quadraticCurveTo(10, -30, 20, -22);
      ctx.stroke();
      const halo = ctx.createRadialGradient(20, -22, 1, 20, -22, 13);
      halo.addColorStop(0, 'rgba(255, 245, 160, ' + glow + ')');
      halo.addColorStop(1, 'rgba(255, 245, 160, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(20, -22, 13, 0, Math.PI * 2);
      ctx.fill();
      skinEllipse(ctx, 20, -22, 3.5, 3.5, s.dead ? '#8a8860' : '#fff8b0');

      // Tail
      ctx.save();
      ctx.translate(-16, 0);
      ctx.rotate(s.wag);
      ctx.fillStyle = '#4a3a8a';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-15, -10);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-15, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Body
      skinEllipse(ctx, 0, 0, 20, 15, '#3a2a6b');
      skinEllipse(ctx, 0, 6, 14, 6, '#54428f');

      // Big mouth with teeth along the front
      ctx.strokeStyle = '#0f0a24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(19, 3);
      ctx.quadraticCurveTo(8, 12, -2, 7);
      ctx.stroke();
      ctx.fillStyle = '#f4f0ff';
      for (let i = 0; i < 4; i++) {
        const x = 15 - i * 5;
        ctx.beginPath();
        ctx.moveTo(x, 6 + i * -0.2);
        ctx.lineTo(x - 1.6, 11);
        ctx.lineTo(x - 3.2, 6.8);
        ctx.closePath();
        ctx.fill();
      }

      skinEye(ctx, 8, -4, 5.5, s.dead, '#b8860b');
    }
  },

  {
    name: 'Mini Sub',
    draw: function (ctx, s) {
      // Propeller at the back. It is a thin ellipse that spins fast.
      ctx.save();
      ctx.translate(-20, 2);
      ctx.scale(1, Math.abs(Math.sin(s.time * 30)) + 0.15);
      skinEllipse(ctx, 0, 0, 2.5, 10, s.dead ? '#777' : '#c9d3dc');
      ctx.restore();
      skinEllipse(ctx, -17, 2, 3, 3, '#6b7782');

      // Periscope
      ctx.fillStyle = '#6b7782';
      ctx.fillRect(2, -22, 3, 10);
      ctx.fillRect(2, -22, 9, 3);

      // Hull
      ctx.fillStyle = '#ffcf3d';
      skinRoundRect(ctx, -19, -12, 40, 26, 13);
      ctx.fill();
      ctx.fillStyle = '#e0a800';
      skinRoundRect(ctx, -19, 6, 40, 8, 4);
      ctx.fill();

      // Porthole
      skinEllipse(ctx, 6, -1, 8, 8, '#6b7782');
      skinEllipse(ctx, 6, -1, 6, 6, s.dead ? '#445' : '#8fe3ff');
      if (s.dead) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(2, -5);
        ctx.lineTo(10, 3);
        ctx.moveTo(10, -5);
        ctx.lineTo(2, 3);
        ctx.stroke();
      } else {
        skinEllipse(ctx, 4, -3, 2, 1.5, 'rgba(255, 255, 255, 0.7)');
      }

      // Rivets
      skinEllipse(ctx, -12, -1, 1.5, 1.5, '#b88a00');
      skinEllipse(ctx, -12, 6, 1.5, 1.5, '#b88a00');
    }
  },

  {
    name: 'Your Fish',
    draw: function (ctx, s) {
      // ===== START HERE, JAKE =====
      // Change a number, save, reload the page. See what moved.
      // To read the numbers: skinEllipse(ctx, x, y, width, height, color)

      // 1. TAIL. Try changing the color, or the points of the triangle.
      ctx.save();
      ctx.translate(-14, 0);
      ctx.rotate(s.wag);
      ctx.fillStyle = '#ff9f1c';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-14, -11);
      ctx.lineTo(-14, 11);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 2. BODY. The 18 and 13 are how wide and how tall. Try 22 and 10.
      skinEllipse(ctx, 0, 0, 18, 13, '#2ec4b6');

      // 3. STRIPE. Add more stripes by copying this line and changing x.
      skinEllipse(ctx, 2, 0, 3, 12, '#ffffff');

      // 4. EYE. Move it with the x and y (the 9 and -3).
      skinEye(ctx, 9, -3, 5, s.dead);

      // 5. YOUR IDEA. Add a hat, a mustache, a crown, a lightsaber...
      // Remember: (0, 0) is the middle of the fish and -y is UP.
    }
  }
];
