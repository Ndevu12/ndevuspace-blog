"use client";

import { useState } from "react";
import { MessageFilters } from "@/types/message";
import { MessageList } from "./components/MessageList";

// Import design system components
import Typography from "@/components/atoms/Typography/Typography";
import Button from "@/components/atoms/Button/Button";
import Input from "@/components/atoms/Input/Input";
import Card from "@/components/molecules/Card/Card";

export default function MessagesPage() {
  const [filters, setFilters] = useState<MessageFilters>({});
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  };

  const handleFilterChange = (isRead?: boolean) => {
    setFilters((prev) => ({ ...prev, isRead }));
  };

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-yellow-400 rounded-2xl flex items-center justify-center shadow-xl shadow-accent/25">
              <i className="fas fa-envelope text-black text-2xl"></i>
            </div>
            <div>
              <Typography
                variant="h3"
                className="text-white font-roboto bg-gradient-to-r from-white via-gray-100 to-accent bg-clip-text text-transparent"
              >
                Message Center
              </Typography>
              <Typography variant="p" className="text-gray-400 text-lg">
                Manage and respond to messages from your contact form
              </Typography>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <Card
          variant="elevated"
          className="p-6 mb-6 animate-fade-in bg-gradient-to-br from-secondary via-secondary to-secondary/80 border-accent/20 shadow-xl shadow-black/20"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Typography
              variant="h3"
              className="text-white font-roboto flex items-center"
            >
              <i className="fas fa-chart-bar text-accent mr-3"></i>
              Overview
            </Typography>

            <div className="flex flex-wrap items-center gap-4">
              {/* Total Messages */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-accent/10 to-yellow-400/5 border border-accent/30 rounded-xl shadow-lg shadow-accent/10">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-accent/25">
                  <i className="fas fa-inbox text-black text-sm"></i>
                </div>
                <div>
                  <Typography
                    variant="small"
                    className="text-gray-400 text-xs uppercase tracking-wide"
                  >
                    Total Messages
                  </Typography>
                  <Typography variant="h4" className="text-accent font-bold">
                    {totalCount}
                  </Typography>
                </div>
              </div>

              {/* Unread Messages */}
              {unreadCount > 0 ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500/10 to-red-400/5 border border-red-500/30 rounded-xl shadow-lg shadow-red-500/10 animate-pulse">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-400 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                    <i className="fas fa-bell text-white text-sm"></i>
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      className="text-gray-400 text-xs uppercase tracking-wide"
                    >
                      Unread
                    </Typography>
                    <Typography variant="h4" className="text-red-400 font-bold">
                      {unreadCount}
                    </Typography>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500/10 to-green-400/5 border border-green-500/30 rounded-xl shadow-lg shadow-green-500/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
                    <i className="fas fa-check-circle text-white text-sm"></i>
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      className="text-gray-400 text-xs uppercase tracking-wide"
                    >
                      All Caught Up
                    </Typography>
                    <Typography
                      variant="h4"
                      className="text-green-400 font-bold"
                    >
                      {totalCount - unreadCount}
                    </Typography>
                  </div>
                </div>
              )}

              {/* Read Messages */}
              {totalCount > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-blue-400/5 border border-blue-500/30 rounded-xl shadow-lg shadow-blue-500/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <i className="fas fa-envelope-open text-white text-sm"></i>
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      className="text-gray-400 text-xs uppercase tracking-wide"
                    >
                      Read
                    </Typography>
                    <Typography
                      variant="h4"
                      className="text-blue-400 font-bold"
                    >
                      {totalCount - unreadCount}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Filters and Search Controls */}
        <Card
          variant="elevated"
          className="p-6 mb-8 animate-fade-in bg-gradient-to-br from-secondary/80 via-secondary/60 to-secondary/40 border-gray-600/50 shadow-lg"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Search Section */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  className="text-gray-400 uppercase tracking-wide text-xs"
                >
                  Search Messages
                </Typography>
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="Search by name, email, subject, or message..."
                    className="pl-12 pr-4 py-3 w-full sm:w-80 bg-secondary/50 border-gray-600 focus:border-accent focus:ring-accent/20 focus:bg-secondary transition-all duration-300"
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                  <i className="fas fa-search absolute left-4 top-4 text-gray-400 group-hover:text-accent transition-colors duration-300"></i>
                </div>
              </div>

              {/* Filter Section */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  className="text-gray-400 uppercase tracking-wide text-xs"
                >
                  Filter by Status
                </Typography>
                <div className="flex gap-2">
                  <Button
                    variant={
                      filters.isRead === undefined ? "primary" : "secondary"
                    }
                    size="sm"
                    onClick={() => handleFilterChange(undefined)}
                    className={`transition-all duration-300 transform hover:scale-105 ${
                      filters.isRead === undefined
                        ? "bg-gradient-to-r from-accent to-yellow-400 text-black font-semibold shadow-lg shadow-accent/25"
                        : "border-gray-600 text-gray-300 hover:border-accent/50 hover:text-accent"
                    }`}
                  >
                    <i className="fas fa-list text-xs mr-2"></i>
                    All
                  </Button>
                  <Button
                    variant={filters.isRead === false ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleFilterChange(false)}
                    className={`transition-all duration-300 transform hover:scale-105 ${
                      filters.isRead === false
                        ? "bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold shadow-lg shadow-red-500/25"
                        : "border-gray-600 text-gray-300 hover:border-red-400/50 hover:text-red-400"
                    }`}
                  >
                    <i className="fas fa-bell text-xs mr-2"></i>
                    Unread
                  </Button>
                  <Button
                    variant={filters.isRead === true ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => handleFilterChange(true)}
                    className={`transition-all duration-300 transform hover:scale-105 ${
                      filters.isRead === true
                        ? "bg-gradient-to-r from-green-500 to-green-400 text-white font-semibold shadow-lg shadow-green-500/25"
                        : "border-gray-600 text-gray-300 hover:border-green-400/50 hover:text-green-400"
                    }`}
                  >
                    <i className="fas fa-check text-xs mr-2"></i>
                    Read
                  </Button>
                </div>
              </div>

              {/* Sort Section */}
              <div className="space-y-2">
                <Typography
                  variant="small"
                  className="text-gray-400 uppercase tracking-wide text-xs"
                >
                  Sort Order
                </Typography>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "newest" | "oldest")
                    }
                    aria-label="Sort messages"
                    title="Sort messages"
                    className="pl-4 pr-10 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent bg-secondary/50 text-white transition-all duration-300 hover:bg-secondary appearance-none cursor-pointer min-w-40"
                  >
                    <option value="newest">📅 Newest First</option>
                    <option value="oldest">📅 Oldest First</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-4 text-gray-400 pointer-events-none"></i>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Message List */}
        <MessageList
          filters={filters}
          sortBy={sortBy}
          onUnreadCountChange={setUnreadCount}
          onTotalCountChange={setTotalCount}
          onFiltersChange={setFilters}
        />
      </div>
    </div>
  );
}
