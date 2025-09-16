import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createLabTest, updateLabTest, fetchLabTests } from "../redux/slices/labTestsSlice";
import { toast } from "react-toastify";

const LabTestForm = ({ existingTest, patients = [], onClose }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    patient: existingTest?.patient?._id || "",
    testType: existingTest?.testType || "",
    priority: existingTest?.priority || "routine",
    clinicalNotes: existingTest?.clinicalNotes || "",
    status: existingTest?.status || "ordered",
    specimenType: existingTest?.specimenType || "sputum",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient) {
      toast.error("Please select a patient");
      return;
    }

    try {
      if (existingTest) {
        await dispatch(updateLabTest({ id: existingTest._id, data: formData })).unwrap();
        toast.success("Lab test updated successfully");
      } else {
        await dispatch(createLabTest(formData)).unwrap();
        toast.success("Lab test created successfully");
      }
      dispatch(fetchLabTests());
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save lab test");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 font-bold"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4 text-black">
          {existingTest ? "Edit Lab Test" : "New Lab Test"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-black">
          {/* Patient */}
          <label className="flex flex-col">
            Patient
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>
          </label>

          {/* Test Type */}
          <label className="flex flex-col">
            Test Type
            <select
              name="testType"
              value={formData.testType}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
            >
              <option value="">Select Test Type</option>
              <option value="GeneXpert">GeneXpert</option>
              <option value="Smear Microscopy">Smear Microscopy</option>
              <option value="Culture">Culture</option>
              <option value="Chest X-ray">Chest X-ray</option>
              <option value="Other">Other</option>
            </select>
          </label>

          {/* Priority */}
          <label className="flex flex-col">
            Priority
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
            >
              <option value="routine">Routine</option>
              <option value="priority">Priority</option>
            </select>
          </label>

          {/* Status */}
          <label className="flex flex-col">
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
            >
              <option value="ordered">Ordered</option>
              <option value="specimen_collected">Specimen Collected</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          {/* Specimen Type */}
          <label className="flex flex-col">
            Specimen Type
            <select
              name="specimenType"
              value={formData.specimenType}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
            >
              <option value="sputum">Sputum</option>
              <option value="blood">Blood</option>
              <option value="tissue">Tissue</option>
              <option value="gastric_aspirate">Gastric Aspirate</option>
              <option value="other">Other</option>
              <option value="not_applicable">N/A</option>
            </select>
          </label>

          {/* Clinical Notes */}
          <label className="flex flex-col">
            Clinical Notes
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
              rows="3"
            />
          </label>

          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {existingTest ? "Update Lab Test" : "Create Lab Test"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LabTestForm;
