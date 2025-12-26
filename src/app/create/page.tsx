"use client";

import { createCapsule } from "@/app/actions/capsule";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import MediaCapture from "@/app/components/MediaCapture";
import AiSummarizer from "@/app/components/AiSummarizer"; // Import your new component
import {
  ArrowLeft,
  Clock,
  Mail,
  FileText,
  Lock,
  Upload,
  Camera as CameraIcon,
  Sparkles,
  Loader2,
  RotateCcw,
  Wand2
} from "lucide-react";
import SpotifySearch from "@/app/components/SpotifySearch";
import { generateAiPrompts } from "@/app/actions/ai";

export default function CreateCapsulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<"UPLOAD" | "CAMERA">("UPLOAD");
  const now = new Date().toISOString().slice(0, 16);
  const [spotifyTrackId, setSpotifyTrackId] = useState<string | null>(null);
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messageText, setMessageText] = useState(""); 
  const [originalText, setOriginalText] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    if (capturedFile) {
      formData.set("file", capturedFile);
    }

    const fileToCheck = formData.get("file") as File;
    if (!fileToCheck || fileToCheck.size === 0) {
      toast.warning("Your capsule is empty. Please attach a memory.");
      setLoading(false);
      return;
    }

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

  const handleRevert = () => {
    setMessageText(originalText);
    setOriginalText("");
    toast.info("Reverted to original message.");
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
      {/* --- LEFT COLUMN: THE EDITOR FORM --- */}
      <div className="w-full lg:w-[450px] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-3 glass-panel rounded-full hover:bg-white/10 transition-all group"
          >
            <ArrowLeft className="w-6 h-6 text-gray-300 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
              Create Capsule
            </h1>
            <p className="text-gray-400 text-sm">Design your message to the future.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-2xl flex-1 flex flex-col gap-6 shadow-2xl">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-blue-300">
              <FileText className="w-4 h-4" /> Title
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g., 'A message for 2030'"
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-blue-500/50 transition-all text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-green-300">
              <Mail className="w-4 h-4" /> Recipient Email
            </label>
            <input
              name="recipientEmail"
              type="email"
              required
              placeholder="future.self@example.com"
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-green-500/50 transition-all text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-purple-300">
              <Clock className="w-4 h-4" /> Unlock Date
            </label>
            <input
              name="unlockDate"
              type="datetime-local"
              required
              min={now}
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-purple-500/50 transition-all text-lg"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Message Textarea */}
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-gray-300">Message</label>
              
              <div className="flex gap-2">
                {originalText && (
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="text-[10px] flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30 hover:bg-yellow-500/40"
                  >
                    <RotateCcw className="w-3 h-3" /> Revert
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    setIsAiLoading(true);
                    const result = await generateAiPrompts();
                    if (result.content) {
                      setMessageText(prev => `${prev}\n\n--- Questions ---\n${result.content}\n`);
                    }
                    setIsAiLoading(false);
                  }}
                  disabled={isAiLoading}
                  className="text-[10px] flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30"
                >
                  <Sparkles className="w-3 h-3" /> Help Me Write
                </button>
              </div>
            </div>

            {/* INTEGRATED AI SUMMARIZER & REFINER */}
            <AiSummarizer 
              message={messageText} 
              onRefine={(refined) => {
                setOriginalText(messageText);
                setMessageText(refined);
                toast.success("Refined text applied!");
              }} 
            />

            <textarea
              name="message"
              placeholder="Write something meaningful..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-4 rounded-xl glass-input focus:ring-2 focus:ring-gray-500/50 transition-all text-lg resize-none flex-1 min-h-[150px]"
            />
            <input type="hidden" name="message" value={messageText} />
          </div>

          <SpotifySearch onSelect={setSpotifyTrackId} />
          <input type="hidden" name="spotifyTrackId" value={spotifyTrackId || ""} />

          <button
            type="submit"
            disabled={loading}
            className="w-full p-5 bg-linear-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-[200%_auto] hover:bg-[100%_0] rounded-xl font-bold text-xl text-white transition-all duration-500 shadow-lg shadow-purple-900/40 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Lock className="w-6 h-6" />}
            {loading ? "Burying..." : "Bury Capsule"}
          </button>
        </form>
      </div>

      {/* --- RIGHT COLUMN: THE MEDIA STUDIO --- */}
      <div className="flex-1 flex flex-col gap-6 h-[800px] lg:h-auto">
        <div className="flex p-1 glass-panel rounded-xl">
          <button
            type="button"
            onClick={() => { setInputType("UPLOAD"); setCapturedFile(null); }}
            className={`flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${inputType === "UPLOAD" ? "bg-blue-600 text-white" : "text-gray-400"}`}
          >
            <Upload className="w-5 h-5" /> Upload
          </button>
          <button
            type="button"
            onClick={() => { setInputType("CAMERA"); setCapturedFile(null); }}
            className={`flex-1 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${inputType === "CAMERA" ? "bg-purple-600 text-white" : "text-gray-400"}`}
          >
            <CameraIcon className="w-5 h-5" /> Camera
          </button>
        </div>

        <div className="flex-1 relative">
          <MediaCapture onCapture={setCapturedFile} mode={inputType} />
          {capturedFile && (
            <div className="absolute top-4 left-4 bg-green-600/90 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg backdrop-blur">
              ✅ Memory Attached
            </div>
          )}
        </div>
      </div>
    </div>
  );
}