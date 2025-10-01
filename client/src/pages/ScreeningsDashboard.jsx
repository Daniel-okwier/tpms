import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreenings,
  deleteScreening,
  voidScreening,
  setFilters,
  setPage,
  screeningSelectors,
} from "@/redux/slices/screeningSlice";
import { fetchPatients } from "@/redux/slices/patientSlice";
import ScreeningForm from "./ScreeningForm";
import ScreeningDetail from "./ScreeningDetailsPage";
import { toast } from "react-toastify";

const ScreeningsDashboard = () => {
  const dispatch = useDispatch();

  // state from slice (entity adapter)
  const screeningsState = useSelector((state) => state.screenings);
  const screenings = useSelector(screeningSelectors.selectAll);
  const { loading, error, total, page, limit, filters } = screeningsState;

  // patients for dropdown
  const patients = useSelector((state) => state.patients.items || []);

  // local UI state
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [localQuery, setLocalQuery] = useState(filters.q || "");

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 200 }));
    dispatch(fetchScreenings({ page, limit, q: filters.q }));
  }, [dispatch, page, limit, filters.q]);

  const openCreate = () => {
    setSelectedScreening(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setSelectedScreening(s);
    setShowForm(true);
  };

  const openDetails = (id) => {
    setSelectedScreening(id);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will permanently delete the screening.")) return;
    try {
      await dispatch(deleteScreening(id)).unwrap();
      toast.success("Screening deleted");
      dispatch(fetchScreenings({ page, limit, q: filters.q }));
    } catch (err) {
      toast.error(err || "Failed to delete screening");
    }
  };

  const handleVoid = async (id) => {
    if (!window.confirm("Void this screening? This keeps the record but marks it voided.")) return;
    try {
      await dispatch(voidScreening({ id, reason: "Voided from dashboard" })).unwrap();
      toast.success("Screening voided");
      dispatch(fetchScreenings({ page, limit, q: filters.q }));
    } catch (err) {
      toast.error(err || "Failed to void screening");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ ...filters, q: localQuery }));
    dispatch(setPage(1));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.max(1, Math.ceil(total / limit))) {
      dispatch(setPage(newPage));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Screenings</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Screening
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex w-full max-w-md">
          <input
            placeholder="Search by MRN or patient name"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="border px-2 py-1 rounded-l text-black w-full"
          />
          <button className="px-4 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 bg-white text-black rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border px-2 py-2 text-left">Patient</th>
              <th className="border px-2 py-2 text-left">MRN</th>
              <th className="border px-2 py-2 text-left">Date</th>
              <th className="border px-2 py-2 text-left">Outcome</th>
              <th className="border px-2 py-2 text-left">Priority</th>
              <th className="border px-2 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading === "pending" && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading screenings...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan="6" className="text-center text-red-500 py-4">
                  {typeof error === "string" ? error : "Failed to load screenings"}
                </td>
              </tr>
            )}

            {loading === "succeeded" &&
              screenings.map((s) => (
                <tr key={s._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {s.patient ? `${s.patient.firstName} ${s.patient.lastName}` : "N/A"}
                  </td>
                  <td className="px-4 py-2">{s.patient?.mrn || "N/A"}</td>
                  <td className="px-4 py-2">{new Date(s.screeningDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {s.screeningOutcome === "suspected_tb" ? "Suspected TB" : "Not Suspected"}
                  </td>
                  <td className="px-4 py-2">{s.priority}</td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button
                      onClick={() => openEdit(s)}
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
                    <button
                      onClick={() => openDetails(s._id)}
                      className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 shadow"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleVoid(s._id)}
                      className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-800 shadow"
                    >
                      Void
                    </button>
                  </td>
                </tr>
              ))}

            {loading === "succeeded" && screenings.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No screenings found
                </td>
              </tr>
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
            <button
              className="px-3 py-1 border rounded"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(total / limit)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ScreeningForm
          existingScreening={selectedScreening}
          patients={patients}
          onClose={() => {
            setShowForm(false);
            dispatch(fetchScreenings({ page, limit, q: filters.q }));
          }}
        />
      )}

      {showDetail && (
        <ScreeningDetail
          screeningId={selectedScreening}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};

export default ScreeningsDashboard;
