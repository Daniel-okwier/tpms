import React from "react";

const TreatmentDetail = ({ treatment, onClose }) => {
  if (!treatment) return null;

  const {
    patient,
    diagnosis,
    regimen,
    startDate,
    expectedEndDate,
    actualEndDate,
    status,
    followUps = [],
    createdAt,
    createdBy,
  } = treatment;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Treatment Details</h2>

        {/* PATIENT INFO */}
        <section className="border-b border-gray-200 pb-3 mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Patient Information</h3>
          <p>
            <strong>Name:</strong> {patient?.firstName} {patient?.lastName}
          </p>
          <p>
            <strong>MRN:</strong> {patient?.mrn}
          </p>
        </section>

        {/* DIAGNOSIS */}
        {diagnosis && (
          <section className="border-b border-gray-200 pb-3 mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Diagnosis</h3>
            <p>
              <strong>Type:</strong> {diagnosis.diagnosisType}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(diagnosis.diagnosisDate).toLocaleDateString()}
            </p>
          </section>
        )}

        {/* TREATMENT DETAILS */}
        <section className="border-b border-gray-200 pb-3 mb-4">
          <h3 className="font-semibold text-gray-700 mb-2">Treatment Information</h3>
          <p>
            <strong>Regimen:</strong> {regimen}
          </p>
          <p>
            <strong>Start Date:</strong>{" "}
            {new Date(startDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Expected End:</strong>{" "}
            {new Date(expectedEndDate).toLocaleDateString()}
          </p>
          {actualEndDate && (
            <p>
              <strong>Actual End:</strong>{" "}
              {new Date(actualEndDate).toLocaleDateString()}
            </p>
          )}
          <p>
            <strong>Status:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-sm ${
                status === "completed"
                  ? "bg-green-100 text-green-700"
                  : status === "ongoing"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {status}
            </span>
          </p>
          <p>
            <strong>Created By:</strong> {createdBy?.name || "N/A"} ({createdBy?.role})
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(createdAt).toLocaleDateString()}
          </p>
        </section>

        {/* FOLLOW-UPS */}
        <section>
          <h3 className="font-semibold text-gray-700 mb-2">Follow-Up Visits</h3>
          {followUps.length === 0 ? (
            <p className="text-gray-500">No follow-up entries yet.</p>
          ) : (
            <table className="w-full border text-sm text-gray-800">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Weight (kg)</th>
                  <th className="border px-2 py-1 text-left">Pill Count</th>
                  <th className="border px-2 py-1 text-left">Side Effects</th>
                  <th className="border px-2 py-1 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((f, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">
                      {new Date(f.date).toLocaleDateString()}
                    </td>
                    <td className="border px-2 py-1">{f.weightKg || "-"}</td>
                    <td className="border px-2 py-1">{f.pillCount || "-"}</td>
                    <td className="border px-2 py-1">{f.sideEffects || "-"}</td>
                    <td className="border px-2 py-1">{f.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* CLOSE BUTTON */}
        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreatmentDetail;
