import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreeningById,
  screeningSelectors,
} from "../redux/slices/screeningSlice";
import { toast } from "react-toastify";

const ScreeningDetailsPage = ({ screeningId, onClose }) => {
  const dispatch = useDispatch();

  const screening = useSelector((state) =>
    screeningSelectors.selectById(state, screeningId)
  );
  const loading = useSelector((state) => state.screenings.loading);
  const error = useSelector((state) => state.screenings.error);

  useEffect(() => {
    if (screeningId) {
      dispatch(fetchScreeningById(screeningId));
    }
  }, [dispatch, screeningId]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  if (loading === "pending") return <p>Loading screening details...</p>;
  if (!screening) return <p>No details available.</p>;

  return (
    <div className="bg-white p-6 rounded shadow mt-4">
      <h3 className="text-lg font-semibold mb-3">Screening Details</h3>
      <div className="space-y-2 text-sm">
        <p>
          <strong>Patient:</strong> {screening.patient?.firstName}{" "}
          {screening.patient?.lastName}
        </p>
        <p>
          <strong>Date:</strong>{" "}
          {new Date(screening.date || screening.screeningDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Type:</strong> {screening.type}
        </p>
        <p>
          <strong>Notes:</strong> {screening.notes || "None"}
        </p>
      </div>

      <div className="mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 shadow"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ScreeningDetailsPage;
