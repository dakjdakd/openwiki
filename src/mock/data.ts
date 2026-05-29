export const MOCK_PROJECT = {
  id: "demo",
  name: "next.js",
  owner: "vercel",
  url: "https://github.com/vercel/next.js",
  description: "The React Framework",
  techStack: ["React", "TypeScript", "Node.js", "Rust", "SWC"],
  analyzedAt: new Date().toLocaleDateString(),
};

export const MOCK_SUMMARY = {
  summary: "Next.js is a React framework that gives you building blocks to create web applications. By framework, we mean Next.js handles the tooling and configuration needed for React, and provides additional structure, features, and optimizations for your application.",
  targetUser: "Frontend developers and teams building production-ready React applications with SSR/SSG.",
  coreFunctionality: "File-system routing, Server Components, SSR/SSG, Image Optimization, Edge API Routes.",
  entryFile: "packages/next/src/server/next.ts",
  dataFlow: "Request -> Edge/Node Server -> Next.js Router -> Server Components -> Client Components -> HTML Response",
  startHere: [
    "packages/next/src/server/next.ts",
    "packages/next/src/shared/lib/router/router.ts",
    "packages/next/src/client/next.ts",
  ],
};

export const MOCK_FILE_TREE = [
  {
    path: "packages",
    type: "directory",
    explanation: "Contains all packages managed in this monorepo",
    importance: "high",
    children: [
      {
        path: "packages/next",
        type: "directory",
        explanation: "The core Next.js framework package",
        importance: "high",
        children: [
          {
            path: "packages/next/src",
            type: "directory",
            explanation: "Source code for Next.js core ecosystem",
            importance: "high",
            children: [
              {
                path: "packages/next/src/client",
                type: "directory",
                explanation: "Client-side runtime code",
                importance: "high",
                children: [
                  {
                    path: "packages/next/src/client/next.ts",
                    type: "file",
                    explanation: "Entry point for the Next.js client-side runtime runtime. Initializes the router.",
                    importance: "high",
                  }
                ]
              },
              {
                path: "packages/next/src/server",
                type: "directory",
                explanation: "Server-side routing and rendering logic",
                importance: "high",
                children: [
                  {
                    path: "packages/next/src/server/next.ts",
                    type: "file",
                    explanation: "The main entry point for the Next.js custom server.",
                    importance: "high",
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: "test",
    type: "directory",
    explanation: "Integration and unit tests",
    importance: "low"
  },
  {
    path: "package.json",
    type: "file",
    explanation: "Monorepo configuration and scripts",
    importance: "medium"
  }
];

export const MOCK_MODULES = [
  {
    id: "router",
    name: "File-system Router",
    files: "packages/next/src/shared/lib/router",
    responsibility: "Maps file paths to URLs and handles client-side transitions.",
    why: "It's the most defining feature of Next.js, dictating how pages are structured.",
    suggestion: "Read router.ts first to understand state transitions.",
  },
  {
    id: "server",
    name: "Server Runtime",
    files: "packages/next/src/server",
    responsibility: "Handles incoming requests, SSR, and rendering Server Components.",
    why: "Crucial for understanding how Next.js achieves its performance and SEO benefits.",
    suggestion: "Look at render.tsx to see how React elements become HTML.",
  },
  {
    id: "build",
    name: "Build Pipeline",
    files: "packages/next/src/build",
    responsibility: "Compiles TypeScript, bundles with Webpack/Turbopack.",
    why: "Understanding the build step is essential for optimizing large apps.",
    suggestion: "Start with index.ts in the build directory.",
  }
];

export const MOCK_LESSONS = [
  {
    id: "lesson-1",
    title: "1. Understand the Project Entry",
    goal: "Learn how a Next.js server starts and handles the first request.",
    files: ["packages/next/src/server/next.ts"],
    why: "Every request flows through this entry point.",
    focus: "Look at the NextServer class and how it delegates to the Server instance.",
    questions: ["How does NextServer distinguish between dev and production modes?"],
    exercise: "Try modifying the dev server config locally to log all incoming URLs.",
  },
  {
    id: "lesson-2",
    title: "2. The File-system Router",
    goal: "Understand how Pages and App router map URLs to files.",
    files: ["packages/next/src/shared/lib/router/router.ts"],
    why: "Routing is the backbone of the framework.",
    focus: "Understand the singleton Router instance and how push/replace methods update state without reloading.",
    questions: ["What events are emitted during a route change?"],
    exercise: "Trace the execution of router.push('/about').",
  },
  {
    id: "lesson-3",
    title: "3. Server-side Rendering",
    goal: "See how React components are converted to HTML strings.",
    files: ["packages/next/src/server/render.tsx"],
    why: "This is where the magic of SSR happens.",
    focus: "Look at renderToWebStream and how React 18 suspended components are handled.",
    questions: ["How are server chunks streamed to the client?"],
    exercise: "Find where 'getServerSideProps' data is injected into the HTML.",
  }
];

export const MOCK_ARCHITECTURE = `flowchart TD
    Client[Client Browser]
    Server[Node.js / Edge Server]
    Router[Next.js Router]
    AppDir[App Router/RSC]
    PagesDir[Pages Router]
    Webpack[Webpack/Turbopack]

    Client -->|HTTP Request| Server
    Server --> Router
    Router -->|If /app| AppDir
    Router -->|If /pages| PagesDir
    AppDir -->|Builds| Webpack
    PagesDir -->|Builds| Webpack
    Webpack -->|Outputs bundles| Server
`;

export const MOCK_BUSINESS = {
  positioning: "The premier full-stack React framework for the enterprise.",
  problems: "React alone requires piecing together routing, data fetching, and bundling. SEO is hard for SPAs.",
  users: "Frontend developers, full-stack engineers, enterprise web teams.",
  painPoints: "Slow page loads, complex Webpack configs, poor SEO, difficult state synchronization in SPAs.",
  coreValue: "Zero-config SSR/SSG, excellent developer experience (DX), built-in optimizations.",
  competitors: [
    { name: "Remix", edge: "Nested routing, web standards focus" },
    { name: "Nuxt", edge: "Vue ecosystem equivalent" },
    { name: "Astro", edge: "Zero-JS by default, islands architecture" }
  ],
  model: "Open source framework driving adoption to Vercel's paid hosting and edge deployment platform.",
  mvp: "A dev server that compiles React files in a 'pages' directory into distinct routes.",
  growth: "Developer evangelism, excellent documentation, tight integration with Vercel hosting.",
  risks: "Complexity creep (App Router transition), lock-in concerns to Vercel infrastructure.",
  future: "Rust-based tooling (Turbopack) for extreme performance, deeper AI integration in dev workflows."
};
