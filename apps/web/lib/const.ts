export const MAX_FILE_SIZE = 4

export const siteConfig = {
  name: "doc-doc.",
  url: `${process.env.NEXT_PUBLIC_APP_URL}`,
  ogImage: `${process.env.NEXT_PUBLIC_APP_URL}/og.png`,
  description: "Doc Doc • Organize Your Medical Records",
  links: {
    twitter: "https://x.com/adeshgg",
    github: "https://github.com/adeshgg",
  },
  author: {
    name: "Adesh Gupta",
    url: `https://x.com/adeshgg`,
  },
  keywords: [
    "Medical Document AI",
    "AI Chat",
    "Medical Records Chatbot",
    "Health Document Assistant",
    "Personal Health AI",
    "Medical Information Retrieval",
    "Document Q&A AI",
    "Healthcare AI Assistant",
    "RAG AI",
    "Retrieval Augmented Generation",
    "Large Language Model (LLM)",
    "Natural Language Processing (NLP)",
    "AI-powered Medical",
    "Self-hosted Medical AI",
    "Community-driven Medical AI",
    "Medical Insights",
    "Health Information Management",
    "Personalized Health Advice",
    "Understand Medical Reports",
    "Medical Document Organization",
    "Healthcare Document Analysis",
    "Easy Medical Q&A",
  ],
}

export type SiteConfig = typeof siteConfig
