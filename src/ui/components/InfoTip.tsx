import React, { useState, useRef, useEffect, useCallback } from "react";
import { HelpCircle } from "lucide-react";

interface InfoTipProps {
  /** Short headline shown in bold at the top of the tooltip */
  title: string;
  /** Full explanation text */
  body: string;
  /** Optional extra rows, e.g. [["Pro:", "…"], ["Con:", "…"]] */
  rows?: [string, string][];
}

/**
 * InfoTip — a help icon with a rich contextual tooltip.
 *
 * Behaviour:
 *   Mouse  → shows on hover (mouseenter / mouseleave)
 *   Touch  → toggles on tap; auto-dismisses after 4 s or outside tap
 *
 * Deliberately does NOT use :hover CSS so it works identically on
 * every platform without media queries.
 */
export const InfoTip: React.FC<InfoTipProps> = ({ title, body, rows }) => {
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  // Auto-dismiss after 4 s on touch
  const showTouch = useCallback(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setVisible((v) => {
      const next = !v;
      if (next) {
        dismissTimer.current = setTimeout(() => setVisible(false), 4000);
      }
      return next;
    });
  }, []);

  // Dismiss when tapping outside on touch devices
  useEffect(() => {
    if (!visible || !isTouch) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("touchstart", handler, { passive: true });
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [visible, isTouch]);

  return (
    <span
      ref={containerRef}
      className="infotip-root"
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      /* Mouse events */
      onMouseEnter={() => { if (!isTouch) show(); }}
      onMouseLeave={() => { if (!isTouch) hide(); }}
      /* Touch events */
      onTouchStart={() => setIsTouch(true)}
      onClick={() => { if (isTouch) showTouch(); }}
      aria-label={`Info: ${title}`}
      role="button"
      tabIndex={0}
      onFocus={show}
      onBlur={hide}
    >
      <HelpCircle
        size={15}
        style={{
          color: "var(--accent-primary)",
          opacity: 0.75,
          cursor: "pointer",
          flexShrink: 0,
          transition: "opacity 0.2s",
        }}
      />

      {visible && (
        <span
          className="infotip-bubble"
          role="tooltip"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "min(300px, 90vw)",
            background: "rgba(16, 18, 30, 0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(139, 92, 246, 0.35)",
            borderRadius: "12px",
            padding: "12px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            pointerEvents: isTouch ? "auto" : "none",
            animation: "infotip-in 0.15s ease",
          }}
        >
          {/* Arrow */}
          <span style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 10,
            height: 10,
            background: "rgba(16, 18, 30, 0.97)",
            borderRight: "1px solid rgba(139, 92, 246, 0.35)",
            borderBottom: "1px solid rgba(139, 92, 246, 0.35)",
            rotate: "45deg",
          }} />

          <p style={{
            fontWeight: 700,
            fontSize: "0.8rem",
            color: "var(--accent-primary)",
            marginBottom: "5px",
            letterSpacing: "0.03em",
          }}>
            {title}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {body}
          </p>
          {rows && rows.length > 0 && (
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {rows.map(([label, val], i) => (
                <div key={i} style={{ display: "flex", gap: "6px", fontSize: "0.72rem" }}>
                  <span style={{ color: "var(--accent-primary)", fontWeight: 700, whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>{val}</span>
                </div>
              ))}
            </div>
          )}
          {isTouch && (
            <p style={{
              marginTop: 8,
              fontSize: "0.65rem",
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
            }}>
              Tap outside to dismiss
            </p>
          )}
        </span>
      )}
    </span>
  );
};
