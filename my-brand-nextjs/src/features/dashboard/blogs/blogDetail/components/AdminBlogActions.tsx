"use client";

import React, { useState } from "react";
import { BlogActionsProps } from "../types";
import Button from "@/components/atoms/Button/Button";

export const AdminBlogActions: React.FC<BlogActionsProps> = ({
  blogId,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    if (onDelete) {
      setIsProcessing(true);
      try {
        await onDelete(blogId);
        setShowDeleteModal(false);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDuplicate = async () => {
    if (onDuplicate) {
      setIsProcessing(true);
      try {
        await onDuplicate(blogId);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <>
      <div className="bg-secondary rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">
          <i className="fas fa-cog mr-2 text-yellow-400"></i>
          Admin Actions
        </h3>

        <div className="space-y-3">
          {/* Edit Action */}
          <Button
            variant="primary"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={() => onEdit?.(blogId)}
          >
            <i className="fas fa-edit mr-2"></i>
            Edit Blog
          </Button>

          {/* Duplicate Action */}
          <Button
            variant="secondary"
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium"
            onClick={handleDuplicate}
            disabled={isProcessing}
          >
            <i className="fas fa-copy mr-2"></i>
            {isProcessing ? "Duplicating..." : "Duplicate Blog"}
          </Button>

          {/* Toggle Status Action */}
          <Button
            variant="ghost"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium"
            onClick={() => onToggleStatus?.(blogId)}
          >
            <i className="fas fa-eye mr-2"></i>
            Toggle Status
          </Button>

          {/* Delete Action */}
          <Button
            variant="ghost"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
            onClick={() => setShowDeleteModal(true)}
          >
            <i className="fas fa-trash-alt mr-2"></i>
            Delete Blog
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Confirm Delete</h3>
                <p className="text-gray-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this blog post? This will
              permanently remove the blog and all associated data.
            </p>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="ghost"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt mr-2"></i>
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
