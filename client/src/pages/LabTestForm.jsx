
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createLabTest } from '../redux/slices/labTestsSlice';
import { fetchPatients } from '../redux/slices/patientSlice';
import { X } from 'lucide-react';

const LabTestForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { patients } = useSelector((state) => state.patients);
  const { loading, error, successMessage } = useSelector((state) => state.labTests);

  const [formData, setFormData] = useState({
    patient: '',
    testTypes: [],
    tests: {}, 
    clinicalNotes: '',
    priority: 'routine',
  });

  const testOptions = [
    'GeneXpert',
    'Smear Microscopy',
    'Culture',
    'Chest X-ray',
    'Other',
  ];

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleTestSelect = (testType) => {
    setFormData((prev) => {
      const selected = prev.testTypes.includes(testType)
        ? prev.testTypes.filter((t) => t !== testType)
        : [...prev.testTypes, testType];

      // Reset test data when unselected
      const updatedTests = { ...prev.tests };
      if (!selected.includes(testType)) delete updatedTests[testType];

      return { ...prev, testTypes: selected, tests: updatedTests };
    });
  };

  const handleResultChange = (testType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      tests: {
        ...prev.tests,
        [testType]: {
          ...prev.tests[testType],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = formData.testTypes.map((type) => ({
      patient: formData.patient,
      testType: type,
      clinicalNotes: formData.clinicalNotes,
      priority: formData.priority,
      ...formData.tests[type],
    }));
    dispatch(createLabTest(payload));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-3xl shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">
          Create Lab Test Order
        </h2>

        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 mb-3 rounded">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Patient</label>
            <select
              value={formData.patient}
              onChange={(e) =>
                setFormData({ ...formData, patient: e.target.value })
              }
              required
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800"
            >
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Test Types</label>
            <div className="flex flex-wrap gap-3">
              {testOptions.map((testType) => (
                <label key={testType} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.testTypes.includes(testType)}
                    onChange={() => handleTestSelect(testType)}
                    className="accent-blue-600"
                  />
                  <span>{testType}</span>
                </label>
              ))}
            </div>
          </div>

          {formData.testTypes.map((testType) => (
            <div key={testType} className="border p-4 rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-blue-600 mb-2">{testType} Result</h3>

              {testType === 'GeneXpert' && (
                <>
                  <div className="flex gap-4 mb-2">
                    <label>
                      MTB Detected:
                      <select
                        value={formData.tests[testType]?.mtbDetected || ''}
                        onChange={(e) =>
                          handleResultChange(testType, 'mtbDetected', e.target.value)
                        }
                        className="ml-2 p-1 border rounded"
                      >
                        <option value="">Select</option>
                        <option value="detected">Detected</option>
                        <option value="not_detected">Not Detected</option>
                        <option value="indeterminate">Indeterminate</option>
                      </select>
                    </label>
                    <label>
                      Rif Resistance:
                      <select
                        value={formData.tests[testType]?.rifResistance || ''}
                        onChange={(e) =>
                          handleResultChange(testType, 'rifResistance', e.target.value)
                        }
                        className="ml-2 p-1 border rounded"
                      >
                        <option value="">Select</option>
                        <option value="detected">Detected</option>
                        <option value="not_detected">Not Detected</option>
                        <option value="indeterminate">Indeterminate</option>
                      </select>
                    </label>
                  </div>
                </>
              )}

              {testType === 'Smear Microscopy' && (
                <div className="flex gap-4 mb-2">
                  <label>
                    Result:
                    <select
                      value={formData.tests[testType]?.result || ''}
                      onChange={(e) =>
                        handleResultChange(testType, 'result', e.target.value)
                      }
                      className="ml-2 p-1 border rounded"
                    >
                      <option value="">Select</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="scanty">Scanty</option>
                    </select>
                  </label>
                </div>
              )}

              {testType === 'Culture' && (
                <div className="flex gap-4 mb-2">
                  <label>
                    Growth:
                    <select
                      value={formData.tests[testType]?.growth || ''}
                      onChange={(e) =>
                        handleResultChange(testType, 'growth', e.target.value)
                      }
                      className="ml-2 p-1 border rounded"
                    >
                      <option value="">Select</option>
                      <option value="positive">Positive</option>
                      <option value="negative">Negative</option>
                      <option value="contaminated">Contaminated</option>
                      <option value="pending">Pending</option>
                    </select>
                  </label>
                </div>
              )}

              {testType === 'Chest X-ray' && (
                <div className="flex flex-col gap-2">
                  <label>
                    Impression:
                    <input
                      type="text"
                      className="ml-2 p-1 border rounded w-full"
                      value={formData.tests[testType]?.impression || ''}
                      onChange={(e) =>
                        handleResultChange(testType, 'impression', e.target.value)
                      }
                    />
                  </label>
                  <label>
                    Cavitation:
                    <input
                      type="checkbox"
                      checked={formData.tests[testType]?.cavitation || false}
                      onChange={(e) =>
                        handleResultChange(testType, 'cavitation', e.target.checked)
                      }
                      className="ml-2"
                    />
                  </label>
                </div>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Clinical Notes</label>
            <textarea
              value={formData.clinicalNotes}
              onChange={(e) =>
                setFormData({ ...formData, clinicalNotes: e.target.value })
              }
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-800"
              rows="3"
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {loading ? 'Saving...' : 'Save Tests'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LabTestForm;
