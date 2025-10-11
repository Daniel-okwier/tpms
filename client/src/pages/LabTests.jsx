import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLabTests, deleteLabTest } from "../redux/slices/labTestsSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import LabTestForm from "./LabTestForm";
import LabTestDetail from "./LabTestDetail";
import { toast } from "react-toastify";

const LabTestsPage = () => {
  const dispatch = useDispatch();

  // Lab tests
  const { entities: labTests, loading, error } = useSelector(
    (state) => state.labTests
  );

  // Patients
  const patients = useSelector((state) => state.patients.items || []);

  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [filters, setFilters] = useState({
    q: "",
    testType: "",
    status: "",
  });

  useEffect(() => {
    dispatch(fetchLabTests());
    dispatch(fetchPatients({ page: 1, limit: 100 }));
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lab test?")) return;

    try {
      await dispatch(deleteLabTest(id)).unwrap();
      toast.success("Lab test deleted successfully");
      dispatch(fetchLabTests());
    } catch (err) {
      toast.error(err.message || "Failed to delete lab test");
    }
  };

  const handleEdit = (test) => {
    setSelectedTest(test);
    setShowForm(true);
  };

  // ✅ Group lab tests by patient to avoid multiple rows for same patient
  const groupedLabTests = Object.values(labTests || {}).reduce((acc, test) => {
    const patientId = test.patient?._id || test.patientId;
    if (!patientId) return acc;

    if (!acc[patientId]) {
      acc[patientId] = {
        ...test,
        testTypes: [test.testType],
        allStatuses: [test.status],
      };
    } else {
      acc[patientId].testTypes.push(test.testType);
      acc[patientId].allStatuses.push(test.status);
    }

    return acc;
  }, {});

  // Convert grouped object to array
  const groupedTestsArray = Object.values(groupedLabTests);

  const filteredLabTests = groupedTestsArray.filter((test) => {
    return (
      (!filters.q ||
        test.patient?.firstName?.toLowerCase().includes(filters.q.toLowerCase()) ||
        test.patient?.lastName?.toLowerCase().includes(filters.q.toLowerCase()) ||
        test.patient?.mrn?.includes(filters.q) ||
        test.patientId?.toLowerCase().includes(filters.q.toLowerCase())) &&
      (!filters.testType || test.testTypes.includes(filters.testType)) &&
      (!filters.status || test.allStatuses.includes(filters.status))
    );
  });

  return (
    <div className="p-4">
      {/* Title + New button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Lab Tests</h1>
        <button
          onClick={() => {
            setSelectedTest(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Lab Test
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by patient name, MRN, or ID"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          className="border px-2 py-1 rounded text-black"
        />
        <select
          value={filters.testType}
          onChange={(e) => setFilters({ ...filters, testType: e.target.value })}
          className="border px-2 py-1 rounded text-black"
        >
          <option value="">All Test Types</option>
          <option value="GeneXpert">GeneXpert</option>
          <option value="Smear Microscopy">Smear Microscopy</option>
          <option value="Culture">Culture</option>
          <option value="Chest X-ray">Chest X-ray</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border px-2 py-1 rounded text-black"
        >
          <option value="">All Status</option>
          <option value="ordered">Ordered</option>
          <option value="specimen_collected">Specimen Collected</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="verified">Verified</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 bg-white text-black rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border px-2 py-2 text-left">Patient</th>
              <th className="border px-2 py-2 text-left">MRN</th>
              <th className="border px-2 py-2 text-left">Test Types</th>
              <th className="border px-2 py-2 text-left">Statuses</th>
              <th className="border px-2 py-2 text-left">Priority</th>
              <th className="border px-2 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading === "pending" && (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Loading lab tests...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan="6" className="text-center text-red-500 py-4">
                  {typeof error === "string" ? error : "Failed to load lab tests"}
                </td>
              </tr>
            )}

            {loading === "succeeded" &&
              !error &&
              filteredLabTests.map((test) => (
                <tr key={test._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {test.patient
                      ? `${test.patient.firstName} ${test.patient.lastName}`
                      : test.patientId || "N/A"}
                  </td>
                  <td className="px-4 py-2">{test.patient?.mrn || "N/A"}</td>
                  <td className="px-4 py-2">
                    {test.testTypes.join(", ")}
                  </td>
                  <td className="px-4 py-2">
                    {Array.from(new Set(test.allStatuses)).join(", ")}
                  </td>
                  <td className="px-4 py-2">{test.priority || "N/A"}</td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(test)}
                      className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 shadow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 shadow"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTest(test);
                        setShowDetail(true);
                      }}
                      className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 shadow"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}

            {loading === "succeeded" &&
              !error &&
              filteredLabTests.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No lab tests found
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showForm && (
        <LabTestForm
          existingTest={selectedTest}
          patients={patients}
          onClose={() => setShowForm(false)}
        />
      )}

      {showDetail && (
        <LabTestDetail test={selectedTest} onClose={() => setShowDetail(false)} />
      )}
    </div>
  );
};

export default LabTestsPage;