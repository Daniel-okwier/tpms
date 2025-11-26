import React, { useMemo, useState } from "react";
import VisitList from "./VisitList";
import VisitActionModal from "./VisitActionModal";

const TreatmentDetail = ({
  treatment,
  onClose,
  onMarkComplete,
  onMarkMissed,
  onEditVisit,   // <-- NEW: edit visit handler
}) => {
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
    visitSchedule = [],
    createdAt,
    createdBy,
  } = treatment;

  // Group follow-ups by date
  const followUpsByDate = useMemo(() => {
    const map = {};
    followUps.forEach((f) => {
      if (!f || !f.date) return;
      const key = new Date(f.date).toISOString().split("T")[0];
      map[key] = map[key] || [];
      map[key].push(f);
    });
    return map;
  }, [followUps]);

  // Modal state ONLY for EDIT VISIT
  const [modal, setModal] = useState({
    open: false,
    date: null,
    action: null,
  });

  const handleOpenEditModal = (dateIso) => {
    setModal({ open: true, date: dateIso, action: "edit" });
  };

  const handleCloseModal = () =>
    setModal({ open: false, date: null, action: null });

  const handleSubmitModal = async (payload) => {
    if (modal.action === "edit" && typeof onEditVisit === "function") {
      await onEditVisit(modal.date, payload);
    }

    handleCloseModal();
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Treatment Details</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient</h3>
            <p className="text-gray-900">
              <span className="font-medium">Name:</span> {patient?.firstName} {patient?.lastName}
            </p>
            <p className="text-gray-900">
              <span className="font-medium">MRN:</span> {patient?.mrn || "N/A"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Treatment</h3>
            <p className="text-gray-900">
              <span className="font-medium">Regimen:</span> {regimen}
            </p>
            <p className="text-gray-900">
              <span className="font-medium">Start:</span>{" "}
              {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-900">
              <span className="font-medium">Expected End:</span>{" "}
              {expectedEndDate ? new Date(expectedEndDate).toLocaleDateString() : "N/A"}
            </p>
            {actualEndDate && (
              <p className="text-gray-900">
                <span className="font-medium">Actual End:</span>{" "}
                {new Date(actualEndDate).toLocaleDateString()}
              </p>
            )}
            <p className="mt-2">
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${
                  status === "completed"
                    ? "bg-green-100 text-green-800"
                    : status === "ongoing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {status}
              </span>
            </p>
          </div>
        </div>

        {/* Metadata */}
        <div className="mb-6 text-sm text-gray-700">
          <p>
            <span className="font-medium">Created By:</span>{" "}
            {createdBy?.name || "N/A"} ({createdBy?.role || "N/A"})
          </p>
          <p>
            <span className="font-medium">Created At:</span>{" "}
            {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
          </p>
        </div>

        {/* Follow-up Visits */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Follow-up Visits
          </h3>

          <VisitList
            visitSchedule={Array.isArray(visitSchedule) ? visitSchedule : []}
            followUpsByDate={followUpsByDate}
            onMarkComplete={onMarkComplete}   // <-- DIRECT ACTION
            onMarkMissed={onMarkMissed}       // <-- DIRECT ACTION
            onEditVisit={handleOpenEditModal} // <-- ONLY edit opens modal
          />
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>

      {/* EDIT VISIT MODAL ONLY */}
      <VisitActionModal
        open={modal.open}
        date={modal.date}
        action={modal.action}
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
};

export default TreatmentDetail;
