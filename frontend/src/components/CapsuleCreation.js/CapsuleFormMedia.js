import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMedia } from "../../redux/slices/CapsuleSlice";

// --- Google Drive API Configuration ---
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

const CapsuleFormMedia = ({ nextStep, prevStep }) => {
  const dispatch = useDispatch();
  const savedMedia = useSelector((state) => state.capsule.mediaFiles);
  const [mediaFiles, setMediaFiles] = useState(savedMedia || []);
  const [recordingStatus, setRecordingStatus] = useState("idle");
  const [stream, setStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [previewError, setPreviewError] = useState(null);

  const liveVideoRef = useRef(null);
  const previewRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // --- Google Drive Picker State ---
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);

  // --- Effect to load Google API scripts ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("client:picker", () => {
        setGapiLoaded(true);
        window.gapi.client
          .load("https://www.googleapis.com/discovery/v1/apis/drive/v3/rest")
          .then(() => setPickerApiLoaded(true));
      });
    };
    document.body.appendChild(script);
  }, []);

  // --- Attach live stream to video when recording ---
  useEffect(() => {
    if (recordingStatus === "recording" && liveVideoRef.current && stream) {
      console.log("Attaching stream to live video"); // Debug: Stream attachment
      liveVideoRef.current.srcObject = stream;
    }
  }, [recordingStatus, stream]);

  // --- Attach blob to preview element ---
  useEffect(() => {
    if (recordedBlob && previewRef.current) {
      console.log("Preview Blob:", {
        size: recordedBlob.size,
        type: recordedBlob.type,
      }); // Debug: Log blob details
      try {
        const previewURL = URL.createObjectURL(recordedBlob);
        console.log("Preview URL:", previewURL); // Debug: Log blob URL
        previewRef.current.src = "";
        previewRef.current.load(); // Reset before setting new src
        previewRef.current.src = previewURL;
        previewRef.current.load();
        previewRef.current.play().catch((err) => {
          console.warn("Auto-play failed:", err); // Debug: Log auto-play errors
          setPreviewError("Auto-play failed. Click Play to view the video.");
        });
        return () => {
          console.log("Revoking preview URL"); // Debug: URL revocation
          URL.revokeObjectURL(previewURL);
          if (previewRef.current) {
            previewRef.current.src = "";
            previewRef.current.load();
          }
        };
      } catch (err) {
        console.error("Error setting preview URL:", err);
        setPreviewError("Failed to load video preview. Please try again.");
        setRecordingStatus("idle");
        setRecordedBlob(null);
      }
    }
  }, [recordedBlob]);

  // --- Cleanup stream on component unmount ---
  useEffect(() => {
    return () => {
      if (stream) {
        console.log("Cleaning up stream"); // Debug: Stream cleanup
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // --- Handlers for Local File Upload & Google Drive ---
  const handleLocalFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setMediaFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleAuthClick = () => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        createPicker(tokenResponse.access_token);
      },
    });
    tokenClient.requestAccessToken();
  };

  const createPicker = (accessToken) => {
    const view = new window.google.picker.View(window.google.picker.ViewId.ALL);
    const picker = new window.google.picker.PickerBuilder()
      .setApiKey(GOOGLE_API_KEY)
      .setOAuthToken(accessToken)
      .addView(view)
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const driveFiles = data.docs.map((doc) => ({
            name: doc.name,
            mimeType: doc.mimeType,
            id: doc.id,
            isFromDrive: true,
          }));
          setMediaFiles((prev) => [...prev, ...driveFiles]);
        }
      })
      .build();
    picker.setVisible(true);
  };

  // --- Handlers for Live Recording ---
  const handleStartRecording = async () => {
    if (!audioEnabled && !videoEnabled) {
      alert("Enable at least audio or video to start recording.");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled,
        audio: audioEnabled,
      });
      console.log("Stream acquired:", {
        videoTracks: mediaStream.getVideoTracks().length,
        audioTracks: mediaStream.getAudioTracks().length,
      }); // Debug: Log stream details
      setStream(mediaStream);
      setRecordingStatus("recording");

      // Select supported MIME type
      const mimeTypeOptions = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4;codecs=avc1",
      ];
      const mimeType = mimeTypeOptions.find((type) =>
        MediaRecorder.isTypeSupported(type)
      ) || "video/webm";
      console.log("Selected MIME type:", mimeType); // Debug: Log MIME type

      // Verify browser can play the MIME type
      const videoElement = document.createElement("video");
      const canPlay = videoElement.canPlayType(mimeType);
      console.log("Can play MIME type:", canPlay); // Debug: Log playback support
      if (canPlay === "") {
        console.warn("Browser may not support playback of:", mimeType);
      }

      const recorder = new MediaRecorder(mediaStream, { mimeType });
      mediaRecorderRef.current = recorder;

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Chunk received:", event.data.size); // Debug: Log chunk size
          chunks.push(event.data);
        } else {
          console.warn("Empty chunk received");
        }
      };
      recorder.onstop = () => {
        console.log("Recorder stopped, chunks:", chunks.length); // Debug: Log chunk count
        const blob = new Blob(chunks, { type: mimeType });
        console.log("Blob created:", {
          size: blob.size,
          type: blob.type,
        }); // Debug: Log blob details
        if (blob.size > 0) {
          setRecordedBlob(blob);
          setRecordingStatus("preview");
        } else {
          console.error("No data recorded");
          setRecordingStatus("idle");
          alert("No data was recorded. Please try again.");
        }
        mediaStream.getTracks().forEach((track) => track.stop());
        setStream(null);
      };
      recorder.onerror = (err) => {
        console.error("Recording error:", err);
        setRecordingStatus("idle");
        alert("Recording failed. Please try again.");
      };
      recorder.start(1000); // Use 1-second timeslice for chunk collection
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      console.log("Stopping recorder"); // Debug: Log stop action
      mediaRecorderRef.current.stop();
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !audioEnabled));
    }
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = !videoEnabled));
    }
    setVideoEnabled(!videoEnabled);
  };

  const handleUseRecording = () => {
    if (!recordedBlob) return;
    const fileType = recordedBlob.type || "video/webm";
    console.log("Using recording, fileType:", fileType); // Debug: Log file type
    const recordedFile = new File(
      [recordedBlob],
      `recording-${Date.now()}.${fileType.includes("video") ? "webm" : "weba"}`,
      { type: fileType }
    );
    setMediaFiles((prevFiles) => [...prevFiles, recordedFile]);
    handleDiscardRecording();
  };

  const handleDiscardRecording = () => {
    console.log("Discarding recording"); // Debug: Log discard action
    setRecordedBlob(null);
    setRecordingStatus("idle");
    setAudioEnabled(true);
    setVideoEnabled(true);
    setPreviewError(null);
    // Only attempt to clean up previewRef if it exists
    if (previewRef.current) {
      try {
        previewRef.current.src = "";
        previewRef.current.load();
      } catch (err) {
        console.warn("Error cleaning up previewRef:", err);
      }
    }
  };

  const handlePlayPreview = () => {
    if (previewRef.current) {
      console.log("Manual play attempt"); // Debug: Log manual play
      previewRef.current.play().catch((err) => {
        console.error("Manual play failed:", err);
        setPreviewError("Failed to play video. Try downloading or re-recording.");
      });
    }
  };

  const handleNext = () => {
    dispatch(setMedia(mediaFiles));
    nextStep();
  };

  const removeFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const renderRecordingUI = () => {
    switch (recordingStatus) {
      case "recording":
        return (
          <div className="relative">
            <video
              ref={liveVideoRef}
              autoPlay
              muted
              className="w-full rounded-md bg-gray-900"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <button
                onClick={toggleAudio}
                className="bg-gray-700 text-white p-2 rounded-full"
              >
                {audioEnabled ? "🎤 Mute" : "🔇 Unmute"}
              </button>
              <button
                onClick={toggleVideo}
                className="bg-gray-700 text-white p-2 rounded-full"
              >
                {videoEnabled ? "📹 Video Off" : "▶️ Video On"}
              </button>
              <button
                onClick={handleStopRecording}
                className="bg-red-600 text-white px-4 py-2 rounded-full"
              >
                Stop
              </button>
            </div>
          </div>
        );
      case "preview":
        return (
          <div>
            {recordedBlob ? (
              <>
                <video
                  ref={previewRef}
                  controls
                  type={recordedBlob.type}
                  className="w-full rounded-md"
                  key={recordedBlob.size} // Force re-render on blob change
                  onError={(e) => {
                    console.error("Video element error:", e);
                    setPreviewError("Video failed to load. Try re-recording.");
                  }}
                />
                {previewError && (
                  <p className="text-red-500 mt-2">{previewError}</p>
                )}
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={handlePlayPreview}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={handleUseRecording}
                    className="bg-green-600 text-white px-4 py-2 rounded-md"
                    disabled={!recordedBlob}
                  >
                    ✅ Use Recording
                  </button>
                  <button
                    onClick={handleDiscardRecording}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    🗑️ Discard
                  </button>
                </div>
              </>
            ) : (
              <p className="text-red-500">No recording available for preview.</p>
            )}
          </div>
        );
      case "idle":
      default:
        return (
          <div className="text-center">
            <div className="flex justify-center gap-4 mb-4">
              <label>
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={() => setAudioEnabled(!audioEnabled)}
                />
                Audio
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={videoEnabled}
                  onChange={() => setVideoEnabled(!videoEnabled)}
                />
                Video
              </label>
            </div>
            <button
              onClick={handleStartRecording}
              className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
              disabled={!audioEnabled && !videoEnabled}
            >
              Start Recording
            </button>
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6 space-y-8">
      {/* --- Section 1: File Uploads --- */}
      <div>
        <h2 className="text-xl font-semibold mb-3">📂 Upload Files</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex-1 cursor-pointer bg-gray-100 hover:bg-gray-200 text-center p-4 rounded-md border-2 border-dashed">
            <span>💻 Upload from Device</span>
            <input
              type="file"
              multiple
              onChange={handleLocalFileChange}
              className="hidden"
            />
          </label>
          <button
            onClick={handleAuthClick}
            disabled={!gapiLoaded || !pickerApiLoaded}
            className="flex-1 bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300"
          >
            ☁️ Upload from Google Drive
          </button>
        </div>
      </div>

      {/* --- Section 2: Live Recording --- */}
      <div>
        <h2 className="text-xl font-semibold mb-3">🔴 Live Recording</h2>
        <div className="bg-gray-200 rounded-md p-4">{renderRecordingUI()}</div>
      </div>

      {/* --- Media Preview List --- */}
      {mediaFiles.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Selected Media</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {mediaFiles.map((file, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span>
                  {file.name} {file.isFromDrive && "(Google Drive)"}
                </span>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-red-500 font-bold ml-4"
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* --- Navigation Buttons --- */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={prevStep}
          className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
        >
          ⬅️ Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Next ➡️
        </button>
      </div>
    </div>
  );
};

export default CapsuleFormMedia;