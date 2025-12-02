"use client";

import { deleteCapsule } from "@/app/actions/capsule";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteButton({ capsuleId }: { capsuleId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    // We can use a toast to confirm instead of window.confirm if we wanted,
    // but window.confirm is safer.
    if (!confirm("Are you sure?")) return;

    setLoading(true);
    const toastId = toast.loading("Deleting memory...");

    const result = await deleteCapsule(capsuleId);

    if (result?.error) {
      toast.error(result.error, { id: toastId });
      setLoading(false);
    } else {
      toast.success("Memory deleted forever.", { id: toastId });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-full transition"
      title="Delete Capsule"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  );
}
