// Resolved blog service — chooses dummy vs real implementation at module evaluation.

import { getClientPublicConfig } from "@/lib/config";
import * as blogApi from "./blogService";
import * as dummyBlogApi from "./dummyBlogService";

type BlogApiContract = {
  getRecentBlogs: typeof blogApi.getRecentBlogs;
  getBlogsPaginated: typeof blogApi.getBlogsPaginated;
  getBlogById: typeof blogApi.getBlogById;
  getBlogBySlug: typeof blogApi.getBlogBySlug;
  getBlogsByCategory: typeof blogApi.getBlogsByCategory;
  getBlogsByTag: typeof blogApi.getBlogsByTag;
  searchBlogsByTitle: typeof blogApi.searchBlogsByTitle;
  likeBlog: typeof blogApi.likeBlog;
  getAllBlogCategories: typeof blogApi.getAllBlogCategories;
};

const resolved: BlogApiContract = getClientPublicConfig().useDummyData
  ? dummyBlogApi
  : blogApi;

export const getRecentBlogs = resolved.getRecentBlogs;
export const getBlogsPaginated = resolved.getBlogsPaginated;
export const getBlogById = resolved.getBlogById;
export const getBlogBySlug = resolved.getBlogBySlug;
export const getBlogsByCategory = resolved.getBlogsByCategory;
export const getBlogsByTag = resolved.getBlogsByTag;
export const searchBlogsByTitle = resolved.searchBlogsByTitle;
export const likeBlog = resolved.likeBlog;
export const getAllBlogCategories = resolved.getAllBlogCategories;

