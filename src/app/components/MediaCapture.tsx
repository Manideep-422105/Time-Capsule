"use client";

import { useRef, useState, useEffect } from "react";
import { Camera, Video, Square, RefreshCw, UploadCloud } from "lucide-react";

interface MediaCaptureProps {
  onCapture: (file: File | null) => void;
  mode: "UPLOAD" | "CAMERA";
}

export default function MediaCapture({ onCapture, mode }: MediaCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<"PHOTO" | "VIDEO">("PHOTO");
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- UPDATED USE EFFECT WITH CLEANUP ---
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    // Cleanup: Stop camera when component unmounts (leaving the page)
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // --- CAMERA FUNCTIONS ---
  async function startCamera(forceMode?: "PHOTO" | "VIDEO") {
    const currentMode = forceMode || cameraMode;
    stopCamera(); // Ensure clean slate
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } }, 
        audio: currentMode === "VIDEO" 
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Could not access camera. Please allow permissions.");
    }
  }

  function stopCamera() {
    if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); }
  }

  function takePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      handleCapture(new File([blob], "capture.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  }

  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => { handleCapture(new File([new Blob(chunksRef.current, { type: "video/webm" })], "capture.webm", { type: "video/webm" })); };
    recorder.start(); setIsRecording(true); mediaRecorderRef.current = recorder;
  }

  function stopRecording() {
    if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setIsRecording(false); }
  }

  // --- FILE FUNCTIONS ---
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleCapture(file);
  }

  // --- COMMON FUNCTIONS ---
  function handleCapture(file: File) {
    setPreviewUrl(URL.createObjectURL(file));
    onCapture(file); stopCamera();
  }

  function reset() {
    setPreviewUrl(null); onCapture(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (mode === "CAMERA") startCamera(cameraMode);
  }

  // --- UI RENDERING ---
  return (
    <div className="w-full h-full glass-panel rounded-2xl overflow-hidden relative flex flex-col">
      {previewUrl ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center group">
          {previewUrl.includes("video") ? (
             <video src={previewUrl} controls className="w-full h-full object-contain" />
          ) : (
             <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          )}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button type="button" onClick={reset} aria-label="Retake Memory" className="p-3 bg-black/60 hover:bg-red-600/80 rounded-full text-white backdrop-blur-md transition-all">
                  <RefreshCw className="w-6 h-6" />
              </button>
          </div>
        </div>
      ) : (
        mode === "UPLOAD" ? (
          <div onClick={() => fileInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer border-2 border-dashed border-gray-700 m-4 rounded-xl">
            <UploadCloud className="w-20 h-20 mb-4 opacity-70" />
            <p className="text-xl font-semibold">Click to Upload</p>
            <p className="text-sm">Images, Videos, PDFs, Documents</p>
            <input ref={fileInputRef} type="file" accept="image/*,video/*,.pdf,.doc,.docx,.txt" hidden onChange={handleFileChange} />
          </div>
        ) : (
          !stream ? (
            <div className="flex-1 flex items-center justify-center gap-6">
                <button type="button" onClick={() => { setCameraMode("PHOTO"); startCamera("PHOTO"); }} className="flex flex-col items-center gap-3 p-6 glass-panel rounded-xl hover:bg-blue-600/20 transition-all group">
                    <Camera className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold">Take Photo</span>
                </button>
                <button type="button" onClick={() => { setCameraMode("VIDEO"); startCamera("VIDEO"); }} className="flex flex-col items-center gap-3 p-6 glass-panel rounded-xl hover:bg-purple-600/20 transition-all group">
                    <Video className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold">Record Video</span>
                </button>
            </div>
          ) : (
            <div className="relative w-full h-full bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent flex justify-center items-center gap-8">
                    {cameraMode === "PHOTO" ? (
                        <button type="button" onClick={takePhoto} aria-label="Take Photo" className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"></button>
                    ) : (
                        isRecording ? (
                            <button type="button" onClick={stopRecording} aria-label="Stop Recording" className="w-20 h-20 bg-red-600 rounded-full border-4 border-white animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                <Square className="w-8 h-8 text-white" fill="currentColor" />
                            </button>
                        ) : (
                            <button type="button" onClick={startRecording} aria-label="Start Recording" className="w-20 h-20 bg-red-600 rounded-full border-4 border-gray-300 hover:bg-red-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"></button>
                        )
                    )}
                </div>
            </div>
          )
        )
      )}
    </div>
  );
}