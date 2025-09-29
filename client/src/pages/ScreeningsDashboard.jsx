import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreenings,
  deleteScreening,
  screeningsSelectors,
} from "../redux/slices/screeningSlice";
import ScreeningForm from "./ScreeningForm";
import ScreeningDetailsPage from "./ScreeningDetailsPage";
import { toast } from "react-toastify";

const ScreeningsDashboard = () => {
  const dispatch = useDispatch();

  const screenings = useSelector(screeningsSelectors.selectAll);
  const loading = useSelector((state) => state.screenings.loading);
  const error = useSelector((state) => state.screenings.error);

  const patients = useSelector((state) => state.patients.items || []);

  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState(null);

  useEffect(() => {
    dispatch(fetchScreenings());
  }, [dispatch]);

  if (loading === "pending") return <p>Loading screenings...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteScreening(id)).unwrap();
      toast.success("Screening deleted successfully");
    } catch (err) {
      toast.error(err || "Failed to delete screening");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Screenings</h2>

      {/* Add New Screening */}
      <button
        onClick={() => {
          setSelectedScreening(null);
          setShowForm(true);
        }}
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
      >
        + New Screening
      </button>

      {/* Screening Form */}
      {showForm && (
        <ScreeningForm
          patients={patients}
          onClose={() => setShowForm(false)}
          existingData={selectedScreening}
        />
      )}

      {/* Screening Details */}
      {showDetail && selectedScreening && (
        <ScreeningDetailsPage
          screeningId={selectedScreening}
          onClose={() => setShowDetail(false)}
        />
      )}

      {/* Screenings List */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">Patient</th>
            <th className="border px-3 py-2">Date</th>
            <th className="border px-3 py-2">Type</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {screenings.map((s) => (
            <tr key={s._id}>
              <td className="border px-3 py-2">
                {s.patient?.firstName} {s.patient?.lastName}
              </td>
              <td className="border px-3 py-2">
                {new Date(s.screeningDate || s.date).toLocaleDateString()}
              </td>
              <td className="border px-3 py-2">{s.type}</td>
              <td className="border px-3 py-2 space-x-2">
                <button
                  onClick={() => {
                    setSelectedScreening(s._id);
                    setShowDetail(true);
                  }}
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 shadow"
                >
                  Details
                </button>
                <button
                  onClick={() => {
                    setSelectedScreening(s);
                    setShowForm(true);
                  }}
                  className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 shadow"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 shadow"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {screenings.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-3 text-gray-500">
                No screenings available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ScreeningsDashboard;
