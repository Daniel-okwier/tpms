import React, { useMemo, useState } from "react";
import VisitList from "./VisitList";
import VisitActionModal from "./VisitActionModal";
import { toast } from "react-toastify";

const TreatmentDetail = ({
  treatment,
  onClose,
  onMarkComplete,
  onMarkMissed,
  onEditVisit,
}) => {
  if (!treatment) return null;

  const {
    patient,
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

  // 🔥 FIX: Store only the LATEST follow-up object for a given date.
  const followUpsByDate = useMemo(() => {
    const map = {};
    // By iterating through the followUps array, the last one for a date will overwrite previous ones,
    // ensuring we get the FINAL, most recent status and data for that date.
    followUps.forEach((f) => {
      if (f && f.date) {
        const key = new Date(f.date).toISOString().split("T")[0];
        map[key] = f; 
      }
    });
    return map;
  }, [followUps]);

  const [modal, setModal] = useState({
    open: false,
    date: null,
    action: null,
    initialData: {},
  });

  const getVisitData = (dateIso) => {
    const dateKey = new Date(dateIso).toISOString().split("T")[0];
    // Now just retrieve the latest object directly
    return followUpsByDate[dateKey] || {}; 
  };

  const handleOpenEditModal = (dateIso) => {
    setModal({
      open: true,
      date: dateIso,
      action: "edit",
      initialData: getVisitData(dateIso),
    });
  };

  const handleMarkComplete = (dateIso) => {
    setModal({
      open: true,
      date: dateIso,
      action: "complete",
      initialData: {},
    });
  };

  const handleMarkMissed = (dateIso) => {
    setModal({
      open: true,
      date: dateIso,
      action: "missed",
      initialData: {},
    });
  };

  const handleCloseModal = () => {
    setModal({ open: false, date: null, action: null, initialData: {} });
  };

  const handleSubmitModal = async (payload) => {
    const { action, date, initialData } = modal;

    let finalPayload = { ...payload };
    let submitFunction = onEditVisit;
    let successMessage = "";

    if (action === "edit") {
      // Preserve the current status if editing the data/notes, unless explicitly changing the status
      finalPayload = { ...payload, status: payload.status || initialData.status }; 
      successMessage = "Visit data updated successfully.";
      submitFunction = onEditVisit; // Use onEditVisit for existing records
    } else if (action === "complete") {
      finalPayload = { ...payload, status: 'completed' };
      successMessage = "Visit marked as completed.";
      submitFunction = onMarkComplete;
    } else if (action === "missed") {
      finalPayload = { notes: payload.notes, status: 'missed' };
      successMessage = "Visit marked as missed.";
      submitFunction = onMarkMissed;
    }

    try {
      // The submit function (handleAddOrUpdateVisit) now includes the toast.success, 
      // but keeping this one for consistency with your existing code logic.
      await submitFunction(date, finalPayload); 
      // toast.success(successMessage); // Duplicative toast removed if handleAddOrUpdateVisit handles it
      handleCloseModal();
    } catch (error) {
      console.error(`Error processing ${action} visit:`, error);
      toast.error(`Failed to ${action} visit.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
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
              <span className="font-medium">Start:</span> {startDate ? new Date(startDate).toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-900">
              <span className="font-medium">Expected End:</span> {expectedEndDate ? new Date(expectedEndDate).toLocaleDateString() : "N/A"}
            </p>
            {actualEndDate && (
              <p className="text-gray-900">
                <span className="font-medium">Actual End:</span> {new Date(actualEndDate).toLocaleDateString()}
              </p>
            )}
            <p className="mt-2">
              <span className="font-medium">Status:</span>{" "}
              <span className={`inline-block px-2 py-1 rounded text-sm ${status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                {status}
              </span>
            </p>
          </div>
        </div>

        <div className="mb-6 text-sm text-gray-700">
          <p>
            <span className="font-medium">Created By:</span> {createdBy?.name || "N/A"} ({createdBy?.role || "N/A"})
          </p>
          <p>
            <span className="font-medium">Created At:</span> {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Follow-up Visits</h3>
          <VisitList
            visitSchedule={Array.isArray(visitSchedule) ? visitSchedule : []}
            followUpsByDate={followUpsByDate}
            onMarkComplete={handleMarkComplete}
            onMarkMissed={handleMarkMissed}
            onEditVisit={handleOpenEditModal}
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

      <VisitActionModal
        open={modal.open}
        date={modal.date}
        action={modal.action}
        initialData={modal.initialData} 
        onClose={handleCloseModal}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
};

export default TreatmentDetail;