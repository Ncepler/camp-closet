"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center">
              {i > 0 && (
                <span
                  className="mx-2 text-xs select-none"
                  style={{ color: "#D9D2C2" }}
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {isLast || !crumb.href ? (
                <span
                  className="text-xs font-medium"
                  style={{ color: "#1F2A20" }}
                  aria-current={isLast ? "page" : undefined}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-xs font-medium"
                  style={{
                    color: "#8A8E83",
                    transition: "color 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4A5247"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#8A8E83"; }}
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
