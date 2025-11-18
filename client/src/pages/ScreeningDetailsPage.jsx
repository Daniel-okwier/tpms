import React, { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

const ScreeningDetail = ({ screeningId, onClose }) => {
  const [screening, setScreening] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!screeningId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get(`/screenings/${screeningId}`)
      .then((res) => {
        setScreening(res.data.data);
      })
      .catch((err) => {
        toast.error("Failed to fetch screening details");
      })
      .finally(() => setLoading(false));
  }, [screeningId]);

  if (!screeningId) return null;
  if (loading) return (
    <div className="p-4">Loading...</div>
  );

  if (!screening) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={onClose}></div>

      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-lg z-50 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Screening Details</h2>
          <button onClick={onClose} className="text-gray-600 text-lg">×</button>
        </div>

        <div className="space-y-2 text-black">
          <p><strong>Patient:</strong> {screening.patient?.firstName} {screening.patient?.lastName} (MRN: {screening.patient?.mrn})</p>
          <p><strong>Date:</strong> {new Date(screening.screeningDate).toLocaleDateString()}</p>
          <p><strong>Facility:</strong> {screening.facilityName}</p>
          <p><strong>Outcome:</strong> {screening.screeningOutcome}</p>
          <p><strong>Priority:</strong> {screening.priority}</p>
          <p><strong>Refer to Lab:</strong> {screening.referToLab ? "Yes" : "No"}</p>
          <p><strong>Notes:</strong> {screening.notes || "-"}</p>

          <hr />

          <div>
            <h4 className="font-semibold">Symptoms</h4>
            <pre className="whitespace-pre-wrap">{JSON.stringify(screening.symptoms || {}, null, 2)}</pre>
          </div>

          <div>
            <h4 className="font-semibold">Risk Factors</h4>
            <pre className="whitespace-pre-wrap">{JSON.stringify(screening.riskFactors || {}, null, 2)}</pre>
          </div>

          <div>
            <h4 className="font-semibold">Vitals</h4>
            <pre className="whitespace-pre-wrap">{JSON.stringify(screening.vitals || {}, null, 2)}</pre>
          </div>

          {screening.voided && (
            <p className="text-red-600">
              <strong>Voided:</strong> {screening.voidReason} on {new Date(screening.voidedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ScreeningDetail;
