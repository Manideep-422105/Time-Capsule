"use client";

import { deleteCapsule } from "@/app/actions/capsule";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";

export default function DeleteButton({ capsuleId }: { capsuleId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this memory? This cannot be undone.")) return;
    
    setLoading(true);
    const result = await deleteCapsule(capsuleId);
    if (result?.error) {
        alert(result.error);
        setLoading(false);
    }
    // No need to set loading false on success, the page will refresh
  };

  return (
    <button 
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition"
        title="Delete Capsule"
    >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}