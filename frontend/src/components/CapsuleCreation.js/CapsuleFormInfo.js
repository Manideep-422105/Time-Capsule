import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDetails } from "../../redux/slices/CapsuleSlice";

const CapsuleFormInfo = ({ nextStep }) => {
  const dispatch = useDispatch();
  const details = useSelector((state) => state.capsule.details);

  const [form, setForm] = useState(details);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    dispatch(setDetails(form));
    nextStep();
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4">📝 Capsule Details</h2>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <textarea
        name="message"
        placeholder="Message"
        value={form.message}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <input
        type="text"
        name="receiver"
        placeholder="Receiver"
        value={form.receiver}
        onChange={handleChange}
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleNext}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Next ➡️
      </button>
    </div>
  );
};

export default CapsuleFormInfo;
