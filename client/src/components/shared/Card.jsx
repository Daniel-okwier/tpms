import React from "react";

export default function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-col justify-between">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}
