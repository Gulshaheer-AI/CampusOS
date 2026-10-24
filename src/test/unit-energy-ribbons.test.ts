import { describe, it, expect } from "vitest";
import { ribbonPoints } from "@/lib/energy-ribbons";

describe("Hollow energy-curve geometry", () => {
  it("keeps every open-loop stroke closed and finite throughout its fluid cycle", () => {
    for (const t of [0, 8, 25, 90])
      for (let i = 0; i < 8; i++) {
        const points = ribbonPoints(i, t, 130);
        expect(points.length).toBeGreaterThan(100);
        expect(points[0].x).toBeCloseTo(points.at(-1)!.x, 8);
        expect(points[0].y).toBeCloseTo(points.at(-1)!.y, 8);
        expect(
          points.every(
            (p) =>
              Number.isFinite(p.x) &&
              Number.isFinite(p.y) &&
              Number.isFinite(p.z),
          ),
        ).toBe(true);
      }
  });
  it("deforms internal distances instead of rigidly rotating an ellipse", () => {
    const start = ribbonPoints(2, 0, 130),
      next = ribbonPoints(2, 9, 130);
    const differences = [
      [10, 90],
      [40, 115],
      [70, 150],
    ].map(([a, b]) => {
      const distance = (p: typeof start) =>
        Math.hypot(p[a].x - p[b].x, p[a].y - p[b].y);
      return Math.abs(distance(next) - distance(start));
    });
    expect(Math.max(...differences)).toBeGreaterThan(0.5);
  });
  it("distributes independent loop origins instead of forcing a shared knot", () => {
    const origins = Array.from(
      { length: 8 },
      (_, i) => ribbonPoints(i, 0, 130)[0],
    );
    const cells = new Set(
      origins.map((p) => `${Math.round(p.x / 10)},${Math.round(p.y / 10)}`),
    );
    expect(cells.size).toBeGreaterThan(4);
  });
});
