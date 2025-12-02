"use client";

import { registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
// 1. Import signIn
import { signIn } from "next-auth/react"; 

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await registerUser(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/signin"); 
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>

        {/* --- GOOGLE BUTTON START --- */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 bg-white text-black p-2 rounded mb-4 hover:bg-gray-200 transition font-medium"
        >
          <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>
        {/* --- GOOGLE BUTTON END --- */}

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-2 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input name="name" type="text" placeholder="Name" required className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" />
          <input name="email" type="email" placeholder="Email" required className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" />
          <input name="password" type="password" placeholder="Password" required className="p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:border-blue-500" />
          <button type="submit" disabled={loading} className="w-full p-2 bg-blue-600 rounded hover:bg-blue-500 transition font-bold disabled:opacity-50">
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <a href="/signin" className="text-blue-400 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}