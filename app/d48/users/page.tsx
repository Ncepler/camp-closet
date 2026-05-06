"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/app/lib/adminApi";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi
      .select<Profile>("profiles", { orderBy: "created_at", orderAsc: false })
      .then(({ data }) => {
        setUsers(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Users</h1>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? "Loading…" : `${users.length} registered account${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 outline-none focus:border-gray-500 transition-colors w-64 placeholder:text-gray-600"
        />
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-500 text-sm">{search ? "No users match your search." : "No users yet."}</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.id}
                  className={`hover:bg-gray-800/50 transition-colors ${
                    i < filtered.length - 1 ? "border-b border-gray-800/60" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-gray-200">{u.full_name ?? <span className="text-gray-600">—</span>}</td>
                  <td className="px-4 py-3 text-gray-300">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
