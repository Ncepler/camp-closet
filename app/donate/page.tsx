"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp } from "@/app/lib/supabaseClient";
import { ITEM_TYPES, CONDITIONS, getSizesForItemType } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const inputCss: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #D9D2C2",
  borderRadius: "4px",
  background: "transparent",
  outline: "none",
  fontSize: "14px",
  color: "#1F2A20",
};

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F5F1E8" }}>
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          style={{ maxWidth: "440px", width: "100%" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.38, delay: 0.12, ease: EASE_OUT }}
            className="w-10 h-10 flex items-center justify-center mb-6"
            style={{ border: "1.5px solid #2D5A3D", borderRadius: "2px" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#2D5A3D" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease: EASE_OUT }}
            className="font-medium mb-3"
            style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 72, 'soft' 40", fontSize: "28px", color: "#1F2A20" }}
          >
            Donation submitted
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.28, ease: EASE_OUT }}
            className="text-sm mb-8 leading-relaxed"
            style={{ color: "#4A5247" }}
          >
            Thank you. We&apos;ll review it and reach out at <strong>{user?.email}</strong> if we have questions.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.36, ease: EASE_OUT }}
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
              onClick={() => router.push("/")}
              className="px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
            >
              Back to home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F1E8", minHeight: "100vh" }}>

      {/* Header */}
      <div className="px-6 py-12" style={{ borderBottom: "1px solid #D9D2C2" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <motion.h1
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="mb-1"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontVariationSettings: "'opsz' 72, 'soft' 40",
              fontSize: "clamp(24px, 3.5vw, 36px)",
              color: "#1F2A20",
            }}
          >
            Donate clothing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: EASE_OUT }}
            className="text-sm"
            style={{ color: "#8A8E83" }}
          >
            Help another family by donating gear your kid has outgrown.
          </motion.p>
        </div>
      </div>

      <div className="px-6 py-10" style={{ maxWidth: "560px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.15, ease: EASE_OUT }}
          className="mb-6 p-4 text-sm"
          style={{ background: "#EDE6D3", border: "1px solid #D9D2C2", borderRadius: "4px" }}
        >
          <p style={{ color: "#4A5247" }}>
            Donated items are reviewed by us and listed for families in need. We&apos;ll let you know once it&apos;s live.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Camp */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2, ease: EASE_OUT }}
          >
            <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
              Which camp? <span style={{ color: "#8B3A2E" }}>*</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              required
              style={{ ...inputCss }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
            >
              <option value="">Pick a camp…</option>
              {camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </motion.div>

          {/* Item type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25, ease: EASE_OUT }}
          >
            <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
              Item type <span style={{ color: "#8B3A2E" }}>*</span>
            </label>
            <select
              value={itemType}
              onChange={(e) => { setItemType(e.target.value); setSize(""); }}
              required
              style={{ ...inputCss }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
            >
              <option value="">Select type…</option>
              {ITEM_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </motion.div>

          {/* Size */}
          <AnimatePresence>
            {itemType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.18, ease: EASE_OUT } }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="overflow-hidden"
              >
                <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
                  Size <span style={{ color: "#8B3A2E" }}>*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {getSizesForItemType(itemType).map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.22, delay: i * 0.04, ease: EASE_OUT }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => setSize(s)}
                      className="px-3 py-1.5 text-xs font-medium"
                      style={{
                        border: size === s ? "2px solid #2D5A3D" : "1px solid #D9D2C2",
                        background: size === s ? "#2D5A3D" : "transparent",
                        color: size === s ? "#F5F1E8" : "#4A5247",
                        borderRadius: "4px",
                        transition: "background 150ms cubic-bezier(0.23, 1, 0.32, 1), color 150ms cubic-bezier(0.23, 1, 0.32, 1), border-color 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Condition */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3, ease: EASE_OUT }}
          >
            <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
              Condition <span style={{ color: "#8B3A2E" }}>*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => (
                <motion.button
                  key={c.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => setCondition(c.value)}
                  className="text-left px-4 py-3"
                  style={{
                    border: condition === c.value ? "2px solid #2D5A3D" : "1px solid #D9D2C2",
                    background: condition === c.value ? "#EDE6D3" : "transparent",
                    borderRadius: "4px",
                    transition: "background 150ms cubic-bezier(0.23, 1, 0.32, 1), border-color 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <div className="font-medium text-sm" style={{ color: "#1F2A20" }}>{c.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>{c.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35, ease: EASE_OUT }}
          >
            <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
              Photo <span className="font-normal" style={{ color: "#8A8E83" }}>(optional but helpful)</span>
            </label>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative aspect-video overflow-hidden" style={{ maxWidth: "280px", border: "1px solid #D9D2C2" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
                  style={{ background: "rgba(31,42,32,0.75)", color: "#F5F1E8", borderRadius: "2px" }}
                >
                  ✕
                </motion.button>
              </div>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.1 }}
                onClick={() => fileRef.current?.click()}
                className="w-full p-8 text-center"
                style={{
                  border: "1.5px dashed #D9D2C2",
                  borderRadius: "4px",
                  transition: "border-color 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#8A8E83"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D9D2C2"; }}
              >
                <svg className="w-7 h-7 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#D9D2C2" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-sm font-medium" style={{ color: "#4A5247" }}>Upload a photo</div>
                <div className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>JPG, PNG, WEBP</div>
              </motion.button>
            )}
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.4, ease: EASE_OUT }}
          >
            <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
              Phone <span className="font-normal" style={{ color: "#8A8E83" }}>(optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 000-0000"
              style={inputCss}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
                className="text-xs p-3"
                style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={submitting || !isValid}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.1 }}
            className="w-full py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#2D5A3D", color: "#F5F1E8", borderRadius: "4px" }}
          >
            {submitting ? "Submitting…" : "Donate this item →"}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
