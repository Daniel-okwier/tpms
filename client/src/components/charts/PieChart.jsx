import React from "react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function PieChart({ data = [], labels = [], title }) {
  // fallback if API sends object-based data
  const chartData =
    data.length && typeof data[0] === "object"
      ? data
      : labels.map((label, idx) => ({
          name: label,
          value: data[idx] || 0,
        }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
      <ResponsiveContainer width="100%" height={300}>
        <RePieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
