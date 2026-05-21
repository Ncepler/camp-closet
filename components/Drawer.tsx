"use client";

import { ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
  title?: string;
}

export function Drawer({ open, onClose, children, side = "right", title }: DrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Shift focus to close button
      const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const panelPosition = side === "right" ? { right: 0 } : { left: 0 };
  const hiddenX = side === "right" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            onClick={onClose}
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(31, 42, 32, 0.45)",
              zIndex: 60,
            }}
          />

          <motion.div
            key="drawer-panel"
            initial={{ x: hiddenX, opacity: 0 }}
            animate={{ x: 0, opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } }}
            exit={{ x: hiddenX, opacity: 0, transition: { duration: 0.18, ease: EASE_IN_OUT } }}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? "Menu"}
            style={{
              position: "fixed",
              top: 0,
              ...panelPosition,
              height: "100dvh",
              width: "min(320px, 85vw)",
              background: "#F5F1E8",
              borderLeft: side === "right" ? "1px solid #D9D2C2" : undefined,
              borderRight: side === "left" ? "1px solid #D9D2C2" : undefined,
              zIndex: 61,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="flex items-center justify-between px-5 h-14 flex-shrink-0"
              style={{ borderBottom: "1px solid #D9D2C2" }}
            >
              {title ? (
                <span className="text-sm font-medium" style={{ color: "#4A5247" }}>
                  {title}
                </span>
              ) : (
                <span />
              )}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 -mr-1"
                style={{
                  color: "#8A8E83",
                  borderRadius: "4px",
                  transition: "background 150ms cubic-bezier(0.23, 1, 0.32, 1), color 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#EDE6D3";
                  (e.currentTarget as HTMLElement).style.color = "#1F2A20";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#8A8E83";
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
