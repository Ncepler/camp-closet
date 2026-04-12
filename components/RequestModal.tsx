"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface RequestModalProps {
  type: "camp" | "school";
  onClose: () => void;
}

export function RequestModal({ type, onClose }: RequestModalProps) {
  const [name, setName]           = useState("");
  const [location, setLocation]   = useState("");
  const [email, setEmail]         = useState("");
  const [schoolType, setSchoolType] = useState("high_school");
  const [status, setStatus]       = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError]         = useState("");

  const primaryColor = type === "camp" ? "#2d5016" : "#1e3a5f";
  const accentColor  = type === "camp" ? "#7fb069" : "#4a90e2";
  const label        = type === "camp" ? "Camp" : "School";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const { data: userData } = await supabase.auth.getUser();

    const table = type === "camp" ? "new_camp_requests" : "new_school_requests";
    const payload =
      type === "camp"
        ? { camp_name: name, location: location || null, requester_email: email, requested_by: userData.user?.id ?? null, status: "pending" }
        : { school_name: name, school_type: schoolType, location: location || null, requester_email: email, requested_by: userData.user?.id ?? null, status: "pending" };

    const { error: insertError } = await supabase.from(table).insert(payload);
    if (insertError) {
      setStatus("error");
      setError(insertError.message);
    } else {
      setStatus("success");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${accentColor}15)` }}
        >
          <h2 className="font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
            Request a New {label}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {status === "success" ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">✨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Request submitted!</h3>
              <p className="text-sm text-gray-500 mb-5">
                We&apos;ll review your request and add <strong>{name}</strong> to the platform soon.
              </p>
              <button onClick={onClose}
                className="px-6 py-2 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} Name <span className="text-red-500">*</span>
                </label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#7fb069] transition"
                  placeholder={`e.g. Camp Friendship`}
                />
              </div>

              {type === "school" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                  <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                    <option value="high_school">High School</option>
                    <option value="middle_school">Middle School</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition"
                  placeholder="City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition"
                  placeholder="you@example.com"
                />
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={status === "loading"}
                  className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                  {status === "loading" ? "Sending…" : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
