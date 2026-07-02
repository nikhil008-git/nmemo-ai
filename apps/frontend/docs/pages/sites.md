# Sites list (`/sites`) — planned

## Purpose

Owner home — all websites they’ve connected to nmemo.

## Audience

Logged-in owners.

## Layout (planned)

- Page title: Your sites
- Primary CTA: **Add site**
- Grid or table of sites:
  - Domain name
  - Index status (syncing / ready / error)
  - Last ingested at
  - Conversations count (7d)
  - Quick link: Embed code

## Empty state

- Illustration + “Add your first site”
- Explain: paste URL → we index docs → copy embed script

## Actions

| Action | Result |
|--------|--------|
| Add site | → onboarding flow or modal |
| Click row | → `/sites/[id]` |
| Delete site | Confirm modal; removes Qdrant collection |
