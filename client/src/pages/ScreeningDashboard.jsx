import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchScreenings, deleteScreening } from "../redux/screeningsSlice";
import { toast } from "react-toastify";
import {
  Eye,
  Edit,
  Trash2
} from "lucide-react";

const ScreeningDashboard = () => {
  const dispatch = useDispatch();
  const { screenings, loading, error } = useSelector((state) => state.screenings);

  useEffect(() => {
    dispatch(fetchScreenings());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to void this screening?")) {
      try {
        await dispatch(deleteScreening(id)).unwrap();
        toast.success("Screening voided successfully");
      } catch (err) {
        toast.error(err || "Failed to void screening");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Screening Dashboard</h2>

      {loading && <p className="text-gray-500">Loading screenings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="py-3 px-6 text-left">Patient</th>
              <th className="py-3 px-6 text-left">MRN</th>
              <th className="py-3 px-6 text-left">Screening Date</th>
              <th className="py-3 px-6 text-left">Facility</th>
              <th className="py-3 px-6 text-left">Outcome</th>
              <th className="py-3 px-6 text-left">Created By</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {screenings.length > 0 ? (
              screenings.map((screening) => (
                <tr
                  key={screening._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="py-3 px-6">
                    {screening.patient?.firstName} {screening.patient?.lastName}
                  </td>
                  <td className="py-3 px-6">{screening.patient?.mrn}</td>
                  <td className="py-3 px-6">
                    {new Date(screening.screeningDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-6">{screening.facilityName}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        screening.screeningOutcome === "suspected_tb"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {screening.screeningOutcome === "suspected_tb"
                        ? "Suspected TB"
                        : "Not Suspected"}
                    </span>
                  </td>
                  <td className="py-3 px-6">{screening.createdBy?.name}</td>
                  <td className="py-3 px-6 text-center flex justify-center gap-3">
                    {/* Details */}
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {/* Edit */}
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg shadow-md flex items-center gap-1"
                      title="Edit Screening"
                    >
                      <Edit size={18} />
                    </button>

                    {/* Delete / Void */}
                    <button
                      onClick={() => handleDelete(screening._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-md flex items-center gap-1"
                      title="Void Screening"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-6 text-center text-gray-500 italic"
                >
                  No screenings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScreeningDashboard;
