"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/app/lib/supabaseClient";
import type { Camp } from "@/app/lib/supabaseClient";
import { ITEM_TYPES, CONDITIONS, getSizesForItemType } from "@/app/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, string> = {
  1: "photo",
  2: "camp",
  3: "item",
  4: "condition",
  5: "donate",
};

const SUBMIT_ITEM_TYPES = [
  ...ITEM_TYPES,
  { value: "other", label: "Other" },
] as const;

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const stepVariants = {
  enter: (dir: number) => ({ x: dir * 36, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir * -36,
    opacity: 0,
    transition: { duration: 0.15, ease: EASE_OUT },
  }),
};

function sortKey(name: string) {
  return name.replace(/^camp\s+/i, "").toLowerCase();
}

const inputCss: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #D9D2C2",
  borderRadius: "4px",
  background: "transparent",
  outline: "none",
  fontSize: "14px",
  color: "#1F2A20",
  transition: "border-color 180ms cubic-bezier(0.23, 1, 0.32, 1)",
};

export default function SubmitPage() {
  const router  = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [user, setUser]               = useState<User | null>(null);
  const [sellerPhone, setSellerPhone] = useState("");
  const [profileHasPhone, setProfileHasPhone] = useState(false);
  const [step, setStep]               = useState<Step>(1);
  const [direction, setDirection]     = useState<1 | -1>(1);

  const [camps, setCamps]           = useState<Camp[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [itemType, setItemType]     = useState("");
  const [otherItemText, setOtherItemText] = useState("");
  const [size, setSize]             = useState("");
  const [condition, setCondition]   = useState("");
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isDonating, setIsDonating] = useState(false);
  const [donorNote, setDonorNote]   = useState("");

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", data.user.id)
        .single();
      if (profile?.phone) {
        setSellerPhone(profile.phone);
        setProfileHasPhone(true);
      }

      const { data: campsData } = await supabase.from("camps").select("*").order("name");
      const sorted = (campsData ?? []).sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)));
      setCamps(sorted);
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
    if (!imageFile) {
      setError("You need to upload a photo before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const finalItemType = itemType === "other" ? otherItemText.trim() : itemType;

      if (!isDonating) {
        const { data: priorClaims } = await supabase
          .from("claims")
          .select("id, items!inner(camp_id, item_type)")
          .eq("claimer_id", user.id)
          .neq("status", "cancelled")
          .eq("items.camp_id", selectedId)
          .eq("items.item_type", finalItemType)
          .limit(1);

        if (priorClaims && priorClaims.length > 0) {
          setError("Items you claimed for free can't be listed for sale. If it doesn't fit, donate it forward instead.");
          setSubmitting(false);
          return;
        }
      }

      const ext  = imageFile.name.split(".").pop();
      const path = `submissions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("item-images")
        .upload(path, imageFile);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(path);

      const { error: insertError } = await supabase.from("camp_requests").insert({
        user_id:      user.id,
        camp_id:      selectedId,
        item_type:    finalItemType,
        size,
        condition,
        image_url:    urlData.publicUrl,
        seller_email: user.email,
        seller_phone: sellerPhone || null,
        status:       "pending",
        is_donation:  isDonating,
        donor_note:   isDonating && donorNote.trim() ? donorNote.trim() : null,
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
    if (step === 1) return !!imageFile;
    if (step === 2) return !!selectedId;
    if (step === 3) return !!itemType && !!size && (itemType !== "other" || !!otherItemText.trim());
    if (step === 4) return !!condition && (profileHasPhone || sellerPhone.length === 10);
    return true;
  };

  const advance = () => { setDirection(1); setStep((s) => (s + 1) as Step); };
  const retreat = () => { setDirection(-1); setStep((s) => (s - 1) as Step); };

  const selectedCamp = camps.find((c) => c.id === selectedId);

  if (submitted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#F5F1E8" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          style={{ maxWidth: "440px", width: "100%" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.12, ease: EASE_OUT }}
            className="w-10 h-10 flex items-center justify-center mb-6"
            style={{ border: "1.5px solid #2D5A3D", borderRadius: "2px" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#2D5A3D" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: EASE_OUT }}
            className="font-medium mb-3"
            style={{ fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 72, 'soft' 40", fontSize: "28px", color: "#1F2A20" }}
          >
            Listing submitted
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24, ease: EASE_OUT }}
            className="text-sm mb-8 leading-relaxed"
            style={{ color: "#4A5247" }}
          >
            We&apos;ll look it over and approve it within a day or two.
            If we have questions we&apos;ll reach out at <strong>{user?.email}</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: EASE_OUT }}
            className="flex flex-wrap gap-3"
          >
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.1 }}
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setSelectedId("");
                setItemType("");
                setOtherItemText("");
                setSize("");
                setCondition("");
                setImageFile(null);
                setImagePreview(null);
                setIsDonating(false);
                setDonorNote("");
              }}
              className="px-5 py-2.5 text-sm font-semibold"
              style={{
                background: "#2D5A3D",
                color: "#F5F1E8",
                borderRadius: "4px",
                transition: "opacity 180ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              List another item
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.1 }}
              onClick={() => router.push("/camps")}
              className="px-5 py-2.5 text-sm font-medium"
              style={{
                border: "1px solid #D9D2C2",
                color: "#4A5247",
                borderRadius: "4px",
                transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Browse camps
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
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <motion.h1
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
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
            List an item
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="text-sm"
            style={{ color: "#8A8E83" }}
          >
            Got gear you&apos;ve outgrown? We&apos;ll review it within a day.
          </motion.p>
        </div>
      </div>

      <div className="px-6 py-10" style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Progress — animated hairline bars */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT }}
          className="mb-8"
        >
          <p className="text-xs mb-3" style={{ color: "#8A8E83" }}>
            {step} of 5 — {STEP_LABELS[step]}
          </p>
          <div className="flex gap-1.5">
            {([1, 2, 3, 4, 5] as Step[]).map((s) => (
              <div
                key={s}
                className="flex-1 h-0.5 relative overflow-hidden"
                style={{ background: "#D9D2C2" }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ background: "#2D5A3D", transformOrigin: "left center" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: s <= step ? 1 : 0 }}
                  transition={{ duration: 0.32, ease: EASE_OUT }}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step content — direction-aware slide transitions */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >

            {/* Step 1: Photo */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2
                    className="font-medium mb-1"
                    style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                  >
                    Add a photo
                  </h2>
                  <p className="text-xs" style={{ color: "#8A8E83" }}>
                    Clear, well-lit photos get approved faster. Lay the item flat on a light surface.
                  </p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="relative aspect-square overflow-hidden"
                    style={{ maxWidth: "280px", border: "1px solid #D9D2C2" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-xs font-bold"
                      style={{
                        background: "rgba(31,42,32,0.75)",
                        color: "#F5F1E8",
                        borderRadius: "2px",
                        transition: "opacity 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    >
                      ✕
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => fileRef.current?.click()}
                    className="w-full p-10 text-center"
                    style={{
                      border: "1.5px dashed #D9D2C2",
                      borderRadius: "4px",
                      transition: "border-color 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#8A8E83"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#D9D2C2"; }}
                  >
                    <svg className="w-8 h-8 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#D9D2C2" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm font-medium" style={{ color: "#4A5247" }}>Click to upload a photo</div>
                    <div className="text-xs mt-1" style={{ color: "#8A8E83" }}>JPG, PNG, or WEBP · up to 10MB</div>
                  </motion.button>
                )}
              </div>
            )}

            {/* Step 2: Select camp */}
            {step === 2 && (
              <div className="space-y-4">
                <h2
                  className="font-medium"
                  style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                >
                  Which camp?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" style={{ maxHeight: "380px", overflowY: "auto" }}>
                  {camps.map((camp, i) => (
                    <motion.button
                      key={camp.id}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.03, ease: EASE_OUT }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedId(camp.id)}
                      className="relative overflow-hidden text-left"
                      style={{
                        border: selectedId === camp.id ? "2px solid #2D5A3D" : "1px solid #D9D2C2",
                        borderRadius: "0px",
                        transition: "border-color 160ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                    >
                      <div className="h-16 relative" style={{ background: "#EDE6D3" }}>
                        {camp.main_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={camp.main_image} alt={camp.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(31,42,32,0.7) 0%, transparent 60%)" }} />
                        <div className="absolute bottom-1.5 left-2 right-2">
                          <p className="text-xs font-medium leading-tight" style={{ color: "#F5F1E8", fontFamily: "var(--font-fraunces)", fontVariationSettings: "'opsz' 36, 'soft' 30" }}>
                            {camp.name}
                          </p>
                        </div>
                        {selectedId === camp.id && (
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, ease: EASE_OUT }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center"
                            style={{ background: "#2D5A3D", borderRadius: "2px" }}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#F5F1E8" }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
                {selectedCamp && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="text-xs"
                    style={{ color: "#2D5A3D" }}
                  >
                    Selected: {selectedCamp.name}
                  </motion.p>
                )}
              </div>
            )}

            {/* Step 3: Item details */}
            {step === 3 && (
              <div className="space-y-6">
                <h2
                  className="font-medium"
                  style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                >
                  What are you selling?
                </h2>

                <div>
                  <label className="block text-xs font-medium mb-3" style={{ color: "#4A5247" }}>Item type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SUBMIT_ITEM_TYPES.map((type) => (
                      <motion.button
                        key={type.value}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: 0.1 }}
                        onClick={() => { setItemType(type.value); setSize(""); setOtherItemText(""); }}
                        className="py-2.5 px-3 text-xs font-medium"
                        style={{
                          border: itemType === type.value ? "2px solid #2D5A3D" : "1px solid #D9D2C2",
                          background: itemType === type.value ? "#2D5A3D" : "transparent",
                          color: itemType === type.value ? "#F5F1E8" : "#4A5247",
                          borderRadius: "4px",
                          transition: "all 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                        }}
                      >
                        {type.label}
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {itemType === "other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: EASE_OUT }}
                        style={{ overflow: "hidden" }}
                      >
                        <input
                          type="text"
                          value={otherItemText}
                          onChange={(e) => setOtherItemText(e.target.value)}
                          placeholder="Describe the item (e.g. Sweatpants, Jacket…)"
                          style={{ ...inputCss, marginTop: "12px" }}
                          onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {itemType && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25, ease: EASE_OUT }}
                    >
                      <label className="block text-xs font-medium mb-3" style={{ color: "#4A5247" }}>Size</label>
                      <div className="flex flex-wrap gap-2">
                        {getSizesForItemType(itemType).map((s) => (
                          <motion.button
                            key={s}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            onClick={() => setSize(s)}
                            className="px-3 py-1.5 text-xs font-medium"
                            style={{
                              border: size === s ? "2px solid #2D5A3D" : "1px solid #D9D2C2",
                              background: size === s ? "#2D5A3D" : "transparent",
                              color: size === s ? "#F5F1E8" : "#4A5247",
                              borderRadius: "4px",
                              transition: "all 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                            }}
                          >
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Step 4: Condition */}
            {step === 4 && (
              <div className="space-y-5">
                <h2
                  className="font-medium"
                  style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                >
                  What&apos;s the condition?
                </h2>
                <div className="space-y-2">
                  {CONDITIONS.map((c) => (
                    <motion.button
                      key={c.value}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => setCondition(c.value)}
                      className="w-full text-left px-4 py-3"
                      style={{
                        border: condition === c.value ? "2px solid #2D5A3D" : "1px solid #D9D2C2",
                        background: condition === c.value ? "#EDE6D3" : "transparent",
                        borderRadius: "4px",
                        transition: "all 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                    >
                      <div className="font-medium text-sm" style={{ color: "#1F2A20" }}>{c.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>{c.description}</div>
                    </motion.button>
                  ))}
                </div>

                {!profileHasPhone && (
                  <div className="mt-5 pt-5" style={{ borderTop: "1px solid #D9D2C2" }}>
                    <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
                      Your phone number
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="5550001234"
                      maxLength={10}
                      style={inputCss}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
                    />
                    <p className="text-xs mt-1" style={{ color: "#8A8E83" }}>
                      10 digits, numbers only. Used to contact you about your listing.
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="text-xs p-3"
                      style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Step 5: Donate toggle */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2
                    className="font-medium mb-1"
                    style={{ fontFamily: "var(--font-fraunces)", fontSize: "20px", color: "#1F2A20", fontVariationSettings: "'opsz' 36, 'soft' 30" }}
                  >
                    Donating this instead?
                  </h2>
                  <p className="text-xs leading-relaxed" style={{ color: "#8A8E83" }}>
                    Free for another camp family to claim. We&apos;ll handle matching and shipping reimbursement.
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.1 }}
                  onClick={() => { setIsDonating(!isDonating); if (isDonating) setDonorNote(""); }}
                  className="flex items-center gap-3 w-full text-left p-4"
                  style={{
                    border: isDonating ? "2px solid #2D5A3D" : "1px solid #D9D2C2",
                    background: isDonating ? "#EDE6D3" : "transparent",
                    borderRadius: "4px",
                    transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                  }}
                >
                  <motion.div
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
                    style={{
                      border: isDonating ? "none" : "1.5px solid #D9D2C2",
                      background: isDonating ? "#2D5A3D" : "transparent",
                      borderRadius: "2px",
                      transition: "all 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                  >
                    <AnimatePresence>
                      {isDonating && (
                        <motion.svg
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.18, ease: EASE_OUT }}
                          className="w-3 h-3"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          style={{ color: "#F5F1E8" }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: isDonating ? "#1F2A20" : "#4A5247" }}>
                      {isDonating ? "Free — donated" : "Donate this item"}
                    </div>
                    {isDonating && (
                      <div className="text-xs mt-0.5" style={{ color: "#8A8E83" }}>No sale price. Another family can claim it at no cost.</div>
                    )}
                  </div>
                </motion.button>

                <AnimatePresence>
                  {isDonating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: EASE_OUT }}
                      style={{ overflow: "hidden" }}
                    >
                      <label className="block text-xs font-medium mb-2" style={{ color: "#4A5247" }}>
                        Add a note for whoever claims it{" "}
                        <span style={{ color: "#8A8E83", fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={donorNote}
                        onChange={(e) => setDonorNote(e.target.value.slice(0, 140))}
                        placeholder="e.g., 'written for younger kids' or 'good for a first-time camper'"
                        maxLength={140}
                        style={inputCss}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#2D5A3D"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#D9D2C2"; }}
                      />
                      <p className="text-xs mt-1 text-right" style={{ color: "#8A8E83" }}>
                        {donorNote.length}/140
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="text-xs p-3"
                      style={{ color: "#8B3A2E", background: "#F9F0EE", border: "1px solid #D9B9B4", borderRadius: "4px" }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.1 }}
              onClick={retreat}
              className="px-5 py-2.5 text-sm font-medium"
              style={{
                border: "1px solid #D9D2C2",
                color: "#4A5247",
                borderRadius: "4px",
                transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EDE6D3"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Back
            </motion.button>
          )}
          {step < 5 ? (
            <motion.button
              whileTap={canAdvance() ? { scale: 0.97 } : {}}
              transition={{ duration: 0.1 }}
              onClick={advance}
              disabled={!canAdvance()}
              className="flex-1 py-2.5 text-sm font-semibold disabled:cursor-not-allowed"
              style={{
                background: "#2D5A3D",
                color: "#F5F1E8",
                borderRadius: "4px",
                opacity: canAdvance() ? 1 : 0.4,
                transition: "opacity 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              Continue
            </motion.button>
          ) : (
            <motion.button
              whileTap={!submitting ? { scale: 0.97 } : {}}
              transition={{ duration: 0.1 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-semibold disabled:cursor-not-allowed"
              style={{
                background: "#2D5A3D",
                color: "#F5F1E8",
                borderRadius: "4px",
                opacity: submitting ? 0.6 : 1,
                transition: "opacity 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              }}
            >
              {submitting ? "Submitting…" : "Submit for review →"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
