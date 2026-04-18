"use client";

/**
 * Client-side helper for calling /api/admin.
 * Reads the admin password from sessionStorage (stored there by the admin layout on login).
 */

type Filter = { col: string; eq: string | boolean | null };
type InFilter = { col: string; values: string[] };

function adminKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("admin_key") ?? "";
}

async function post(body: Record<string, unknown>) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey(),
    },
    body: JSON.stringify(body),
  });
  return res.json() as Promise<Record<string, unknown>>;
}

export const adminApi = {
  select<T = unknown>(
    table: string,
    opts: {
      columns?: string;
      filters?: Filter[];
      in?: InFilter;
      orderBy?: string;
      orderAsc?: boolean;
    } = {}
  ): Promise<{ data: T[] | null; error?: string }> {
    return post({ op: "select", table, ...opts }) as Promise<{ data: T[] | null; error?: string }>;
  },

  count(
    table: string,
    filters?: Filter[]
  ): Promise<{ count: number; error?: string }> {
    return post({ op: "count", table, filters }) as Promise<{ count: number; error?: string }>;
  },

  update(
    table: string,
    id: string,
    data: Record<string, unknown>
  ): Promise<{ success?: boolean; error?: string }> {
    return post({ op: "update", table, id, data }) as Promise<{ success?: boolean; error?: string }>;
  },

  insert<T = unknown>(
    table: string,
    data: Record<string, unknown>
  ): Promise<{ data: T | null; error?: string }> {
    return post({ op: "insert", table, data }) as Promise<{ data: T | null; error?: string }>;
  },

  approveCamp(
    id: string,
    camp_name: string,
    location: string | null
  ): Promise<{ success?: boolean; error?: string }> {
    return post({ op: "approve_camp", id, camp_name, location }) as Promise<{ success?: boolean; error?: string }>;
  },

  approveSchool(
    id: string,
    school_name: string,
    school_type: string | null,
    location: string | null
  ): Promise<{ success?: boolean; error?: string }> {
    return post({ op: "approve_school", id, school_name, school_type, location }) as Promise<{ success?: boolean; error?: string }>;
  },
};
