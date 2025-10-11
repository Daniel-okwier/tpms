import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLabTests } from "../redux/slices/labTestsSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import { X } from "lucide-react";

const LabTestForm = ({ onClose }) => {
  const dispatch = useDispatch();

  const {
    items: patients,
    loading: patientLoading,
    error: patientError,
  } = useSelector((state) => state.patients || { items: [], loading: false });

  const { error, successMessage } = useSelector((state) => state.labTests || {});

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: "",
    testTypes: [],
    tests: {},
    clinicalNotes: "",
    priority: "routine",
  });

  const testOptions = [
    "GeneXpert",
    "Smear Microscopy",
    "Culture",
    "Chest X-ray",
    "Other",
  ];

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleTestSelect = (testType) => {
    setFormData((prev) => {
      const selected = prev.testTypes.includes(testType)
        ? prev.testTypes.filter((t) => t !== testType)
        : [...prev.testTypes, testType];
      const updatedTests = { ...prev.tests };
      if (!selected.includes(testType)) delete updatedTests[testType];
      return { ...prev, testTypes: selected, tests: updatedTests };
    });
  };

  const handleResultChange = (testType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tests: {
        ...prev.tests,
        [testType]: {
          ...prev.tests[testType],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient || formData.testTypes.length === 0) return;

    setSubmitting(true);

    const tests = formData.testTypes.map((type) => ({
      testType: type,
      clinicalNotes: formData.clinicalNotes,
      priority: formData.priority,
      ...formData.tests[type],
    }));

    //Send as object
    await dispatch(
      createLabTests({
        patientId: formData.patient,
        tests,
      })
    );

    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-3xl shadow-xl relative max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
          Create Lab Test
        </h2>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 text-green-800 p-3 mb-3 rounded">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-3 mb-3 rounded">
            {typeof error === "string"
              ? error
              : error?.error || "An error occurred"}
          </div>
        )}
        {patientError && (
          <div className="bg-red-100 text-red-800 p-3 mb-3 rounded">
            {patientError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Patient</label>
            <select
              value={formData.patient}
              onChange={(e) =>
                setFormData({ ...formData, patient: e.target.value })
              }
              required
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="">
                {patientLoading ? "Loading patients..." : "Select patient"}
              </option>
              {Array.isArray(patients) && patients.length > 0 ? (
                patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} ({p.mrn})
                  </option>
                ))
              ) : (
                !patientLoading && <option disabled>No patients found</option>
              )}
            </select>
          </div>

          {/* Test Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Test Types</label>
            <div className="flex flex-wrap gap-3">
              {testOptions.map((testType) => (
                <label key={testType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.testTypes.includes(testType)}
                    onChange={() => handleTestSelect(testType)}
                    className="accent-blue-600"
                  />
                  <span>{testType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dynamic Test Result Fields */}
          {formData.testTypes?.map((testType) => (
            <div
              key={testType}
              className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <h3 className="font-semibold text-blue-600 mb-2">
                {testType} Result
              </h3>

              {/* GeneXpert Test */}
              {testType === "GeneXpert" ? (
                <>
                  <label>
                    MTB Detected:
                    <select
                      value={formData.tests[testType]?.mtbDetected || ""}
                      onChange={(e) =>
                        handleResultChange(
                          testType,
                          "mtbDetected",
                          e.target.value
                        )
                      }
                      className="ml-2 p-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select</option>
                      <option value="detected">Detected</option>
                      <option value="not_detected">Not Detected</option>
                      <option value="indeterminate">Indeterminate</option>
                    </select>
                  </label>
                  <label className="block mt-2">
                    Rif Resistance:
                    <select
                      value={formData.tests[testType]?.rifResistance || ""}
                      onChange={(e) =>
                        handleResultChange(
                          testType,
                          "rifResistance",
                          e.target.value
                        )
                      }
                      className="ml-2 p-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Select</option>
                      <option value="detected">Detected</option>
                      <option value="not_detected">Not Detected</option>
                      <option value="indeterminate">Indeterminate</option>
                    </select>
                  </label>
                </>
              ) : testType === "Chest X-ray" ? (
                // Chest X-ray Test
                <div className="flex flex-col gap-2">
                  <label className="font-medium mb-1">
                    Radiological Impression:
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      "Normal",
                      "Suggestive of TB",
                      "Other Abnormality",
                      "Unclear / Indeterminate",
                    ].map((value) => (
                      <label
                        key={value}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={`result-${testType}`}
                          value={value}
                          checked={formData.tests[testType]?.result === value}
                          onChange={(e) =>
                            handleResultChange(testType, "result", e.target.value)
                          }
                          className="accent-blue-600"
                        />
                        <span>{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                // Smear Microscopy / Culture / Other
                <div className="flex flex-col gap-2">
                  <label className="font-medium mb-1">Result:</label>
                  <div className="flex flex-wrap gap-3">
                    {["positive", "negative", "indeterminate"].map((value) => (
                      <label
                        key={value}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={`result-${testType}`}
                          value={value}
                          checked={formData.tests[testType]?.result === value}
                          onChange={(e) =>
                            handleResultChange(
                              testType,
                              "result",
                              e.target.value
                            )
                          }
                          className="accent-blue-600"
                        />
                        <span className="capitalize">{value}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Clinical Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Clinical Notes
            </label>
            <textarea
              value={formData.clinicalNotes}
              onChange={(e) =>
                setFormData({ ...formData, clinicalNotes: e.target.value })
              }
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              rows="3"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="text-right">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {submitting ? "Saving..." : "Save Tests"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabTestForm;