"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRibbonRenderer } from "@/lib/energy-ribbons";

/** Open glass/plasma curves with slow wave deformation and visibility-aware playback. */
export function LearningOrbit() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const renderer = createRibbonRenderer(element);
    if (!renderer) {
      element.dataset.motion = "unavailable";
      return;
    }
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      last = 0,
      time = 0,
      visible = true,
      disposed = false;
    const draw = (now: number) => {
      if (disposed) return;
      if (!last || now - last >= 1000 / 30) {
        if (last) time += Math.min((now - last) / 1000, 0.25);
        last = now;
        renderer.draw(time);
      }
      frame = requestAnimationFrame(draw);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = 0;
      const enabled = motionOverride ?? !preference.matches;
      const moving = enabled && visible && !document.hidden;
      setPlaying(moving);
      element.dataset.motion = !enabled
        ? "still"
        : moving
          ? "flowing"
          : "paused";
      if (!enabled) {
        time = 0;
        renderer.draw(0);
      }
      if (moving) frame = requestAnimationFrame(draw);
    };
    const resize = new ResizeObserver(() => {
      renderer.resize(
        element.clientWidth,
        element.clientHeight,
        window.devicePixelRatio || 1,
      );
      renderer.draw(time);
    });
    resize.observe(element);
    const visibility = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      sync();
    });
    visibility.observe(element);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [motionOverride]);
  return (
    <div className="orb-art" data-testid="learning-orbit">
      <canvas
        ref={canvas}
        aria-hidden="true"
        data-testid="energy-ribbons"
        data-motion="loading"
      />
      <span className="orb-caption" aria-hidden="true">
        Learn. Build. Grow.
      </span>
      <button
        type="button"
        className="orb-playback"
        aria-label={playing ? "Pause animation" : "Play animation"}
        onClick={() => setMotionOverride(!playing)}
      >
        {playing ? "Ⅱ" : "▶"}
      </button>
    </div>
  );
}
