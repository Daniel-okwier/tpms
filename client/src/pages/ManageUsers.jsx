// src/pages/ManageUsers.jsx
import React, { useState } from "react";
import api from "../utils/axios";

export default function ManageUsers() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await api.post("auth/register", formData); // admin creates user
      setMessage(`User ${data.name} (${data.role}) created successfully!`);
      setFormData({ name: "", email: "", password: "", role: "doctor" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="p-6 ml-64">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      {message && <p className="mb-4 text-green-600">{message}</p>}
      <form onSubmit={handleSubmit} className="max-w-md space-y-4 bg-white p-6 rounded shadow">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-600"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-600"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-600"
        >
          <option value="doctor">Doctor</option>
          <option value="lab_staff">Lab Staff</option>
          <option value="nurse">Nurse</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded p-3 transition-colors"
        >
          Create User
        </button>
      </form>
    </div>
  );
}
