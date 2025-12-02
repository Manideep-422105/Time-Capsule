"use client";

import { openCapsule } from "@/app/actions/capsule";
import { Unlock, Loader2 } from "lucide-react";
import { useState } from "react";

export default function OpenButton({ capsuleId, senderId }: { capsuleId: string, senderId: string }) {
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    const result = await openCapsule(capsuleId, senderId);
    
    if (result.url) {
        // Redirect the user to the secure file
        window.open(result.url, "_blank");
    } else {
        alert("Error opening capsule: " + result.error);
    }
    setLoading(false);
  };

  return (
    <button 
        onClick={handleOpen}
        disabled={loading}
        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-full transition flex items-center gap-1 shadow-lg shadow-green-900/50"
    >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
        {loading ? "Opening..." : "Open"}
    </button>
  );
}