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
        symptoms: existingScreening.symptoms || {
          coughWeeks: 0,
          fever: false,
          nightSweats: false,
          weightLoss: false,
          hemoptysis: false,
        },
        riskFactors: existingScreening.riskFactors || {
          hivPositive: false,
          onART: false,
          diabetes: false,
          closeContactTB: false,
          malnourished: false,
          smoker: false,
          alcoholUse: false,
          pregnancy: false,
        },
        vitals: existingScreening.vitals || {
          heightCm: "",
          weightKg: "",
          temperatureC: "",
          respiratoryRate: "",
          oxygenSaturation: "",
        },
        tbHistory: existingScreening.tbHistory || {
          previousTB: false,
          previousRegimen: "",
          treatmentOutcome: "unknown",
        },
      }
    : {
        patient: "",
        facilityName: "",
        screeningDate: new Date().toISOString().substring(0, 10),
        screeningOutcome: "suspected_tb",
        priority: "routine",
        referToLab: false,
        notes: "",
        symptoms: {
          coughWeeks: 0,
          fever: false,
          nightSweats: false,
          weightLoss: false,
          hemoptysis: false,
        },
        riskFactors: {
          hivPositive: false,
          onART: false,
          diabetes: false,
          closeContactTB: false,
          malnourished: false,
          smoker: false,
          alcoholUse: false,
          pregnancy: false,
        },
        vitals: {
          heightCm: "",
          weightKg: "",
          temperatureC: "",
          respiratoryRate: "",
          oxygenSaturation: "",
        },
        tbHistory: {
          previousTB: false,
          previousRegimen: "",
          treatmentOutcome: "unknown",
        },
      };

  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingScreening]);

  const handleChange = (e, section, field) => {
    const { name, value, type, checked } = e.target;

    if (section) {
      setForm((f) => ({
        ...f,
        [section]: {
          ...f[section],
          [field || name]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
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
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl relative p-6 overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-600 text-lg">
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-black">
          {existingScreening ? "Edit Screening" : "New Screening"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          {/* Patient */}
          <label className="flex flex-col">
            Patient
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
              required
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} (MRN: {p.mrn})
                </option>
              ))}
            </select>
          </label>

          {/* Facility & Date */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              Facility
              <input
                type="text"
                name="facilityName"
                value={form.facilityName}
                onChange={handleChange}
                className="border px-2 py-1 rounded text-black"
                required
              />
            </label>

            <label className="flex flex-col">
              Screening Date
              <input
                type="date"
                name="screeningDate"
                value={form.screeningDate}
                onChange={handleChange}
                className="border px-2 py-1 rounded text-black"
                required
              />
            </label>
          </div>

          {/* Symptoms */}
          <fieldset className="border p-3 rounded">
            <legend className="font-semibold">Symptoms</legend>
            <label className="flex flex-col">
              Cough duration (weeks)
              <input
                type="number"
                name="coughWeeks"
                value={form.symptoms.coughWeeks}
                onChange={(e) => handleChange(e, "symptoms")}
                className="border px-2 py-1 rounded"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {["fever", "nightSweats", "weightLoss", "hemoptysis"].map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={s}
                    checked={form.symptoms[s]}
                    onChange={(e) => handleChange(e, "symptoms")}
                  />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Risk Factors */}
          <fieldset className="border p-3 rounded">
            <legend className="font-semibold">Risk Factors</legend>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(form.riskFactors).map((r) => (
                <label key={r} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name={r}
                    checked={form.riskFactors[r]}
                    onChange={(e) => handleChange(e, "riskFactors")}
                  />
                  {r}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Vitals */}
          <fieldset className="border p-3 rounded">
            <legend className="font-semibold">Vitals</legend>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Height (cm)"
                name="heightCm"
                value={form.vitals.heightCm}
                onChange={(e) => handleChange(e, "vitals")}
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Weight (kg)"
                name="weightKg"
                value={form.vitals.weightKg}
                onChange={(e) => handleChange(e, "vitals")}
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Temperature (°C)"
                name="temperatureC"
                value={form.vitals.temperatureC}
                onChange={(e) => handleChange(e, "vitals")}
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Respiratory Rate"
                name="respiratoryRate"
                value={form.vitals.respiratoryRate}
                onChange={(e) => handleChange(e, "vitals")}
                className="border px-2 py-1 rounded"
              />
              <input
                type="number"
                placeholder="Oxygen Saturation (%)"
                name="oxygenSaturation"
                value={form.vitals.oxygenSaturation}
                onChange={(e) => handleChange(e, "vitals")}
                className="border px-2 py-1 rounded"
              />
            </div>
          </fieldset>

          {/* TB History */}
          <fieldset className="border p-3 rounded">
            <legend className="font-semibold">TB History</legend>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="previousTB"
                checked={form.tbHistory.previousTB}
                onChange={(e) => handleChange(e, "tbHistory")}
              />
              Previous TB
            </label>
            <input
              type="text"
              placeholder="Previous Regimen"
              name="previousRegimen"
              value={form.tbHistory.previousRegimen}
              onChange={(e) => handleChange(e, "tbHistory")}
              className="w-full border px-2 py-1 rounded mt-2"
            />
            <select
              name="treatmentOutcome"
              value={form.tbHistory.treatmentOutcome}
              onChange={(e) => handleChange(e, "tbHistory")}
              className="w-full border px-2 py-1 rounded mt-2"
            >
              <option value="unknown">Unknown</option>
              <option value="cured">Cured</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="defaulted">Defaulted</option>
              <option value="died">Died</option>
            </select>
          </fieldset>

          {/* Outcome, Notes */}
          <label className="flex flex-col">
            Outcome
            <select
              name="screeningOutcome"
              value={form.screeningOutcome}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
            >
              <option value="suspected_tb">Suspected TB</option>
              <option value="not_suspected">Not Suspected</option>
              <option value="confirmed_tb">Confirmed TB</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="referToLab"
              checked={form.referToLab}
              onChange={handleChange}
            />
            Refer to lab
          </label>

          <label className="flex flex-col">
            Priority
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
            >
              <option value="routine">Routine</option>
              <option value="priority">Priority</option>
            </select>
          </label>

          <label className="flex flex-col">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="border px-2 py-1 rounded text-black"
              rows="3"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {existingScreening ? "Update Screening" : "Create Screening"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScreeningForm;
