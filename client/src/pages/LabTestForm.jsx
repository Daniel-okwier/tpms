import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLabTests, updateLabTest, fetchLabTests } from "../redux/slices/labTestsSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import { X } from "lucide-react";
import { toast } from "react-toastify";

const LabTestForm = ({ onClose, existingTest = null }) => {
  const dispatch = useDispatch();
  const { items: patients = [], loading: patientLoading } =
    useSelector((state) => state.patients || {});
  const { entities: labTests = [] } = useSelector((state) => state.labTests || {});

  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient: "",
    testTypes: [],
    tests: {},
    clinicalNotes: "",
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

  useEffect(() => {
    if (!existingTest) return;

    const initial = {
      patient: existingTest.patient?._id || existingTest.patientId || "",
      testTypes: existingTest.testTypes || [existingTest.testType],
      tests: {},
      clinicalNotes: existingTest.clinicalNotes || "",
    };

    (existingTest.testTypes || [existingTest.testType]).forEach((type) => {
      initial.tests[type] = {
        result: existingTest.result || "",
      };
    });

    setFormData(initial);
  }, [existingTest]);

  const handleTestSelect = (testType) => {
    if (existingTest) return; 
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

  const clearForm = () => {
    setFormData({
      patient: "",
      testTypes: [],
      tests: {},
      clinicalNotes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient || formData.testTypes.length === 0) {
      toast.error("Please select a patient and at least one test.");
      return;
    }

    setSubmitting(true);
    try {
      // prevent duplicate test creation
      const existingPatientTest = Object.values(labTests).find(
        (t) => t.patient?._id === formData.patient
      );

      if (!existingTest && existingPatientTest) {
        toast.error("A lab test already exists for this patient.");
        setSubmitting(false);
        return;
      }

      if (existingTest) {
        const updates = {
          clinicalNotes: formData.clinicalNotes,
          tests: formData.tests,
        };
        await dispatch(updateLabTest({ id: existingTest._id, updates })).unwrap();
        toast.success("Lab test updated successfully");
        dispatch(fetchLabTests());
        onClose();
      } else {
        const testsPayload = formData.testTypes.map((type) => ({
          testType: type,
          clinicalNotes: formData.clinicalNotes,
          ...formData.tests[type],
          status: "completed",
        }));

        const payload = { patientId: formData.patient, tests: testsPayload };
        await dispatch(createLabTests(payload)).unwrap();
        toast.success("Lab tests created successfully");
        clearForm();
        dispatch(fetchLabTests());
        onClose();
      }
    } catch (err) {
      const msg =
        err?.error ||
        err?.message ||
        "An unexpected error occurred. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-3xl shadow-xl relative max-h-[90vh] overflow-y-auto text-gray-900 dark:text-gray-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
          {existingTest ? "Edit Lab Test" : "Create Lab Test"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient */}
          <div>
            <label className="block text-sm font-medium mb-1">Patient</label>
            <select
              value={formData.patient}
              onChange={(e) =>
                setFormData({ ...formData, patient: e.target.value })
              }
              required
              disabled={!!existingTest}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800"
            >
              <option value="">
                {patientLoading ? "Loading patients..." : "Select patient"}
              </option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>

            {existingTest && existingTest.patient && (
              <div className="mt-2 text-sm text-gray-700">
                Editing test for:{" "}
                <span className="font-medium">
                  {existingTest.patient.firstName} {existingTest.patient.lastName} (
                  {existingTest.patient.mrn})
                </span>
              </div>
            )}
          </div>

          {/* Test Types */}
          <div>
            <label className="block text-sm font-medium mb-1">Test Types</label>
            <div className="flex flex-wrap gap-3">
              {testOptions.map((testType) => (
                <label key={testType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.testTypes.includes(testType)}
                    onChange={() => handleTestSelect(testType)}
                    disabled={!!existingTest}
                    className="accent-blue-600"
                  />
                  <span>{testType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dynamic Test Fields */}
          {formData.testTypes.map((testType) => (
            <div
              key={testType}
              className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800"
            >
              <h3 className="font-semibold text-blue-600 mb-2">
                {testType} Result
              </h3>
              {testType === "Chest X-ray" ? (
                <div className="flex flex-col gap-2">
                  <label className="font-medium mb-1">
                    Radiological Impression:
                  </label>
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
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="font-medium mb-1">Result:</label>
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
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800"
              rows="3"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {submitting
                ? "Saving..."
                : existingTest
                ? "Update Test"
                : "Save Tests"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabTestForm;
