/** Hollow, non-planar light curves. All motion deforms the curves; no rigid spin. */
type Point = { x: number; y: number; z: number };
const TAU = Math.PI * 2;
const SAMPLES = 180;
// Independent, gently warped orbital planes keep the loops distributed rather
// than pinching every curve into a single knot. [angle, tilt, scale, x, y]
const LOOPS = [
  [0.08, 0.28, 1, 0, 0],
  [0.55, 1.05, 0.98, -0.05, -0.04],
  [-0.55, 1, 0.88, -0.15, 0.03],
  [0.8, 0.65, 0.78, 0.12, -0.02],
  [-0.22, 0.75, 0.95, -0.03, -0.1],
  [1.2, 0.88, 0.48, -0.05, 0.06],
  [-0.6, 1.46, 0.85, -0.04, 0.02],
  [0.65, 1.4, 0.72, 0.03, -0.05],
];
const CURVES = LOOPS.length;
export function ribbonPoints(
  index: number,
  time: number,
  radius: number,
): Point[] {
  const [angle, tilt, scale, dx, dy] = LOOPS[index % CURVES];
  const phase = index * 0.71;
  const bend = tilt + 0.24 * Math.sin(time * 0.32 + phase);
  const rotation =
    angle +
    0.38 * Math.sin(time * 0.28 - phase) +
    time * 0.035 * (index % 2 ? -1 : 1);
  const ca = Math.cos(rotation),
    sa = Math.sin(rotation);
  return Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const a = (i / SAMPLES) * TAU;
    const r =
      radius *
      scale *
      (1 +
        0.06 * Math.sin(a * 3 - time * 0.8 + phase) +
        0.025 * Math.sin(a * 5 + time * 0.55));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const z =
      y * Math.sin(bend) +
      radius * 0.055 * Math.sin(a * 2 - time * 0.65 + phase);
    const flatY = y * Math.cos(bend);
    const perspective = 1 + z / (radius * 7);
    return {
      x: (x * ca - flatY * sa) * perspective + dx * radius,
      y: (x * sa + flatY * ca) * perspective + dy * radius,
      z: z / radius,
    };
  });
}

function crossing(a: Point[], b: Point[], left: boolean): Point {
  let best = a[0],
    distance = Infinity;
  // A sparse search is sufficient for a soft optical caustic; no fixed knot.
  for (let i = 0; i < a.length; i += 3) {
    if (left && (a[i].x > 0 || a[i].y < 0)) continue;
    if (!left && a[i].y > 0) continue;
    for (let j = 0; j < b.length; j += 3) {
      const d = (a[i].x - b[j].x) ** 2 + (a[i].y - b[j].y) ** 2;
      if (d < distance) {
        distance = d;
        best = { x: (a[i].x + b[j].x) / 2, y: (a[i].y + b[j].y) / 2, z: 0 };
      }
    }
  }
  return best;
}

