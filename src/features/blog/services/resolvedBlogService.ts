// Resolved blog service — chooses dummy vs real implementation at module evaluation.

import { getClientPublicConfig } from "@/lib/config";
import * as blogApi from "./blogService";
import * as dummyBlogApi from "./dummyBlogService";

const resolved = getClientPublicConfig().useDummyData ? dummyBlogApi : blogApi;

export const getRecentBlogs = resolved.getRecentBlogs;
export const getBlogsPaginated = resolved.getBlogsPaginated;
export const getBlogById = resolved.getBlogById;
export const getBlogBySlug = resolved.getBlogBySlug;
export const getBlogsByCategory = resolved.getBlogsByCategory;
export const getBlogsByTag = resolved.getBlogsByTag;
export const searchBlogsByTitle = resolved.searchBlogsByTitle;
export const likeBlog = resolved.likeBlog;
export const getAuthorByBlogId = resolved.getAuthorByBlogId;
export const getAllBlogCategories = resolved.getAllBlogCategories;

