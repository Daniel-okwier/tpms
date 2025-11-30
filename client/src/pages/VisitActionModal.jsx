import React, { useState, useEffect } from "react";

const VisitActionModal = ({
  open,
  date,
  action,
  initialData,
  onClose,
  onSubmit,
}) => {
  // Initialize state with initialData values
  const [formData, setFormData] = useState({
    weightKg: initialData.weightKg || "",
    notes: initialData.notes || "",
  });

  // Reset form data when initialData prop changes
  useEffect(() => {
    setFormData({
      weightKg: initialData.weightKg || "",
      notes: initialData.notes || "",
    });
  }, [initialData]);

  if (!open) return null;

  const displayDate = date ? new Date(date).toLocaleDateString() : 'N/A';

  // Determine if clinical data entry is required
  const isClinicalDataEntry = action === 'complete' || 
    (action === 'edit' && initialData.status !== 'missed');

  // Notes are always required for documentation
  const isNotesRequired = true;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (isClinicalDataEntry && !formData.weightKg) {
      alert("Weight is required for a completed visit.");
      return;
    }
    if (isNotesRequired && !formData.notes) {
      alert("Notes/Reason are required for this action.");
      return;
    }

    // Pass the payload to the parent handler
    onSubmit({
      weightKg: isClinicalDataEntry && formData.weightKg ? Number(formData.weightKg) : undefined,
      notes: formData.notes,
    });
  };

  const getTitle = () => {
    switch (action) {
      case 'complete':
        return `Mark Visit Complete: ${displayDate}`;
      case 'missed':
        return `Mark Visit Missed: ${displayDate}`;
      case 'edit':
        return initialData.status === 'missed'
          ? `Edit Missed Note: ${displayDate}`
          : `Edit Follow-up Data: ${displayDate}`;
      default:
        return 'Visit Action';
    }
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">{getTitle()}</h2>

        <form onSubmit={handleSubmit}>
          {/* WEIGHT FIELD - Only shown for complete or editing completed visits */}
          {isClinicalDataEntry && (
            <div className="mb-4">
              <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="weightKg"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleChange}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={isClinicalDataEntry}
              />
            </div>
          )}

          {/* NOTES FIELD - Always shown, and required */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required={isNotesRequired}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {action === 'edit' ? 'Update Data' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitActionModal;