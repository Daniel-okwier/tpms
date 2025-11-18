import React from "react";

const DiagnosisDetails = ({ diagnosis, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 text-lg"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">Diagnosis Details</h2>

        <div className="space-y-2 text-black">
          <p>
            <strong>Patient:</strong>{" "}
            {diagnosis.patient?.firstName} {diagnosis.patient?.lastName} (MRN:{" "}
            {diagnosis.patient?.mrn})
          </p>
          <p>
            <strong>Diagnosis Type:</strong> {diagnosis.diagnosisType}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(diagnosis.diagnosisDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Doctor:</strong> {diagnosis.diagnosedBy?.name}
          </p>
          {diagnosis.notes && (
            <p>
              <strong>Notes:</strong> {diagnosis.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisDetails;
