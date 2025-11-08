import { GoogleOAuthProvider } from "@react-oauth/google";
import MediaRecorder from "./components/MediaRecorder";
import Login from "./pages/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import DashBoard from "./pages/DashBoard";
// import CreateCapsule from "./pages/CapsuleForm";
import CreateCapsule from "./pages/CreateCapsule";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <GoogleOAuthProvider clientId="224007734413-5ho2k8t00sh1gk6jnqstg3r35ov6afuf.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/create-capsule" element={<CreateCapsule/>}/>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </GoogleOAuthProvider>
  );
}
export default App;
