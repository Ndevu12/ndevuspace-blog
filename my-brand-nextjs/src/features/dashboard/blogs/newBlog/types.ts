import { BlogCategory } from '@/types/blog';

export interface BlogFormData {
  title: string;
  subtitle?: string;
  description: string;
  content: string;
  categoryId?: string;
  tags: string[];
  readingTime?: string;
  author: string;
  featuredImage?: File;
  imageUrl?: string;
  imageCaption?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'published' | 'draft';
  publishDate?: string;
}

export interface NewBlogFormProps {
  onSubmit: (data: BlogFormData) => Promise<void> | void;
  onPreview: (data: BlogFormData) => void;
  isSubmitting?: boolean;
  initialData?: Partial<BlogFormData>;
  isEditMode?: boolean; // Add isEditMode prop
}

export interface PreviewModalProps {
  data: BlogFormData;
  onClose: () => void;
}

export interface CategorySelectorProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
}

export interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  onImageUrlChange: (url: string) => void;
  imageUrl?: string;
  featuredImage?: File;
  className?: string;
}

export interface RichTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}
