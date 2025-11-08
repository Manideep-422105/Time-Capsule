import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const GoogleAuth = () => {
  const navigate = useNavigate();

  const onSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      const decodedGoogleUser = jwtDecode(googleToken);
      console.log("Google User Info:", decodedGoogleUser);

      // Send token to backend
      const res = await fetch("http://localhost:5454/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Account does not exist");
      }
    } catch (err) {
      console.error("Google Login error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const onError = () => {
    console.error("Google Sign-In Failed");
    toast.error("Google Sign-In Failed");
  };

  return <GoogleLogin onSuccess={onSuccess} onError={onError} />;
};

export default GoogleAuth;
