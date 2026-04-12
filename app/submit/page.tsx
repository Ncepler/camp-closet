"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp, School } from "@/app/lib/supabaseClient";
import { ITEM_TYPES, CONDITIONS, getSizesForItemType } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Mode = "camp" | "school";
type Step = 1 | 2 | 3 | 4;

export default function SubmitPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser]   = useState<User | null>(null);
  const [step, setStep]   = useState<Step>(1);
  const [mode, setMode]   = useState<Mode>("camp");

  // Form state
  const [camps, setCamps]         = useState<Camp[]>([]);
  const [schools, setSchools]     = useState<School[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [itemType, setItemType]   = useState("");
  const [size, setSize]           = useState("");
  const [condition, setCondition] = useState("");
  const [phone, setPhone]         = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/auth?redirect=/submit");
        return;
      }
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

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError("");

    try {
      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        const ext  = imageFile.name.split(".").pop();
        const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(path, imageFile);
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
        is_donation:  false,
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const canAdvance = () => {
    if (step === 1) return !!selectedId;
    if (step === 2) return !!itemType && !!size;
    if (step === 3) return !!condition;
    return true;
  };

  const primaryColor = mode === "camp" ? "#2d5016" : "#1e3a5f";
  const accentColor  = mode === "camp" ? "#7fb069" : "#4a90e2";
  const entities     = mode === "camp" ? camps : schools;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: mode === "camp" ? "var(--camp-bg)" : "var(--school-bg)" }}>
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-fraunces)" }}>
            Submission Received!
          </h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you! We&apos;ll review your submission and approve it within 1–2 business days.
            You&apos;ll hear from us at <strong>{user?.email}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setSubmitted(false); setStep(1); setSelectedId(""); setItemType(""); setSize(""); setCondition(""); setImageFile(null); setImagePreview(null); }}
              className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
            >
              Submit Another
            </button>
            <button
              onClick={() => router.push(mode === "camp" ? "/camps" : "/schools")}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Browse {mode === "camp" ? "Camps" : "Schools"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: mode === "camp" ? "var(--camp-bg)" : "var(--school-bg)" }}>
      {/* Header */}
      <div
        className="py-12 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
      >
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-fraunces)" }}>
          Sell an Item
        </h1>
        <p className="text-white/75">List your camp clothing or school uniforms in minutes.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Mode toggle */}
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 mb-8 shadow-sm">
          {(["camp", "school"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setSelectedId(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === m ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              style={mode === m ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` } : {}}
            >
              {m === "camp" ? "🏕️ Camp Clothing" : "🎓 School Uniforms"}
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step > s ? "text-white" : step === s ? "text-white ring-2 ring-offset-2" : "bg-gray-100 text-gray-400"
                }`}
                style={step >= s ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` } : {}}
              >
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={`flex-1 h-0.5 rounded transition-all ${step > s ? "opacity-100" : "opacity-20"}`} style={{ background: accentColor }} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {/* Step 1: Select institution */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
                Which {mode === "camp" ? "camp" : "school"}?
              </h2>
              <div className="grid gap-2 max-h-72 overflow-y-auto pr-1">
                {entities.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => setSelectedId(entity.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      selectedId === entity.id
                        ? "text-white border-transparent"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                    style={selectedId === entity.id ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, borderColor: "transparent" } : {}}
                  >
                    <div>{entity.name}</div>
                    {entity.location && <div className="text-xs opacity-60 mt-0.5">{entity.location}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Item details */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
                What are you selling?
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Item Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {ITEM_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => { setItemType(type.value); setSize(""); }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-all ${
                        itemType === type.value ? "text-white border-transparent" : "border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                      style={itemType === type.value ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` } : {}}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              {itemType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {getSizesForItemType(itemType).map((s) => (
                      <button key={s} onClick={() => setSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                          size === s ? "text-white border-transparent" : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                        style={size === s ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` } : {}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Condition */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
                What&apos;s the condition?
              </h2>
              <div className="grid gap-3">
                {CONDITIONS.map((c) => (
                  <button key={c.value} onClick={() => setCondition(c.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      condition === c.value ? "text-white border-transparent" : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                    style={condition === c.value ? { background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` } : {}}
                  >
                    <div className="font-medium text-sm">{c.label}</div>
                    <div className={`text-xs mt-0.5 ${condition === c.value ? "opacity-75" : "text-gray-500"}`}>{c.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Photo + contact */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "var(--font-fraunces)" }}>
                Add a photo
              </h2>
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden aspect-square max-w-xs mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-black/70 transition-colors"
                    >✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-gray-400 transition-colors"
                  >
                    <div className="text-4xl mb-2">📸</div>
                    <div className="text-sm font-medium text-gray-700">Click to upload a photo</div>
                    <div className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</div>
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition"
                  placeholder="(555) 000-0000"
                />
                <p className="text-xs text-gray-400 mt-1">We use this to coordinate pickup — never shared with buyers.</p>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={!canAdvance()}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                {submitting ? "Submitting…" : "Submit for Review"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
