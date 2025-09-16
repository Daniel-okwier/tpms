import React, { useState } from "react";
import LabTestForm from "./LabTestForm";

const LabTestDetail = ({ test, onClose }) => {
  const [showEditForm, setShowEditForm] = useState(false);

  if (!test) return null;

  return (
    <>
      {/* Drawer overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose}></div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-lg z-50 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Lab Test Details</h2>
          <button
            onClick={onClose}
            className="text-black font-bold text-lg hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-2 text-black">
          <p>
            <span className="font-semibold">Patient:</span>{" "}
            {test.patient?.firstName} {test.patient?.lastName}
          </p>
          <p>
            <span className="font-semibold">Test Type:</span> {test.testType}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {test.status}
          </p>
          <p>
            <span className="font-semibold">Priority:</span> {test.priority}
          </p>
          <p>
            <span className="font-semibold">Specimen Type:</span> {test.specimenType}
          </p>
          <p>
            <span className="font-semibold">Clinical Notes:</span> {test.clinicalNotes || "-"}
          </p>
          <p>
            <span className="font-semibold">Order Date:</span>{" "}
            {new Date(test.orderDate).toLocaleDateString()}
          </p>
          {test.verifiedBy && (
            <p>
              <span className="font-semibold">Verified By:</span> {test.verifiedBy?.name}
            </p>
          )}
        </div>

        {/* Edit button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowEditForm(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditForm && (
        <LabTestForm
          onClose={() => setShowEditForm(false)}
          existingTest={test}
        />
      )}
    </>
  );
};

export default LabTestDetail;
