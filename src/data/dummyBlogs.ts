// Dummy blog data for development — typed against blog/src/types/blog.ts
// Used when NEXT_PUBLIC_USE_DUMMY_DATA=true (via dummyBlogService.ts)

import type { BlogPost, BlogCategory, BlogComment, Author } from "@/types/blog";

// ─── Shared Entities ───

const defaultAuthor: Author = {
  id: "author-1",
  _id: "author-1",
  user: "user-1",
  firstName: "Jean Paul Elisa",
  lastName: "NIYOKWIZERWA",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z",
};

// ─── Categories ───
// Single source of truth — imported by dummyBlogService.ts as `dummyCategories`

const rawDummyCategories = [
  { _id: "cat-webdev", name: "Web Development", icon: "code" },
  { _id: "cat-design", name: "Design", icon: "palette" },
  { _id: "cat-tech", name: "Technology", icon: "cpu" },
  { _id: "cat-devops", name: "DevOps", icon: "server" },
  { _id: "cat-cloud", name: "Cloud Computing", icon: "cloud" },
  { _id: "cat-architecture", name: "Architecture", icon: "sitemap" },
  { _id: "cat-tutorials", name: "Tutorials", icon: "graduation-cap" },
];

export const dummyCategories: BlogCategory[] = rawDummyCategories.map((category) => ({
  ...category,
  id: category._id,
}));

// Helper to look up a category by id (guaranteed to exist at init time)
const cat = (id: string) => dummyCategories.find((c) => c.id === id || c._id === id)!;

// ─── Comments Pool ───

function normalizeComments(
  comments: Array<Omit<BlogComment, "id"> & { _id: string }>
): BlogComment[] {
  return comments.map((comment) => ({
    ...comment,
    id: comment._id,
  }));
}

const commentsForBlog1 = normalizeComments([
  {
    _id: "cmt-1",
    blogId: "blog-1",
    content:
      "Great breakdown of the architectural trade-offs. We migrated from a monolith to microservices last year and this captures the journey perfectly.",
    name: "Alice Mukamusoni",
    email: "alice.m@example.com",
    createdAt: "2026-02-20T14:30:00Z",
  },
  {
    _id: "cmt-2",
    blogId: "blog-1",
    content:
      "The hybrid approach section is spot on. We use serverless for event processing but keep core services in containers. Best of both worlds.",
    name: "Bob Kagabo",
    createdAt: "2026-02-22T09:15:00Z",
  },
  {
    _id: "cmt-3",
    blogId: "blog-1",
    content:
      "I'd love to see a follow-up on how you handle data consistency across microservices. That's been our biggest challenge.",
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    createdAt: "2026-02-25T16:45:00Z",
  },
]);

const commentsForBlog3 = normalizeComments([
  {
    _id: "cmt-4",
    blogId: "blog-3",
    content:
      "The section on visual hierarchy was eye-opening. As a backend dev, I never thought about these principles but they make so much sense.",
    name: "David Iradukunda",
    email: "david.i@example.com",
    createdAt: "2026-01-18T11:20:00Z",
  },
  {
    _id: "cmt-5",
    blogId: "blog-3",
    content:
      "Accessibility should be the first thing we think about, not an afterthought. Great that you highlighted it so prominently.",
    name: "Leila Umutoni",
    createdAt: "2026-01-20T08:45:00Z",
  },
]);

const commentsForBlog4 = normalizeComments([
  {
    _id: "cmt-6",
    blogId: "blog-4",
    content:
      "The ethical considerations section is crucial. Too many AI articles skip this entirely. Thanks for including it.",
    name: "Michael Habimana",
    email: "m.habimana@example.com",
    createdAt: "2026-02-02T13:10:00Z",
  },
  {
    _id: "cmt-7",
    blogId: "blog-4",
    content:
      "I've been using GitHub Copilot for 8 months and it's genuinely changed how I work. The productivity boost is real.",
    name: "Grace Uwimana",
    createdAt: "2026-02-05T17:30:00Z",
  },
  {
    _id: "cmt-8",
    blogId: "blog-4",
    content:
      "Great article! But I think we also need to discuss AI's impact on junior developer learning curves.",
    name: "Patrick Nshuti",
    email: "p.nshuti@example.com",
    createdAt: "2026-02-08T10:00:00Z",
  },
]);

const commentsForBlog6 = normalizeComments([
  {
    _id: "cmt-9",
    blogId: "blog-6",
    content:
      "Strict mode and discriminated unions are game-changers. I wish I'd enabled strict: true from the start on our project.",
    name: "Emma Nikuze",
    email: "emma.n@example.com",
    createdAt: "2026-03-02T09:20:00Z",
  },
  {
    _id: "cmt-10",
    blogId: "blog-6",
    content:
      "The Zod section is exactly what I needed. We've been struggling with runtime validation at API boundaries.",
    name: "James Mugisha",
    createdAt: "2026-03-04T14:50:00Z",
  },
]);

