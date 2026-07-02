# Citation chips — planned

## Role

Show **where** an answer came from — title, snippet, link to source doc.

## Location

`components/citation.tsx` (stub today)

## Display

Below each assistant message that used retrieval:

```
Sources:
[ Refund Policy ]  [ Shipping FAQ ]  [ Pricing ]
```

- Chip shows `title`
- Click opens `source_url` in new tab
- Hover may show `snippet` tooltip

## Rules (product)

- Every factual claim in answer should map to a citation (agent schema enforces)
- If zero citations, show warning style or “General response” badge

## Empty / error

- Retrieval failed → no chips; show “Couldn’t find sources”

## Related

- `@repo/shared` `citationSchema`: `source_url`, `title`, `snippet`
