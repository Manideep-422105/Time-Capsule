import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuth from "../components/GoogleAuth";
import { toast } from "react-toastify";
import bgImage from "../assets/Background1.png"; // ✅ Import image

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return toast.error("Please fill all details");
    }
    const loadingToast = toast.loading("Logging in...");
    try {
      const res = await fetch("http://localhost:5454/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      toast.dismiss(loadingToast);

      if (res.ok && data.success) {
        toast.success("Login successful!");
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("An error occurred. Please try again.");
      console.error("Login form submission error:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`, // ✅ Correct usage
      }}
    >
      <div className="relative px-6 py-10 bg-white/10 backdrop-blur-md shadow-lg rounded-3xl sm:p-10 border border-white/20 w-full max-w-xl">
        <form onSubmit={handleSubmit}>
          <label
            className="font-semibold text-sm text-gray-100 pb-1 block"
            htmlFor="email"
          >
            E-mail
          </label>
          <input
            id="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
            className="border border-white/30 bg-white/20 text-black rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your email"
          />

          <label
            className="font-semibold text-sm text-gray-100 pb-1 block"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="border border-white/30 bg-white/20 text-black rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your password"
          />

          {/* Google Login */}
          <GoogleAuth />

          <button
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white w-full rounded-lg mt-4 transition duration-300"
            type="submit"
          >
            Log in
          </button>

          {/* Sign Up link */}
          <p className="mt-4 text-center text-sm text-black">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-black font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
