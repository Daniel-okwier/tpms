import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLabTests,
  labTestsSelectors,
  setFilters,
  setPage,
  deleteLabTest,
} from "../redux/slices/labTestsSlice";
import LabTestForm from "./LabTestForm";
import LabTestDetail from "./LabTestDetail";

const LabTestsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const labTests = useSelector(labTestsSelectors.selectAll);
  const loading = useSelector((state) => state.labTests.loading);
  const total = useSelector((state) => state.labTests.total);
  const page = useSelector((state) => state.labTests.page);
  const filters = useSelector((state) => state.labTests.filters);

  const [search, setSearch] = useState("");
  const [selectedTest, setSelectedTest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    dispatch(fetchLabTests());
  }, [dispatch, page, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, q: search }));
  };

  const handleView = (test) => {
    setSelectedTest(test);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setSelectedTest(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lab test?")) return;
    try {
      await dispatch(deleteLabTest(id)).unwrap();
      dispatch(fetchLabTests());
    } catch (err) {
      console.error("Failed to delete lab test:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Lab Tests Dashboard</h2>
        {(user?.role === "doctor" || user?.role === "nurse") && (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Lab Test
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-2 items-end">
        <input
          type="text"
          placeholder="Search by patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-1 flex-1 min-w-[150px]"
        />

        <select
          value={filters.testType}
          onChange={(e) => dispatch(setFilters({ ...filters, testType: e.target.value }))}
          className="border rounded px-3 py-1"
        >
          <option value="">All Test Types</option>
          {["GeneXpert", "Smear Microscopy", "Culture", "Chest X-ray", "Other"].map(
            (type) => (
              <option key={type} value={type}>
                {type}
              </option>
            )
          )}
        </select>

        <select
          value={filters.status}
          onChange={(e) => dispatch(setFilters({ ...filters, status: e.target.value }))}
          className="border rounded px-3 py-1"
        >
          <option value="">All Statuses</option>
          {[
            "ordered",
            "specimen_collected",
            "in_progress",
            "completed",
            "verified",
            "cancelled",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Apply
        </button>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            dispatch(setFilters({ q: "", testType: "", status: "" }));
          }}
          className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400"
        >
          Reset
        </button>
      </form>

      {/* Lab Tests Table */}
      {loading === "pending" ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {["Patient", "Test Type", "Status", "Ordered By", "Order Date", "Actions"].map(
                (h) => (
                  <th key={h} className="border px-2 py-1">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {[...Array(6)].map((__, i) => (
                  <td key={i} className="border px-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Patient</th>
              <th className="border px-2 py-1">Test Type</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Ordered By</th>
              <th className="border px-2 py-1">Order Date</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labTests.map((test) => (
              <tr key={test._id}>
                <td className="border px-2 py-1">{test.patient?.name}</td>
                <td className="border px-2 py-1">{test.testType}</td>
                <td className="border px-2 py-1">{test.status}</td>
                <td className="border px-2 py-1">{test.orderedBy?.name}</td>
                <td className="border px-2 py-1">
                  {new Date(test.orderDate).toLocaleDateString()}
                </td>
                <td className="border px-2 py-1 flex gap-1">
                  <button
                    onClick={() => handleView(test)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    View
                  </button>
                  {(user?.role === "doctor" || user?.role === "lab_staff") && (
                    <button
                      onClick={() => {
                        setSelectedTest(test);
                        setShowForm(true);
                      }}
                      className="px-2 py-1 bg-yellow-300 rounded hover:bg-yellow-400"
                    >
                      Edit
                    </button>
                  )}
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>Total: {total}</span>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={page === 1}
          >
            Prev
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => dispatch(setPage(page + 1))}
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={page * 12 >= total}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      {showForm && <LabTestForm test={selectedTest} onClose={() => setShowForm(false)} />}
      {showDetail && <LabTestDetail test={selectedTest} onClose={() => setShowDetail(false)} />}
    </div>
  );
};

export default LabTestsPage;
