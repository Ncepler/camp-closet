import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div className={`skeleton${className ? ` ${className}` : ""}`} style={style} />;
}

export function ItemCardSkeleton() {
  return (
    <div style={{ border: "1px solid #D9D2C2" }}>
      <div className="skeleton aspect-square" />
      <div className="p-3 space-y-2" style={{ borderTop: "1px solid #D9D2C2" }}>
        <div className="skeleton h-4 w-3/4" style={{ borderRadius: "2px" }} />
        <div className="skeleton h-3 w-1/2" style={{ borderRadius: "2px" }} />
        <div className="skeleton h-8 w-full mt-2" style={{ borderRadius: "4px" }} />
      </div>
    </div>
  );
}
