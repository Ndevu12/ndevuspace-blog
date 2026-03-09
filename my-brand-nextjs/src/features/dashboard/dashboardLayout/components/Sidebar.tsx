"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "fas fa-chart-line",
    page: "dashboard",
  },
  {
    href: "/dashboard/blogs",
    label: "Blogs",
    icon: "fas fa-newspaper",
    page: "blogs",
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: "fas fa-envelope",
    page: "messages",
  },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch
    setMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Collapse/expand logic (desktop)
  const toggleSidebar = () => {
    if (!mounted) return;
    setCollapsed((prev) => !prev);
    document.body.classList.toggle("sidebar-collapsed");
  };

  // Mobile sidebar logic
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  // Dummy user data (replace with context/store)
  const user = {
    username: "Admin User",
    role: "Super Admin",
    avatar: "/images/mypic.png",
  };

  // Helper: get active link
  const isActive = (href: string) => {
    // Match by pathname
    return pathname === href;
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <aside className="hidden md:flex flex-col w-64 h-screen bg-secondary border-r border-gray-700 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo1.png"
              alt="NdevuSpace Logo"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              NdevuSpace
            </span>
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={closeSidebar}
          aria-label="Close sidebar overlay"
        />
      )}
      <aside
        className={`
          ${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 bg-secondary border-r border-gray-700 shadow-xl overflow-y-auto ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `hidden md:flex flex-col w-64 h-screen bg-secondary border-r border-gray-700 shadow-xl transition-all duration-300 ${
                  collapsed ? "sidebar-collapsed w-20" : "w-64"
                }`
          }
        `}
        aria-label="Sidebar"
      >
        {/* Logo & collapse/close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo1.png"
              alt="NdevuSpace Logo"
              width={40}
              height={40}
              className="rounded"
            />
            {!collapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                NdevuSpace
              </span>
            )}
          </Link>
          {isMobile ? (
            <button
              className="md:hidden text-gray-400 hover:text-white"
              title="Close Sidebar"
              aria-label="Close Sidebar"
              onClick={closeSidebar}
            >
              <i className="fas fa-times"></i>
            </button>
          ) : (
            <button
              className="hidden md:flex text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              onClick={toggleSidebar}
            >
              <i className={`fas ${collapsed ? "fa-expand" : "fa-bars"}`}></i>
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className={`mt-4 px-4 flex-1 ${collapsed ? "px-1" : "px-4"}`}>
          <h4
            className={`text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 ${
              collapsed ? "hidden" : "block"
            }`}
          >
            Main
          </h4>
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 nav-link ${
                    isActive(link.href)
                      ? "bg-gray-800 text-yellow-400"
                      : "text-gray-300 hover:text-yellow-400 hover:bg-gray-800"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  data-page={link.page}
                >
                  <i className={`${link.icon} w-5`}></i>
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Copyright */}
        {!collapsed && (
          <div className="mt-auto pt-8 px-4 pb-4">
            <span className="text-xs text-gray-500">© 2025 NdevuSpace</span>
          </div>
        )}
      </aside>

      {/* Mobile sidebar toggle button */}
      {isMobile && !sidebarOpen && (
        <button
          className="fixed bottom-6 left-6 z-40 bg-secondary text-gray-400 hover:text-white p-3 rounded-full shadow-lg md:hidden"
          title="Open Sidebar"
          aria-label="Open Sidebar"
          onClick={openSidebar}
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
      )}
    </>
  );
};

export default Sidebar;
