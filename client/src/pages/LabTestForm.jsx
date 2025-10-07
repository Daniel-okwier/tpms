
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLabTest } from "../redux/slices/labTestsSlice";
import { fetchPatients } from "../redux/slices/patientSlice";

const LabTestForm = ({ onClose }) => {
  const dispatch = useDispatch();

  const patients = useSelector((state) => state.patients?.items || []);
  const loadingPatients = useSelector((state) => state.patients?.loading);

  const [formData, setFormData] = useState({
    patient: "",
    testType: "",
    status: "ordered",
    priority: "routine",
    specimenType: "",
    clinicalNotes: "",
    result: {},
  });

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResultChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      result: {
        ...prev.result,
        [name]: value,
      },
    }));
  };

  const renderResultFields = () => {
    switch (formData.testType) {
      case "Sputum Smear Microscopy":
        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">Smear Result</label>
            <div className="flex gap-4">
              {["Positive", "Negative"].map((option) => (
                <label key={option} className="flex items-center gap-1 text-gray-900">
                  <input
                    type="radio"
                    name="smearResult"
                    value={option}
                    checked={formData.result.smearResult === option}
                    onChange={handleResultChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      case "GeneXpert":
        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">MTB Detection</label>
            <div className="flex gap-4">
              {["Detected", "Not Detected"].map((option) => (
                <label key={option} className="flex items-center gap-1 text-gray-900">
                  <input
                    type="radio"
                    name="mtbDetected"
                    value={option}
                    checked={formData.result.mtbDetected === option}
                    onChange={handleResultChange}
                  />
                  {option}
                </label>
              ))}
            </div>

            <label className="block font-medium mt-2 text-gray-900">Rifampicin Resistance</label>
            <div className="flex gap-4">
              {["Resistant", "Sensitive", "Indeterminate"].map((option) => (
                <label key={option} className="flex items-center gap-1 text-gray-900">
                  <input
                    type="radio"
                    name="rifResistance"
                    value={option}
                    checked={formData.result.rifResistance === option}
                    onChange={handleResultChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      case "Chest X-ray":
        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">Radiological Impression</label>
            <select
              name="xrayResult"
              value={formData.result.xrayResult || ""}
              onChange={handleResultChange}
              className="w-full border p-2 rounded text-gray-900"
            >
              <option value="">-- Select Result --</option>
              <option value="Normal">Normal</option>
              <option value="Suggestive of TB">Suggestive of TB</option>
              <option value="Other Pathology">Other Pathology</option>
            </select>
          </div>
        );

      case "Culture Test":
        return (
          <div className="space-y-2">
            <label className="block font-medium text-gray-900">Culture Result</label>
            <div className="flex gap-4">
              {["Positive", "Negative", "Contaminated"].map((option) => (
                <label key={option} className="flex items-center gap-1 text-gray-900">
                  <input
                    type="radio"
                    name="cultureResult"
                    value={option}
                    checked={formData.result.cultureResult === option}
                    onChange={handleResultChange}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.testType) {
      alert("Please select a patient and test type.");
      return;
    }
    dispatch(createLabTest(formData));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
          Add New Lab Test
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 text-gray-900">
          {/* Patient */}
          <div>
            <label className="block mb-1 font-medium">Patient</label>
            <select
              name="patient"
              value={formData.patient}
              onChange={handleChange}
              className="w-full border p-2 rounded text-gray-900"
              required
            >
              <option value="">-- Select Patient --</option>
              {loadingPatients ? (
                <option>Loading...</option>
              ) : patients.length > 0 ? (
                patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} (MRN: {p.mrn})
                  </option>
                ))
              ) : (
                <option disabled>No patients found</option>
              )}
            </select>
          </div>

          {/* Test Type */}
          <div>
            <label className="block mb-1 font-medium">Test Type</label>
            <select
              name="testType"
              value={formData.testType}
              onChange={handleChange}
              className="w-full border p-2 rounded text-gray-900"
              required
            >
              <option value="">-- Select Test Type --</option>
              <option value="Sputum Smear Microscopy">Sputum Smear Microscopy</option>
              <option value="GeneXpert">GeneXpert</option>
              <option value="Chest X-ray">Chest X-ray</option>
              <option value="Culture Test">Culture Test</option>
            </select>
          </div>

          {/* Specimen Type (Radio Buttons) */}
          <div>
            <label className="block mb-1 font-medium">Specimen Type</label>
            <div className="flex flex-wrap gap-3">
              {["Sputum", "Blood", "Tissue", "Pleural Fluid", "Urine", "Other"].map(
                (specimen) => (
                  <label key={specimen} className="flex items-center gap-1 text-gray-900">
                    <input
                      type="radio"
                      name="specimenType"
                      value={specimen}
                      checked={formData.specimenType === specimen}
                      onChange={handleChange}
                    />
                    {specimen}
                  </label>
                )
              )}
            </div>
          </div>

          {/* Dynamic Result Fields */}
          {renderResultFields()}

          {/* Clinical Notes */}
          <div>
            <label className="block mb-1 font-medium">Clinical Notes</label>
            <textarea
              name="clinicalNotes"
              value={formData.clinicalNotes}
              onChange={handleChange}
              className="w-full border p-2 rounded text-gray-900 placeholder-gray-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block mb-1 font-medium">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border p-2 rounded text-gray-900"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition w-full"
          >
            Save Lab Test
          </button>
        </form>
      </div>
    </div>
  );
};

export default LabTestForm;

