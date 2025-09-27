import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreenings,
  deleteScreening,
  screeningsSelectors,
  setFilters,
  setPage,
} from "@/redux/slices/screeningSlice";
import Button from "@/components/shared/Button";
import { toast } from "react-hot-toast";

const ScreeningDashboard = () => {
  const dispatch = useDispatch();
  const { loading, error, total, page, limit, filters } = useSelector(
    (state) => state.screenings
  );
  const screenings = useSelector(screeningsSelectors.selectAll);

  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Fetch data on mount and when filters/page change
  useEffect(() => {
    dispatch(fetchScreenings({ page, limit, ...filters }));
  }, [dispatch, page, limit, filters]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteScreening(id)).unwrap();
      toast.success("Screening voided successfully");
    } catch (err) {
      toast.error(err || "Failed to void screening");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(total / limit)) {
      dispatch(setPage(newPage));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, search: searchTerm }));
    dispatch(setPage(1));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header + Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Screening Dashboard
        </h1>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search by MRN or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Button type="submit" variant="primary" size="sm" className="rounded-l-none">
              Search
            </Button>
          </form>

          {/* Add new */}
          <Button
            variant="primary"
            onClick={() => toast("Add new screening clicked!")}
          >
            + New Screening
          </Button>
        </div>
      </div>

      {loading === "pending" && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Facility</th>
              <th className="px-6 py-3">Outcome</th>
              <th className="px-6 py-3">Priority</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {screenings.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No screenings found
                </td>
              </tr>
            ) : (
              screenings.map((s) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {s.patient?.firstName} {s.patient?.lastName}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(s.screeningDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{s.facilityName}</td>
                  <td className="px-6 py-4">
                    {s.screeningOutcome === "suspected_tb" ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                        Suspected TB
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
                        Not Suspected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        s.priority === "priority"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {s.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast("View details clicked!")}
                    >
                      Details
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => toast("Edit clicked!")}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(s._id)}
                    >
                      Void
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600">
            Page {page} of {Math.ceil(total / limit)}
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(total / limit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreeningDashboard;
