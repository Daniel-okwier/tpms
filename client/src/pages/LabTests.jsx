import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchLabTests } from "../redux/slices/labTestsSlice";
import LabTestForm from "./LabTestForm";
import LabTestDetail from "./LabTestDetail";

const LabTestsPage = () => {
  const dispatch = useDispatch();
  const tests = useSelector((state) =>
    state.labTests.ids.map((id) => state.labTests.entities[id])
  );
  const loading = useSelector((state) => state.labTests.loading);

  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    dispatch(fetchLabTests());
  }, [dispatch]);

  const handleCreate = () => {
    setSelectedTest(null); // ensure form is in create mode
    setShowForm(true);
  };

  const handleEdit = (test) => {
    setSelectedTest(test);
    setShowForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">Lab Tests</h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          New Lab Test
        </button>
      </div>

      {loading === "pending" ? (
        <p className="text-black">Loading lab tests...</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-black">Patient</th>
                <th className="px-4 py-2 text-left text-black">Test Type</th>
                <th className="px-4 py-2 text-left text-black">Status</th>
                <th className="px-4 py-2 text-left text-black">Priority</th>
                <th className="px-4 py-2 text-left text-black">Order Date</th>
                <th className="px-4 py-2 text-left text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tests.length > 0 ? (
                tests.map((test) => (
                  <tr
                    key={test._id}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <td
                      className="px-4 py-2 text-black"
                      onClick={() => setSelectedTest(test)}
                    >
                      {test.patient?.firstName} {test.patient?.lastName}
                    </td>
                    <td
                      className="px-4 py-2 text-black"
                      onClick={() => setSelectedTest(test)}
                    >
                      {test.testType}
                    </td>
                    <td
                      className="px-4 py-2 text-black"
                      onClick={() => setSelectedTest(test)}
                    >
                      {test.status}
                    </td>
                    <td
                      className="px-4 py-2 text-black"
                      onClick={() => setSelectedTest(test)}
                    >
                      {test.priority}
                    </td>
                    <td
                      className="px-4 py-2 text-black"
                      onClick={() => setSelectedTest(test)}
                    >
                      {new Date(test.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleEdit(test)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-2 text-center text-black"
                  >
                    No lab tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <LabTestForm
          onClose={() => {
            setShowForm(false);
            setSelectedTest(null);
          }}
          existingTest={selectedTest}
        />
      )}

      {/* Details Drawer */}
      {selectedTest && (
        <LabTestDetail
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
};

export default LabTestsPage;
