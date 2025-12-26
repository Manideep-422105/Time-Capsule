"use client";

import { useRef, useState, useEffect } from "react";
import { 
  Camera, 
  Video, 
  Square, 
  RefreshCw, 
  UploadCloud, 
  Image as ImageIcon, 
  Film,
  FileText 
} from "lucide-react";

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
  const [capturedMediaType, setCapturedMediaType] = useState<"image" | "video" | "other" | null>(null);
  const [fileName, setFileName] = useState<string>("");
  
  const [cameraMode, setCameraMode] = useState<"PHOTO" | "VIDEO">("PHOTO");
  
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FIX: Stop camera immediately when switching modes ---
  useEffect(() => {
    if (mode === "UPLOAD") {
      stopCamera();
    }
  }, [mode]);

  // --- Existing Stream Logic ---
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // --- CAMERA LOGIC ---
  async function startCamera(targetMode: "PHOTO" | "VIDEO") {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } }, 
        audio: targetMode === "VIDEO" 
      });
      
      setCameraMode(targetMode);
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

  function switchCameraMode(newMode: "PHOTO" | "VIDEO") {
    if (newMode === cameraMode) return;
    startCamera(newMode);
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
    
    try {
        const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") 
            ? { mimeType: "video/webm;codecs=vp9" }
            : MediaRecorder.isTypeSupported("video/webm")
            ? { mimeType: "video/webm" }
            : undefined;

        const recorder = new MediaRecorder(stream, options);
        
        recorder.ondataavailable = (e) => { 
            if (e.data && e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };
        
        recorder.onstop = () => { 
            const blob = new Blob(chunksRef.current, { type: "video/webm" });
            const file = new File([blob], "capture.webm", { type: "video/webm" });
            handleCapture(file);
        };
        
        recorder.start(200); 
        setIsRecording(true); 
        mediaRecorderRef.current = recorder;
    } catch (error) {
        console.error("Recorder Init Error:", error);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") { 
        mediaRecorderRef.current.stop(); 
        setIsRecording(false); 
    }
  }

  // --- FILE HANDLING ---
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleCapture(file);
  }

  function handleCapture(file: File) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    
    if (file.type.startsWith("video/") || file.name.endsWith(".webm") || file.name.endsWith(".mp4")) {
        setCapturedMediaType("video");
    } else if (file.type.startsWith("image/")) {
        setCapturedMediaType("image");
    } else {
        setCapturedMediaType("other");
    }

    onCapture(file); 
    stopCamera();
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); 
    setCapturedMediaType(null);
    setFileName("");
    onCapture(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    if (mode === "CAMERA") startCamera(cameraMode);
  }

  // --- RENDER ---
  return (
    <div className="w-full h-full glass-panel rounded-2xl overflow-hidden relative flex flex-col min-h-[400px]">
      
      {previewUrl ? (
        <div className="relative w-full h-full bg-black flex items-center justify-center group p-4">
          
          {capturedMediaType === "video" && (
             <video 
                key={previewUrl} 
                src={previewUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain max-h-[600px]" 
             />
          )}

          {capturedMediaType === "image" && (
             <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          )}

          {capturedMediaType === "other" && (
             <div className="flex flex-col items-center justify-center text-gray-200 gap-4">
                <div className="p-6 bg-white/10 rounded-2xl border border-white/20">
                   <FileText className="w-20 h-20 text-blue-400" />
                </div>
                <div className="text-center">
                    <p className="text-xl font-bold">{fileName}</p>
                    <p className="text-sm text-gray-400 mt-1">Document attached</p>
                </div>
             </div>
          )}

          <div className="absolute top-4 right-4 z-10">
              <button type="button" onClick={reset} className="p-3 bg-black/60 hover:bg-red-600/80 rounded-full text-white backdrop-blur-md transition-all shadow-lg">
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
            <input 
                ref={fileInputRef} 
                type="file" 
                hidden 
                onChange={handleFileChange} 
            />
          </div>
        ) : (
          !stream ? (
            <div className="flex-1 flex items-center justify-center gap-6">
                <button type="button" onClick={() => startCamera("PHOTO")} className="flex flex-col items-center gap-3 p-6 glass-panel rounded-xl hover:bg-blue-600/20 transition-all group">
                    <Camera className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold">Take Photo</span>
                </button>
                <button type="button" onClick={() => startCamera("VIDEO")} className="flex flex-col items-center gap-3 p-6 glass-panel rounded-xl hover:bg-purple-600/20 transition-all group">
                    <Video className="w-12 h-12 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold">Record Video</span>
                </button>
            </div>
          ) : (
            <div className="relative w-full h-full bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                
                {!isRecording && (
                   <div className="absolute top-6 left-0 right-0 flex justify-center z-10">
                     <div className="bg-black/50 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/10">
                        <button 
                          type="button"
                          onClick={() => switchCameraMode("PHOTO")}
                          className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${cameraMode === "PHOTO" ? "bg-white text-black" : "text-gray-300 hover:bg-white/10"}`}
                        >
                          <ImageIcon className="w-3 h-3" /> Photo
                        </button>
                        <button 
                          type="button"
                          onClick={() => switchCameraMode("VIDEO")}
                          className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${cameraMode === "VIDEO" ? "bg-red-500 text-white" : "text-gray-300 hover:bg-white/10"}`}
                        >
                          <Film className="w-3 h-3" /> Video
                        </button>
                     </div>
                   </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-8 bg-linear-to-t from-black/80 to-transparent flex justify-center items-center gap-8">
                    {cameraMode === "PHOTO" ? (
                        <button type="button" onClick={takePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"></button>
                    ) : (
                        isRecording ? (
                            <button type="button" onClick={stopRecording} className="w-20 h-20 bg-red-600 rounded-full border-4 border-white animate-pulse flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                <Square className="w-8 h-8 text-white" fill="currentColor" />
                            </button>
                        ) : (
                            <button type="button" onClick={startRecording} className="w-20 h-20 bg-red-600 rounded-full border-4 border-gray-300 hover:bg-red-500 hover:scale-105 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]"></button>
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