function path(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  start = 0,
  end = points.length,
) {
  ctx.beginPath();
  for (let i = start; i < end; i++) {
    const p = points[i];
    if (i === start) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
}

/** Reuses one small emission buffer, compositing bloom around open curves only. */
export function createRibbonRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true });
  const light = document.createElement("canvas");
  const emission = light.getContext("2d", { alpha: true });
  const vapor = document.createElement("canvas");
  const mist = vapor.getContext("2d", { alpha: true });
  if (!ctx || !emission || !mist) return null;
  let width = 0,
    height = 0,
    pixelRatio = 1;
  const particles = Array.from({ length: 220 }, (_, i) => {
    const rand = (n: number) => {
      const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return v - Math.floor(v);
    };
    return {
      x: rand(i + 1) * 2 - 1,
      y: rand(i + 300) * 2 - 1,
      alpha: 0.06 + rand(i + 600) * 0.22,
      size: 0.3 + rand(i + 900) * 0.5,
    };
  });
  return {
    resize(w: number, h: number, dpr: number) {
      width = w;
      height = h;
      pixelRatio = Math.min(dpr, 1.5);
      for (const target of [canvas, light, vapor]) {
        target.width = Math.round(w * pixelRatio);
        target.height = Math.round(h * pixelRatio);
      }
    },
    draw(time: number) {
      if (!width || !height) return;
      const r = Math.min(height * 0.385, width * 0.38);
      const cx = width * 0.5,
        cy = height * 0.5;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      // Dark emerald atmosphere, not a filled sphere or a surface texture.
      const haze = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r * 1.65);
      haze.addColorStop(0, "rgba(0,112,38,.10)");
      haze.addColorStop(0.55, "rgba(0,115,40,.07)");
      haze.addColorStop(1, "rgba(0,60,20,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, 0, width, height);
      for (const p of particles) {
        ctx.fillStyle = `rgba(57,220,111,${p.alpha * (0.8 + 0.2 * Math.sin(time * 0.25 + p.x * 7))})`;
        ctx.beginPath();
        ctx.arc(cx + p.x * r * 1.65, cy + p.y * r * 1.45, p.size, 0, TAU);
        ctx.fill();
      }
      // Faint, broad field lines and diagonal light shafts behind the main curves.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.4);
      for (const scale of [1.32, 1.65]) {
        ctx.strokeStyle = "rgba(48,197,96,.09)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * scale, r * 0.78, 0, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      emission.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        cx * pixelRatio,
        cy * pixelRatio,
      );
      emission.clearRect(-cx, -cy, width, height);
      emission.globalCompositeOperation = "lighter";
      emission.lineCap = "round";
      emission.lineJoin = "round";
      mist.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        cx * pixelRatio,
        cy * pixelRatio,
      );
      mist.clearRect(-cx, -cy, width, height);
      mist.globalCompositeOperation = "lighter";
      mist.lineCap = "round";
      const curves = LOOPS.map((_, k) => ribbonPoints(k, time, r));
      for (let k = 0; k < CURVES; k++) {
        const points = curves[k];
        // Broken, outward-curling vapor trails: diffuse emission, never a filled skin.
        for (let layer = 0; layer < 3; layer++) {
          const age = layer + 1;
          const plume = points.map((p, i) => {
            const a = (i / SAMPLES) * TAU;
            const length = Math.hypot(p.x, p.y) || 1;
            const drift =
              age * 4 + 6 * Math.sin(a * 3 - time * 0.2 + k + layer);
            const curl = 5 * Math.sin(a * 4 + time * 0.15 + layer * 1.3);
            return {
              x: p.x + (p.x / length) * drift - (p.y / length) * curl,
              y: p.y + (p.y / length) * drift + (p.x / length) * curl,
              z: p.z,
            };
          });
          path(mist, plume);
          mist.setLineDash([r * (0.22 + layer * 0.07), r * 0.25]);
          mist.lineDashOffset = -time * 3 + k * 17 + layer * 31;
          mist.lineWidth = 16 + age * 7;
          mist.strokeStyle = `rgba(100,241,119,${0.05 - age * 0.008})`;
          mist.stroke();
        }
        // A transparent glass fringe, saturated edge, and a narrow reflected core.
        path(emission, points);
        emission.globalAlpha = [0.72, 0.95, 0.7, 0.48, 0.95, 0.65, 0.58, 0.65][
          k
        ];
        emission.strokeStyle = "rgba(17,230,76,.13)";
        emission.lineWidth = 7;
        emission.stroke();
        const gradient = emission.createLinearGradient(-r, -r, r, r);
        gradient.addColorStop(0, "rgba(151,255,165,.85)");
        gradient.addColorStop(0.38, "rgba(31,189,64,.25)");
        gradient.addColorStop(0.63, "rgba(168,255,179,.9)");
        gradient.addColorStop(1, "rgba(20,183,57,.35)");
        emission.strokeStyle = gradient;
        emission.lineWidth = 1.4 + (k % 3) * 0.45;
        emission.stroke();
        // Close, faint companion filaments produce refractive detail without a skin.
        const wisp = points.map((p, i) => ({
          x: p.x + Math.sin(i * 0.045 + k) * 2.1,
          y: p.y + Math.cos(i * 0.035 - k) * 1.7,
          z: p.z,
        }));
        path(emission, wisp);
        emission.strokeStyle = "rgba(23,205,80,.22)";
        emission.lineWidth = 0.55;
        emission.stroke();
        for (const offset of [-1, 1]) {
          const reflection = points.map((p, i) => ({
            x: p.x + offset * (4 + 3 * Math.sin(i * 0.025 - time * 0.12 + k)),
            y: p.y + offset * (3 + 2 * Math.cos(i * 0.035 + time * 0.1 - k)),
            z: p.z,
          }));
          path(emission, reflection);
          emission.strokeStyle = "rgba(100,241,119,.12)";
          emission.lineWidth = 0.6;
          emission.stroke();
        }
        const glint = Math.floor(((k * 0.137 + time * 0.014) % 1) * SAMPLES);
        path(emission, points, glint, Math.min(SAMPLES + 1, glint + 13));
        emission.strokeStyle = "rgba(205,255,222,.80)";
        emission.lineWidth = 1.05;
        emission.stroke();
      }
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(7px)";
      ctx.globalAlpha = 0.8;
      ctx.drawImage(vapor, 0, 0, width, height);
      ctx.filter = "blur(20px)";
      ctx.globalAlpha = 0.45;
      ctx.drawImage(vapor, 0, 0, width, height);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const [blur, alpha] of [
        [17, 0.5],
        [6, 0.8],
        [0, 0.9],
      ]) {
        ctx.filter = blur ? `blur(${blur}px)` : "none";
        ctx.globalAlpha = alpha;
        ctx.drawImage(light, 0, 0, width, height);
      }
      ctx.restore();
      // Tiny optical caustics follow real curves instead of filling the center.
      const focus = crossing(curves[1], curves[4], true);
      const upper = crossing(curves[0], curves[3], false);
      for (const [px, py, size] of [
        [focus.x, focus.y, 11],
        [upper.x, upper.y, 7],
      ]) {
        const x = cx + px,
          y = cy + py;
        const shine = ctx.createRadialGradient(x, y, 0, x, y, size);
        shine.addColorStop(0, "rgba(225,255,231,.95)");
        shine.addColorStop(0.15, "rgba(115,255,158,.7)");
        shine.addColorStop(1, "rgba(0,255,65,0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = shine;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
      }
      ctx.globalCompositeOperation = "source-over";
    },
  };
}
