// Resolved blog service — chooses dummy vs real implementation at module evaluation.

import { getClientPublicConfig } from "@/lib/config";
import * as blogApi from "./blogService";
import * as dummyBlogApi from "./dummyBlogService";

type BlogApiContract = {
  getBlogsPaginated: typeof blogApi.getBlogsPaginated;
  getBlogById: typeof blogApi.getBlogById;
  getBlogBySlug: typeof blogApi.getBlogBySlug;
  getBlogsByCategory: typeof blogApi.getBlogsByCategory;
  getBlogsByTags: typeof blogApi.getBlogsByTags;
  searchBlogsByTitle: typeof blogApi.searchBlogsByTitle;
  likeBlog: typeof blogApi.likeBlog;
  getAdjacentBlogs: typeof blogApi.getAdjacentBlogs;
  incrementBlogView: typeof blogApi.incrementBlogView;
  getPublicTags: typeof blogApi.getPublicTags;
  getAllBlogCategories: typeof blogApi.getAllBlogCategories;
};

const resolved: BlogApiContract = getClientPublicConfig().useDummyData
  ? dummyBlogApi
  : blogApi;

export const getBlogsPaginated = resolved.getBlogsPaginated;
export const getBlogById = resolved.getBlogById;
export const getBlogBySlug = resolved.getBlogBySlug;
export const getBlogsByCategory = resolved.getBlogsByCategory;
export const getBlogsByTags = resolved.getBlogsByTags;
export const searchBlogsByTitle = resolved.searchBlogsByTitle;
export const likeBlog = resolved.likeBlog;
export const getAdjacentBlogs = resolved.getAdjacentBlogs;
export const incrementBlogView = resolved.incrementBlogView;
export const getPublicTags = resolved.getPublicTags;
export const getAllBlogCategories = resolved.getAllBlogCategories;

