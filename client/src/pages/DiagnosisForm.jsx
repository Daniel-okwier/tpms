import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiagnosis } from "../redux/slices/diagnosisSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import { fetchLabTestsByPatient, labTestsSelectors } from "../redux/slices/labTestsSlice";
import { toast } from "react-toastify";

const DiagnosisForm = ({ onClose, existing }) => {
  const dispatch = useDispatch();

  //  Patients
  const patients = useSelector((state) => state.patients?.items || []);
  const patientsLoading = useSelector((state) => state.patients?.loading || false);

  //  Lab tests 
  const labResults = useSelector(labTestsSelectors.selectAll);
  const labLoading = useSelector((state) => state.labTests?.loading === "pending");

  // Local state
  const [formData, setFormData] = useState({
    patient: existing?.patient?._id || "",
    diagnosis: existing?.diagnosisType || "",
    notes: existing?.notes || "",
  });

  //  Fetch patients on mount
  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 50 }));
  }, [dispatch]);

  //  Fetch lab tests when patient changes
  useEffect(() => {
    if (formData.patient) {
      dispatch(fetchLabTestsByPatient(formData.patient));
    }
  }, [formData.patient, dispatch]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.diagnosis) {
      toast.error("Please select a patient and diagnosis type.");
      return;
    }

    try {
      await dispatch(createDiagnosis(formData)).unwrap();
      toast.success("Diagnosis saved successfully!");
      setFormData({ patient: "", diagnosis: "", notes: "" });
      onClose();
    } catch (err) {
      const errorMsg =
        err?.message || err?.error || "Failed to save diagnosis.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 text-lg"
        >
          &times;
        </button>

        {/* Header */}
        <h2 className="text-xl font-bold mb-4 text-blue-700">
          {existing ? "Edit Diagnosis" : "Create Diagnosis"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Patient</label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
              disabled={!!existing}
            >
              <option value="">-- Select Patient --</option>
              {patientsLoading ? (
                <option>Loading...</option>
              ) : (
                patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} (MRN: {p.mrn})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Lab Results Section */}
          {formData.patient && (
            <div className="bg-gray-50 border p-3 rounded">
              <h3 className="font-semibold mb-2 text-gray-700">Lab Results</h3>
              {labLoading ? (
                <p>Loading lab results...</p>
              ) : labResults.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {labResults.map((lr) => (
                    <li key={lr._id}>
                      <span className="font-medium">{lr.testType}:</span>{" "}
                      <span className="text-blue-700">
                        {lr.result || "N/A"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No lab results for this patient.</p>
              )}
            </div>
          )}

          {/* Diagnosis Dropdown */}
          <div>
            <label className="block mb-1 font-medium">Diagnosis</label>
            <select
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select Diagnosis</option>
              <option value="Pulmonary TB">Pulmonary TB</option>
              <option value="Extrapulmonary TB">Extrapulmonary TB</option>
              <option value="MDR-TB">MDR-TB</option>
              <option value="XDR-TB">XDR-TB</option>
              <option value="Latent TB">Latent TB</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1 font-medium">Notes (optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="Additional notes..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            {existing ? "Update Diagnosis" : "Save Diagnosis"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DiagnosisForm;
