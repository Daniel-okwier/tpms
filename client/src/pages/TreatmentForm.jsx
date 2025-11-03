import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createTreatment,
  updateTreatment,
} from "../redux/slices/treatmentSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import { fetchDiagnoses } from "../redux/slices/diagnosisSlice";
import { toast } from "react-toastify";

const TreatmentForm = ({ existing, onClose }) => {
  const dispatch = useDispatch();
  const { patients = [] } = useSelector((state) => state.patient || {});
  const { diagnoses = [] } = useSelector((state) => state.diagnosis || {});

  const [formData, setFormData] = useState({
    patient: "",
    diagnosis: "",
    regimen: "",
    startDate: "",
    expectedEndDate: "",
    status: "ongoing",
  });

  useEffect(() => {
    dispatch(fetchPatients());
    dispatch(fetchDiagnoses());
    if (existing) {
      setFormData({
        patient: existing.patient?._id || "",
        diagnosis: existing.diagnosis?._id || "",
        regimen: existing.regimen || "",
        startDate: existing.startDate
          ? new Date(existing.startDate).toISOString().split("T")[0]
          : "",
        expectedEndDate: existing.expectedEndDate
          ? new Date(existing.expectedEndDate).toISOString().split("T")[0]
          : "",
        status: existing.status || "ongoing",
      });
    }
  }, [dispatch, existing]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existing) {
        await dispatch(updateTreatment({ id: existing._id, data: formData })).unwrap();
        toast.success("Treatment updated successfully");
      } else {
        await dispatch(createTreatment(formData)).unwrap();
        toast.success("Treatment created successfully");
      }
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to save treatment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {existing ? "Edit Treatment" : "New Treatment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Patient</label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-black"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Diagnosis</label>
            <select
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-black"
            >
              <option value="">Select Diagnosis (optional)</option>
              {diagnoses
                .filter((d) => d.patient?._id === formData.patient)
                .map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.diagnosisType} - {new Date(d.diagnosisDate).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>

          {/* Regimen */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Regimen</label>
            <input
              type="text"
              name="regimen"
              value={formData.regimen}
              onChange={handleChange}
              placeholder="e.g. HRZE for 2 months, HR for 4 months"
              className="w-full border px-3 py-2 rounded text-black"
              required
            />
          </div>

          {/* Start & End Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-black"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Expected End Date</label>
              <input
                type="date"
                name="expectedEndDate"
                value={formData.expectedEndDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-black"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded text-black"
              required
            >
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="defaulted">Defaulted</option>
              <option value="failed">Failed</option>
              <option value="planned">Planned</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {existing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreatmentForm;
