"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        toast.info("Logging out... See you in the future!");
        signOut({ callbackUrl: "/" });
      }}
      className="p-2 text-red-400 hover:bg-red-900/20 rounded-full transition"
      title="Sign Out"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );
}