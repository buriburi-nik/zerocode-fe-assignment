import React, { useState, useEffect } from "react";

function Preloader({ isVisible }) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsExiting(false);
    } else if (shouldRender) {
      setIsExiting(true);
      // Wait for fade-out animation to complete
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className={`preloader-overlay ${isExiting ? "fade-out" : ""}`}>
      <main className="preloader-main">
        <svg
          className="preloader-svg"
          viewBox="0 0 256 128"
          width="256px"
          height="128px"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* ZeroCode Chat theme gradients */}
            <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="33%" stopColor="#f97316" />
              <stop offset="67%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="33%" stopColor="#be185d" />
              <stop offset="67%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <g fill="none" strokeLinecap="round" strokeWidth="16">
            <g className="preloader-track" stroke="#ddd">
              <path d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56" />
              <path d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64" />
            </g>
            <g strokeDasharray="180 656">
              <path
                className="preloader-worm1"
                stroke="url(#grad1)"
                strokeDashoffset="0"
                d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56"
              />
              <path
                className="preloader-worm2"
                stroke="url(#grad2)"
                strokeDashoffset="358"
                d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64"
              />
            </g>
          </g>
        </svg>
        <div className="preloader-text">
          <div className="preloader-brand">ZeroCode Chat</div>
          <div className="preloader-loading">Loading...</div>
        </div>
      </main>
    </div>
  );
}

export default Preloader;
