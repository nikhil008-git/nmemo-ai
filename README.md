# nmemo

Open-source context orchestration for AI applications and agents. nmemo retrieves relevant workspace knowledge, applies ranking and a token budget, and returns context your model can use directly.

It is built for applications that need more than a vector search call: documents, connected tools, workspace boundaries, citations, and predictable context assembly.

## What is included

| Area | Location | Purpose |
| --- | --- | --- |
| Web application | `apps/frontend` | Dashboard for authentication, workspaces, sources, connectors, keys, and chat |
| HTTP API | `apps/api` | Context retrieval, ingestion, workspace management, OAuth, and health endpoints |
| Context engine | `packages/core` | Routing, ranking, de-duplication, conflict handling, and token budgeting |
| RAG retriever | `packages/rag-retriever` | Qdrant-backed document ingestion and retrieval |
| SDK | `packages/sdk` | `nmemo-sdk` client for calling the API |
| Database | `packages/database` | Prisma schema and migrations |


## Quick start

### Prerequisites

- Node.js 18 or newer (Node 22 is used by the included Render blueprint)
- npm 10 or newer
- PostgreSQL and Qdrant
- A Voyage API key for embeddings and a Groq API key for chat features

### Run locally

```bash
git clone https://github.com/nikhil008-git/Orques-AI.git nmemo
cd nmemo
npm install
cp .env.example .env
```

Update `.env` with your database, Qdrant, and provider credentials, then prepare Prisma and start the apps:

```bash
npm run db:generate -w @repo/db
npm run db:migrate -w @repo/db
npm run dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000) and the API at [http://localhost:8080](http://localhost:8080). Verify the API with `curl http://localhost:8080/health`.

`npm run dev` runs all workspace development tasks. To run only the API after its dependencies are built, use `npm run start:api`.

## Use the SDK

```ts
import { createEngine } from "nmemo-sdk";

const engine = createEngine({
  apiKey: process.env.NMEMO_API_KEY!,
  baseUrl: "http://localhost:8080",
});

const context = await engine.getContext({
  query: "What is our refund policy?",
  userId: "user_123",
  workspaceId: "ws_123",
});

console.log(context.prompt);
console.log(context.citations);
```

When using a bearer API key, its workspace scopes the request and `workspaceId` is optional.

## Development

```bash
npm run check-types
npm run lint
npm test
npm run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution expectations. Do not commit `.env` files, OAuth credentials, or user data.

## Deployment

The included [render.yaml](./render.yaml) deploys the API from this monorepo. Set the required environment variables in Render, run the frontend separately, and set its `NEXT_PUBLIC_API_URL` to the deployed API origin.

## Documentation

- [Documentation map](./docs/context-engine/DOCS_MAP.md)
- [HTTP API reference](./docs/context-engine/API.md)
- [SDK guide](./docs/context-engine/SDK.md)
- [API application guide](./apps/api/README.md)

## Security

Please report vulnerabilities privately; see [SECURITY.md](./SECURITY.md). For general questions and bugs, use GitHub Issues.

## License

[MIT](./LICENSE) © nmemo contributors.
