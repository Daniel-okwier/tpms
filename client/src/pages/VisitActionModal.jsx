import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";

/**
 * Modal for capturing structured data when a visit is completed or edited.
 * @param {boolean} open
 * @param {string} date - ISO date string of the visit.
 * @param {string} action - 'complete', 'missed', or 'edit'.
 * @param {Object} initialData - Existing follow-up data. (No default value here)
 * @param {function} onClose
 * @param {function} onSubmit - (payload: Object) => void.
 */
const VisitActionModal = ({
  open,
  date,
  action,
  initialData, // Removed default = {}
  onClose,
  onSubmit,
}) => {
  // FIX: Provide a stable, memoized empty object if initialData is not passed (or null/undefined).
  const stableInitialData = useMemo(() => initialData || {}, [initialData]);

  const [formData, setFormData] = useState({
    weightKg: stableInitialData.weightKg || "",
    pillCount: stableInitialData.pillCount || "",
    sideEffects: stableInitialData.sideEffects || "",
    notes: stableInitialData.notes || "",
  });

  // Update form data when initialData changes. stableInitialData only changes 
  // if the initialData prop reference itself changes.
  useEffect(() => {
    setFormData({
      weightKg: stableInitialData.weightKg || "",
      pillCount: stableInitialData.pillCount || "",
      sideEffects: stableInitialData.sideEffects || "",
      notes: stableInitialData.notes || "",
    });
  }, [stableInitialData]); // Dependency is now stable!

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (action === "complete" || action === "edit") {
      // Simple validation for completed visits
      if (!formData.weightKg || !formData.pillCount) {
        toast.error("Weight and Pill Count are required for a completed visit.");
        return;
      }
      // Submit the structured data
      onSubmit(formData);
    } else if (action === "missed") {
      // For 'missed', the only data needed is the notes/reason (and the status)
      onSubmit({ notes: formData.notes });
    }
  };

  const modalTitle = {
    complete: "Record Completed Visit Data",
    edit: "Edit Follow-up Data",
    missed: "Record Missed Visit Details",
  }[action] || "Visit Action";

  const dateDisplay = date ? new Date(date).toLocaleDateString() : "N/A";
  const requiresStructuredData = action === "complete" || action === "edit";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative">
        <h2 className="text-xl font-bold mb-2 text-gray-800">{modalTitle}</h2>
        <p className="text-sm text-gray-600 mb-4">
          Date: **{dateDisplay}**
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {requiresStructuredData && (
            <div className="grid grid-cols-2 gap-3">
              {/* Weight */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weightKg"
                  value={formData.weightKg}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded text-black"
                  step="0.1"
                  required={requiresStructuredData}
                />
              </div>

              {/* Pill Count */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Pill Count
                </label>
                <input
                  type="number"
                  name="pillCount"
                  value={formData.pillCount}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded text-black"
                  required={requiresStructuredData}
                />
              </div>
            </div>
          )}

          {/* Side Effects */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Side Effects
            </label>
            <textarea
              name="sideEffects"
              value={formData.sideEffects}
              onChange={handleChange}
              rows="2"
              className="w-full border px-3 py-2 rounded text-black"
              placeholder="Record any observed side effects..."
            ></textarea>
          </div>

          {/* Notes/Reason */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              {action === "missed"
                ? "Reason for Missed Visit"
                : "Additional Notes"}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full border px-3 py-2 rounded text-black"
              placeholder={
                action === "missed"
                  ? "Enter reason for missed visit..."
                  : "General follow-up notes..."
              }
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded ${
                action === "missed"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {action === "complete"
                ? "Complete Visit"
                : action === "missed"
                ? "Mark Missed"
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitActionModal;