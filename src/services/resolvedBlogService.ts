// Resolved blog service — Strategy pattern applied at the module level
// Env check happens exactly ONCE at module evaluation time.
// All consumers import from here — no need to know about the data source.

import { IS_USE_DUMMY_DATA_ENABLED } from "@/lib/env";
import * as blogApi from "./blogService";
import * as dummyBlogApi from "./dummyBlogService";

const resolved = IS_USE_DUMMY_DATA_ENABLED ? dummyBlogApi : blogApi;

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
