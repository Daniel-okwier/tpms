import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiagnosis } from "@/redux/slices/diagnosisSlice";
import { toast } from "react-toastify";

const DiagnosisForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { patients } = useSelector((state) => state.patient); 

  const [form, setForm] = useState({
    patient: "",
    diagnosisType: "Suspected TB",
    notes: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createDiagnosis(form)).unwrap();
      toast.success("Diagnosis created");
      onClose();
    } catch (err) {
      toast.error(err || "Failed to create diagnosis");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 text-lg"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">New Diagnosis</h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-black">
          <label className="flex flex-col">
            Patient
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} (MRN: {p.mrn})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            Diagnosis Type
            <select
              name="diagnosisType"
              value={form.diagnosisType}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
              required
            >
              <option value="Pulmonary TB">Pulmonary TB</option>
              <option value="Extra-pulmonary TB">Extra-pulmonary TB</option>
              <option value="No TB">No TB</option>
              <option value="Suspected TB">Suspected TB</option>
            </select>
          </label>

          <label className="flex flex-col">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="border px-2 py-1 rounded"
              rows="3"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiagnosisForm;
