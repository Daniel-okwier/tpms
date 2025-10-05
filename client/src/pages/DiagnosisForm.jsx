import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatients } from "../redux/slices/patientSlice";
import { fetchLabTestsByPatient } from "../redux/slices/labTestsSlice";
import { createDiagnosis } from "../redux/slices/diagnosisSlice";

const DiagnosisForm = ({ onClose }) => {
const dispatch = useDispatch();
const { patients } = useSelector((state) => state.patient);
const { labTests, loading: labLoading } = useSelector((state) => state.labTest);

const [formData, setFormData] = useState({
patient: "",
diagnosis: "",
notes: "",
});

const [selectedPatientLabs, setSelectedPatientLabs] = useState([]);

useEffect(() => {
dispatch(fetchPatients());
}, [dispatch]);

// Fetch labs when patient changes
useEffect(() => {
if (formData.patient) {
dispatch(fetchLabTestsByPatient(formData.patient)).then((res) => {
if (res.payload) {
setSelectedPatientLabs(res.payload);
}
});
} else {
setSelectedPatientLabs([]);
}
}, [dispatch, formData.patient]);

const handleChange = (e) => {
setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = (e) => {
e.preventDefault();
dispatch(createDiagnosis(formData));
onClose();
};

return ( <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"> <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"> <h2 className="text-xl font-bold mb-4">New Diagnosis</h2> <form onSubmit={handleSubmit} className="space-y-4">
{/* Patient Selection */} <div> <label className="block font-semibold">Patient</label> <select
           name="patient"
           value={formData.patient}
           onChange={handleChange}
           required
           className="w-full border rounded px-3 py-2"
         > <option value="">-- Select Patient --</option>
{patients.map((p) => ( <option key={p._id} value={p._id}>
{p.firstName} {p.lastName} (MRN: {p.mrn}) </option>
))} </select> </div>

```
      {/* Lab Tests Preview */}
      <div>
        <label className="block font-semibold">Recent Lab Tests</label>
        {labLoading ? (
          <p>Loading lab results...</p>
        ) : selectedPatientLabs.length > 0 ? (
          <ul className="list-disc ml-5 text-sm">
            {selectedPatientLabs.map((lab) => (
              <li key={lab._id}>
                <strong>{lab.testType}</strong>: {lab.result} (
                {new Date(lab.date).toLocaleDateString()})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm">
            No lab results available for this patient.
          </p>
        )}
      </div>

      {/* Diagnosis Dropdown */}
      <div>
        <label className="block font-semibold">Diagnosis</label>
        <select
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Select Diagnosis --</option>
          <option value="Pulmonary TB - Confirmed">Pulmonary TB - Confirmed</option>
          <option value="Pulmonary TB - Presumptive">Pulmonary TB - Presumptive</option>
          <option value="Extrapulmonary TB">Extrapulmonary TB</option>
          <option value="Not TB">Not TB</option>
          <option value="MDR-TB">MDR-TB</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-semibold">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="Additional details..."
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Diagnosis
        </button>
      </div>
    </form>
  </div>
</div>
);
};

export default DiagnosisForm;
