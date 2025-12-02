"use client";

import { createCapsule } from "@/app/actions/capsule";
import { useState } from "react";
import MediaCapture from "@/app/components/MediaCapture"; 

export default function CreateCapsulePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [inputType, setInputType] = useState<"UPLOAD" | "CAMERA">("UPLOAD");

  const now = new Date().toISOString().slice(0, 16);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    if (inputType === "CAMERA" && capturedFile) {
        formData.set("file", capturedFile);
    } 
    
    const fileToCheck = formData.get("file") as File;
    if (!fileToCheck || fileToCheck.size === 0) {
        setError("Please upload a file or record a memory.");
        setLoading(false);
        return;
    }
    // Limit is set in next.config.ts (e.g. 10MB)
    if (fileToCheck.size > 10 * 1024 * 1024) { 
        setError("File is too large (Max 10MB)");
        setLoading(false);
        return;
    }

    const result = await createCapsule(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">Bury a Capsule</h1>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input name="title" type="text" required className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm text-green-400 mb-1">To (Recipient Email)</label>
            <input name="recipientEmail" type="email" required className="w-full p-3 rounded bg-gray-800 border border-green-600 focus:border-green-400 focus:outline-none" />
          </div>

          {/* Unlock Date */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Unlock Date</label>
            <input name="unlockDate" type="datetime-local" required min={now} className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none" />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Message</label>
            <textarea name="message" rows={3} className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none" />
          </div>

          {/* ATTACHMENT SELECTION */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Attachment</label>
            <div className="flex gap-4 mb-4">
                <button type="button" onClick={() => setInputType("UPLOAD")} className={`flex-1 py-2 rounded text-sm font-bold ${inputType === "UPLOAD" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-500 border border-gray-700"}`}>
                    📂 File Upload
                </button>
                <button type="button" onClick={() => setInputType("CAMERA")} className={`flex-1 py-2 rounded text-sm font-bold ${inputType === "CAMERA" ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-500 border border-gray-700"}`}>
                    🔴 Live Record
                </button>
            </div>

            {inputType === "UPLOAD" ? (
                /* UPDATED INPUT: Added document types to accept */
                <div className="flex flex-col gap-2">
                    <input 
                    name="file" 
                    type="file" 
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt" 
                    className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                    <p className="text-xs text-gray-500">Supports: Images, Videos, PDF, Word, Text</p>
                </div>
            ) : (
                <MediaCapture onCapture={setCapturedFile} />
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-2 w-full p-3 bg-linear-to-r from-blue-600 to-purple-600 rounded font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Burying..." : "🔒 Bury Capsule"}
          </button>
        </form>
      </div>
    </div>
  );
}