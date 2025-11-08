import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetCapsule } from "../../redux/slices/CapsuleSlice";


const CapsuleReview = ({ prevStep }) => {
  const dispatch = useDispatch();
  const { details, mediaFiles } = useSelector((state) => state.capsule);

  const handleSubmit = () => {
    console.log("🚀 Submitting capsule:", { details, mediaFiles });
    alert("✅ Capsule submitted!");
    dispatch(resetCapsule());
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mt-6">
      <h2 className="text-2xl font-semibold mb-4">📦 Review Capsule</h2>

      <div className="mb-6">
        <h3 className="font-medium">📝 Details</h3>
        <p><strong>Title:</strong> {details.title}</p>
        <p><strong>Message:</strong> {details.message}</p>
        <p><strong>Receiver:</strong> {details.receiver}</p>
      </div>

      <div className="mb-6">
        <h3 className="font-medium">🎥 Media</h3>
        {mediaFiles.length > 0 ? (
          <ul className="list-disc pl-5">
            {mediaFiles.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        ) : (
          <p>No media uploaded</p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
        >
          ⬅️ Back
        </button>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          ✅ Submit
        </button>
      </div>
    </div>
  );
};

export default CapsuleReview;
