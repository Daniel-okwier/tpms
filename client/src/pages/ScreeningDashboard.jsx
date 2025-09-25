import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreenings,
  deleteScreening,
  setFilters,
  setPage,
  screeningsSelectors,
} from "@/redux/screeningsSlice";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const ScreeningDashboard = () => {
  const dispatch = useDispatch();
  const screenings = useSelector(screeningsSelectors.selectAll);
  const { loading, error, page, limit, total, filters } = useSelector(
    (state) => state.screenings
  );

  const [search, setSearch] = useState(filters.q || "");
  const [outcome, setOutcome] = useState(filters.outcome || "");

  useEffect(() => {
    dispatch(fetchScreenings({ page, ...filters }));
  }, [dispatch, page, filters]);

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteScreening(id)).unwrap();
      toast.success("Screening voided successfully");
    } catch (err) {
      toast.error(err || "Failed to void screening");
    }
  };

  const handleFilterApply = () => {
    dispatch(setFilters({ q: search, outcome }));
    dispatch(setPage(1));
  };

  const handleReset = () => {
    setSearch("");
    setOutcome("");
    dispatch(setFilters({ q: "", outcome: "" }));
    dispatch(setPage(1));
  };

  const renderOutcomeBadge = (status) => {
    if (status === "suspected_tb") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          Suspected TB
        </span>
      );
    }
    if (status === "not_suspected") {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          Not Suspected
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
        Unknown
      </span>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Screenings Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by patient name or MRN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md p-2 flex-1"
        />

        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="border rounded-md p-2"
        >
          <option value="">All Outcomes</option>
          <option value="suspected_tb">Suspected TB</option>
          <option value="not_suspected">Not Suspected</option>
        </select>

        <Button onClick={handleFilterApply} className="bg-blue-600 text-white">
          Apply
        </Button>
        <Button onClick={handleReset} variant="outline">
          Reset
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Patient</th>
              <th className="px-4 py-2 text-left">MRN</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Outcome</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading === "pending" ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : screenings.length > 0 ? (
              screenings.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="px-4 py-2">
                    {s.patient?.firstName} {s.patient?.lastName}
                  </td>
                  <td className="px-4 py-2">{s.patient?.mrn}</td>
                  <td className="px-4 py-2">
                    {new Date(s.screeningDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{renderOutcomeBadge(s.screeningOutcome)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md"
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-red-500 text-white px-3 py-1 rounded-md"
                      onClick={() => handleDelete(s._id)}
                    >
                      Delete
                    </Button>
                    <Button className="bg-blue-500 text-white px-3 py-1 rounded-md">
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No screenings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p>
          Page {page} of {Math.ceil(total / limit) || 1}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => dispatch(setPage(page - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            onClick={() => dispatch(setPage(page + 1))}
            disabled={page >= Math.ceil(total / limit)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningDashboard;
