"use client";

import React from "react";
import { BlogContentProps } from "../types";

export const BlogContent: React.FC<BlogContentProps> = ({ blog }) => {
  return (
    <div className="bg-secondary rounded-xl p-6 border border-gray-700">
      {/* Featured Image */}
      {blog.imageUrl && (
        <div className="mb-8">
          <img
            src={blog.imageUrl}
            alt={blog.title}
            className="w-full h-auto max-h-96 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <div
          className="blog-content text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html:
              blog.content ||
              '<p class="text-gray-400 italic">No content available.</p>',
          }}
        />
      </div>

      {/* Content Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {blog.content
                ? Math.ceil(
                    blog.content.replace(/<[^>]*>/g, "").split(" ").length / 200
                  )
                : 0}
            </div>
            <div className="text-sm text-gray-400">Est. Reading Time (min)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {blog.content
                ? blog.content.replace(/<[^>]*>/g, "").split(" ").length
                : 0}
            </div>
            <div className="text-sm text-gray-400">Word Count</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {blog.content ? blog.content.replace(/<[^>]*>/g, "").length : 0}
            </div>
            <div className="text-sm text-gray-400">Characters</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {blog.content
                ? (blog.content.match(/<img[^>]*>/g) || []).length
                : 0}
            </div>
            <div className="text-sm text-gray-400">Images</div>
          </div>
        </div>
      </div>
    </div>
  );
};
