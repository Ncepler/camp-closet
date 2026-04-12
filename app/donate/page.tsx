"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp, School } from "@/app/lib/supabaseClient";
import { ITEM_TYPES, CONDITIONS, getSizesForItemType } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Mode = "camp" | "school";

export default function DonatePage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser]   = useState<User | null>(null);
  const [mode, setMode]   = useState<Mode>("camp");

  const [camps, setCamps]     = useState<Camp[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [itemType, setItemType]     = useState("");
  const [size, setSize]             = useState("");
  const [condition, setCondition]   = useState("");
  const [phone, setPhone]           = useState("");
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/auth?redirect=/donate"); return; }
      setUser(data.user);
      const [{ data: campsData }, { data: schoolsData }] = await Promise.all([
        supabase.from("camps").select("*").order("name"),
        supabase.from("schools").select("*").order("name"),
      ]);
      setCamps(campsData ?? []);
      setSchools(schoolsData ?? []);
    };
    load();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError("");

    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext  = imageFile.name.split(".").pop();
        const path = `donations/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("item-images").upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const table   = mode === "camp" ? "camp_requests" : "school_requests";
      const idField = mode === "camp" ? "camp_id" : "school_id";

      const { error: insertError } = await supabase.from(table).insert({
        user_id:      user.id,
        [idField]:    selectedId,
        item_type:    itemType,
        size,
        condition,
        image_url:    imageUrl,
        seller_email: user.email,
        seller_phone: phone || null,
        status:       "pending",
        is_donation:  true,
      });
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const primaryColor = mode === "camp" ? "#2d5016" : "#1e3a5f";
  const accentColor  = mode === "camp" ? "#7fb069" : "#4a90e2";
  const entities     = mode === "camp" ? camps : schools;
  const isValid      = !!selectedId && !!itemType && !!size && !!condition;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: mode === "camp" ? "var(--camp-bg)" : "var(--school-bg)" }}>
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">💚</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
            Thank You for Donating!
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Your generosity helps families access quality clothing at little or no cost.
            We&apos;ll review your donation and be in touch at <strong>{user?.email}</strong>.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: mode === "camp" ? "var(--camp-bg)" : "var(--school-bg)" }}>
      {/* Header */}
      <div className="py-12 px-6 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
        <div className="text-4xl mb-3">💚</div>
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fraunces)" }}>
          Donate Clothing
        </h1>
        <p className="text-white/75 max-w-md mx-auto">
          Help another family by donating clothing your child has outgrown. Every item makes a difference.
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        {/* Mode toggle */}
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 mb-8 shadow-sm">
          {(["camp", "school"] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); setSelectedId(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${mode === m ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              style={mode === m ? { background: `linear-gradient(135deg, ${m === "camp" ? "#2d5016" : "#1e3a5f"}, ${m === "camp" ? "#7fb069" : "#4a90e2"})` } : {}}>
              {m === "camp" ? "🏕️ Camp Clothing" : "🎓 School Uniforms"}
            </button>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>How donations work:</strong> Your donated items are reviewed by us and added to the platform for families in need. You&apos;re giving your clothing a second life where it&apos;ll be used and appreciated.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* Institution */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Select {mode === "camp" ? "Camp" : "School"} <span className="text-red-500">*</span>
            </label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#7fb069] transition bg-white">
              <option value="">Choose a {mode === "camp" ? "camp" : "school"}…</option>
              {entities.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {/* Item type */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Item Type <span className="text-red-500">*</span>
            </label>
            <select value={itemType} onChange={(e) => { setItemType(e.target.value); setSize(""); }}
              required
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none bg-white">
              <option value="">Select type…</option>
              {ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          {/* Size */}
          {itemType && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Size <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {getSizesForItemType(itemType).map((s) => (
                  <button key={s} type="button" onClick={() => setSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${size === s ? "text-white border-transparent" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                    style={size === s ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` } : {}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => (
                <button key={c.value} type="button" onClick={() => setCondition(c.value)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${condition === c.value ? "text-white border-transparent" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                  style={condition === c.value ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` } : {}}>
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className={`text-xs mt-0.5 ${condition === c.value ? "opacity-75" : "text-gray-500"}`}>{c.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Photo <span className="text-gray-400 font-normal">(optional but helpful)</span>
            </label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video max-w-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/70 transition-colors">✕</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-sm font-medium text-gray-700">Upload a photo</div>
                <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</div>
              </button>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition"
              placeholder="(555) 000-0000"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <button type="submit" disabled={submitting || !isValid}
            className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
            {submitting ? "Submitting Donation…" : "Donate This Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
