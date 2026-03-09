"use client";

import { useState } from "react";
import { ContactMessage } from "@/types/message";
import { messageService } from "../messageService";

// Import design system components
import Typography from "@/components/atoms/Typography/Typography";
import Button from "@/components/atoms/Button/Button";
import Badge from "@/components/atoms/Badge/Badge";
import Card from "@/components/molecules/Card/Card";

interface MessageCardProps {
  message: ContactMessage;
  onUpdate: () => void;
}

function MessageCard({ message, onUpdate }: MessageCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleToggleRead = async () => {
    setIsLoading(true);
    try {
      await messageService.markMessageAsRead(message.id, !message.isRead);
      onUpdate();
    } catch (error) {
      console.error("Failed to update message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setIsLoading(true);
    try {
      await messageService.deleteMessage(message.id);
      onUpdate();
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = () => {
    const subject = message.subject ? `Re: ${message.subject}` : "Re: Your message";
    const mailtoUrl = `mailto:${message.email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoUrl, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const truncateMessage = (text: string, length: number = 150) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  };

  return (
    <Card
      variant="bordered"
      className={`relative transition-all duration-300 ${
        !message.isRead
          ? "border-accent/50 bg-gradient-to-br from-accent/5 to-transparent"
          : "border-gray-700 hover:border-accent/30"
      } ${isLoading ? "opacity-60" : ""}`}
      hover={!isLoading}
    >
      <div
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Unread indicator */}
        {!message.isRead && (
          <div className="absolute top-4 left-4 w-3 h-3">
            <div className="w-full h-full bg-accent rounded-full animate-pulse"></div>
          </div>
        )}

        <div className={`${!message.isRead ? "ml-6" : ""}`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Typography
                  variant="h6"
                  className={`font-roboto ${
                    !message.isRead ? "text-white" : "text-gray-300"
                  }`}
                >
                  {message.name}
                </Typography>
                <Badge
                  variant="status"
                  color={message.isRead ? "gray" : "yellow"}
                  size="sm"
                >
                  {message.isRead ? "Read" : "New"}
                </Badge>
              </div>
              
              <Typography variant="small" className="text-accent/80 font-medium">
                {message.email}
              </Typography>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <Typography variant="small">
                {formatDate(message.receivedAt)}
              </Typography>
              
              {/* Action buttons */}
              <div className={`flex gap-1 transition-opacity duration-200 ${
                showActions ? "opacity-100" : "opacity-0"
              }`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleRead}
                  disabled={isLoading}
                  className="w-8 h-8 p-0 min-w-0 hover:bg-accent/10"
                  title={message.isRead ? "Mark as unread" : "Mark as read"}
                >
                  <i className={`fas ${message.isRead ? "fa-envelope" : "fa-envelope-open"} text-xs`}></i>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-8 h-8 p-0 min-w-0 hover:bg-accent/10"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} text-xs`}></i>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-8 h-8 p-0 min-w-0 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete message"
                >
                  <i className="fas fa-trash text-xs"></i>
                </Button>
              </div>
            </div>
          </div>

          {/* Subject */}
          {message.subject && (
            <div className="mb-3">
              <Typography
                variant="h6"
                className="text-gray-200 font-medium font-roboto"
              >
                {message.subject}
              </Typography>
            </div>
          )}

          {/* Message preview/full content */}
          <div className="mb-4">
            <Typography
              variant="p"
              className="text-gray-300 leading-relaxed"
            >
              {isExpanded ? message.message : truncateMessage(message.message)}
            </Typography>
            
            {message.message.length > 150 && !isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="mt-2 text-accent hover:text-accent/80 p-0 h-auto min-w-0 font-medium"
              >
                Read more
              </Button>
            )}
          </div>

          {/* Actions */}
          {isExpanded && (
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <Button
                variant="primary"
                size="sm"
                onClick={handleReply}
                icon={<i className="fas fa-reply"></i>}
                iconPosition="left"
              >
                Reply
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleRead}
                disabled={isLoading}
                loading={isLoading}
                icon={<i className={`fas ${message.isRead ? "fa-envelope" : "fa-envelope-open"}`}></i>}
                iconPosition="left"
              >
                {message.isRead ? "Mark Unread" : "Mark Read"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                loading={isLoading}
                icon={<i className="fas fa-trash"></i>}
                iconPosition="left"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// Named export
export { MessageCard };

// Default export
export default MessageCard;
