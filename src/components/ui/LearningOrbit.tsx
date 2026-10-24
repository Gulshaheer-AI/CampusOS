import React, { useId } from "react";

/** Decorative vector rings: no image download, canvas loop, or animation dependency. */
export function LearningOrbit() {
  const id = useId().replace(/:/g, "");
  return (
    <div className="orb-art" aria-hidden="true" data-testid="learning-orbit">
      <svg viewBox="0 0 400 400" fill="none">
        <defs>
          <radialGradient id={`${id}-halo`}>
            <stop stopColor="#79f295" stopOpacity=".16" />
            <stop offset=".7" stopColor="#39b95d" stopOpacity=".05" />
            <stop offset="1" stopColor="#39b95d" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id={`${id}-ring`}
            x1="70"
            y1="80"
            x2="310"
            y2="330"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#d3ffcf" stopOpacity=".95" />
            <stop offset=".35" stopColor="#8bff9f" />
            <stop offset=".7" stopColor="#36b55c" stopOpacity=".25" />
            <stop offset="1" stopColor="#a0ffb2" stopOpacity=".8" />
          </linearGradient>
          <filter
            id={`${id}-glow`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>
        <circle cx="200" cy="200" r="195" fill={`url(#${id}-halo)`} />
        {Array.from({ length: 9 }, (_, i) => (
          <g
            className="orb-motion"
            key={i}
            style={{ animationDelay: `${-i * 3.7}s` }}
          >
            <g transform={`rotate(${i * 37} 200 200)`}>
              <ellipse
                cx={200 + ((i % 3) - 1) * 10}
                cy="200"
                rx={118 + (i % 3) * 8}
                ry={46 + (i % 4) * 14}
                stroke="#6bff8b"
                strokeWidth="3"
                opacity=".48"
                filter={`url(#${id}-glow)`}
              />
              <ellipse
                cx={200 + ((i % 3) - 1) * 10}
                cy="200"
                rx={118 + (i % 3) * 8}
                ry={46 + (i % 4) * 14}
                stroke={`url(#${id}-ring)`}
                strokeWidth={i % 3 === 0 ? 1.3 : 0.8}
              />
            </g>
          </g>
        ))}
        <circle
          cx="200"
          cy="200"
          r="143"
          stroke="#74e592"
          strokeOpacity=".1"
          strokeWidth=".7"
        />
      </svg>
      <span className="orb-caption">Learn. Build. Grow.</span>
    </div>
  );
}
