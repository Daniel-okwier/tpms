import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreenings,
  deleteScreening,
  screeningsSelectors,
} from "@/redux/slices/screeningsSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Eye, Edit } from "lucide-react";

const ScreeningDashboard = () => {
  const dispatch = useDispatch();

  // Normalized selectors
  const screenings = useSelector(screeningsSelectors.selectAll);
  const loading = useSelector((state) => state.screenings.loading);
  const error = useSelector((state) => state.screenings.error);

  // Load screenings on mount
  useEffect(() => {
    dispatch(fetchScreenings());
  }, [dispatch]);

  // Handle delete/void
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteScreening(id)).unwrap();
      toast.success("Screening record voided successfully");
    } catch (err) {
      toast.error(err || "Failed to void screening");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Screenings</h2>

      {/* Loading */}
      {loading === "pending" && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-500 text-center mb-4">
          Error: {error}
        </div>
      )}

      {/* Table */}
      {loading !== "pending" && screenings.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">
                  Screening Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-black">
              {screenings.map((screening) => (
                <tr key={screening._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {screening.patient?.firstName} {screening.patient?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {screening.screeningType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {screening.result}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(screening.screeningDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    {/* Details */}
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {/* Edit */}
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      onClick={() => handleDelete(screening._id)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        loading !== "pending" &&
        !error && (
          <div className="text-center text-gray-600 py-10">
            No screening records found.
          </div>
        )
      )}
    </div>
  );
};

export default ScreeningDashboard;
