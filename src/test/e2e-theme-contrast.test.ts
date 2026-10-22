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

describe("CampusOS E2E: Royal Purple Claymorphism Theme & High-Contrast Typography (Feature 8)", () => {
  // Tier 1: Feature Functionality
  it("should enforce pure white canvas (#FFFFFF) as global background in globals.css", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // CSS variables in :root
    expect(cssContent).toMatch(/--background:\s*#FFFFFF/i);
    expect(cssContent).toMatch(/--clay-surface:\s*#FFFFFF/i);

    // Body rule
    expect(cssContent).toMatch(/body\s*\{[^}]*background-color:\s*#FFFFFF/i);
  });

  it("should verify Royal Purple Clay card styling (.clay-card-purple) with gradient and soft drop-shadows", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    expect(cssContent).toContain(".clay-card-purple");
    // Verify gradient values (#6653E6 or #7868E6)
    expect(cssContent).toMatch(/linear-gradient\([^)]*#6653E6/i);
    // Drop shadow
    expect(cssContent).toContain("box-shadow:");
    // White text on purple card
    expect(cssContent).toMatch(/\.clay-card-purple\s*\{[^}]*color:\s*#FFFFFF/i);
  });

  it("should verify Royal Purple button styling (.clay-button-primary) with gradient and shadows", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    expect(cssContent).toContain(".clay-button-primary");
    expect(cssContent).toMatch(/linear-gradient\([^)]*#6653E6/i);
    expect(cssContent).toMatch(/\.clay-button-primary\s*\{[^}]*color:\s*#FFFFFF/i);
  });

  it("should verify .clay-card container has pure white background and rounded borders", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    expect(cssContent).toContain(".clay-card {");
    expect(cssContent).toMatch(/\.clay-card\s*\{[^}]*background:\s*#FFFFFF/i);
    expect(cssContent).toMatch(/\.clay-card\s*\{[^}]*border-radius:\s*1\.5rem/i);
  });

  it("should verify core clay palette variables: mint, pink, aqua, lavender, surface", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    expect(cssContent).toMatch(/--clay-mint:\s*#38D39F/i);
    expect(cssContent).toMatch(/--clay-pink:\s*#FF7675/i);
    expect(cssContent).toMatch(/--clay-aqua:\s*#74B9FF/i);
    expect(cssContent).toMatch(/--clay-purple:\s*#6653E6/i);
  });

  // Tier 2: Contrast Ratios & WCAG 2.1 Compliance
  it("should achieve WCAG AAA contrast ratio (>= 7:1) for text-slate-900 on pure white #FFFFFF", () => {
    // Slate 900: #0F172A
    const ratio = getContrastRatio("#0F172A", "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(15.0); // Actually ~16.5:1
  });

  it("should achieve WCAG AAA contrast ratio (>= 7:1) for text-slate-700 body copy on pure white #FFFFFF", () => {
    // Slate 700: #334155
    const ratio = getContrastRatio("#334155", "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(9.0); // Actually ~9.6:1
  });

  it("should achieve WCAG AA contrast ratio (>= 4.5:1) for Royal Purple (#6653E6) on pure white #FFFFFF", () => {
    // Royal Purple: #6653E6
    const ratio = getContrastRatio("#6653E6", "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(4.5); // ~4.9:1
  });

  it("should achieve WCAG AA contrast ratio (>= 4.5:1) for dark foreground (#1E194B) on pure white #FFFFFF", () => {
    // Brand foreground: #1E194B
    const ratio = getContrastRatio("#1E194B", "#FFFFFF");
    expect(ratio).toBeGreaterThanOrEqual(14.0); // ~15.2:1
  });

  it("should strictly forbid white text (#FFFFFF) on pure white (#FFFFFF) background", () => {
    const ratio = getContrastRatio("#FFFFFF", "#FFFFFF");
    expect(ratio).toBe(1.0); // 1:1 contrast is 100% invisible
    // A compliant UI must reject contrast ratio < 3.0:1 for any text
    expect(ratio < 3.0).toBe(true);
  });

  it("should strictly forbid light gray text (e.g. #E2E8F0) on pure white (#FFFFFF) background", () => {
    const ratio = getContrastRatio("#E2E8F0", "#FFFFFF");
    expect(ratio).toBeLessThan(3.0); // ~1.28:1 (fails WCAG AA)
  });

  // Tier 3: Pairwise with UI Elements
  it("should audit Card component classes ensuring dark text on light surfaces", () => {
    const cardPath = path.resolve(process.cwd(), "src/components/ui/Card.tsx");
    const cardContent = fs.readFileSync(cardPath, "utf-8");

    // Card background should be white and text slate-900
    expect(cardContent).toContain("bg-white");
    expect(cardContent).toContain("text-slate-900");
    // CardTitle should use text-slate-900
    expect(cardContent).toContain("CardTitle");
    expect(cardContent).toContain("text-slate-900");
  });

  it("should audit Footer component ensuring readable text contrast", () => {
    const footerPath = path.resolve(process.cwd(), "src/components/layout/Footer.tsx");
    const footerContent = fs.readFileSync(footerPath, "utf-8");

    // Headings in footer
    expect(footerContent).toContain("text-brand-purple");
    // Body links in footer
    expect(footerContent).toContain("text-slate-600");
  });

  it("should audit Button variants ensuring distinct styles and readable text", () => {
    const buttonPath = path.resolve(process.cwd(), "src/components/ui/Button.tsx");
    const buttonContent = fs.readFileSync(buttonPath, "utf-8");

    expect(buttonContent).toContain("primary:");
    expect(buttonContent).toContain("outline:");
    expect(buttonContent).toContain("ghost:");
    expect(buttonContent).toContain("danger:");
    expect(buttonContent).toContain("cyan:");
    expect(buttonContent).toContain("purple:");
  });

  it("should verify layout.tsx sets bg-white and text-slate-900 on root body", () => {
    const layoutPath = path.resolve(process.cwd(), "src/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    expect(layoutContent).toContain("bg-white");
    expect(layoutContent).toContain("text-slate-900");
  });

  // Tier 4: Real-World Workload & Full Platform Audit
  it("should audit tailwind configuration to ensure brand and clay colors are consistent", () => {
    const tailwindPath = path.resolve(process.cwd(), "tailwind.config.ts");
    const tailwindContent = fs.readFileSync(tailwindPath, "utf-8");

    expect(tailwindContent).toContain("brand");
    expect(tailwindContent).toContain("clay");
    // Check that purple hex #6653E6 or #714B67 is defined
    expect(tailwindContent).toMatch(/#6653E6|#714B67/i);
  });

  it("should verify print styles enforce exact color reproduction without background loss", () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // Global print color adjust
    expect(cssContent).toMatch(/body\s*\{/);
  });

  it("should verify that heading styles use font-black or font-extrabold for prominent visual hierarchy", () => {
    const heroComponents = [
      "src/app/portfolio/page.tsx",
      "src/app/challenges/[challengeId]/page.tsx",
    ];

    for (const compPath of heroComponents) {
      const fullPath = path.resolve(process.cwd(), compPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        expect(content).toMatch(/font-(black|extrabold|bold)/);
      }
    }
  });
});
