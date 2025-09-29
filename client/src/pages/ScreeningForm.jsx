import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  createScreening,
  updateScreening,
} from "../redux/slices/screeningSlice";
import { toast } from "react-toastify";

const ScreeningForm = ({ patients, onClose, existingData }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(
    existingData || {
      patientId: "",
      date: "",
      type: "",
      notes: "",
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingData) {
        await dispatch(
          updateScreening({ id: existingData._id, updates: formData })
        ).unwrap();
        toast.success("Screening updated successfully");
      } else {
        await dispatch(createScreening(formData)).unwrap();
        toast.success("Screening created successfully");
      }
      onClose();
    } catch (err) {
      toast.error(err || "Failed to save screening");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-4">
      <h3 className="text-lg font-semibold mb-3">
        {existingData ? "Edit Screening" : "New Screening"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Patient Dropdown */}
        <div>
          <label className="block mb-2">Patient</label>
          <select
            value={formData.patientId}
            onChange={(e) =>
              setFormData({ ...formData, patientId: e.target.value })
            }
            className="border px-2 py-1 rounded w-full text-black"
            required
          >
            <option value="">-- Select Patient --</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName} (MRN: {p.mrn})
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="border px-2 py-1 rounded w-full text-black"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block mb-2">Type</label>
          <input
            type="text"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="border px-2 py-1 rounded w-full text-black"
            placeholder="e.g. Initial, Follow-up"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="border px-2 py-1 rounded w-full text-black"
            rows="3"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
          >
            {existingData ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 shadow"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScreeningForm;
