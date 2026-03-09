import React from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div
      className="flex h-screen w-full overflow-hidden bg-primary text-white font-roboto"
      data-page="dashboard"
    >
      {/* Sidebar */}
      <Sidebar />
      {/* Main layout container */}
      <div className="dashboard-layout flex-1 flex flex-col h-screen">
        {/* Header */}
        <Header />
        {/* Main content area - important to have flex-grow and overflow-y-auto */}
        <main className="p-6 flex-grow overflow-y-auto bg-gradient-to-b from-primary to-black/90">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
