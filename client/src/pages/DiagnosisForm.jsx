import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiagnosis } from "../redux/slices/diagnosisSlice";
import { fetchPatients } from "../redux/slices/patientSlice";

const DiagnosisForm = () => {
  const dispatch = useDispatch();

  const patientsState = useSelector((state) => state.patients);
  const patients = patientsState?.items || [];
  const patientsLoading = patientsState?.loading || false;

  const [formData, setFormData] = useState({
    patient: "",
    diagnosis: "",
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchPatients({ page: 1, limit: 50 }));
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createDiagnosis(formData));
    setFormData({ patient: "", diagnosis: "", notes: "" });
  };

  if (patientsLoading) return <p>Loading patients...</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-md bg-white shadow"
    >
      <div>
        <label className="block mb-1 font-semibold">Patient</label>
        <select
          name="patient"
          value={formData.patient}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Patient --</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>
              {p.firstName} {p.lastName} ({p.mrn})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Diagnosis</label>
        <input
          type="text"
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 font-semibold">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

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
