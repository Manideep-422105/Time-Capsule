"use client";
import { registerUser } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    const result = await registerUser(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/signin");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form action={handleSubmit} className="flex flex-col gap-4 w-80">
        <input name="name" type="text" placeholder="Name" required className="p-2 rounded bg-gray-800" />
        <input name="email" type="email" placeholder="Email" required className="p-2 rounded bg-gray-800" />
        <input name="password" type="password" placeholder="Password" required className="p-2 rounded bg-gray-800" />
        <button type="submit" className="p-2 bg-blue-600 rounded hover:bg-blue-500">Register</button>
      </form>
    </div>
  );
}