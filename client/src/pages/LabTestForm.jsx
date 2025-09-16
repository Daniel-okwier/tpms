import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLabTest, updateLabTest } from "../redux/slices/labTestsSlice";
import { patientSelectors, fetchPatients } from "../redux/slices/patientSlice";

const LabTestForm = ({ onClose, existingTest }) => {
  const dispatch = useDispatch();

  // Fetch patients from Redux
  const patients = useSelector(patientSelectors.selectAll);
  useEffect(() => {
    if (patients.length === 0) dispatch(fetchPatients());
  }, [dispatch, patients.length]);

  const [form, setForm] = useState({
    patient: existingTest?.patient?._id || "",
    testType: existingTest?.testType || "GeneXpert",
    priority: existingTest?.priority || "routine",
    specimenType: existingTest?.specimenType || "sputum",
    clinicalNotes: existingTest?.clinicalNotes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.patient) return alert("Please select a patient");

    const action = existingTest
      ? updateLabTest({ id: existingTest._id, data: form })
      : createLabTest(form);

    dispatch(action)
      .unwrap()
      .then(() => {
        alert(
          existingTest ? "Lab test updated successfully" : "Lab test created successfully"
        );
        onClose();
      })
      .catch((err) => alert(err.message || "Failed to save lab test"));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-black">
          {existingTest ? "Edit Lab Test" : "New Lab Test"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {/* Patient select */}
          <div>
            <label className="block mb-1 font-medium">Patient</label>
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-black bg-white"
              disabled={!!existingTest} // optionally prevent changing patient on edit
            >
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} (MRN: {p.mrn})
                </option>
              ))}
            </select>
          </div>

          {/* Test Type */}
          <div>
            <label className="block mb-1 font-medium">Test Type</label>
            <select
              name="testType"
              value={form.testType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-black bg-white"
            >
              <option value="GeneXpert">GeneXpert</option>
              <option value="Smear Microscopy">Smear Microscopy</option>
              <option value="Culture">Culture</option>
              <option value="Chest X-ray">Chest X-ray</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block mb-1 font-medium">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-black bg-white"
            >
              <option value="routine">Routine</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          {/* Specimen Type */}
          <div>
            <label className="block mb-1 font-medium">Specimen Type</label>
            <select
              name="specimenType"
              value={form.specimenType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded text-black bg-white"
            >
              <option value="sputum">Sputum</option>
              <option value="blood">Blood</option>
              <option value="tissue">Tissue</option>
              <option value="gastric_aspirate">Gastric Aspirate</option>
              <option value="other">Other</option>
              <option value="not_applicable">Not Applicable</option>
            </select>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block mb-1 font-medium">Clinical Notes</label>
            <textarea
              name="clinicalNotes"
              value={form.clinicalNotes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border rounded text-black bg-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100 text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {existingTest ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabTestForm;
