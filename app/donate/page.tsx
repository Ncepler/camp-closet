"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp } from "@/app/lib/supabaseClient";
import { ITEM_TYPES, CONDITIONS, getSizesForItemType } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function DonatePage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser]   = useState<User | null>(null);

  const [camps, setCamps]           = useState<Camp[]>([]);
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
      const { data: campsData } = await supabase.from("camps").select("*").order("name");
      setCamps(campsData ?? []);
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

      const { error: insertError } = await supabase.from("camp_requests").insert({
        user_id:      user.id,
        camp_id:      selectedId,
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

  const isValid = !!selectedId && !!itemType && !!size && !!condition;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-white">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-lg border-2 border-[#2d5016] flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-[#2d5016]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-fraunces)" }}>
            Donation submitted
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Thank you. We&apos;ll review it and reach out at <strong>{user?.email}</strong> if we have questions.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-2.5 rounded text-white font-semibold transition-opacity hover:opacity-90 bg-[#2d5016]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-12 px-6 bg-[#2d5016]">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-fraunces)" }}>
            Donate Clothing
          </h1>
          <p className="text-white/60 text-sm">
            Help another family by donating gear your kid has outgrown.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            Donated items are reviewed by us and listed for families in need. We&apos;ll let you know once it&apos;s live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          {/* Camp */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Which camp? <span className="text-red-500">*</span>
            </label>
            <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm outline-none focus:border-gray-400 transition bg-white">
              <option value="">Pick a camp…</option>
              {camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Item type */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Item Type <span className="text-red-500">*</span>
            </label>
            <select value={itemType} onChange={(e) => { setItemType(e.target.value); setSize(""); }}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded text-sm outline-none focus:border-gray-400 transition bg-white">
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
                    className={`px-3 py-1.5 rounded text-sm font-medium border-2 transition-all ${
                      size === s
                        ? "text-white border-transparent bg-[#2d5016]"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}>
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
                  className={`text-left px-4 py-3 rounded border-2 transition-all ${
                    condition === c.value
                      ? "text-white border-transparent bg-[#2d5016]"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}>
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className={`text-xs mt-0.5 ${condition === c.value ? "opacity-70" : "text-gray-500"}`}>{c.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Photo <span className="text-gray-400 font-normal text-xs">(optional but helpful)</span>
            </label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden aspect-video max-w-xs border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded w-7 h-7 flex items-center justify-center text-xs hover:bg-black/70 transition-colors font-bold">
                  ✕
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors">
                <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-sm font-medium text-gray-600">Upload a photo</div>
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
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-gray-400 transition"
              placeholder="(555) 000-0000"
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

          <button type="submit" disabled={submitting || !isValid}
            className="w-full py-2.5 rounded text-white font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed bg-[#2d5016]">
            {submitting ? "Submitting…" : "Donate This Item"}
          </button>
        </form>
      </div>
    </div>
  );
}
