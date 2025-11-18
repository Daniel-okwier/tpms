import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchScreeningById,
  updateScreening,
  screeningSelectors,
} from "../redux/slices/screeningSlice";
import { toast } from "react-toastify";

const EditScreeningPage = ({ screeningId, onClose }) => {
  const dispatch = useDispatch();

  const screening = useSelector((state) =>
    screeningSelectors.selectById(state, screeningId)
  );
  const loading = useSelector((state) => state.screenings.loading);
  const error = useSelector((state) => state.screenings.error);

  const [formData, setFormData] = useState({
    date: "",
    type: "",
    notes: "",
  });

  useEffect(() => {
    if (screeningId) {
      dispatch(fetchScreeningById(screeningId));
    }
  }, [dispatch, screeningId]);

  useEffect(() => {
    if (screening) {
      setFormData({
        date: screening.date || screening.screeningDate || "",
        type: screening.type || "",
        notes: screening.notes || "",
      });
    }
  }, [screening]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateScreening({ id: screeningId, updates: formData })).unwrap();
      toast.success("Screening updated successfully");
      onClose();
    } catch (err) {
      toast.error(err || "Failed to update screening");
    }
  };

  if (loading === "pending" && !screening) return <p>Loading screening...</p>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Edit Screening</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Date */}
        <div>
          <label className="block mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="border px-2 py-1 rounded w-full text-black"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block mb-2">Type</label>
          <input
            type="text"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="border px-2 py-1 rounded w-full text-black"
            placeholder="e.g. Initial, Follow-up"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block mb-2">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="border px-2 py-1 rounded w-full text-black"
            rows="3"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow"
          >
            Update
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 shadow"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditScreeningPage;
