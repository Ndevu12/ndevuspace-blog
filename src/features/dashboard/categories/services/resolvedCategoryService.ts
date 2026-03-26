// Resolved category service — chooses dummy vs real implementation at module evaluation.

import { getClientPublicConfig } from "@/lib/config";
import * as categoryApi from "./categoryService";
import * as dummyCategoryApi from "./dummyCategoryService";

const resolved = getClientPublicConfig().useDummyData ? dummyCategoryApi : categoryApi;

export const getAllCategories = resolved.getAllCategories;
export const getCategoryById = resolved.getCategoryById;

export { createCategory, updateCategory, deleteCategory } from "./categoryService";

