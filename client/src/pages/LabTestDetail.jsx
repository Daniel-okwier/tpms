import React, { useState, useEffect } from "react";
import axios from "axios";
import LabTestForm from "./LabTestForm";

const LabTestDetail = ({ test, onClose }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [patientTests, setPatientTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all tests for this patient
  useEffect(() => {
    if (!test?.patient?._id) return;

    const fetchPatientTests = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/labtests/patient/${test.patient._id}`
        );

        // Handle both array and wrapped response formats
        const data =
          Array.isArray(response.data)
            ? response.data
            : response.data.data || response.data.patientTests || [];

        setPatientTests(data);
      } catch (err) {
        console.error("Error fetching patient lab tests:", err);
        setError("Failed to load patient lab tests.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientTests();
  }, [test?.patient?._id]);

  if (!test) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-lg z-50 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Lab Test Details</h2>
          <button
            onClick={onClose}
            className="text-gray-700 font-bold text-lg hover:text-gray-900"
          >
            ×
          </button>
        </div>

        {/* Patient Info */}
        <div className="space-y-2 text-gray-900 mb-4 border-b border-gray-300 pb-4">
          <p>
            <span className="font-semibold">Patient:</span>{" "}
            {test.patient?.firstName} {test.patient?.lastName}
          </p>
          <p>
            <span className="font-semibold">MRN:</span> {test.patient?.mrn}
          </p>
          <p>
            <span className="font-semibold">Order Date:</span>{" "}
            {new Date(test.orderDate).toLocaleDateString()}
          </p>
          {test.verifiedBy && (
            <p>
              <span className="font-semibold">Verified By:</span>{" "}
              {test.verifiedBy?.name}
            </p>
          )}
        </div>

        {/* Loading / Error Handling */}
        {loading ? (
          <p className="text-gray-700">Loading patient lab tests...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {/* Tests Performed */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900">
                Tests Performed
              </h3>

              {Array.isArray(patientTests) && patientTests.length === 0 ? (
                <p className="text-gray-700">No lab tests found for this patient.</p>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 bg-gray-200 font-semibold text-gray-800 py-2 px-3">
                    <div>Test Type</div>
                    <div>Result</div>
                  </div>

                  {Array.isArray(patientTests) &&
                    patientTests.map((t) => (
                      <div
                        key={t._id}
                        className="grid grid-cols-2 border-t border-gray-300 bg-gray-50 hover:bg-gray-100 transition duration-150 px-3 py-2 text-gray-900"
                      >
                        <div>
                          <p className="font-medium">{t.testType}</p>
                          <p className="text-sm text-gray-700">
                            Status: {t.status}
                          </p>
                          <p className="text-sm text-gray-700">
                            Priority: {t.priority}
                          </p>
                          <p className="text-sm text-gray-700">
                            Specimen: {t.specimenType || "-"}
                          </p>
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="font-semibold text-blue-700">
                            {t.result?.toString() || "Pending"}
                          </p>
                          {t.clinicalNotes && (
                            <p className="text-sm text-gray-700 italic mt-1">
                              Note: {t.clinicalNotes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Edit button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowEditForm(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 shadow"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditForm && (
        <LabTestForm onClose={() => setShowEditForm(false)} existingTest={test} />
      )}
    </>
  );
};

export default LabTestDetail;