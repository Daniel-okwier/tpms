import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateScreening } from "@/redux/slices/screeningSlice";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/utils/axios";
import Button from "@/components/shared/Button";
import { toast } from "react-hot-toast";

const EditScreeningPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    api.get(`/screenings/${id}`).then((res) => setForm(res.data.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateScreening({ id, updates: form })).unwrap();
      toast.success("Screening updated successfully");
      navigate("/screenings");
    } catch (err) {
      toast.error(err || "Failed to update screening");
    }
  };

  if (!form) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Edit Screening</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="facilityName"
            value={form.facilityName}
            onChange={handleChange}
            placeholder="Facility Name"
            className="w-full border p-2 rounded"
          />
          <select
            name="screeningOutcome"
            value={form.screeningOutcome}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="suspected_tb">Suspected TB</option>
            <option value="not_suspected">Not Suspected</option>
          </select>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="priority">Priority</option>
            <option value="normal">Normal</option>
          </select>

          <div className="flex space-x-2">
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/screenings")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScreeningPage;
