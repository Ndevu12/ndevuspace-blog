// Simple FormData builder - no complex transformations
import { BlogFormData } from '../types';

/**
 * Build FormData from BlogFormData - Direct mapping, no transformations
 */
export function buildBlogFormData(data: BlogFormData): FormData {
  const formData = new FormData();
  
  // Add text fields directly
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('content', data.content);
  formData.append('author', data.author);
  formData.append('status', data.status);
  
  // Add optional text fields
  if (data.subtitle) formData.append('subtitle', data.subtitle);
  if (data.categoryId) formData.append('categoryId', data.categoryId);
  if (data.readingTime) formData.append('readingTime', data.readingTime);
  if (data.imageCaption) formData.append('imageCaption', data.imageCaption);
  if (data.metaTitle) formData.append('metaTitle', data.metaTitle);
  if (data.metaDescription) formData.append('metaDescription', data.metaDescription);
  if (data.publishDate) formData.append('publishDate', data.publishDate);
  
  // Add tags as JSON string
  if (data.tags.length > 0) {
    formData.append('tags', JSON.stringify(data.tags));
  }
  
  // Handle image - file takes priority
  if (data.featuredImage instanceof File) {
    formData.append('image', data.featuredImage);
  } 
  
  if (data.imageUrl && data.imageUrl.trim()) {
    formData.append('imageUrl', data.imageUrl);
  }
  
  return formData;
}
