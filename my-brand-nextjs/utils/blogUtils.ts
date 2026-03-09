// Default author information
const DEFAULT_AUTHOR = {
  name: "Jean Paul Elisa NIYOKWIZERWA",
  firstName: "Jean Paul Elisa",
  lastName: "NIYOKWIZERWA", 
  image: "/images/mypic.png",
};

export const getAuthorName = (author: any): string => {
  if (!author) return DEFAULT_AUTHOR.name;
  
  if (typeof author === "string") {
    return author;
  }
  
  if (author?.firstName && author?.lastName) {
    return `${author.firstName} ${author.lastName}`;
  }
  
  if (author?.firstName) {
    return author.firstName;
  }
  
  if (author?.name) {
    return author.name;
  }
  
  return DEFAULT_AUTHOR.name;
};

export const getAuthorImage = (post: any): string => {
  // Check for direct authorImage property on post
  if (post?.authorImage) return post.authorImage;
  
  // Check for image in author object
  if (post?.author && typeof post.author === 'object') {
    if ('image' in post.author && post.author.image) {
      return post.author.image;
    }
  }
  
  return DEFAULT_AUTHOR.image;
};
