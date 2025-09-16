import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createLabTest, updateLabTest, fetchLabTests } from '../redux/slices/labTestsSlice';
import { useSelector } from 'react-redux';
import { labTestsSelectors } from '../redux/slices/labTestsSlice';

const testTypes = ['GeneXpert', 'Smear Microscopy', 'Culture', 'Chest X-ray', 'Other'];
const priorities = ['routine', 'priority'];
const specimenTypes = ['sputum', 'blood', 'tissue', 'gastric_aspirate', 'other', 'not_applicable'];
const statuses = ['ordered', 'specimen_collected', 'in_progress', 'completed', 'verified', 'cancelled'];

const LabTestForm = ({ test, onClose }) => {
  const dispatch = useDispatch();
  const labTests = useSelector(labTestsSelectors.selectAll);

  const [formData, setFormData] = useState({
    patient: test?.patient?._id || '',
    testType: test?.testType || '',
    priority: test?.priority || 'routine',
    clinicalNotes: test?.clinicalNotes || '',
    specimenType: test?.specimenType || 'sputum',
    status: test?.status || 'ordered',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (test) {
        // Update existing
        await dispatch(updateLabTest({ id: test._id, updates: formData })).unwrap();
      } else {
        // Create new
        await dispatch(createLabTest(formData)).unwrap();
      }
      dispatch(fetchLabTests());
      onClose();
    } catch (err) {
      console.error('Error saving lab test:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{test ? 'Edit Lab Test' : 'Add Lab Test'}</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Patient</label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Patient</option>
              {labTests.map((t) => (
                <option key={t.patient?._id} value={t.patient?._id}>
                  {t.patient?.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Test Type</label>
            <select
              name="testType"
              value={formData.testType}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select Test Type</option>
              {testTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Specimen Type</label>
            <select
              name="specimenType"
              value={formData.specimenType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {specimenTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium">Clinical Notes</label>
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows="3"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {test ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabTestForm;
