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
  const { entities: labTests } = useSelector((state) => state.labTests);

  // Patients (fixed: now using items from slice, not entities)
  const patients = useSelector((state) => state.patients.items);

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
    dispatch(fetchPatients({ page: 1, limit: 100 })); // fetch patients for dropdown
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

  const filteredLabTests = Object.values(labTests || {}).filter((test) => {
    return (
      (!filters.q ||
        test.patient?.firstName?.toLowerCase().includes(filters.q.toLowerCase()) ||
        test.patient?.lastName?.toLowerCase().includes(filters.q.toLowerCase()) ||
        test.patient?.mrn?.includes(filters.q)) &&
      (!filters.testType || test.testType === filters.testType) &&
      (!filters.status || test.status === filters.status)
    );
  });

  return (
    <div className="p-4">
      {/* Dashboard Title and New Button */}
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
          placeholder="Search patient"
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

      {/* Lab Tests Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="border px-2 py-1">Patient</th>
              <th className="border px-2 py-1">MRN</th>
              <th className="border px-2 py-1">Test Type</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Priority</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLabTests.map((test) => (
              <tr key={test._id} className="hover:bg-gray-100">
                <td className="border px-2 py-1 text-black">
                  {test.patient?.firstName} {test.patient?.lastName}
                </td>
                <td className="border px-2 py-1 text-black">{test.patient?.mrn}</td>
                <td className="border px-2 py-1 text-black">{test.testType}</td>
                <td className="border px-2 py-1 text-black">{test.status}</td>
                <td className="border px-2 py-1 text-black">{test.priority}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      setShowForm(true);
                    }}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      setShowDetail(true);
                    }}
                    className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredLabTests.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-black py-4">
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
        <LabTestDetail
          test={selectedTest}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  );
};

export default LabTestsPage;
