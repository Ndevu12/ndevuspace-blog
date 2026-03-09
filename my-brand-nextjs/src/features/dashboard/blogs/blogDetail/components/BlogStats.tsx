"use client";

import React, { useState, useEffect } from "react";
import { BlogStatsProps } from "../types";
import { adminBlogDetailService } from "../services";

export const BlogStats: React.FC<BlogStatsProps> = ({ blog, stats }) => {
  const [blogStats, setBlogStats] = useState(stats);
  const [loading, setLoading] = useState(!stats);

  useEffect(() => {
    if (!stats) {
      const loadStats = async () => {
        try {
          // Prefer Mongo _id, fall back to id; guard if missing
          const safeId = blog._id ?? blog.id;
          if (!safeId) {
            console.warn("BlogStats: Missing blog id; using default stats.");
            setBlogStats({
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0,
            });
            setLoading(false);
            return;
          }
          const fetchedStats = await adminBlogDetailService.getBlogStats(safeId);
          setBlogStats(fetchedStats);
        } catch (error) {
          console.error("Failed to load blog stats");
          setBlogStats({
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
          });
        } finally {
          setLoading(false);
        }
      };

      loadStats();
    }
  }, [blog._id, blog.id, stats]);

  if (loading) {
    return (
      <div className="bg-secondary rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold mb-4 text-white">
          <i className="fas fa-chart-line mr-2 text-blue-400"></i>
          Blog Statistics
        </h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-white">
        <i className="fas fa-chart-line mr-2 text-blue-400"></i>
        Blog Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Views */}
        <div className="text-center p-4 bg-primary/30 rounded-lg">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            <i className="fas fa-eye"></i>
          </div>
          <div className="text-2xl font-bold text-white">
            {blogStats?.views.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-gray-400">Views</div>
        </div>

        {/* Likes */}
        <div className="text-center p-4 bg-primary/30 rounded-lg">
          <div className="text-3xl font-bold text-red-400 mb-2">
            <i className="fas fa-heart"></i>
          </div>
          <div className="text-2xl font-bold text-white">
            {blogStats?.likes.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-gray-400">Likes</div>
        </div>

        {/* Comments */}
        <div className="text-center p-4 bg-primary/30 rounded-lg">
          <div className="text-3xl font-bold text-green-400 mb-2">
            <i className="fas fa-comments"></i>
          </div>
          <div className="text-2xl font-bold text-white">
            {blogStats?.comments.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-gray-400">Comments</div>
        </div>

        {/* Shares */}
        <div className="text-center p-4 bg-primary/30 rounded-lg">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            <i className="fas fa-share"></i>
          </div>
          <div className="text-2xl font-bold text-white">
            {blogStats?.shares.toLocaleString() || "0"}
          </div>
          <div className="text-sm text-gray-400">Shares</div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h4 className="text-lg font-semibold text-white mb-3">
          Performance Indicators
        </h4>
        <div className="space-y-3">
          {/* Engagement Rate */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Engagement Rate</span>
            <span className="text-green-400 font-medium">
              {blogStats
                ? Math.round(
                    ((blogStats.likes + blogStats.comments + blogStats.shares) /
                      Math.max(blogStats.views, 1)) *
                      100
                  )
                : 0}
              %
            </span>
          </div>

          {/* Views per Day */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Avg. Views per Day</span>
            <span className="text-blue-400 font-medium">
              {blogStats
                ? Math.round(
                    blogStats.views /
                      Math.max(
                        1,
                        Math.ceil(
                          (Date.now() - new Date(blog.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                  )
                : 0}
            </span>
          </div>

          {/* Like Ratio */}
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Like Ratio</span>
            <span className="text-red-400 font-medium">
              {blogStats
                ? Math.round(
                    (blogStats.likes / Math.max(blogStats.views, 1)) * 100
                  )
                : 0}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
