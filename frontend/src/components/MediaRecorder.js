// client/src/components/MediaRecorderUpload.jsx
import React, { useRef, useState } from "react";

export default function MediaRecorderUpload({ onUploadComplete, token }) {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Start camera + mic
  const startPreview = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true // set to false for audio-only UI if desired
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error(err);
      setError("Could not access camera/microphone. Allow permissions.");
    }
  };

  // Stop camera preview
  const stopPreview = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Start recording (MediaRecorder)
  const startRecording = () => {
    setError("");
    if (!mediaStreamRef.current) {
      setError("Start preview first.");
      return;
    }

    try {
      const options = { mimeType: "video/webm;codecs=vp8,opus" };
      const recorder = new MediaRecorder(mediaStreamRef.current, options);
      recorderRef.current = recorder;
      setChunks([]);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          setChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      setError("Recording not supported in this browser.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
    // keep media stream open for preview; user can stop preview manually
  };

  // Upload Blob (either recorded or file input)
  const uploadBlob = async (blob, filename = "recorded.webm") => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      // backend expects field name 'media'
      fd.append("media", blob, filename);

      const res = await fetch("/api/v1/upload/media", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        },
        body: fd
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      // data.url and data.type should come from upload controller
      onUploadComplete({ url: data.url, type: data.type });
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  // Handler for file input uploads
  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // immediate upload
    await uploadBlob(file, file.name);
  };

  // Save recorded blob (send to backend)
  const saveRecording = async () => {
    if (!chunks || chunks.length === 0) {
      setError("Nothing recorded.");
      return;
    }
    const blob = new Blob(chunks, { type: "video/webm" });
    await uploadBlob(blob, `capsule_${Date.now()}.webm`);
  };

  // Allow user to discard recording and re-record
  const discardRecording = () => {
    setChunks([]);
    setPreviewUrl(null);
  };

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="text-lg font-medium">Add Media</h3>

      {/* Device upload */}
      <div>
        <label className="block mb-2">Upload from device</label>
        <input type="file" accept="video/*,audio/*,image/*" onChange={onFileChange} />
      </div>

      <hr />

      {/* Recording section */}
      <div>
        <label className="block mb-2">Record now (camera + mic)</label>
        <div className="flex gap-2 mb-2">
          <button
            className="px-3 py-1 border rounded"
            type="button"
            onClick={startPreview}
          >
            Start Preview
          </button>
          <button
            className="px-3 py-1 border rounded"
            type="button"
            onClick={stopPreview}
          >
            Stop Preview
          </button>
          {!recording ? (
            <button
              className="px-3 py-1 bg-green-500 text-white rounded"
              type="button"
              onClick={startRecording}
            >
              Start Recording
            </button>
          ) : (
            <button
              className="px-3 py-1 bg-red-500 text-white rounded"
              type="button"
              onClick={stopRecording}
            >
              Stop Recording
            </button>
          )}
        </div>

        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "320px", height: "240px", background: "#000" }}
          />
        </div>

        {previewUrl && (
          <div className="mt-3">
            <label className="block mb-1">Preview</label>
            <video src={previewUrl} controls style={{ width: "320px", height: "240px" }} />
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-1 border rounded" onClick={discardRecording}>Discard</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={saveRecording} disabled={uploading}>
                {uploading ? "Uploading..." : "Save & Upload Recording"}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
