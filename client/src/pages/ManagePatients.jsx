import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatients,
  createPatient,
  archivePatient,
  updatePatient,
  searchPatients,
} from "@/redux/slices/patientSlice";
import { useNavigate } from "react-router-dom";
import api from "@/utils/axios";

export default function Patients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items = [], loading, error } = useSelector((state) => state.patients || {});

  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [message, setMessage] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [formData, setFormData] = useState(initialForm());
  const [searchTerm, setSearchTerm] = useState("");

  function initialForm() {
    return {
      mrn: "",
      firstName: "",
      lastName: "",
      gender: "male",
      dateOfBirth: "",
      contactInfo: { phone: "", email: "" },
      address: "",
      facilityName: "",
      initialStatus: "suspected_tb",
    };
  }

  useEffect(() => {
    // load first page of patients
    dispatch(fetchPatients({ page: 1, limit: 20 }));
  }, [dispatch]);

  // called when opening Create form (only for NEW patients)
  const ensureNextMrn = async () => {
    try {
      // fetch latest patient (page=1, limit=1) — backend returns { success: true, patients, ... }
      const res = await api.get("/patients?page=1&limit=1");
      const latest = res.data?.patients?.[0];
      const next = computeNextMrn(latest?.mrn);
      setFormData((prev) => ({ ...prev, mrn: next }));
    } catch (err) {
      // fallback MRN
      setFormData((prev) => ({ ...prev, mrn: generateFallbackMrn() }));
    }
  };

  const computeNextMrn = (lastMrn) => {
    if (!lastMrn) return generateFallbackMrn();
    // find trailing digits
    const match = lastMrn.match(/(\d+)$/);
    if (match) {
      const digits = match[1];
      const prefix = lastMrn.slice(0, lastMrn.length - digits.length);
      const nextNum = (parseInt(digits, 10) || 0) + 1;
      // preserve length with zero padding
      const nextDigits = String(nextNum).padStart(digits.length, "0");
      return `${prefix}${nextDigits}`;
    }
    // no trailing digits → append -1 (or timestamp)
    return `${lastMrn}-${Date.now().toString().slice(-5)}`;
  };

  const generateFallbackMrn = () => {
    const ts = Date.now().toString().slice(-6);
    return `MRN-${ts}`;
  };

  // Show form handler: when opening NEW form generate MRN
  const openCreateForm = async () => {
    setEditingPatient(null);
    setFormData(initialForm());
    setShowForm(true);
    await ensureNextMrn();
  };

  
  // Handler
  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage("");

    try {
      if (editingPatient) {
        await dispatch(
          updatePatient({ id: editingPatient._id, updates: formData })
        ).unwrap?.();
        setMessage("Patient updated successfully.");
      } else {
        await dispatch(createPatient(formData)).unwrap?.();
        setMessage("Patient created successfully.");
      }

      // refresh list
      await dispatch(fetchPatients({ page: 1, limit: 20 }));
      setShowForm(false);
      setEditingPatient(null);
      setFormData(initialForm());
    } catch (err) {
      setMessage(err?.message || err?.payload?.message || "Operation failed.");
    } finally {
      setFormLoading(false);
      // clear message after a short while
      setTimeout(() => setMessage(""), 3500);
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm("Are you sure you want to archive this patient?")) return;
    try {
      await dispatch(archivePatient(id)).unwrap?.();
      await dispatch(fetchPatients({ page: 1, limit: 20 }));
      setMessage("Patient archived.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err?.message || "Failed to archive.");
    }
  };

  const handleEdit = (patient) => {
    // normalize dateOfBirth to yyyy-mm-dd if present
    const dob = patient.dateOfBirth ? patient.dateOfBirth.split("T")[0] : "";
    setEditingPatient(patient);
    setFormData({
      ...patient,
      dateOfBirth: dob,
      contactInfo: patient.contactInfo || { phone: "", email: "" },
    });
    setShowForm(true);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    setSearchLoading(true);
    setMessage("");
    try {
      if (searchTerm.trim()) {
        // try both name and mrn search
        await dispatch(
          searchPatients({
            name: searchTerm.trim(),
            mrn: searchTerm.trim(),
          })
        ).unwrap?.();
      } else {
        // empty search -> reload
        await dispatch(fetchPatients({ page: 1, limit: 20 }));
      }
    } catch (err) {
      setMessage(err?.message || "Search failed.");
    } finally {
      setSearchLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black">Patient Management</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : openCreateForm())}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? "Close Form" : "Create Patient"}
        </button>
      </div>

      {/* messages */}
      {message && (
        <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-black">
          {message}
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2 items-center max-w-md">
        <input
          type="text"
          placeholder="Search by MRN or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded flex-1 text-black placeholder-slate-400"
          aria-label="Search patients by MRN or name"
        />
        <button
          type="submit"
          disabled={searchLoading}
          className={`px-4 py-2 rounded-lg ${searchLoading ? "bg-gray-400 text-white" : "bg-green-600 text-white"}`}
        >
          {searchLoading ? "Searching patient..." : "Search"}
        </button>
      </form>

      {/* Create / Edit form */}
      {showForm && (
        <form
          onSubmit={handleCreateOrUpdate}
          className="bg-white shadow-md rounded-lg p-4 mb-6 grid grid-cols-2 gap-4"
        >
          <input
            type="text"
            placeholder="MRN"
            value={formData.mrn}
            onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
            required
            className="border p-2 rounded text-black"
            readOnly={!editingPatient} // MRN auto when creating; allow edit when explicitly editing
          />

          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            className="border p-2 rounded text-black"
          />

          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            className="border p-2 rounded text-black"
          />

          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            className="border p-2 rounded text-black"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
            className="border p-2 rounded text-black"
          />

          <input
            type="text"
            placeholder="Phone"
            value={formData.contactInfo.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, phone: e.target.value },
              })
            }
            className="border p-2 rounded text-black"
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.contactInfo.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactInfo: { ...formData.contactInfo, email: e.target.value },
              })
            }
            className="border p-2 rounded text-black"
          />

          <input
            type="text"
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="border p-2 rounded text-black"
          />

          <input
            type="text"
            placeholder="Facility Name"
            value={formData.facilityName}
            onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
            required
            className="border p-2 rounded text-black"
          />

          <select
            value={formData.initialStatus}
            onChange={(e) => setFormData({ ...formData, initialStatus: e.target.value })}
            className="border p-2 rounded text-black"
          >
            <option value="suspected_tb">Suspected TB</option>
            <option value="confirmed_tb">Confirmed TB</option>
          </select>

          <button
            type="submit"
            className={`col-span-2 py-2 rounded-lg text-white ${formLoading ? "bg-gray-400" : "bg-green-600"}`}
            disabled={formLoading}
          >
            {formLoading ? (editingPatient ? "Updating..." : "Saving...") : (editingPatient ? "Update Patient" : "Save Patient")}
          </button>
        </form>
      )}

      {/* Patient Table */}
      {loading ? (
        <p>Loading patients...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th className="px-4 py-2 text-left">MRN</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Gender</th>
                <th className="px-4 py-2 text-left">Facility</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-black">
                    No patients found.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-black">{p.mrn}</td>
                    <td className="px-4 py-2 text-black font-medium">{p.firstName} {p.lastName}</td>
                    <td className="px-4 py-2 text-black capitalize">{p.gender}</td>
                    <td className="px-4 py-2 text-black">{p.facilityName}</td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button
                        onClick={() => navigate(`/patients/${p._id}`)}
                        className="bg-gray-600 text-white px-3 py-1 rounded"
                        title="View patient"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                        title="Edit patient"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleArchive(p._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded"
                        title="Archive patient"
                      >
                        Archive
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
