import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLabTestsByPatient,
  fetchLabTests,
  labTestsSelectors,
} from "../redux/slices/labTestsSlice";
import LabTestForm from "./LabTestForm";

const LabTestDetail = ({ test, onClose }) => {
  const dispatch = useDispatch();
  const [showEditForm, setShowEditForm] = useState(false);

  const { loading, error } = useSelector((state) => state.labTests);
  const allTests = useSelector(labTestsSelectors.selectAll);

  // Filter lab tests for this patient only
  const patientTests = allTests.filter(
    (t) => t.patient?._id === test?.patient?._id
  );

  // Fetch tests for this patient on mount
  useEffect(() => {
    if (test?.patient?._id) {
      dispatch(fetchLabTestsByPatient(test.patient._id));
    }
  }, [dispatch, test?.patient?._id]);

  // When closing the detail drawer, reset tests to show all again
  const handleClose = () => {
    dispatch(fetchLabTests());
    onClose();
  };

  if (!test) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={handleClose}
      ></div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-lg z-50 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Lab Test Details</h2>
          <button
            onClick={handleClose}
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
        {loading === "pending" ? (
          <p className="text-gray-700">Loading patient lab tests...</p>
        ) : error ? (
          <p className="text-red-500">
            {typeof error === "string" ? error : "Failed to load tests"}
          </p>
        ) : (
          <>
            <div>
              <h3 className="font-semibold text-lg mb-3 text-gray-900">
                Tests Performed
              </h3>

              {patientTests.length === 0 ? (
                <p className="text-gray-700">
                  No lab tests found for this patient.
                </p>
              ) : (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-2 bg-gray-200 font-semibold text-gray-800 py-2 px-3">
                    <div>Test Type</div>
                    <div>Result</div>
                  </div>

                  {patientTests.map((t) => (
                    <div
                      key={t._id}
                      className="grid grid-cols-2 border-t border-gray-300 bg-gray-50 hover:bg-gray-100 transition duration-150 px-3 py-3 text-gray-900"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{t.testType}</p>
                        <p className="text-sm text-gray-700">
                          Status:{" "}
                          <span className="font-medium capitalize">
                            {t.status || "pending"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700">
                          Priority:{" "}
                          <span className="font-medium">
                            {t.priority || "-"}
                          </span>
                        </p>
                        <p className="text-sm text-gray-700">
                          Specimen:{" "}
                          <span className="font-medium">
                            {t.specimenType || "-"}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col justify-center text-right">
                        <p
                          className={`font-semibold ${
                            t.result
                              ? "text-blue-700"
                              : "text-gray-500 italic"
                          }`}
                        >
                          {t.result?.toString() || "Pending"}
                        </p>
                        {t.resultNote && (
                          <p className="text-sm text-gray-700 italic mt-1">
                            Note: {t.resultNote}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/*Clinical Summary Note */}
            {test.clinicalNotes && (
              <div className="mt-6 border-t border-gray-300 pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Clinical Summary
                </h4>
                <p className="text-gray-800 italic">{test.clinicalNotes}</p>
              </div>
            )}
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
        <LabTestForm
          onClose={() => setShowEditForm(false)}
          existingTest={test}
        />
      )}
    </>
  );
};

export default LabTestDetail;
