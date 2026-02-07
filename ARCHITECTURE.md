# Architecture Write-Up

## Overview

The AI Research Agent is a fullstack application with a clear separation between a Next.js frontend and FastAPI backend, connected to PostgreSQL for persistence.

## Architecture Decisions

### Frontend: Next.js 15 with App Router
Chose Next.js for its excellent developer experience, built-in routing, and seamless Vercel deployment. The App Router provides server components and improved performance. TypeScript ensures type safety across the codebase.

### Backend: FastAPI with Streaming
FastAPI was selected for its async support and native Server-Sent Events (SSE) capability, essential for streaming AI responses. This provides real-time feedback as the AI thinks and responds, significantly improving UX compared to waiting for complete responses.

### Database: PostgreSQL with SQLAlchemy
PostgreSQL offers reliability and is well-supported by deployment platforms. SQLAlchemy ORM simplifies database operations while maintaining flexibility. The schema uses UUIDs for chat IDs, enabling shareable links without exposing sequential IDs.

### AI: Anthropic Claude with Web Search
Claude (claude-sonnet-4-20250514) was chosen for its strong reasoning capabilities and built-in web search tool. The model autonomously decides when to search versus answer from knowledge, providing cited sources for transparency.

## Key Tradeoffs

1. **Streaming vs Simplicity**: SSE streaming adds complexity but dramatically improves perceived performance.

2. **Custom UI vs Component Libraries**: Built custom dark theme instead of Shadcn for unique design, requiring more development time but achieving a distinctive look.

3. **Single LLM Provider**: Using only Anthropic simplifies implementation but creates vendor dependency. Could be abstracted for multi-provider support.

4. **Client-Side State**: Chat state managed in React rather than server state (Redux/Zustand), keeping the app simple but limiting offline capabilities.

## Future Improvements

- Add authentication for private chats
- Implement multiple tools (calculator, code execution)
- Add voice input/output
- Enable conversation export (PDF/Markdown)

**Word Count: 289**