import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";
import Button from "@/components/shared/Button";

const ScreeningDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [screening, setScreening] = useState(null);

  useEffect(() => {
    api.get(`/screenings/${id}`).then((res) => setScreening(res.data.data));
  }, [id]);

  if (!screening) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Screening Details</h2>
        <div className="space-y-2">
          <p><strong>Patient:</strong> {screening.patient?.firstName} {screening.patient?.lastName}</p>
          <p><strong>Date:</strong> {new Date(screening.screeningDate).toLocaleDateString()}</p>
          <p><strong>Facility:</strong> {screening.facilityName}</p>
          <p><strong>Outcome:</strong> {screening.screeningOutcome}</p>
          <p><strong>Priority:</strong> {screening.priority}</p>
          {screening.voided && (
            <p className="text-red-600">
              <strong>Voided:</strong> {screening.voidReason} on{" "}
              {new Date(screening.voidedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate("/screenings")}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScreeningDetailsPage;
