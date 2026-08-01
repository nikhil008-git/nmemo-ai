# nmemo web application

Next.js dashboard for workspaces, sources, connectors, API keys, and chat.

## Run locally

From the repository root, copy [`.env.example`](../../.env.example) to `.env`, set `NEXT_PUBLIC_API_URL` if the API is not running at `http://localhost:8080`, then run:

```bash
npm install
npm run dev -w frontend
```

Open [http://localhost:3000](http://localhost:3000). The API must be running for authenticated and data-backed pages.

## Checks

```bash
npm run lint -w frontend
npm test -w frontend
npm run build -w frontend
```

UI implementation notes live in [`docs/`](./docs/README.md). Public setup and project documentation are maintained in the [root README](../../README.md).
