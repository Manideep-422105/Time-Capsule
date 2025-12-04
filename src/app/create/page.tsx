"use client";

import { createCapsule } from "@/app/actions/capsule";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import MediaCapture from "@/app/components/MediaCapture";
import {
  ArrowLeft,
  Clock,
  Mail,
  FileText,
  Lock,
  Upload,
  Camera as CameraIcon,
} from "lucide-react";
import SpotifySearch from "@/app/components/SpotifySearch";
import { generateAiPrompts } from "@/app/actions/ai";
import { Sparkles, Loader2 } from "lucide-react";
import { refineMessage } from "@/app/actions/ai";
import { Wand, RotateCcw } from "lucide-react"; // Add Wand and RotateCcw

export default function CreateCapsulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  // "UPLOAD" | "CAMERA" state is now passed down to the component
  const [inputType, setInputType] = useState<"UPLOAD" | "CAMERA">("UPLOAD");
  const now = new Date().toISOString().slice(0, 16);
  const [spotifyTrackId, setSpotifyTrackId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messageText, setMessageText] = useState(""); // New state for input tracking
  const [originalText, setOriginalText] = useState("");
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    // Attach captured file if it exists
    if (capturedFile) {
      formData.set("file", capturedFile);
    }

    // Validation
    const fileToCheck = formData.get("file") as File;
    if (!fileToCheck || fileToCheck.size === 0) {
      toast.warning("Your capsule is empty. Please attach a memory.");
      setLoading(false);
      return;
    }

    // Submit
    const toastId = toast.loading("Sealing your memory in the time vault...");
    const result = await createCapsule(formData);

    if (result?.error) {
      toast.error(result.error, { id: toastId });
      setLoading(false);
    } else {
      toast.success("Capsule Buried Successfully! 🔒", { id: toastId });
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    }
  }
  const handleRefine = async () => {
    if (!messageText.trim()) {
      return toast.error("Please write a message to refine.");
    }

    setIsAiLoading(true);
    const toastId = toast.loading("Refining your message...");

    // Save the original text before modification
    setOriginalText(messageText);

    const result = await refineMessage(messageText);

    if (result.content) {
      setMessageText(result.content); // Update the textarea content with the refined text
      toast.success("Message refined!", { id: toastId });
    } else {
      toast.error(result.error || "Refinement failed.", { id: toastId });
    }
    setIsAiLoading(false);
  };

  const handleRevert = () => {
    setMessageText(originalText);
    setOriginalText("");
    toast.info("Reverted to original message.");
  };
  return (
    // MAIN CONTAINER: Full screen, 2-column grid
    <div className="min-h-screen p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
      {/* --- LEFT COLUMN: THE EDITOR FORM --- */}
      <div className="w-full lg:w-[450px] flex flex-col">
        {/* Header & Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="p-3 glass-panel rounded-full hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 text-gray-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
              Create Capsule
            </h1>
            <p className="text-gray-400 text-sm">
              Design your message to the future.
            </p>
          </div>
        </div>

        {/* The Form */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel p-8 rounded-2xl flex-1 flex flex-col gap-6 shadow-2xl"
        >
          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-300">
              <FileText className="w-4 h-4" /> Title
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g., 'A message for 2030'"
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-blue-500/50 transition-all text-lg placeholder:text-gray-600"
            />
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-green-300">
              <Mail className="w-4 h-4" /> Recipient Email
            </label>
            <input
              name="recipientEmail"
              type="email"
              required
              placeholder="future.self@example.com"
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-green-500/50 transition-all text-lg placeholder:text-gray-600"
            />
          </div>

          {/* Date Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-purple-300">
              <Clock className="w-4 h-4" /> Unlock Date
            </label>
            <input
              name="unlockDate"
              type="datetime-local"
              required
              min={now}
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-purple-500/50 transition-all text-lg cursor-pointer"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Message Textarea */}
          {/* Message Textarea with AI Button */}
          {/* Message Textarea with AI Buttons */}
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-300">
                Message (Optional)
              </label>

              {/* AI ACTION BUTTONS GROUP */}
              <div className="flex gap-2">
                {/* 1. REVERT BUTTON (Shows only after refining) */}
                {originalText && (
                  <button
                    type="button"
                    onClick={handleRevert}
                    disabled={isAiLoading}
                    className="text-xs flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30 hover:bg-yellow-500/40 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" /> Revert
                  </button>
                )}

                {/* 2. REFINE BUTTON */}
                <button
                  type="button"
                  onClick={handleRefine}
                  disabled={isAiLoading || !messageText.trim()}
                  className="text-xs flex items-center gap-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30 hover:bg-green-500/40 transition-all"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand className="w-3 h-3" />
                  )}
                  {isAiLoading ? "Refining..." : "Refine Draft"}
                </button>

                {/* 3. GENERATE PROMPTS (AI Assist) BUTTON */}
                <button
                  type="button"
                  onClick={async () => {
                    // Keep existing prompt generation logic
                    setIsAiLoading(true);
                    const toastId = toast.loading(
                      "Consulting the Time Oracle..."
                    );
                    const result = await generateAiPrompts();

                    if (result.content) {
                      const separator = messageText ? "\n\n" : "";
                      const newText = `${messageText}${separator}--- AI Inspiration ---\n${result.content}\n\nMy Answer:\n`;
                      setMessageText(newText);
                      toast.success("Ideas added!", { id: toastId });
                    } else {
                      toast.error("AI failed to respond.", { id: toastId });
                    }
                    setIsAiLoading(false);
                  }}
                  disabled={isAiLoading}
                  className="text-xs flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 hover:bg-purple-500/40 transition-all"
                >
                  <Sparkles className="w-3 h-3" /> Get Prompts
                </button>
              </div>
            </div>

            <textarea
              name="message"
              placeholder="Write something meaningful..."
              value={messageText} // Bind state
              onChange={(e) => {
                setMessageText(e.target.value);
                // Clear original text if user starts typing again after refinement
                if (originalText) setOriginalText("");
              }}
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-gray-500/50 transition-all text-lg resize-none flex-1 min-h-[150px] placeholder:text-gray-600 font-sans"
            />

            {/* Hidden input must still send the final value to the server action */}
            <input type="hidden" name="message" value={messageText} />
          </div>
          {/* --- NEW SPOTIFY SECTION --- */}
          <SpotifySearch onSelect={setSpotifyTrackId} />

          {/* HIDDEN INPUT TO SEND TO SERVER */}
          <input
            type="hidden"
            name="spotifyTrackId"
            value={spotifyTrackId || ""}
          />
          {/* Hidden File Input (handled by MediaCapture component) */}
          <input
            type="hidden"
            name="file-check"
            value={capturedFile ? "ok" : ""}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-5 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-[200%_auto] hover:bg-position-[right_center] rounded-xl font-bold text-xl text-white transition-all duration-500 shadow-lg shadow-purple-900/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="animate-pulse">Burying Memory...</span>
            ) : (
              <>
                {" "}
                <Lock className="w-6 h-6 group-hover:scale-110 transition-transform" />{" "}
                Bury Capsule{" "}
              </>
            )}
          </button>
        </form>
      </div>

      {/* --- RIGHT COLUMN: THE MEDIA STUDIO --- */}
      <div className="flex-1 flex flex-col gap-6 h-[800px] lg:h-auto">
        {/* Mode Switcher (Tabs) */}
        <div className="flex p-1 glass-panel rounded-xl">
          <button
            type="button"
            onClick={() => {
              setInputType("UPLOAD");
              setCapturedFile(null);
            }}
            className={`flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              inputType === "UPLOAD"
                ? "bg-blue-600/80 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Upload className="w-5 h-5" /> Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setInputType("CAMERA");
              setCapturedFile(null);
            }}
            className={`flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              inputType === "CAMERA"
                ? "bg-purple-600/80 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CameraIcon className="w-5 h-5" /> Live Studio
          </button>
        </div>

        {/* The Big Media Component */}
        <div className="flex-1 relative group">
          {/* The component handles both modes now based on the prop */}
          <MediaCapture onCapture={setCapturedFile} mode={inputType} />

          {/* Success Indicator Overlay */}
          {capturedFile && (
            <div className="absolute top-4 left-4 bg-green-600/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg backdrop-blur animate-in fade-in slide-in-from-top-4">
              ✅ Memory Attached
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
