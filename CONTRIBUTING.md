# Contributing to nmemo

Thanks for helping improve nmemo. Small, focused pull requests are easiest to review.

## Local development

1. Use Node.js 18+ and npm 10+.
2. Fork the repository and create a branch from the default branch.
3. Run `npm install`, then copy `.env.example` to `.env` and set the services you need.
4. Run `npm run dev` for local development.

Before opening a pull request, run the relevant checks:

```bash
npm run check-types
npm run lint
npm test
```

## Pull requests

- Keep changes scoped and include tests when behavior changes.
- Explain what changed, why, and how you verified it.
- Do not commit credentials, production data, generated build output, or dependency directories.
- Update documentation when a public API, environment variable, or setup step changes.

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
