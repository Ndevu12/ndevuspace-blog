import { Metadata } from 'next'
import { BlogPage } from '@/features/blog'

export const metadata: Metadata = {
  title: 'Blog | NdevuSpace - Latest Insights',
  description: 'Explore my latest articles on web development, software engineering, technology trends, and professional insights from the world of programming.',
  openGraph: {
    title: 'Blog | NdevuSpace - Latest Insights',
    description: 'Latest articles on web development, software engineering, and technology trends.',
    url: '/blog',
    siteName: 'NdevuSpace',
    images: [
      {
        url: '/images/blog-og.png',
        width: 1200,
        height: 630,
        alt: 'NdevuSpace Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function Blog() {
  return <BlogPage />
}
