
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiagnosis } from "../redux/slices/diagnosisSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import { fetchLabResultsByPatient } from "../redux/slices/labResultSlice"; 

const DiagnosisForm = () => {
  const dispatch = useDispatch();

  // Redux state
  const { patients, loading: patientsLoading } = useSelector(
    (state) => state.patients || { patients: [], loading: false }
  );

  const { labResults, loading: labLoading } = useSelector(
    (state) => state.labResults || { labResults: [], loading: false }
  );

  // Local state
  const [formData, setFormData] = useState({
    patient: "",
    diagnosis: "",
    notes: "",
  });

  // Fetch patients once
  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // Fetch lab results whenever a patient is chosen
  useEffect(() => {
    if (formData.patient) {
      dispatch(fetchLabResultsByPatient(formData.patient));
    }
  }, [formData.patient, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.diagnosis) {
      alert("Please select a patient and provide a diagnosis.");
      return;
    }
    dispatch(createDiagnosis(formData));
    setFormData({ patient: "", diagnosis: "", notes: "" });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded bg-white shadow space-y-4"
    >
      <h2 className="text-lg font-bold">Add Diagnosis</h2>

      {/* Patient Dropdown */}
      <div>
        <label className="block mb-1">Patient</label>
        <select
          name="patient"
          value={formData.patient}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">-- Select Patient --</option>
          {patientsLoading ? (
            <option>Loading...</option>
          ) : patients && patients.length > 0 ? (
            patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))
          ) : (
            <option disabled>No patients available</option>
          )}
        </select>
      </div>

      {/* Show lab results for the selected patient */}
      {formData.patient && (
        <div className="bg-gray-50 border p-3 rounded">
          <h3 className="font-semibold mb-2">Lab Results</h3>
          {labLoading ? (
            <p>Loading lab results...</p>
          ) : labResults && labResults.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {labResults.map((lr) => (
                <li key={lr._id}>
                  <span className="font-medium">{lr.testType}:</span>{" "}
                  {lr.result}
                </li>
              ))}
            </ul>
          ) : (
            <p>No lab results for this patient.</p>
          )}
        </div>
      )}

      {/* Diagnosis field */}
      <div>
        <label className="block mb-1">Diagnosis</label>
        <input
          type="text"
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="e.g. Pulmonary TB"
          required
        />
      </div>

      {/* Notes field */}
      <div>
        <label className="block mb-1">Notes (optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Additional notes..."
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Diagnosis
      </button>
    </form>
  );
};

export default DiagnosisForm;