const commentsForBlog7 = normalizeComments([
  {
    _id: "cmt-11",
    blogId: "blog-7",
    content:
      "This is the clearest Docker introduction I've read. The Dockerfile example is production-ready, which isn't common in tutorial content.",
    name: "Diane Uwase",
    email: "diane.u@example.com",
    createdAt: "2026-01-12T11:30:00Z",
  },
]);

const commentsForBlog11 = normalizeComments([
  {
    _id: "cmt-12",
    blogId: "blog-11",
    content:
      "We set up GitHub Actions following this exact pattern and it saved us from deploying a broken build on day one. CI/CD is non-negotiable.",
    name: "Kevin Ishimwe",
    email: "k.ishimwe@example.com",
    createdAt: "2026-03-06T15:40:00Z",
  },
  {
    _id: "cmt-13",
    blogId: "blog-11",
    content:
      "Great practical guide! Any recommendations for handling secrets and environment variables in CI pipelines?",
    name: "Claudine Mukamana",
    createdAt: "2026-03-08T08:15:00Z",
  },
]);

// ─── Blog Posts ───

const rawDummyBlogs: Array<Omit<BlogPost, "id"> & { _id: string }> = [
  // ── 1. Architecture ─────────────────────────────────────────────────
  {
    _id: "blog-1",
    slug: "modern-web-architecture-evolution",
    title: "The Evolution of Modern Web Architecture",
    description:
      "From monolithic applications to microservices and serverless computing — how web architecture has transformed over time and what approach might work best for your next project.",
    content: `
      <h2>The Monolithic Era</h2>
      <p>Traditionally, web applications were built as monolithic structures — single, unified codebases responsible for everything from UI to data persistence. This offered simplicity but presented challenges as apps grew in complexity and scale.</p>
      <p>In a monolithic architecture, all components are interconnected and interdependent. Even small changes require testing and deploying the entire application, making the development cycle longer and increasing the risk of introducing regressions.</p>

      <div class="bg-secondary p-6 rounded-lg my-8 border-l-4 border-primary">
        <h3>Key Limitations of Monolithic Architecture:</h3>
        <ul>
          <li>Scaling challenges: You must scale the entire application rather than just the components under heavy load</li>
          <li>Technology constraints: The whole application typically uses the same stack, limiting flexibility</li>
          <li>Complexity: As the application grows, the codebase becomes harder to understand and maintain</li>
          <li>Development bottlenecks: Larger teams face coordination challenges when working on a single codebase</li>
        </ul>
      </div>

      <h2>The Rise of Microservices</h2>
      <p>Microservices emerged as organizations sought more scalable, flexible alternatives. This architectural style structures applications as collections of loosely coupled services, each implementing a specific business function.</p>
      <p>Microservices communicate through well-defined APIs, typically over HTTP with REST or gRPC protocols. Each service can be developed, deployed, and scaled independently.</p>

      <h3>Benefits of Microservices</h3>
      <ul>
        <li>Improved scalability — services scale independently based on demand</li>
        <li>Technology diversity — teams can select the best tools for each service</li>
        <li>Development agility — smaller, focused teams work in parallel</li>
        <li>Resilience — failures are isolated to individual services</li>
      </ul>

      <h2>Serverless: The Next Evolution</h2>
      <p>Serverless computing abstracts away infrastructure management entirely. Developers focus solely on writing code while cloud providers handle execution, scaling, and availability. Platforms like AWS Lambda, Google Cloud Functions, and Azure Functions enable deploying individual functions that run in response to events.</p>

      <h2>Hybrid Approaches and Modern Best Practices</h2>
      <p>In practice, many organizations adopt hybrid architectures that blend elements from different approaches. An application might use microservices for core business functionality while leveraging serverless for event processing.</p>
      <p>The key to success lies not in blindly following trends, but in carefully evaluating options against your unique needs and constraints.</p>
    `,
    author: defaultAuthor,
    createdAt: "2026-02-15T10:30:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
    imageUrl: "/images/blog/tech.jfif",
    category: cat("cat-architecture"),
    tags: [
      "Architecture",
      "Web Development",
      "Microservices",
      "Serverless",
      "Best Practices",
    ],
    readTime: "8 min read",
    isFeatured: true,
    isNew: false,
    likes: 42,
    likesCount: 42,
    viewsCount: 1245,
    comments: commentsForBlog1,
    status: "published",
    metaTitle: "The Evolution of Modern Web Architecture",
    metaDescription:
      "From monoliths to microservices to serverless — explore how web architecture has transformed.",
  },

  // ── 2. Responsive Design ───────────────────────────────────────────
  {
    _id: "blog-2",
    slug: "responsive-design-principles-2026",
    title: "Responsive Web Design Principles for 2026",
    description:
      "Master the essential principles of responsive web design — from mobile-first strategies to container queries and modern layout techniques.",
    content: `
      <h2>What is Responsive Web Design?</h2>
      <p>Responsive web design makes web pages render well on a variety of devices and screen sizes. It's about creating websites that provide an optimal viewing experience with minimal resizing and scrolling.</p>

      <h2>Mobile-First Approach</h2>
      <p>Design for the smallest screen first, then progressively enhance for larger screens. This forces focus on essential content and functionality before adding complexity.</p>

      <h2>Modern Layout Techniques</h2>
      <h3>CSS Grid</h3>
      <pre><code>.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}</code></pre>

      <h3>Flexbox</h3>
      <p>Flexbox provides efficient layout, alignment, and space distribution among items in a container — particularly useful for one-dimensional layouts and navigation bars.</p>

      <h3>Container Queries</h3>
      <p>Container queries are a game-changer for component-level responsiveness. Instead of responding to viewport width, components adapt based on their container's size — making truly reusable components possible.</p>

      <h2>Key Takeaways</h2>
      <ul>
        <li>Use fluid grids with relative units (rem, em, %)</li>
        <li>Make images flexible within their containers</li>
        <li>Leverage media queries for device-specific styles</li>
        <li>Adopt container queries for component-level responsiveness</li>
        <li>Test across real devices, not just browser dev tools</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2026-01-20T14:15:00Z",
    updatedAt: "2026-02-10T11:00:00Z",
    imageUrl: "/images/blog/programming.jfif",
    category: cat("cat-webdev"),
    tags: ["CSS", "Responsive Design", "Mobile-first", "Container Queries"],
    readTime: "6 min read",
    isNew: false,
    likes: 28,
    likesCount: 28,
    viewsCount: 947,
    comments: [],
    status: "published",
  },

  // ── 3. UI/UX Design ────────────────────────────────────────────────
  {
    _id: "blog-3",
    slug: "ui-ux-design-fundamentals-developers",
    title: "UI/UX Design Fundamentals for Developers",
    description:
      "Learn the essential design principles every developer should know to build better user experiences — visual hierarchy, consistency, and accessibility.",
    content: `
      <h2>Why Developers Need Design Skills</h2>
      <p>Understanding design principles helps developers make better decisions at every level — from component architecture to micro-interactions. It bridges the gap between "it works" and "it works beautifully."</p>

      <h2>Core Principles</h2>

      <h3>Visual Hierarchy</h3>
      <p>Guide users through content by size, color, contrast, and spacing. The most important elements should be the most prominent. A well-structured hierarchy reduces cognitive load and helps users find what they need faster.</p>

      <h3>Consistency</h3>
      <p>Consistent patterns reduce cognitive load. Use the same components, colors, and interactions throughout your application. Design systems like shadcn/ui and Material Design exist precisely for this reason.</p>

      <h3>Accessibility</h3>
      <p>Design for everyone. Ensure sufficient color contrast (WCAG 2.1 AA minimum), provide alt text for images, support keyboard navigation, and use semantic HTML. Accessibility isn't optional — it's a fundamental quality of good software.</p>

      <h2>Practical Tips</h2>
      <ul>
        <li>Start with a design system or component library</li>
        <li>Use whitespace generously — it's not wasted space, it's breathing room</li>
        <li>Test with real users, not assumptions</li>
        <li>Limit your color palette to 2-3 primary colors</li>
        <li>Typography hierarchy: no more than 2-3 font weights per page</li>
      </ul>

      <blockquote>
        <p>"Good design is obvious. Great design is transparent." — Joe Sparano</p>
      </blockquote>
    `,
    author: defaultAuthor,
    createdAt: "2026-01-05T09:00:00Z",
    updatedAt: "2026-01-15T14:30:00Z",
    imageUrl: "/images/blog/social.jfif",
    category: cat("cat-design"),
    tags: ["UX", "UI", "Design Principles", "Accessibility"],
    readTime: "7 min read",
    isNew: false,
    likes: 35,
    likesCount: 35,
    viewsCount: 812,
    comments: commentsForBlog3,
    status: "published",
  },

  // ── 4. AI in Tech ──────────────────────────────────────────────────
  {
    _id: "blog-4",
    slug: "future-of-ai-in-tech-2026",
    title: "The Future of AI in Tech: What Developers Need to Know",
    description:
      "How artificial intelligence is reshaping the technology landscape — from AI-assisted development to production ML systems and the ethical questions we must answer.",
    content: `
      <h2>AI's Current Impact</h2>
      <p>Artificial intelligence has moved from research labs to production systems at an unprecedented pace. From code completion tools to automated testing, AI is becoming an integral part of the development workflow in 2026.</p>

      <h2>AI-Assisted Development</h2>
      <p>Tools like GitHub Copilot, Claude, and AI-powered code review are fundamentally changing how we write software. They don't replace developers — they augment capabilities, handle repetitive tasks, and accelerate the feedback loop from idea to implementation.</p>
      <p>The key is learning to work <em>with</em> AI effectively: writing clear prompts, reviewing generated code critically, and understanding where AI excels versus where human judgment is irreplaceable.</p>

      <h2>Machine Learning in Production</h2>
      <p>Deploying ML models requires understanding infrastructure, monitoring, and the full MLOps lifecycle. It's not just about training models — it's about keeping them reliable, up-to-date, and performant in production environments.</p>

      <h2>Ethical Considerations</h2>
      <p>As AI becomes more pervasive, developers must consider bias in training data, transparency in decision-making, privacy implications, and the societal impact of the systems they build. Responsible AI isn't a nice-to-have — it's a professional obligation.</p>

      <blockquote>
        <p>"The question is not whether AI will transform our industry, but how we'll ensure it does so responsibly."</p>
      </blockquote>
    `,
    author: defaultAuthor,
    createdAt: "2026-01-28T11:00:00Z",
    updatedAt: "2026-02-15T09:00:00Z",
    imageUrl: "/images/blog/future.jfif",
    category: cat("cat-tech"),
    tags: ["AI", "Machine Learning", "Future Tech", "Ethics"],
    readTime: "6 min read",
    isNew: false,
    likes: 56,
    likesCount: 56,
    viewsCount: 1580,
    comments: commentsForBlog4,
    status: "published",
  },

  // ── 5. Startup Guide ───────────────────────────────────────────────
  {
    _id: "blog-5",
    slug: "starting-your-tech-startup-practical-guide",
    title: "Starting Your Tech Startup: A Practical Guide",
    description:
      "Practical advice for developers looking to turn ideas into viable tech businesses — from MVP to funding and team building.",
    content: `
      <h2>From Idea to MVP</h2>
      <p>Every startup begins with a problem worth solving. The key is validating your idea before investing months of development. Talk to potential users, build prototypes, and iterate fast. The goal of an MVP isn't perfection — it's learning.</p>

      <h2>Technical Decisions That Matter</h2>
      <p>Choose boring technology for your core infrastructure. Innovation should be in your product, not your tech stack. Use what your team knows best — speed matters more than using the latest framework.</p>
      <p>That said, invest in good foundations: type safety, automated testing, CI/CD from day one. Technical debt accumulated early will slow you down when speed matters most.</p>

      <h2>Building Your Team</h2>
      <p>Start small. A founding team of 2-3 people who complement each other's skills is ideal. Look for people who ship consistently, not just those with impressive resumes. Culture forms in the first few hires.</p>

      <h2>Funding and Growth</h2>
      <ul>
        <li>Bootstrap as long as possible to retain control and validate with real revenue</li>
        <li>Revenue is the best form of funding — it proves your idea works</li>
        <li>If you raise, raise enough to reach the next meaningful milestone</li>
        <li>Focus on unit economics from day one — growth without sustainability is a trap</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2025-12-10T08:30:00Z",
    updatedAt: "2026-01-05T10:00:00Z",
    imageUrl: "/images/blog/enjoy.jfif",
    category: cat("cat-tech"),
    tags: ["Startup", "Tech Business", "MVP", "Product Development"],
    readTime: "7 min read",
    isNew: false,
    likes: 21,
    likesCount: 21,
    viewsCount: 623,
    comments: [],
    status: "published",
  },

  // ── 6. TypeScript Best Practices ───────────────────────────────────
  {
    _id: "blog-6",
    slug: "typescript-best-practices-2026",
    title: "TypeScript Best Practices for Production Apps",
    description:
      "Level up your TypeScript with strict configurations, discriminated unions, Zod validation, and patterns used in real production codebases.",
    content: `
      <h2>Strict Mode Is Non-Negotiable</h2>
      <p>Always enable <code>strict: true</code> in your tsconfig. It catches entire categories of bugs at compile time. The small upfront cost pays off enormously in reduced runtime errors and better IDE support.</p>

      <h2>Prefer Interfaces Over Types (Usually)</h2>
      <p>Interfaces are extendable and produce better error messages. Use type aliases for unions, intersections, and mapped types where interfaces can't help.</p>

      <h2>Discriminated Unions</h2>
      <pre><code>type Result&lt;T&gt; =
  | { success: true; data: T }
  | { success: false; error: string };

function handle(result: Result&lt;User&gt;) {
  if (result.success) {
    // TypeScript knows result.data exists here
    console.log(result.data.name);
  }
}</code></pre>

      <h2>Zod for Runtime Validation</h2>
      <p>TypeScript only checks at compile time. Use Zod to validate data at runtime boundaries — API responses, form inputs, environment variables. The combination of TypeScript + Zod gives you end-to-end type safety.</p>

      <h2>Utility Types You Should Know</h2>
      <ul>
        <li><code>Partial&lt;T&gt;</code> — make all properties optional</li>
        <li><code>Pick&lt;T, K&gt;</code> — select specific properties</li>
        <li><code>Omit&lt;T, K&gt;</code> — exclude specific properties</li>
        <li><code>Record&lt;K, V&gt;</code> — construct an object type with specific keys and values</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2026-02-28T16:00:00Z",
    updatedAt: "2026-03-05T10:00:00Z",
    imageUrl: "/images/blog/languages.png",
    category: cat("cat-webdev"),
    tags: ["TypeScript", "Best Practices", "Web Development", "Type Safety"],
    readTime: "5 min read",
    isNew: true,
    likes: 63,
    likesCount: 63,
    viewsCount: 2100,
    comments: commentsForBlog6,
    status: "published",
    metaTitle: "TypeScript Best Practices for Production Applications",
    metaDescription:
      "Strict mode, discriminated unions, Zod validation — production TypeScript patterns.",
  },

  // ── 7. Docker & Kubernetes ─────────────────────────────────────────
  {
    _id: "blog-7",
    slug: "docker-kubernetes-developers-guide",
    title: "Docker & Kubernetes for Developers",
    description:
      "A developer-focused guide to containerization and orchestration — from Dockerfile basics to Kubernetes deployments and local development workflows.",
    content: `
      <h2>Why Containers?</h2>
      <p>Containers solve the "works on my machine" problem. They package your application with its dependencies into a consistent, portable unit that runs the same everywhere — your laptop, CI, staging, and production.</p>

      <h2>Docker Essentials</h2>
      <pre><code>FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]</code></pre>

      <h2>Multi-Stage Builds</h2>
      <p>Use multi-stage builds to keep your production images lean. Build in one stage, copy only the artifacts you need into the final image. This can reduce image sizes by 80% or more.</p>

      <h2>Kubernetes Basics</h2>
      <p>Kubernetes orchestrates containers at scale. It handles deployment, scaling, load balancing, and self-healing. For most teams, managed services like EKS, GKE, or AKS are the way to go — don't run your own control plane unless you have a very good reason.</p>

      <h2>Local Development</h2>
      <p>Use Docker Compose for local multi-service setups. Tools like Tilt or Skaffold bridge the gap between local development and Kubernetes deployment, giving you fast feedback loops without sacrificing parity with production.</p>
    `,
    author: defaultAuthor,
    createdAt: "2026-01-08T12:00:00Z",
    updatedAt: "2026-01-20T15:00:00Z",
    imageUrl: "/images/blog/technology.jfif",
    category: cat("cat-devops"),
    tags: ["Docker", "Kubernetes", "DevOps", "Containers"],
    readTime: "8 min read",
    isNew: false,
    likes: 38,
    likesCount: 38,
    viewsCount: 956,
    comments: commentsForBlog7,
    status: "published",
  },

  // ── 8. Functional Programming ──────────────────────────────────────
  {
    _id: "blog-8",
    slug: "functional-programming-javascript",
    title: "Functional Programming in JavaScript",
    description:
      "Practical functional programming concepts that make your JavaScript code cleaner, more testable, and easier to reason about — without going full Haskell.",
    content: `
      <h2>Pure Functions</h2>
      <p>A pure function always returns the same output for the same input and produces no side effects. This makes them predictable, testable, and easy to compose. Most of your utility functions should be pure.</p>

      <h2>Immutability</h2>
      <p>Avoid mutating data. Use spread operators, <code>Object.freeze</code>, or libraries like Immer to work with immutable data structures. Immutability eliminates an entire class of bugs related to shared mutable state.</p>

      <h2>Higher-Order Functions</h2>
      <pre><code>const pipe = (...fns) => (x) =>
  fns.reduce((acc, fn) => fn(acc), x);

const processUser = pipe(
  validateEmail,
  normalizeNames,
  addTimestamps
);</code></pre>

      <h2>When Not to Go Full Functional</h2>
      <p>Pragmatism beats purity. Use functional patterns where they add clarity, but don't force them everywhere. Imperative code is sometimes clearer for complex stateful operations. The goal is readable, maintainable code — not adherence to a paradigm.</p>

      <h2>Practical Applications</h2>
      <ul>
        <li>Array methods: <code>map</code>, <code>filter</code>, <code>reduce</code> for data transformations</li>
        <li>Currying for creating reusable, configurable functions</li>
        <li>Option/Result patterns for handling nullable values</li>
        <li>Event sourcing patterns in state management</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2025-11-18T10:00:00Z",
    updatedAt: "2025-12-05T14:00:00Z",
    imageUrl: "/images/blog/functional.png",
    category: cat("cat-webdev"),
    tags: ["JavaScript", "Functional Programming", "Best Practices"],
    readTime: "6 min read",
    isNew: false,
    likes: 31,
    likesCount: 31,
    viewsCount: 745,
    comments: [],
    status: "published",
  },

  // ── 9. Cloud-Native Development ────────────────────────────────────
  {
    _id: "blog-9",
    slug: "cloud-native-development-2026",
    title: "Cloud-Native Development: Building for the Modern Stack",
    description:
      "An introduction to cloud-native development principles — twelve-factor apps, infrastructure as code, and designing applications built for the cloud from day one.",
    content: `
      <h2>What Does Cloud-Native Mean?</h2>
      <p>Cloud-native isn't just "running in the cloud." It's a set of principles for building applications that fully leverage cloud computing — elastic scaling, resilience, observability, and automation. It's about designing systems that embrace the distributed nature of modern infrastructure.</p>

      <h2>The Twelve-Factor App</h2>
      <p>The twelve-factor methodology provides a framework for building SaaS applications that are portable, scalable, and maintainable. Key principles include:</p>
      <ul>
        <li>Store config in environment variables, not code</li>
        <li>Treat backing services as attached resources</li>
        <li>Strictly separate build and run stages</li>
        <li>Export services via port binding</li>
        <li>Scale out via the process model</li>
      </ul>

      <h2>Infrastructure as Code</h2>
      <p>Define your infrastructure in version-controlled code using tools like Terraform, Pulumi, or AWS CDK. This ensures reproducibility, enables code review for infrastructure changes, and eliminates configuration drift.</p>

      <h2>Observability</h2>
      <p>In distributed systems, you can't just SSH into a server and tail logs. Invest in the three pillars of observability: structured logging, distributed tracing, and metrics. Tools like Grafana, Prometheus, and OpenTelemetry make this accessible.</p>
    `,
    author: defaultAuthor,
    createdAt: "2025-12-22T14:00:00Z",
    updatedAt: "2026-01-10T09:30:00Z",
    imageUrl: "/images/blog/datascience.jfif",
    category: cat("cat-cloud"),
    tags: ["Cloud Native", "Infrastructure", "DevOps", "Twelve-Factor"],
    readTime: "7 min read",
    isNew: false,
    likes: 24,
    likesCount: 24,
    viewsCount: 670,
    comments: [],
    status: "published",
  },

  // ── 10. Teaching Coding ────────────────────────────────────────────
  {
    _id: "blog-10",
    slug: "teaching-coding-to-autistic-kids",
    title: "Teaching Coding to Autistic Kids",
    description:
      "How structured programming environments can be powerful learning tools for children on the autism spectrum — and what educators should know.",
    content: `
      <h2>Why Coding Works</h2>
      <p>Programming is logical, predictable, and rule-based — qualities that align well with how many autistic children think. It provides clear cause-and-effect relationships and immediate visual feedback, creating a learning environment where the rules are explicit and consistent.</p>

      <h2>Choosing the Right Tools</h2>
      <p>Visual programming languages like Scratch provide an excellent entry point. Block-based coding eliminates syntax errors while teaching computational thinking. For older learners, Python's clean syntax and immediate feedback loop work well.</p>

      <h2>Creating an Inclusive Environment</h2>
      <ul>
        <li>Reduce sensory distractions in the learning space</li>
        <li>Provide clear, step-by-step instructions with visual aids</li>
        <li>Allow self-paced progress without time pressure</li>
        <li>Celebrate process and effort, not just outcomes</li>
        <li>Use special interests as project themes for engagement</li>
      </ul>

      <h2>Real Impact</h2>
      <p>Many autistic individuals have gone on to successful careers in technology. Early exposure to coding can build confidence, problem-solving skills, and a sense of agency. The tech industry benefits enormously from neurodivergent perspectives — different ways of thinking lead to better solutions.</p>
    `,
    author: defaultAuthor,
    createdAt: "2025-11-05T09:30:00Z",
    imageUrl: "/images/blog/autistic-kids-coding.jpg",
    category: cat("cat-tutorials"),
    tags: ["Education", "Coding", "Accessibility", "Teaching Tech"],
    readTime: "5 min read",
    isNew: false,
    likes: 47,
    likesCount: 47,
    viewsCount: 1320,
    comments: [],
    status: "published",
  },

  // ── 11. CI/CD Pipelines ────────────────────────────────────────────
  {
    _id: "blog-11",
    slug: "getting-started-with-ci-cd-pipelines",
    title: "Getting Started with CI/CD Pipelines",
    description:
      "A practical introduction to continuous integration and deployment — from your first GitHub Actions workflow to production deployment strategies.",
    content: `
      <h2>What Is CI/CD?</h2>
      <p>Continuous Integration means merging code frequently and running automated tests on every change. Continuous Deployment extends this by automatically shipping passing changes to production. Together, they create a fast, reliable feedback loop.</p>

      <h2>Setting Up Your First Pipeline</h2>
      <p>Start simple. A basic pipeline that runs tests and type-checks on pull requests already provides enormous value. You can add deployment stages, security scanning, and performance testing incrementally.</p>

      <h2>GitHub Actions Example</h2>
      <pre><code>name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn
      - run: yarn install --frozen-lockfile
      - run: yarn type-check
      - run: yarn test
      - run: yarn build</code></pre>

      <h2>Best Practices</h2>
      <ul>
        <li>Keep pipelines fast — aim for under 10 minutes total</li>
        <li>Make builds deterministic and reproducible</li>
        <li>Use caching aggressively for dependencies</li>
        <li>Monitor pipeline health and fix flaky tests immediately</li>
        <li>Use branch protection rules to enforce CI passing before merge</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2026-03-01T11:00:00Z",
    updatedAt: "2026-03-07T09:00:00Z",
    imageUrl: "/images/blog/coding adventure.png",
    category: cat("cat-devops"),
    tags: ["CI/CD", "DevOps", "GitHub Actions", "Automation"],
    readTime: "6 min read",
    isNew: true,
    likes: 25,
    likesCount: 25,
    viewsCount: 680,
    comments: commentsForBlog11,
    status: "published",
  },

  // ── 12. Career Growth ──────────────────────────────────────────────
  {
    _id: "blog-12",
    slug: "career-growth-junior-to-senior-developer",
    title: "Career Growth: From Junior to Senior Developer",
    description:
      "Navigate your career progression in software development — essential skills, mindset shifts, and strategies to advance from junior to senior developer.",
    content: `
      <h2>It's Not Just About Code</h2>
      <p>The jump from junior to senior isn't about writing more complex code — it's about having a broader impact. Senior developers think about systems, trade-offs, team productivity, and long-term maintainability.</p>

      <h2>Technical Depth vs. Breadth</h2>
      <p>Go deep in your primary stack, but maintain awareness of the broader ecosystem. You should be an expert in your domain while being conversational about adjacent technologies. T-shaped skills are your goal.</p>

      <h2>Key Mindset Shifts</h2>
      <ul>
        <li><strong>From tasks to outcomes:</strong> Stop measuring productivity by tasks completed. Focus on the impact of your work.</li>
        <li><strong>From individual to multiplier:</strong> Your value increases when you make the team better — through mentoring, documentation, and process improvements.</li>
        <li><strong>From building to shipping:</strong> Features don't matter until users have them. Prioritize getting things to production safely.</li>
        <li><strong>From certainty to judgment:</strong> Senior developers are comfortable making decisions with incomplete information.</li>
      </ul>

      <h2>Practical Steps</h2>
      <ul>
        <li>Own a feature end-to-end: from design to deployment to monitoring</li>
        <li>Write RFCs and technical proposals</li>
        <li>Mentor junior developers — teaching deepens understanding</li>
        <li>Contribute to architectural decisions</li>
        <li>Build relationships across teams</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2026-02-05T08:30:00Z",
    updatedAt: "2026-02-18T16:00:00Z",
    imageUrl: "/images/blog/life.jfif",
    category: cat("cat-tutorials"),
    tags: [
      "Software Engineering",
      "Developer Growth",
      "Best Practices",
      "Team Leadership",
    ],
    readTime: "7 min read",
    isNew: false,
    likes: 39,
    likesCount: 39,
    viewsCount: 1050,
    comments: [],
    status: "published",
    metaTitle: "Career Growth: From Junior to Senior Developer",
    metaDescription:
      "Essential skills and mindset shifts for advancing from junior to senior developer.",
  },

  // ── 13. Next.js App Router ─────────────────────────────────────────
  {
    _id: "blog-13",
    slug: "next-js-app-router-deep-dive",
    title: "Next.js App Router: A Deep Dive",
    description:
      "Everything you need to know about Next.js App Router — server components, streaming, parallel routes, and when to use client vs. server rendering.",
    content: `
      <h2>Why App Router?</h2>
      <p>Next.js App Router represents a fundamental shift in how we build React applications. Built on React Server Components, it enables server-first rendering by default while maintaining the interactivity users expect.</p>

      <h2>Server vs. Client Components</h2>
      <p>The key mental model: components are server components by default. Add <code>"use client"</code> only when you need browser APIs, event handlers, or React hooks like useState/useEffect. Keep the client boundary as low as possible in your component tree.</p>

      <h2>Data Fetching</h2>
      <p>Server components can be async — fetch data directly inside them without useEffect or client-side state management. This is simpler, faster, and eliminates loading waterfalls.</p>

      <pre><code>export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    &lt;div&gt;
      {posts.map(post =&gt; (
        &lt;BlogCard key={post.id} post={post} /&gt;
      ))}
    &lt;/div&gt;
  );
}</code></pre>

      <h2>Streaming and Suspense</h2>
      <p>Use <code>&lt;Suspense&gt;</code> boundaries to stream parts of the page independently. Users see content as it becomes available instead of waiting for the slowest data fetch.</p>

      <h2>When to Use What</h2>
      <ul>
        <li><strong>Server Components:</strong> Data fetching, heavy rendering, accessing backend resources</li>
        <li><strong>Client Components:</strong> Interactivity, browser APIs, real-time updates</li>
        <li><strong>Route Handlers:</strong> API endpoints that don't need a UI</li>
        <li><strong>Server Actions:</strong> Form submissions and mutations</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-09T08:00:00Z",
    imageUrl: "/images/blog/pro.jfif",
    category: cat("cat-tutorials"),
    tags: ["Next.js", "React", "Server Components", "App Router", "Tutorial"],
    readTime: "10 min read",
    isFeatured: true,
    isNew: true,
    likes: 71,
    likesCount: 71,
    viewsCount: 2450,
    comments: [],
    status: "published",
    metaTitle:
      "Next.js App Router Deep Dive — Server Components, Streaming & More",
    metaDescription:
      "Master Next.js App Router: server components, data fetching, streaming, and when to use client vs. server rendering.",
  },

  // ── 14. Building Scalable APIs ─────────────────────────────────────
  {
    _id: "blog-14",
    slug: "building-scalable-apis-node-express",
    title: "Building Scalable APIs with Node.js and Express",
    description:
      "Design and implement robust, scalable APIs — covering authentication, validation, error handling, and performance optimization patterns.",
    content: `
      <h2>API Design Principles</h2>
      <p>Good API design makes your backend a pleasure to work with. Use consistent naming conventions, proper HTTP methods, meaningful status codes, and comprehensive error responses.</p>

      <h2>Project Structure</h2>
      <p>Organize your Express app by feature, not by type. Each feature module contains its routes, controllers, services, and validation schemas. This makes the codebase navigable and each feature independently testable.</p>

      <h2>Authentication & Authorization</h2>
      <p>Use JWT tokens for stateless authentication. Implement role-based access control (RBAC) as middleware. Always hash passwords with bcrypt and store tokens securely.</p>

      <h2>Input Validation</h2>
      <p>Validate every input at the API boundary using Zod or Joi. Never trust client data — validate types, ranges, formats, and business rules before processing.</p>

      <h2>Error Handling</h2>
      <pre><code>// Centralized error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Internal server error";

  res.status(status).json({
    success: false,
    error: message,
  });
});</code></pre>

      <h2>Performance Optimization</h2>
      <ul>
        <li>Use database indexes for frequently queried fields</li>
        <li>Implement response caching with Redis</li>
        <li>Paginate all list endpoints</li>
        <li>Use compression middleware for response payloads</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2025-12-01T09:15:00Z",
    updatedAt: "2025-12-20T11:00:00Z",
    imageUrl: "/images/blog/mming.jfif",
    category: cat("cat-webdev"),
    tags: ["Node.js", "Express", "API", "Backend", "JavaScript"],
    readTime: "9 min read",
    isNew: false,
    likes: 33,
    likesCount: 33,
    viewsCount: 890,
    comments: [],
    status: "published",
  },

  // ── 15. Modern CSS ─────────────────────────────────────────────────
  {
    _id: "blog-15",
    slug: "modern-css-techniques-grid-flexbox",
    title: "Modern CSS Techniques: Grid, Flexbox, and Beyond",
    description:
      "Master modern CSS layout techniques including CSS Grid, Flexbox, container queries, and the new features reshaping how we build responsive layouts.",
    content: `
      <h2>CSS Grid: Two-Dimensional Layouts</h2>
      <p>CSS Grid is the gold standard for two-dimensional layouts. It handles both rows and columns simultaneously, making complex page layouts straightforward.</p>

      <pre><code>.dashboard {
  display: grid;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}</code></pre>

      <h2>Flexbox: One-Dimensional Alignment</h2>
      <p>Flexbox excels at distributing space along a single axis. Use it for navigation bars, card rows, centering content, and any pattern where items flow in one direction.</p>

      <h2>Container Queries</h2>
      <p>Container queries let components respond to their container's size rather than the viewport. This is transformative for building truly reusable, context-aware components.</p>

      <h2>New CSS Features Worth Learning</h2>
      <ul>
        <li><code>:has()</code> — the parent selector CSS always needed</li>
        <li><code>color-mix()</code> — blend colors natively in CSS</li>
        <li>Cascade layers (<code>@layer</code>) — manage specificity at scale</li>
        <li>Nesting — write cleaner, more organized stylesheets</li>
        <li>View transitions — smooth page transitions natively</li>
      </ul>
    `,
    author: defaultAuthor,
    createdAt: "2026-02-10T13:20:00Z",
    updatedAt: "2026-02-25T10:00:00Z",
    imageUrl: "/images/blog/what is programming.jfif",
    category: cat("cat-webdev"),
    tags: ["CSS", "Grid", "Flexbox", "Responsive Design", "Frontend"],
    readTime: "6 min read",
    isNew: false,
    likes: 27,
    likesCount: 27,
    viewsCount: 720,
    comments: [],
    status: "published",
  },
];

export const dummyBlogs: BlogPost[] = rawDummyBlogs.map((blog) => ({
  ...blog,
  id: blog._id,
  author: {
    ...blog.author,
    id: blog.author.id ?? blog.author._id,
  },
  category: blog.category
    ? {
        ...blog.category,
        id: blog.category.id ?? blog.category._id,
      }
    : undefined,
  comments: blog.comments?.map((comment) => ({
    ...comment,
    id: comment.id ?? comment._id,
  })),
}));
