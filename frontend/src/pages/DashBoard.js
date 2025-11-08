import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CapsuleCard from "../components/CapsuleCard";
const Dashboard = () => {
  const [capsules, setCapsules] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(
          "http://localhost:5454/api/v1/capsule/user-capsules",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCapsules(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCapsules();
  }, []);

  // Delete capsule
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this capsule?")) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:5454/api/v1/capsule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCapsules(capsules.filter((cap) => cap._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete capsule");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          📦 My Time Capsules
        </h2>
        <button
          onClick={() => navigate("/create-capsule")}
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
        >
          + Create Capsule
        </button>
      </div>

      {/* Capsules List */}
      {capsules.length === 0 ? (
        <p className="text-center text-gray-500">
          No capsules found. Click{" "}
          <span className="font-medium">"Create Capsule"</span> to add one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsules.map((cap) => (
            <CapsuleCard
              key={cap._id}
              capsule={cap}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
