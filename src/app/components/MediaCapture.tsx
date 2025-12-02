"use client";

import { useRef, useState, useEffect } from "react";

interface MediaCaptureProps {
  onCapture: (file: File | null) => void;
}

export default function MediaCapture({ onCapture }: MediaCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<"PHOTO" | "VIDEO">("PHOTO");
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // FIX: Accept 'forceMode' to ensure we get audio immediately
  async function startCamera(forceMode?: "PHOTO" | "VIDEO") {
    const currentMode = forceMode || mode; // Use forced mode if provided
    
    try {
      // Stop any existing tracks first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        // Logic: If Video Mode, ask for Audio.
        audio: currentMode === "VIDEO" 
      });
      
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera Error:", err);
      alert("Could not access camera. Please allow permissions.");
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }

  function takePhoto() {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      handleCapture(file);
    }, "image/jpeg");
  }

  function startRecording() {
    if (!stream) return;
    chunksRef.current = [];
    // Important: MimeType ensures audio/video are encoded together
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], "capture.webm", { type: "video/webm" });
      handleCapture(file);
    };

    recorder.start();
    setIsRecording(true);
    mediaRecorderRef.current = recorder;
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  function handleCapture(file: File) {
    setPreviewUrl(URL.createObjectURL(file));
    onCapture(file); 
    stopCamera(); 
  }

  function reset() {
    setPreviewUrl(null);
    onCapture(null);
  }

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
      {previewUrl ? (
        <div className="flex flex-col items-center gap-4">
          {mode === "PHOTO" ? (
             <img src={previewUrl} alt="Captured preview" className="rounded w-full max-h-64 object-cover" />
          ) : (
             <video src={previewUrl} controls className="rounded w-full max-h-64" />
          )}
          <button type="button" onClick={reset} className="text-red-400 text-sm hover:underline">❌ Retake</button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {!stream ? (
            <div className="flex gap-4">
                {/* FIX: Explicitly pass the mode to startCamera */}
                <button type="button" onClick={() => { setMode("PHOTO"); startCamera("PHOTO"); }} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">📷 Take Photo</button>
                <button type="button" onClick={() => { setMode("VIDEO"); startCamera("VIDEO"); }} className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500">🎥 Record Video</button>
            </div>
          ) : (
            <div className="relative w-full">
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded bg-black transform scale-x-[-1]" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    {mode === "PHOTO" ? (
                        <button type="button" onClick={takePhoto} aria-label="Take Photo" className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-200"></button>
                    ) : (
                        isRecording ? (
                            <button type="button" onClick={stopRecording} aria-label="Stop Recording" className="w-16 h-16 bg-red-600 rounded-full border-4 border-white animate-pulse"></button>
                        ) : (
                            <button type="button" onClick={startRecording} aria-label="Start Recording" className="w-16 h-16 bg-red-600 rounded-full border-4 border-gray-300 hover:bg-red-500"></button>
                        )
                    )}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}