// Resolved category service — env check happens once at module evaluation
// All consumers import from here. Write operations (CRUD) always use the real API.

import { IS_USE_DUMMY_DATA_ENABLED } from "@/lib/envConfig";
import * as categoryApi from "./categoryService";
import * as dummyCategoryApi from "./dummyCategoryService";

const resolved = IS_USE_DUMMY_DATA_ENABLED ? dummyCategoryApi : categoryApi;

// Read operations — env-aware
export const getAllCategories = resolved.getAllCategories;
export const getCategoryById = resolved.getCategoryById;

// Write operations — always real API (admin only)
export { createCategory, updateCategory, deleteCategory } from "./categoryService";
