import React from "react";

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  accentColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  count,
  accentColor,
}) => (
  <div className="bg-white shadow-lg rounded-xl p-6 flex items-center space-x-4 min-h-[110px]">
    <div className={`text-3xl ${accentColor || "text-blue-600"}`}>{icon}</div>
    <div>
      <div className="text-lg font-semibold text-gray-700">{title}</div>
      <div className="text-2xl font-bold text-gray-900">{count}</div>
    </div>
  </div>
);

export default DashboardCard;
