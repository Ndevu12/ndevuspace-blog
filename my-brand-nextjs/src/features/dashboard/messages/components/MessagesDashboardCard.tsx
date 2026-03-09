"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { messageService } from "../messageService";

// Import design system components
import Typography from "@/components/atoms/Typography/Typography";
import Badge from "@/components/atoms/Badge/Badge";
import Card from "@/components/molecules/Card/Card";
import { Loading } from "@/components/atoms/Loading/Loading";

interface MessagesDashboardCardProps {
  className?: string;
}

export function MessagesDashboardCard({
  className = "",
}: MessagesDashboardCardProps) {
  const [messageCount, setMessageCount] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMessageStats = async () => {
      try {
        const messages = await messageService.fetchMessages();
        const unread = await messageService.getUnreadMessagesCount();
        setMessageCount(messages.length);
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to load message stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessageStats();
  }, []);

  if (loading) {
    return (
      <Card variant="elevated" className={`p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="small" className="text-gray-400">
              Messages
            </Typography>
            <div className="mt-2">
              <Loading size="sm" />
            </div>
          </div>
          <div className="text-green-500">
            <i className="fas fa-envelope text-2xl"></i>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Link href="/dashboard/messages">
      <Card
        variant="elevated"
        className={`p-6 hover:border-green-500/50 transition-all cursor-pointer group ${className}`}
        hover
      >
        <div className="flex items-center justify-between">
          <div>
            <Typography
              variant="small"
              className="text-gray-400 group-hover:text-gray-300 transition-colors"
            >
              Messages
            </Typography>
            <div className="flex items-center space-x-2">
              <Typography variant="h3" className="text-white mt-2 font-roboto">
                {messageCount}
              </Typography>
              {unreadCount > 0 && (
                <Badge variant="status" color="red" size="sm">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>
          <div className="text-green-500 group-hover:text-green-400 transition-colors">
            <i className="fas fa-envelope text-2xl"></i>
          </div>
        </div>
      </Card>
    </Link>
  );
}
