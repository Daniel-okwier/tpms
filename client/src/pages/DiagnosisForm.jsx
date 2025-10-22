import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDiagnosis } from "../redux/slices/diagnosisSlice";
import { fetchPatients } from "../redux/slices/patientSlice";
import { fetchLabTestsByPatient } from "../redux/slices/labTestsSlice";

const DiagnosisForm = () => {
const dispatch = useDispatch();


const patients = useSelector((state) => state.patients?.items || []);
const patientsLoading = useSelector((state) => state.patients?.loading || false);

const labResults = useSelector((state) => state.labResults?.labResults || []);
const labLoading = useSelector((state) => state.labResults?.loading || false);

const [formData, setFormData] = useState({
patient: "",
diagnosis: "",
notes: "",
});

// Fetch patients once
useEffect(() => {
dispatch(fetchPatients({ page: 1, limit: 50 }));
}, [dispatch]);

// Fetch lab results when patient changes
useEffect(() => {
if (formData.patient) {
dispatch(fetchLabTestsByPatient(formData.patient));
}
}, [formData.patient, dispatch]);

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};

const handleSubmit = (e) => {
e.preventDefault();
if (!formData.patient || !formData.diagnosis) {
alert("Please select a patient and a diagnosis.");
return;
}
dispatch(createDiagnosis(formData));
setFormData({ patient: "", diagnosis: "", notes: "" });
};

return ( <form  
   onSubmit={handleSubmit}  
   className="p-4 border rounded bg-white shadow space-y-4"  
 > <h2 className="text-lg font-bold">Add Diagnosis</h2>

  {/* Patient Dropdown */}  
  <div>  
    <label className="block mb-1">Patient</label>  
    <select  
      name="patient"  
      value={formData.patient}  
      onChange={handleChange}  
      className="w-full border p-2 rounded"  
      required  
    >  
      <option value="">-- Select Patient --</option>  
      {patientsLoading ? (  
        <option>Loading...</option>  
      ) : patients.length > 0 ? (  
        patients.map((p) => (  
          <option key={p._id} value={p._id}>  
            {p.name} (MRN: {p.mrn})  
          </option>  
        ))  
      ) : (  
        <option disabled>No patients available</option>  
      )}  
    </select>  
  </div>  

  {/* Show lab results for selected patient */}  
  {formData.patient && (  
    <div className="bg-gray-50 border p-3 rounded">  
      <h3 className="font-semibold mb-2">Lab Results</h3>  
      {labLoading ? (  
        <p>Loading lab results...</p>  
      ) : labResults.length > 0 ? (  
        <ul className="list-disc pl-5 space-y-1">  
          {labResults.map((lr) => (  
            <li key={lr._id}>  
              <span className="font-medium">{lr.testType}:</span> {lr.result}  
            </li>  
          ))}  
        </ul>  
      ) : (  
        <p>No lab results for this patient.</p>  
      )}  
    </div>  
  )}  

  {/* Diagnosis dropdown */}  
  <div>  
    <label className="block mb-1">Diagnosis</label>  
    <select  
      name="diagnosis"  
      value={formData.diagnosis}  
      onChange={handleChange}  
      className="w-full border p-2 rounded"  
      required  
    >  
      <option value="">-- Select Diagnosis --</option>  
      <option value="Pulmonary TB">Pulmonary TB</option>  
      <option value="Extrapulmonary TB">Extrapulmonary TB</option>  
      <option value="MDR-TB">MDR-TB</option>  
      <option value="XDR-TB">XDR-TB</option>  
      <option value="Latent TB">Latent TB</option>  
    </select>  
  </div>  

  {/* Notes */}  
  <div>  
    <label className="block mb-1">Notes (optional)</label>  
    <textarea  
      name="notes"  
      value={formData.notes}  
      onChange={handleChange}  
      className="w-full border p-2 rounded"  
      placeholder="Additional notes..."  
    />  
  </div>  

  {/* Submit */}  
  <button  
    type="submit"  
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"  
  >  
    Save Diagnosis  
  </button>  
</form>  
);
};
export default DiagnosisForm;
