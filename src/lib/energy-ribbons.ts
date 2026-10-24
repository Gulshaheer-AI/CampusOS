/** Hollow, non-planar light curves. All motion deforms the curves; no rigid spin. */
type Point = { x: number; y: number; z: number };
const TAU = Math.PI * 2;
const SAMPLES = 180;
// Bezier loops follow the reference's shared caustics and asymmetric open arcs.
// Each segment is [control 1, control 2, end], relative to the graphic radius.
const F: [number, number] = [-0.28, 0.38];
const B: [number, number] = [-0.03, -0.47];
const LOOPS: number[][][] = [
  [
    [-0.96, 0.2, -1.02, -0.7, -0.18, -0.94],
    [0.64, -1.12, 0.62, -0.08, ...F],
  ],
  [
    [-0.84, 0.86, 0.65, 1.12, 0.9, 0.02],
    [1.02, -0.86, 0.43, -1.07, ...B],
    [-0.25, -0.12, -0.37, 0.12, ...F],
  ],
  [
    [-1.03, 0.45, -1.04, -0.3, -0.64, -0.56],
    [-0.1, -1.02, 0.64, -0.91, 0.79, -0.4],
    [0.94, 0.05, 0.35, 0.45, ...F],
  ],
  [
    [-0.44, 0.08, -0.15, -0.31, ...B],
    [0.39, -0.81, 0.91, -0.03, 0.6, 0.43],
    [0.24, 0.81, -0.6, 0.63, ...F],
  ],
  [
    [-0.83, 0.43, -0.8, -0.91, -0.09, -0.79],
    [0.56, -0.69, 0.44, 0.85, ...F],
  ],
  [
    [-0.75, 0.88, 0.33, 1.12, 0.71, 0.55],
    [1.11, -0.12, 0.55, -0.92, -0.1, -0.95],
    [-0.83, -1.01, -1.13, 0.17, ...F],
  ],
  [
    [-0.94, 0.08, -0.66, -0.49, 0.14, -0.38],
    [0.98, -0.29, 0.88, 0.41, 0.24, 0.67],
    [-0.23, 0.86, -0.77, 0.7, ...F],
  ],
  [
    [-0.65, 0.62, -0.28, -0.12, 0.29, -0.74],
    [0.76, -1.21, 0.91, -0.26, 0.47, 0.24],
    [0.08, 0.71, -0.63, 0.81, ...F],
  ],
];
const CURVES = LOOPS.length;
export function ribbonPoints(
  index: number,
  time: number,
  radius: number,
): Point[] {
  const segments = LOOPS[index % CURVES];
  const points: Point[] = [];
  let start = F;
  segments.forEach((segment, part) => {
    const [ax, ay, bx, by, ex, ey] = segment;
    const steps = SAMPLES / segments.length;
    for (let j = 0; j < steps; j++) {
      const t = j / steps,
        u = 1 - t;
      const x =
        u * u * u * start[0] +
        3 * u * u * t * ax +
        3 * u * t * t * bx +
        t * t * t * ex;
      const y =
        u * u * u * start[1] +
        3 * u * u * t * ay +
        3 * u * t * t * by +
        t * t * t * ey;
      const a = ((part + t) / segments.length) * TAU;
      const envelope = Math.sin(a * 0.5) ** 2;
      const waveX =
        envelope *
        (0.04 * Math.sin(a * 2 - time * 0.24 + index) +
          0.012 * Math.sin(a * 5 + time * 0.15));
      const waveY =
        envelope *
        (0.042 * Math.sin(a * 3 - time * 0.19 - index) +
          0.009 * Math.sin(a * 7 + time * 0.13));
      points.push({
        x: (x + waveX) * radius,
        y: (y + waveY) * radius,
        z: Math.sin(a + index) * 0.6,
      });
    }
    start = [ex, ey];
  });
  points.push({ x: F[0] * radius, y: F[1] * radius, z: 0 });
  return points;
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
  if (!ctx || !emission) return null;
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
      for (const target of [canvas, light]) {
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
      for (let k = 0; k < CURVES; k++) {
        const points = ribbonPoints(k, time, r);
        // A transparent glass fringe, saturated edge, and a narrow reflected core.
        path(emission, points);
        emission.globalAlpha = [0.72, 0.95, 0.7, 0.48, 0.95, 0.85, 0.25, 0.3][
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
      for (const [blur, alpha] of [
        [17, 0.5],
        [6, 0.85],
        [0, 1],
      ]) {
        ctx.filter = blur ? `blur(${blur}px)` : "none";
        ctx.globalAlpha = alpha;
        ctx.drawImage(light, 0, 0, width, height);
      }
      ctx.restore();
      // Tiny optical caustics follow real curves instead of filling the center.
      const crossing = ribbonPoints(1, time, r)[120];
      for (const [px, py, size] of [
        [F[0] * r, F[1] * r, 11],
        [crossing.x, crossing.y, 7],
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
