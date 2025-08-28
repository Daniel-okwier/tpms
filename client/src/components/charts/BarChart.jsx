import React from "react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BarChart({ data = [], labels = [], title }) {
  const chartData =
    data.length && typeof data[0] === "object"
      ? data
      : labels.map((label, idx) => ({
          name: label,
          value: data[idx] || 0,
        }));

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      <ResponsiveContainer width="100%" height={300}>
        <ReBarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#374151" />
          <YAxis stroke="#374151" />
          <Tooltip />
          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
