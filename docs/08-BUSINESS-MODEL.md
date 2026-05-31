# 08 — Business Model

> All figures below are **illustrative projections** for narrative/pitch purposes, not guarantees. The point is to show the unit economics are sound.

## 1. Pricing (usage + seats hybrid)

Modeled on Clerk / Pinecone style infra pricing.

| Tier | Price/mo | Limits | Target |
|---|---|---|---|
| **Free** | $0 | < 10k memories, community support | Hobby / evaluation |
| **Pro** | $99 | higher memory + token budget | Indie devs / small startups |
| **Scale** | $499 | large budgets, analytics, SLAs | Funded startups |
| **Enterprise** | $2k–10k+ | self-host, SSO, audit export, SOC2, dedicated support | Regulated / multi-product cos |

Usage overages billed on: memories stored, recall calls, and extraction tokens — all metered through the Redis cost guard.

---

## 2. Illustrative ramp

| Month | Pro | Scale | Ent | MRR | ARR run-rate |
|---|---|---|---|---|---|
| M3 (launch) | 20 | 2 | 0 | ~$3k | ~$36k |
| M6 | 60 | 8 | 1 | ~$12k | ~$144k |
| M12 | 200 | 30 | 5 | ~$60k | ~$720k |
| M18 | 400 | 70 | 12 | ~$150k | ~$1.8M |

---

## 3. Why the unit economics work (the part VCs care about)

- **Net Revenue Retention > 120%.** Memory usage *grows* as the customer's app grows: more end-users → more memories → more recall calls → more revenue, with no extra sales effort. This is the best property of usage-based infra.
- **Gross margin 80%+.** Marginal cost = embeddings + storage + occasional extraction LLM calls. The async pipeline batches work and the **per-tenant token budget / rate limiter caps CoGS by design** — there is no scenario where a customer costs more than they pay.
- **Low touch self-serve PLG** for Free→Pro→Scale; **sales-assisted** only at Enterprise (where governance/SOC2 justifies $2k–10k+ ACV).
- **Land-and-expand.** Wedge = memory → expand into evals and RAG-as-a-service (same engine, same customers).

---

## 4. Cost structure (per tenant, simplified)

```
Revenue (tier + overage)
  − embedding cost (capped)
  − extraction LLM cost (capped, batched, async)
  − storage (Postgres/pgvector)
  − Redis + compute (amortized)
= gross profit (target ≥ 80%)
```

The rate limiter is not just abuse prevention — it is the **margin protection mechanism**. Every plan's budget is set so that worst-case usage still clears target margin.

---

## 5. Moat

1. **Data gravity** — accumulated, governed, consolidated memory is sticky; migrating it out is painful.
2. **Cross-app portability** — once multiple of a customer's apps share one memory identity, nmemo is load-bearing.
3. **Governance posture** — SOC2/GDPR tooling is a high-effort barrier that indie competitors won't match quickly.
4. **Quality compounding** — consolidation makes retrieval *improve over time*, a hard-to-copy feedback loop.

---

## 6. Go-to-market (brief)
- **Wedge:** free tier + a killer 60-second cross-app demo; distribute via AI dev communities and a Vercel AI SDK integration.
- **Expansion:** usage growth + Scale tier features (analytics, SLAs).
- **Enterprise:** inbound from regulated teams needing governance → land $2k–10k+ ACV.

---

## 7. Honest framing for interviews
Present these as projections backed by *mechanics*, not as forecasts. The defensible claims: (1) usage-based + high NRR, (2) capped CoGS via the rate limiter, (3) infra positioning that's neutral across frameworks. That mechanics-first story is what separates a credible founder from a hopeful one.
