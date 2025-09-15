import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/utils/axios";

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const { data } = await api.get(`/patients/${id}`);
        setPatient(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load patient");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (loading) return <p className="p-6">Loading patient...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">
          Patient Details – {patient.firstName} {patient.lastName}
        </h1>
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/patients`)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/patients/edit/${patient._id}`)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-semibold">MRN:</span> {patient.mrn}</p>
          <p><span className="font-semibold">Gender:</span> {patient.gender}</p>
          <p><span className="font-semibold">Date of Birth:</span>{" "}
            {new Date(patient.dateOfBirth).toLocaleDateString()}</p>
          <p><span className="font-semibold">Facility:</span> {patient.facilityName}</p>
          <p><span className="font-semibold">Initial Status:</span>{" "}
            {patient.initialStatus.replace("_", " ")}</p>
          <p><span className="font-semibold">Registered On:</span>{" "}
            {new Date(patient.registrationDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">
          Contact Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-semibold">Phone:</span>{" "}
            {patient.contactInfo?.phone || "—"}</p>
          <p><span className="font-semibold">Email:</span>{" "}
            {patient.contactInfo?.email || "—"}</p>
          <p className="col-span-2"><span className="font-semibold">Address:</span>{" "}
            {patient.address || "—"}</p>
        </div>
      </div>

      {/* History Placeholders */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-700 mb-4">
          Medical History
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li>Diagnosis history (to be linked to Diagnosis module)</li>
          <li>Lab test results (to be linked to Lab Tests module)</li>
          <li>Treatments (to be linked to Treatments module)</li>
          <li>Appointments & screenings (to be linked)</li>
        </ul>
      </div>
    </div>
  );
}
