// Dummy blog data for development — typed against blog/src/types/blog.ts
// Used when NEXT_PUBLIC_USE_DUMMY_DATA=true (via dummyBlogService.ts)

import type { BlogPost, BlogCategory, BlogComment, Author } from "@/types/blog";

// ─── Shared Entities ───

const defaultAuthor: Author = {
  _id: "author-1",
  user: "user-1",
  firstName: "Jean Paul Elisa",
  lastName: "NIYOKWIZERWA",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

export const dummyCategories: BlogCategory[] = [
  { _id: "cat-webdev", name: "Web Development", icon: "code" },
  { _id: "cat-design", name: "Design", icon: "palette" },
  { _id: "cat-tech", name: "Technology", icon: "cpu" },
  { _id: "cat-career", name: "Career", icon: "briefcase" },
  { _id: "cat-devops", name: "DevOps", icon: "server" },
];

const sampleComments: BlogComment[] = [
  {
    _id: "cmt-1",
    blogId: "blog-1",
    content: "Great article! Really helped me understand the trade-offs between different approaches.",
    name: "Alice M.",
    email: "alice@example.com",
    createdAt: "2024-03-10T14:30:00Z",
  },
  {
    _id: "cmt-2",
    blogId: "blog-1",
    content: "I've been using this approach in production for 6 months — highly recommended.",
    name: "Bob K.",
    createdAt: "2024-03-12T09:15:00Z",
  },
];

// ─── Blog Posts ───

export const dummyBlogs: BlogPost[] = [
  {
    _id: "blog-1",
    slug: "modern-web-architecture-evolution",
    title: "The Evolution of Modern Web Architecture",
    description:
      "From monolithic applications to microservices and serverless computing — how web architecture has transformed over time.",
    content: `
      <h2>The Monolithic Era</h2>
      <p>Traditionally, web applications were built as monolithic structures — single, unified codebases responsible for everything from UI to data persistence. This offered simplicity but presented challenges as apps grew.</p>
      <h2>The Rise of Microservices</h2>
      <p>Microservices emerged as organizations sought scalable, flexible alternatives. This style structures applications as collections of loosely coupled services, each implementing a specific business function.</p>
      <h3>Benefits of Microservices</h3>
      <ul>
        <li>Improved scalability — services scale independently</li>
        <li>Technology diversity — best tools for each service</li>
        <li>Development agility — smaller, focused teams</li>
        <li>Resilience — failures isolated to individual services</li>
      </ul>
      <h2>Serverless: The Next Evolution</h2>
      <p>Serverless computing abstracts away infrastructure management. Developers focus solely on writing code while cloud providers handle execution, scaling, and availability.</p>
      <h2>Choosing the Right Architecture</h2>
      <p>There is no one-size-fits-all solution. The best approach depends on application complexity, team size, performance constraints, and budget. Many organizations adopt hybrid architectures blending multiple approaches.</p>
    `,
    author: defaultAuthor,
    createdAt: "2024-02-15T10:30:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
    imageUrl: "/images/blog/tech.jfif",
    category: dummyCategories[0],
    tags: ["Architecture", "Web Development", "Microservices", "Serverless"],
    readTime: "8 min read",
    isFeatured: true,
    isNew: false,
    likes: 42,
    likesCount: 42,
    viewsCount: 1245,
    comments: sampleComments,
    status: "published",
    metaTitle: "The Evolution of Modern Web Architecture",
    metaDescription:
      "From monoliths to microservices to serverless — explore how web architecture has transformed.",
  },
  {
    _id: "blog-2",
    slug: "responsive-design-principles",
    title: "Responsive Web Design Principles",
    description:
      "Master the essential principles of responsive web design for modern websites and applications.",
    content: `
      <h2>What is Responsive Web Design?</h2>
      <p>Responsive web design makes web pages render well on a variety of devices and screen sizes. It's about creating websites that provide an optimal viewing experience with minimal resizing and scrolling.</p>
      <h2>Mobile-First Approach</h2>
      <p>Design for the smallest screen first, then progressively enhance for larger screens. This forces focus on essential content and functionality.</p>
      <h2>Modern Layout Techniques</h2>
      <h3>CSS Grid</h3>
      <pre><code class="language-css">.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}</code></pre>
      <h3>Flexbox</h3>
      <p>Flexbox provides efficient layout, alignment, and space distribution among items in a container — particularly useful for one-dimensional layouts.</p>
      <h2>Key Takeaways</h2>
      <ul>
        <li>Use fluid grids with relative units</li>
        <li>Make images flexible within their containers</li>
        <li>Leverage media queries for device-specific styles</li>
        <li>Consider container queries for component-level responsiveness</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2024-03-20T14:15:00Z",
    imageUrl: "/images/blog/programming.jfif",
    category: dummyCategories[0],
    tags: ["CSS", "Responsive", "Mobile-first", "Design"],
    readTime: "6 min read",
    isNew: false,
    likes: 28,
    likesCount: 28,
    viewsCount: 947,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-3",
    slug: "ui-ux-design-fundamentals",
    title: "UI/UX Design Fundamentals for Developers",
    description:
      "Learn the essential design principles every developer should know to build better user experiences.",
    content: `
      <h2>Why Developers Need Design Skills</h2>
      <p>Understanding design principles helps developers make better decisions at every level — from component architecture to micro-interactions. It bridges the gap between "it works" and "it works beautifully."</p>
      <h2>Core Principles</h2>
      <h3>Visual Hierarchy</h3>
      <p>Guide users through content by size, color, contrast, and spacing. The most important elements should be the most prominent.</p>
      <h3>Consistency</h3>
      <p>Consistent patterns reduce cognitive load. Use the same components, colors, and interactions throughout your application.</p>
      <h3>Accessibility</h3>
      <p>Design for everyone. Ensure sufficient color contrast, provide alt text, support keyboard navigation, and use semantic HTML.</p>
      <h2>Practical Tips</h2>
      <ul>
        <li>Start with a design system or component library</li>
        <li>Use whitespace generously — it's not wasted space</li>
        <li>Test with real users, not assumptions</li>
        <li>Limit your color palette and font choices</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2024-04-05T09:00:00Z",
    imageUrl: "/images/blog/social.jfif",
    category: dummyCategories[1],
    tags: ["UX", "UI", "Design Principles", "Accessibility"],
    readTime: "7 min read",
    isNew: false,
    likes: 35,
    likesCount: 35,
    viewsCount: 812,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-4",
    slug: "future-of-ai-in-tech",
    title: "The Future of AI in Tech",
    description:
      "Exploring how artificial intelligence is reshaping the technology landscape and what it means for developers.",
    content: `
      <h2>AI's Current Impact</h2>
      <p>Artificial intelligence has moved from research labs to production systems. From code completion tools to automated testing, AI is becoming an integral part of the development workflow.</p>
      <h2>AI-Assisted Development</h2>
      <p>Tools like GitHub Copilot and AI-powered code review are changing how we write software. They don't replace developers — they augment their capabilities and handle repetitive tasks.</p>
      <h2>Machine Learning in Production</h2>
      <p>Deploying ML models requires understanding infrastructure, monitoring, and the full MLOps lifecycle. It's not just about training models — it's about keeping them reliable in production.</p>
      <h2>Ethical Considerations</h2>
      <p>As AI becomes more pervasive, developers must consider bias, transparency, and the societal impact of the systems they build.</p>
      <blockquote>
        <p>"The question is not whether AI will transform our industry, but how we'll ensure it does so responsibly."</p>
      </blockquote>
    `,
    author: defaultAuthor,
    createdAt: "2024-05-12T11:00:00Z",
    imageUrl: "/images/blog/future.jfif",
    category: dummyCategories[2],
    tags: ["AI", "Machine Learning", "Future Tech"],
    readTime: "6 min read",
    isNew: false,
    likes: 56,
    likesCount: 56,
    viewsCount: 1580,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-5",
    slug: "starting-your-tech-startup",
    title: "Starting Your Tech Startup: A Practical Guide",
    description:
      "Practical advice for developers looking to turn ideas into viable tech businesses.",
    content: `
      <h2>From Idea to MVP</h2>
      <p>Every startup begins with a problem worth solving. The key is validating your idea before investing months of development. Talk to potential users, build prototypes, and iterate fast.</p>
      <h2>Technical Decisions That Matter</h2>
      <p>Choose boring technology for your core infrastructure. Innovation should be in your product, not your tech stack. Use what your team knows best — speed matters more than perfection.</p>
      <h2>Building Your Team</h2>
      <p>Start small. A founding team of 2-3 people who complement each other's skills is ideal. Look for people who ship, not just those with impressive resumes.</p>
      <h2>Funding and Growth</h2>
      <ul>
        <li>Bootstrap as long as possible to retain control</li>
        <li>Revenue is the best form of funding</li>
        <li>If you raise, raise enough to reach the next milestone</li>
        <li>Focus on unit economics from day one</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2024-06-01T08:30:00Z",
    imageUrl: "/images/blog/enjoy.jfif",
    category: dummyCategories[3],
    tags: ["Startup", "Business", "Entrepreneurship"],
    readTime: "7 min read",
    isNew: false,
    likes: 21,
    likesCount: 21,
    viewsCount: 623,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-6",
    slug: "typescript-best-practices-2024",
    title: "TypeScript Best Practices in 2024",
    description:
      "Level up your TypeScript with modern patterns, strict configurations, and real-world best practices.",
    content: `
      <h2>Strict Mode Is Non-Negotiable</h2>
      <p>Always enable <code>strict: true</code> in your tsconfig. It catches entire categories of bugs at compile time. The small upfront cost pays off enormously.</p>
      <h2>Prefer Interfaces Over Types (Usually)</h2>
      <p>Interfaces are extendable and produce better error messages. Use type aliases for unions, intersections, and mapped types where interfaces can't help.</p>
      <h2>Discriminated Unions</h2>
      <pre><code class="language-typescript">type Result&lt;T&gt; =
  | { success: true; data: T }
  | { success: false; error: string };

function handle(result: Result&lt;User&gt;) {
  if (result.success) {
    // TypeScript knows result.data exists here
    console.log(result.data.name);
  }
}</code></pre>
      <h2>Zod for Runtime Validation</h2>
      <p>TypeScript only checks at compile time. Use Zod to validate data at runtime boundaries — API responses, form inputs, environment variables.</p>
    `,
    author: defaultAuthor,
    createdAt: "2024-07-10T16:00:00Z",
    updatedAt: "2024-07-15T10:00:00Z",
    imageUrl: "/images/blog/languages.png",
    category: dummyCategories[0],
    tags: ["TypeScript", "Best Practices", "Web Development"],
    readTime: "5 min read",
    isNew: true,
    likes: 63,
    likesCount: 63,
    viewsCount: 2100,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-7",
    slug: "docker-kubernetes-developers",
    title: "Docker & Kubernetes for Developers",
    description:
      "A developer-focused guide to containerization and orchestration — from local development to production deployment.",
    content: `
      <h2>Why Containers?</h2>
      <p>Containers solve the "works on my machine" problem. They package your application with its dependencies into a consistent, portable unit that runs the same everywhere.</p>
      <h2>Docker Essentials</h2>
      <pre><code class="language-dockerfile">FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]</code></pre>
      <h2>Kubernetes Basics</h2>
      <p>Kubernetes orchestrates containers at scale. It handles deployment, scaling, load balancing, and self-healing. For most teams, managed services like EKS, GKE, or AKS are the way to go.</p>
      <h2>Local Development</h2>
      <p>Use Docker Compose for local multi-service setups. Tools like Tilt or Skaffold bridge the gap between local development and Kubernetes deployment.</p>
    `,
    author: defaultAuthor,
    createdAt: "2024-08-05T12:00:00Z",
    imageUrl: "/images/blog/technology.jfif",
    category: dummyCategories[4],
    tags: ["Docker", "Kubernetes", "DevOps", "Containers"],
    readTime: "8 min read",
    isNew: true,
    likes: 38,
    likesCount: 38,
    viewsCount: 956,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-8",
    slug: "functional-programming-javascript",
    title: "Functional Programming in JavaScript",
    description:
      "Practical functional programming concepts that make your JavaScript code cleaner, more testable, and easier to reason about.",
    content: `
      <h2>Pure Functions</h2>
      <p>A pure function always returns the same output for the same input and produces no side effects. This makes them predictable, testable, and easy to compose.</p>
      <h2>Immutability</h2>
      <p>Avoid mutating data. Use spread operators, <code>Object.freeze</code>, or libraries like Immer to work with immutable data structures.</p>
      <h2>Higher-Order Functions</h2>
      <pre><code class="language-javascript">const pipe = (...fns) => (x) =>
  fns.reduce((acc, fn) => fn(acc), x);

const processUser = pipe(
  validateEmail,
  normalizeNames,
  addTimestamps
);</code></pre>
      <h2>When Not to Go Full Functional</h2>
      <p>Pragmatism beats purity. Use functional patterns where they add clarity, but don't force them everywhere. Imperative code is sometimes clearer for complex stateful operations.</p>
    `,
    author: defaultAuthor,
    createdAt: "2024-09-18T10:00:00Z",
    imageUrl: "/images/blog/functional.png",
    category: dummyCategories[0],
    tags: ["JavaScript", "Functional Programming", "Best Practices"],
    readTime: "6 min read",
    isNew: false,
    likes: 31,
    likesCount: 31,
    viewsCount: 745,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-9",
    slug: "data-science-for-web-developers",
    title: "Data Science Concepts for Web Developers",
    description:
      "An accessible introduction to data science fundamentals tailored for developers with a web background.",
    content: `
      <h2>Why Data Science Matters</h2>
      <p>Data-driven decisions are no longer optional. Understanding basic data science concepts helps you build better products, interpret analytics, and collaborate with data teams.</p>
      <h2>Statistics You Actually Need</h2>
      <p>Focus on distributions, correlation vs causation, A/B testing methodology, and confidence intervals. You don't need a PhD — you need practical intuition.</p>
      <h2>Python for Data Work</h2>
      <p>Python's ecosystem (pandas, NumPy, scikit-learn) dominates data science. As a web developer, you can leverage these tools through APIs or serverless functions.</p>
      <h2>Building Data Pipelines</h2>
      <p>ETL (Extract, Transform, Load) pipelines are the backbone of data engineering. Modern tools like dbt, Airflow, and cloud-native services make this accessible to web developers.</p>
    `,
    author: defaultAuthor,
    createdAt: "2024-10-22T14:00:00Z",
    imageUrl: "/images/blog/datascience.jfif",
    category: dummyCategories[2],
    tags: ["Data Science", "Python", "Analytics"],
    readTime: "7 min read",
    isNew: false,
    likes: 19,
    likesCount: 19,
    viewsCount: 534,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-10",
    slug: "coding-for-autistic-kids",
    title: "Teaching Coding to Autistic Kids",
    description:
      "How structured programming environments can be powerful learning tools for children on the autism spectrum.",
    content: `
      <h2>Why Coding Works</h2>
      <p>Programming is logical, predictable, and rule-based — qualities that align well with how many autistic children think. It provides clear cause-and-effect relationships and immediate visual feedback.</p>
      <h2>Choosing the Right Tools</h2>
      <p>Visual programming languages like Scratch provide an excellent entry point. Block-based coding eliminates syntax errors while teaching computational thinking.</p>
      <h2>Creating an Inclusive Environment</h2>
      <ul>
        <li>Reduce sensory distractions in the learning space</li>
        <li>Provide clear, step-by-step instructions</li>
        <li>Allow self-paced progress without time pressure</li>
        <li>Celebrate process, not just outcomes</li>
      </ul>
      <h2>Real Impact</h2>
      <p>Many autistic individuals have gone on to successful careers in technology. Early exposure to coding can build confidence, problem-solving skills, and a sense of agency.</p>
    `,
    author: defaultAuthor,
    createdAt: "2024-11-05T09:30:00Z",
    imageUrl: "/images/blog/autistic-kids-coding.jpg",
    category: dummyCategories[2],
    tags: ["Education", "Accessibility", "Community"],
    readTime: "5 min read",
    isNew: true,
    likes: 47,
    likesCount: 47,
    viewsCount: 1320,
    comments: [],
    status: "published",
  },
  {
    _id: "blog-11",
    slug: "devops-ci-cd-getting-started",
    title: "Getting Started with CI/CD Pipelines",
    description:
      "A practical introduction to continuous integration and deployment for teams shipping web applications.",
    content: `
      <h2>What Is CI/CD?</h2>
      <p>Continuous Integration means merging code frequently and running automated tests on every change. Continuous Deployment extends this by automatically shipping passing changes to production.</p>
      <h2>Setting Up Your First Pipeline</h2>
      <p>Start simple. A basic pipeline that runs tests on pull requests already provides enormous value. You can add deployment stages, security scanning, and performance testing over time.</p>
      <h2>GitHub Actions Example</h2>
      <pre><code class="language-yaml">name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn install
      - run: yarn test
      - run: yarn build</code></pre>
      <h2>Best Practices</h2>
      <ul>
        <li>Keep pipelines fast — aim for under 10 minutes</li>
        <li>Make builds deterministic and reproducible</li>
        <li>Use caching to speed up dependency installation</li>
        <li>Monitor pipeline health and flaky tests</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2024-12-01T11:00:00Z",
    imageUrl: "/images/blog/coding adventure.png",
    category: dummyCategories[4],
    tags: ["CI/CD", "DevOps", "GitHub Actions", "Automation"],
    readTime: "6 min read",
    isNew: true,
    likes: 25,
    likesCount: 25,
    viewsCount: 680,
    comments: [],
    status: "published",
  },
];
