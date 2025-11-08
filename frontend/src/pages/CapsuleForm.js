import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    unlockAt: "",
  });
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken"); // ✅ your JWT

      const data = new FormData();
      data.append("title", formData.title);
      data.append("message", formData.message);
      data.append("unlockAt", formData.unlockAt);
      if (media) data.append("media", media);

      const res = await axios.post(
        "http://localhost:5454/api/v1/capsule/create-capsule",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        alert("Capsule created successfully!");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating capsule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Create Capsule</h2>

        <label className="block mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <label className="block mb-2">Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
        />

        <label className="block mb-2">Unlock At</label>
        <input
          type="datetime-local"
          name="unlockAt"
          value={formData.unlockAt}
          onChange={handleChange}
          className="w-full p-2 mb-3 border rounded"
          required
        />

        <label className="block mb-2">Media</label>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full mb-4"
          accept="image/*,video/*"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Creating..." : "Create Capsule"}
        </button>
      </form>
    </div>
  );
};

export default CreateCapsule;
