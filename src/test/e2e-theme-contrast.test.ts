import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Calculates WCAG 2.1 relative luminance for an sRGB color channel
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Computes the contrast ratio between two hex colors: (L1 + 0.05) / (L2 + 0.05)
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return Number(((brighter + 0.05) / (darker + 0.05)).toFixed(2));
}

const css = fs.readFileSync(
  path.resolve(process.cwd(), "src/app/globals.css"),
  "utf-8",
);
function token(name: string) {
  const value = css.match(new RegExp(`--${name}:\\s*(#[a-fA-F0-9]{6})`))?.[1];
  if (!value) throw new Error(`Missing theme token: ${name}`);
  return value;
}

describe("Emerald workspace accessibility", () => {
  it.each([
    ["foreground", "background", 7],
    ["foreground", "surface", 7],
    ["muted", "surface", 4.5],
    ["accent", "background", 4.5],
    ["accent", "surface-raised", 4.5],
  ])("%s is legible on %s", (foreground, background, minimum) => {
    expect(
      getContrastRatio(
        token(foreground as string),
        token(background as string),
      ),
    ).toBeGreaterThanOrEqual(minimum as number);
  });
  it("mint primary buttons retain dark, readable labels", () => {
    expect(getContrastRatio("#082012", "#98e9a4")).toBeGreaterThanOrEqual(7);
  });
  it("respects reduced motion and keeps CV paper out of compatibility recoloring", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/animation:\s*none !important/);
    expect(css).toContain(":not(:where(.cv-document, .cv-document *))");
    expect(css).toMatch(/@media print[\s\S]*background:\s*#FFFFFF/i);
  });
  it("keeps keyboard focus visible in the dark theme", () => {
    expect(css).toMatch(
      /:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--accent\)/,
    );
  });
});
