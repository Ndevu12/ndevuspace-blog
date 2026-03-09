// Example of what gets sent to the server

// Case 1: With File Upload
const exampleFormDataWithFile = new FormData();
exampleFormDataWithFile.append('title', 'My Blog Post');
exampleFormDataWithFile.append('description', 'Blog description');
exampleFormDataWithFile.append('content', '<p>Blog content here</p>');
exampleFormDataWithFile.append('author', 'John Doe');
exampleFormDataWithFile.append('status', 'published');
exampleFormDataWithFile.append('categoryId', '64f5a1234567890abcdef123');
exampleFormDataWithFile.append('readingTime', '5');
exampleFormDataWithFile.append('tags', JSON.stringify(['nextjs', 'react', 'tutorial']));
// exampleFormDataWithFile.append('image', actualFileObject); // File object from input

// Case 2: With Image URL
const exampleFormDataWithURL = new FormData();
exampleFormDataWithURL.append('title', 'My Blog Post');
exampleFormDataWithURL.append('description', 'Blog description');
exampleFormDataWithURL.append('content', '<p>Blog content here</p>');
exampleFormDataWithURL.append('author', 'John Doe');
exampleFormDataWithURL.append('status', 'published');
exampleFormDataWithURL.append('categoryId', '64f5a1234567890abcdef123');
exampleFormDataWithURL.append('readingTime', '5');
exampleFormDataWithURL.append('tags', JSON.stringify(['nextjs', 'react', 'tutorial']));
exampleFormDataWithURL.append('imageUrl', 'https://example.com/image.jpg'); // URL string

export { exampleFormDataWithFile, exampleFormDataWithURL };
