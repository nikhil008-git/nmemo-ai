# Analytics (`/sites/[id]/analytics`) — planned

## Purpose

Aggregate insight — what visitors ask, where knowledge fails, conversion to actions.

## Audience

Site owners, growth/support leads.

## Sections (planned)

### Top questions

- Bar chart or table: question clusters, count, trend

### Knowledge gaps

- Queries with low retrieval score or no citations
- “Suggested FAQ” drafts (flywheel input)

### Actions funnel

- Messages → leads created → demos booked
- Tool call breakdown by type

### Pages

- Which URLs visitors were on when they asked (heatmap table)

### Weekly report

- Export or email summary (Architect-style “what’s stopping sales”)

## Data source

- Postgres: `Message`, `Conversation`, tool records
- Langfuse: retrieval quality metrics

## Future

- Compare week over week
- A/B: widget on vs off (if customer runs experiment)
