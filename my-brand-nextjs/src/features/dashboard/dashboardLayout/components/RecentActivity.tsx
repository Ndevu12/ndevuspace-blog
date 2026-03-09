import React from "react";

const activities = [
  { id: 1, text: "Logged in", time: "2 min ago" },
  { id: 2, text: "Updated profile", time: "10 min ago" },
  { id: 3, text: "Created new project", time: "1 hour ago" },
];

const RecentActivity: React.FC = () => (
  <div className="bg-white shadow-lg rounded-xl p-6">
    <h2 className="text-lg font-bold mb-4 text-gray-800">Recent Activity</h2>
    <ul>
      {activities.map((a) => (
        <li key={a.id} className="mb-2 flex justify-between text-gray-700">
          <span>{a.text}</span>
          <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-0.5">
            {a.time}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivity;
