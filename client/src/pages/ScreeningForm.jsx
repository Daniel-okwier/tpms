import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createScreening, updateScreening } from "@/redux/slices/screeningSlice";
import { toast } from "react-toastify";

const ScreeningForm = ({ existingScreening, patients = [], onClose }) => {
  const dispatch = useDispatch();

  const initial = existingScreening
    ? {
        patient: existingScreening.patient?._id || existingScreening.patient,
        facilityName: existingScreening.facilityName || "",
        screeningDate: existingScreening.screeningDate
          ? new Date(existingScreening.screeningDate).toISOString().substring(0, 10)
          : new Date().toISOString().substring(0, 10),
        screeningOutcome: existingScreening.screeningOutcome || "suspected_tb",
        priority: existingScreening.priority || "routine",
        referToLab: existingScreening.referToLab || false,
        notes: existingScreening.notes || "",
      }
    : {
        patient: "",
        facilityName: "",
        screeningDate: new Date().toISOString().substring(0, 10),
        screeningOutcome: "suspected_tb",
        priority: "routine",
        referToLab: false,
        notes: "",
      };

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingScreening]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient) {
      toast.error("Please select a patient");
      return;
    }
    try {
      if (existingScreening) {
        await dispatch(updateScreening({ id: existingScreening._id, updates: form })).unwrap();
        toast.success("Screening updated");
      } else {
        await dispatch(createScreening(form)).unwrap();
        toast.success("Screening created");
      }
      onClose();
    } catch (err) {
      toast.error(err || "Failed to save screening");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl relative p-6">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-600 text-lg">
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-black">{existingScreening ? "Edit Screening" : "New Screening"}</h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-black">
          <label className="flex flex-col">
            Patient
            <select name="patient" value={form.patient} onChange={handleChange} className="border px-2 py-1 rounded text-black" required>
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} (MRN: {p.mrn})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            Facility
            <input type="text" name="facilityName" value={form.facilityName} onChange={handleChange} className="border px-2 py-1 rounded text-black" required />
          </label>

          <label className="flex flex-col">
            Screening Date
            <input type="date" name="screeningDate" value={form.screeningDate} onChange={handleChange} className="border px-2 py-1 rounded text-black" required />
          </label>

          <label className="flex flex-col">
            Outcome
            <select name="screeningOutcome" value={form.screeningOutcome} onChange={handleChange} className="border px-2 py-1 rounded text-black">
              <option value="suspected_tb">Suspected TB</option>
              <option value="not_suspected">Not Suspected</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="referToLab" checked={form.referToLab} onChange={handleChange} />
            Refer to lab
          </label>

          <label className="flex flex-col">
            Priority
            <select name="priority" value={form.priority} onChange={handleChange} className="border px-2 py-1 rounded text-black">
              <option value="routine">Routine</option>
              <option value="priority">Priority</option>
            </select>
          </label>

          <label className="flex flex-col">
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} className="border px-2 py-1 rounded text-black" rows="3" />
          </label>

          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              {existingScreening ? "Update Screening" : "Create Screening"}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScreeningForm;
