"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })} // Redirects to home after logout
      className="px-6 py-2 mt-4 bg-red-600 text-white rounded hover:bg-red-500 transition"
    >
      Sign Out
    </button>
  );
}
