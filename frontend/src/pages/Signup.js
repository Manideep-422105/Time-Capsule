import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bgImage from "../assets/Signup_BG1.jpg"; // replace with your image

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:5454/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Google signup successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(data.message || "Google signup failed!");
      }
    } catch {
      toast.error("Error during Google signup.");
    }
  };

  const handleGoogleFailure = (error) => {
    toast.error("Google Signup Failed");
    console.error(error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.warn("Passwords do not match!");
      return;
    }
    try {
      const res = await fetch("http://localhost:5454/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Signup successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        toast.error(data.message || "Signup failed. Please try again.");
      }
    } catch {
      toast.error("An error occurred during signup.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-end bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundColor: "rgba(0, 0, 0, 0.4)", // transparent overlay
        backgroundBlendMode: "overlay", // blend transparency with image
      }}
    >
      <div className="w-full max-w-md mr-24 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-lg p-8">
        <form onSubmit={handleSubmit}>
          <label className="font-semibold text-sm text-gray-100 pb-1 block" htmlFor="name">
            Name
          </label>
          <input
            className="border border-white/30 bg-white/20 text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />

          <label className="font-semibold text-sm text-gray-100 pb-1 block" htmlFor="email">
            E-mail
          </label>
          <input
            className="border border-white/30 bg-white/20 text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />

          <label className="font-semibold text-sm text-gray-100 pb-1 block" htmlFor="password">
            Password
          </label>
          <input
            className="border border-white/30 bg-white/20 text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <label className="font-semibold text-sm text-gray-100 pb-1 block" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            className="border border-white/30 bg-white/20 text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            required
          />

          {/* Google Signup */}
          <div className="flex justify-center w-full mb-5">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
          </div>

          <button
            className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white w-full rounded-lg mt-2 transition duration-300"
            type="submit"
          >
            Sign Up
          </button>

          <p className="mt-4 text-center text-sm text-gray-200">
            Already have an account?{" "}
            <Link to="/" className="text-green-300 hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Signup;
