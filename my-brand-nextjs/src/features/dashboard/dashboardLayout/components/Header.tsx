"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import { MessageNotification } from "../../messages/components/MessageNotification";

const Header: React.FC = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Redirect anyway
      router.push("/auth/login");
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!mounted) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mounted]);

  // Display user info or loading state
  const displayName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username
    : "Loading...";

  const welcomeMessage = user
    ? `Welcome back, ${
        user.firstName || user.username
      }! Ready to create content?`
    : "Loading dashboard...";

  return (
    <header className="bg-secondary border-b border-gray-700 shadow-lg sticky top-0 z-20 w-full md:header-continuous">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Dashboard Title & User Welcome */}
        <div className="flex-1 ml-4 md:ml-0">
          <h1 className="text-xl font-bold text-white">My Brand Dashboard</h1>
          <p className="text-sm text-gray-400">{welcomeMessage}</p>
        </div>

        {/* Search bar (desktop only) */}
        <div className="hidden md:flex items-center bg-primary/50 rounded-lg px-3 py-2 w-1/3 border border-gray-700">
          <i className="fas fa-search text-gray-400 mr-3"></i>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent w-full focus:outline-none text-gray-300"
            aria-label="Search"
          />
        </div>

        {/* Right Actions - Messages, Notifications & Profile */}
        <div className="flex items-center space-x-4 ml-4">
          {/* Messages */}
          <div ref={notifRef} className="relative">
            <MessageNotification
              onClick={() => setNotifOpen((open: boolean) => !open)}
            />

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-secondary border border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Recent Messages
                  </h3>
                  <p className="text-sm text-gray-400 text-center py-4">
                    No new messages
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <i className="fas fa-bell text-lg text-gray-400"></i>
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                5
              </span>
            </button>
          </div>

          {/* User Profile Dropdown */}
          {isAuthenticated && user && (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                className="flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 px-3 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setProfileOpen((open: boolean) => !open)}
                aria-label="User Profile"
              >
                <Image
                  src={user.avatar || "/images/anonymous.png"}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full object-cover border border-gray-600"
                />
                <span className="hidden md:block text-sm text-white font-medium">
                  {user.firstName || user.username}
                </span>
                <i className="fas fa-chevron-down text-xs text-gray-400"></i>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-secondary border border-gray-600 rounded-lg shadow-xl z-50">
                  {/* Profile Header */}
                  <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={user.avatar || "/images/anonymous.png"}
                        alt="Profile"
                        width={48}
                        height={48}
                        className="rounded-full object-cover border-2 border-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white truncate">
                          {displayName}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">
                          {user.email}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Menu */}
                  <div className="p-2">
                    <Link
                      href="/dashboard"
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <i className="fas fa-tachometer-alt mr-3 w-4"></i>
                      Dashboard
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <i className="fas fa-cog mr-3 w-4"></i>
                      Settings
                    </Link>
                    <hr className="my-2 border-gray-600" />
                    <button
                      type="button"
                      className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt mr-3 w-4"></i>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading state for auth */}
          {isLoading && (
            <div className="flex items-center space-x-2 px-3 py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-600 border-t-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
