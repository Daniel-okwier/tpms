import React from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LineChart({ data = [], labels = [], title }) {
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
        <ReLineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#374151" />
          <YAxis stroke="#374151" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
