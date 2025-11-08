import { useNavigate } from "react-router-dom";

const CapsuleCard = ({ capsule, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div
      key={capsule._id}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 border border-gray-100 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{capsule.title}</h3>

        <p className="text-gray-600 mt-2 line-clamp-3">{capsule.message}</p>

        <p className="text-sm text-gray-500 mt-3">
          ⏰ Unlock At:{" "}
          <span className="font-medium">
            {new Date(capsule.unlockAt).toLocaleString()}
          </span>
        </p>

        {capsule.media && (
          <div className="mt-4">
            <img
              src={capsule.media}
              alt="capsule media"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <button
          onClick={() => navigate(`/edit-capsule/${capsule._id}`)}
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(capsule._id)}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default CapsuleCard;
