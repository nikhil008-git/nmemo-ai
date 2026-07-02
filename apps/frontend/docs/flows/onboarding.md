# Owner onboarding flow — planned

## Goal

New owner goes from signup to live widget on their site in minutes.

## Steps

```
1. Sign up                    → /sign-up
2. Land on dashboard          → /dashboard (today) or /sites (future)
3. Add site                   → enter domain URL
4. Ingestion runs             → progress on knowledge page
5. Review knowledge status    → /sites/[id]/knowledge
6. Copy embed snippet         → /sites/[id]/embed
7. Paste on their website     → widget live
8. Test in /chat              → optional in-app preview
```

## Empty states

- No sites yet → prominent “Add site” on `/sites`
- Ingest failed → error with retry on knowledge page

## Time to value

Target messaging: live in under 30 minutes (aligns with competitor positioning; depends on crawl size).

## Data created

- `Site` record (domain, owner, Qdrant collection id)
- Widget public key
- First ingest job

## Related

- [sites.md](../pages/sites.md)
- [knowledge.md](../pages/knowledge.md)
- [embed.md](../pages/embed.md)
