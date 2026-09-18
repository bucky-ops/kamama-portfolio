/**
 * Kamama Portfolio - Notes (engineering blog).
 * Short first-person write-ups grounded in Collins Kamama's real project work
 * (resume 2026). Content is hand-authored here so it stays editable in one place.
 */

export interface NoteCode {
  /** Short language label shown in the block gutter, e.g. "sql", "python". */
  language: string;
  /** One-line caption explaining what the snippet demonstrates. */
  caption?: string;
  /** The code itself. Plain text - rendered in a styled block with a copy button. */
  snippet: string;
}

export interface NoteSection {
  heading: string;
  paragraphs: string[];
  /** Optional code example rendered after the paragraphs. */
  code?: NoteCode;
}

export interface Note {
  slug: string;
  title: string;
  date: string; // ISO
  readingMinutes: number;
  tags: string[];
  excerpt: string;
  sections: NoteSection[];
}

export const notes: Note[] = [
  {
    slug: "idempotent-field-pipelines",
    title: "Ingest Twice, Worry Once: Idempotent Field-Data Pipelines",
    date: "2026-09-17",
    readingMinutes: 5,
    tags: ["Pipelines", "PostgreSQL", "M&E"],
    excerpt:
      "Field networks retry and links drop mid-upload. Design ingestion so that running it twice changes nothing - the pattern that keeps donor numbers honest.",
    sections: [
      {
        heading: "The problem: field networks retry",
        paragraphs: [
          "Most data-for-development pipelines start with a simple INSERT: a submission arrives, we store it, we move on. That works until the network fails halfway through an upload. The collector on the phone does exactly what it should - it retries - and suddenly the same household survey exists twice in the database. Totals inflate, donor reports disagree with each other, and nobody can say which number is real.",
          "The fix is a design rule I now apply to every ingestion pipeline, including the climate and food-security platform (GCF-SIP): the same input can arrive any number of times, and the stored result is always the same. Engineers call this idempotency. It sounds abstract, but in practice it is three habits: a deterministic key, an upsert instead of an insert, and a raw payload you never mutate.",
        ],
      },
      {
        heading: "Challenge 1: duplicate submissions from retries",
        paragraphs: [
          "The first fix attempt was a naive duplicate check: does a row with this enumerator and timestamp exist? That broke the moment two legitimate submissions shared a timestamp, and it missed retries where the collector app re-sent a batch with a new connection ID. The lesson: the duplicate key must come from the content of the submission, not from connection metadata.",
          "What worked: build a deterministic submission key from things that are true about the data itself - form version, enumerator ID, submission timestamp and a hash of the answers. Then let the database enforce uniqueness. A plain INSERT becomes an upsert that does nothing when the key already exists, so retries are simply absorbed.",
        ],
        code: {
          language: "sql",
          caption: "Idempotent ingest: retries with the same key are absorbed, not duplicated.",
          snippet:
            "INSERT INTO survey_submissions (submission_key, form_version, enumerator_id, collected_at, answers)\nVALUES ($1, $2, $3, $4, $5)\nON CONFLICT (submission_key) DO NOTHING;\n\n-- submission_key is computed by the pipeline:\n-- sha256(form_version || enumerator_id || collected_at || canonical_json(answers))\n-- Same data resent ten times still produces exactly one row.",
        },
      },
      {
        heading: "Challenge 2: forms evolve, histories must not",
        paragraphs: [
          "Field forms change. A question gets reworded, a choice list gains an option, and suddenly this month's submissions have a different shape from last month's. My first version transformed submissions on arrival, which meant a transformation bug silently corrupted data that could never be re-processed.",
          "The solution is a staging layer. Submissions land exactly as received - full answer payload, form version, received timestamp - and nothing ever updates that row. A single documented transformation step (not ten spreadsheets, not analyst edits) moves clean data into the reporting model. When the transformation logic improves, we replay history from staging and every old number can be re-derived.",
        ],
        code: {
          language: "sql",
          caption: "Staging keeps the raw truth; the reporting model is always rebuildable.",
          snippet:
            "CREATE TABLE staging_submissions (\n  id             bigserial PRIMARY KEY,\n  submission_key text UNIQUE NOT NULL,      -- deterministic, from content\n  form_version   text NOT NULL,             -- shape of the payload\n  payload        jsonb NOT NULL,            -- exact answers, untouched\n  received_at    timestamptz NOT NULL DEFAULT now()\n);\n\n-- The only write is INSERT. Corrections happen downstream:\n-- fix the transformation, replay staging, reporting model is rebuilt.",
        },
      },
      {
        heading: "Best practices that keep it boring",
        paragraphs: [
          "Idempotency pays off only if you can prove it ran. Every ingestion run writes a small manifest: run ID, source, rows received, rows accepted, rows skipped as duplicates. If the numbers disagree with expectations, the pipeline stops instead of shipping a wrong dashboard.",
          "Three habits make this maintenance-free. Validate at the form, not the dashboard - a required field constraint at capture is ten times cheaper than a cleaning script. Alert on deltas - a sudden 40% duplicate rate means a collector app is stuck in a retry loop. And rehearse replays - re-running a week of staging data into a scratch schema takes minutes and proves the whole chain still works.",
        ],
      },
    ],
  },
  {
    slug: "cache-the-expensive-parts-rag",
    title: "Cache the Expensive Parts: Making RAG Fast and Cheap",
    date: "2026-09-03",
    readingMinutes: 5,
    tags: ["RAG", "LangChain", "AWS Lambda"],
    excerpt:
      "Every RAG query pays for embeddings, retrieval and generation. The caching order that cut repeat-question cost hard on the SDG 11 evidence system.",
    sections: [
      {
        heading: "Where the money actually goes",
        paragraphs: [
          "The SDG Knowledge Retrieval System answers policy questions over hundreds of UN-Habitat SDG 11 documents. Every single question pays three costs: an embedding call to turn the question into a vector, a vector search to pull candidate passages, and an LLM call (Llama 3.1) to compose the cited answer. The first two are small. The generation call is where latency and money live.",
          "When we watched real usage, a pattern appeared: people ask the same questions in slightly different words. \"Which documents define affordable housing targets?\" and \"What is the official definition of affordable housing?\" deserve the same answer. Treating every rewording as a brand-new question was burning budget for nothing.",
        ],
      },
      {
        heading: "Challenge 1: repeat questions burn tokens",
        paragraphs: [
          "The fix is a two-level cache in front of the pipeline. Level one: normalize the question (lowercase, strip punctuation, collapse whitespace) and hash it together with the model name. If that exact normalized question was answered recently, return the cached answer with its citations, untouched. Level two: cache the embedding vectors themselves, keyed by content hash, so even a cache miss on answers still skips the embedding API.",
          "On AWS Lambda this matters twice over, because a cold start that also calls an embedding API is the slowest path in the whole system. After this change, roughly a third of pilot-team questions never reached generation at all - and answer quality did not move, because a cached answer is the same answer.",
        ],
        code: {
          language: "python",
          caption: "Check the cheap caches before paying for generation.",
          snippet:
            "import hashlib, json\n\ndef cache_key(question: str, model: str) -> str:\n    normalized = \" \".join(question.lower().split())\n    normalized = normalized.replace(\"?\", \"\").replace(\",\", \"\")\n    raw = f\"{model}:{normalized}\"\n    return hashlib.sha256(raw.encode()).hexdigest()\n\ndef answer(question: str, model: str):\n    key = cache_key(question, model)\n    hit = cache_get(key)\n    if hit:\n        return hit  # same answer, same citations, zero token cost\n    result = rag_pipeline(question, model)\n    cache_put(key, result, ttl_hours=24)\n    return result",
        },
      },
      {
        heading: "Challenge 2: the corpus repeats itself",
        paragraphs: [
          "Policy corpora are repetitive: the same target text appears in a strategy brief, an indicator sheet and an annex. Near-duplicate chunks waste two things - retrieval returns three copies of one idea and pushes out diverse passages, and generation reads the same sentence three times and cites it three times.",
          "At ingest time I now collapse near-duplicates: embed every chunk once, compare cosine similarity inside each document section, and when two chunks are almost identical, keep the one with better metadata (section title, document date) and drop the other. The retrieval index gets smaller, searches get faster, and answers cite different sources instead of one source three ways.",
        ],
        code: {
          language: "python",
          caption: "Collapse near-duplicate chunks at ingest, keep the best-labeled one.",
          snippet:
            "def dedupe_chunks(chunks, threshold=0.96):\n    kept = []\n    for chunk in sorted(chunks, key=lambda c: -c.metadata_score):\n        if all(cosine(chunk.embedding, k.embedding) < threshold for k in kept):\n            kept.append(chunk)\n    return kept\n\n# metadata_score prefers chunks with section titles, dates and\n# table content - so the survivor is the most citable copy.",
        },
      },
      {
        heading: "Optimization tips that survived production",
        paragraphs: [
          "Caching a RAG answer is only safe if the cache respects the citation layer. Whatever is cached must carry the full source pointers, so a cached hit is verifiable exactly like a fresh answer - for a development-sector audience, an answer you cannot verify is worth nothing. Invalidate on corpus re-index: new documents in means yesterday's cached answers may be stale.",
          "Measure the hit rate, not just the bill. Log every cache miss with its normalized question and, once a month, turn the top missed questions into a golden test set. That set now doubles as the regression suite for chunking and prompt changes - which is how the system got faster and more trustworthy at the same time.",
        ],
      },
    ],
  },
  {
    slug: "inventory-ledger-cannot-lie",
    title: "An Inventory Ledger That Cannot Lie",
    date: "2026-08-28",
    readingMinutes: 5,
    tags: ["PostgreSQL", "Data Modeling", "Blockchain"],
    excerpt:
      "Mutable stock tables quietly drift. Append-only movement ledgers with computed balances and hard constraints keep reconciliation fast and audits boring.",
    sections: [
      {
        heading: "Why the stock table always disagrees with reality",
        paragraphs: [
          "The classic inventory schema is a products table with a quantity column. Every sale runs UPDATE products SET quantity = quantity - 1. It works in the demo, then drifts: two clerks edit at the same moment, a correction is typed directly into the row, a sync job double-applies, and the number in the database stops matching the shelf. Nobody can explain when it diverged, because the edit history does not exist.",
          "The Blockchain Inventory System takes the strong version of the fix - every stock event is an immutable transaction on an Ethereum ledger, and PostgreSQL is only the reporting layer. But the general lesson works with or without a chain: model inventory as events, not state. You never UPDATE a quantity. You INSERT a movement, and the balance is a consequence.",
        ],
      },
      {
        heading: "Challenge 1: concurrent edits make balances drift",
        paragraphs: [
          "With a mutable quantity column, the database cannot tell a legitimate adjustment from a bug - both are just an UPDATE. The ledger version removes that ambiguity. Stock movements are append-only rows: every RECEIVING, DISPATCH and ADJUSTMENT is a new record with the actor, the reference document and a timestamp. The balance for any SKU is not stored, it is computed - the sum of everything that ever happened to it.",
          "The last line of defense is a database constraint, not application code. Application layers get rewritten, hot-patched and bypassed; CHECK constraints do not forget. If a movement would ever drive a computed balance negative, the database refuses the insert no matter which service sent it.",
        ],
        code: {
          language: "sql",
          caption: "Append-only movements; balances are derived, never stored.",
          snippet:
            "CREATE TABLE stock_movements (\n  id          bigserial PRIMARY KEY,\n  sku         text NOT NULL,\n  qty         int  NOT NULL CHECK (qty <> 0),\n  kind        text NOT NULL CHECK (kind IN ('RECEIVE','DISPATCH','ADJUST')),\n  actor       text NOT NULL,\n  ref_doc     text NOT NULL,           -- GRN, invoice, tx id...\n  created_at  timestamptz NOT NULL DEFAULT now()\n);\n\n-- Balance for a SKU is always a query, never a column:\nSELECT sku,\n       SUM(CASE WHEN kind IN ('RECEIVE','ADJUST') THEN qty\n                ELSE -qty END) AS on_hand\nFROM stock_movements WHERE sku = $1 GROUP BY sku;",
        },
      },
      {
        heading: "Challenge 2: proving the trail to an auditor",
        paragraphs: [
          "Before this system, an audit meant walking back through who-edited-what, and usually ending at \"we are not sure\". With an append-only ledger, the audit trail is the data. Every movement carries its reference document - supplier GRN, sales invoice, and for high-value events the on-chain transaction ID that anchors it to the Ethereum ledger. Tamper evidence stops being a promise and becomes a property: rewriting history would require rewriting every subsequent record, which the chain makes evident.",
          "Reconciliation stopped being an archaeology project. The nightly job recomputes balances from movements, compares them against what the ops console shows, and reports any SKU where the two disagree. In practice the audit question changed from \"can we trust this number?\" to \"which document is this number built from?\" - and the answer is one query away. That discipline is what moved stock reconciliation to roughly 40% faster for the pilot.",
        ],
      },
      {
        heading: "Best practices",
        paragraphs: [
          "You do not need a blockchain to run this pattern - a well-constrained ledger table delivers immutability, derived balances and full audit trails on its own. What the chain adds is third-party verifiability: an auditor can confirm no one with database access rewrote history. Decide based on who needs to trust the data, not on fashion.",
          "If you adopt the pattern: index (sku, created_at) because every balance and reconciliation query walks it; keep ADJUST movements rare and reason-coded, because an adjustment storm means something upstream is lying; and never expose an UPDATE path on the ledger table - not to admins, not in an emergency. The whole design is worth exactly as much as its inability to be quietly edited.",
        ],
      },
    ],
  },
  {
    slug: "postgres-ha-500k-daily",
    title: "Running Tier 3 PostgreSQL HA for 500K+ Daily Transactions",
    date: "2026-08-18",
    readingMinutes: 4,
    tags: ["PostgreSQL", "HA", "DevOps"],
    excerpt:
      "Streaming replication, TLS everywhere and a rehearsed failover runbook - the checklist I use to keep merchant-facing databases at 99.9% uptime.",
    sections: [
      {
        heading: "Why HA is a design decision, not a product",
        paragraphs: [
          "Most outages I have been called into were not caused by the database engine - they were caused by a single-node design that was never asked the hard questions. Before writing a line of application code, I now agree on three numbers with the client: recovery point objective (how much data can we lose), recovery time objective (how long can we be down), and the maintenance window they can actually live with.",
          "For a retail group processing 500,000+ transactions a day, those numbers translated into a Tier 3 setup: a primary, at least one streaming replica in a second availability zone, and an application tier that connects through a health-aware proxy rather than hard-coded hosts.",
        ],
      },
      {
        heading: "The boring things that prevent the loud incidents",
        paragraphs: [
          "TLS on every hop, including replica traffic. pg_hba rules reviewed as code, not clicked together in a console. Backups that are restored - verified monthly, not assumed. WAL archiving shipped off-host so a corrupted primary does not take the backups with it.",
          "The other half is observability. Replication lag, connection saturation, cache hit ratio and long-running transactions go onto the same dashboard the operations team already watches. An alert nobody sees is the same as no alert.",
        ],
      },
      {
        heading: "Failover is a rehearsal, not an improvisation",
        paragraphs: [
          "We run failover drills quarterly. The first drill always exposes the same surprises: apps holding pooled connections to a dead primary, monitoring that keeps paging the wrong channel, and runbooks that say \"promote the replica\" without saying who is allowed to press the button.",
          "After each drill the runbook gets shorter and the recovery gets faster. Uptime is not a feature you ship once - it is a muscle you keep training.",
        ],
      },
    ],
  },
  {
    slug: "rag-for-sdg-evidence",
    title: "Building a RAG System for UN-Habitat SDG 11 Evidence",
    date: "2026-07-02",
    readingMinutes: 5,
    tags: ["RAG", "LangChain", "Llama 3.1"],
    excerpt:
      "What worked when I turned a large SDG 11 document corpus into a cited-answer machine: chunking for policy text, enforcing citations, and deployment on AWS Lambda.",
    sections: [
      {
        heading: "The problem: hours lost to document archaeology",
        paragraphs: [
          "SDG 11 (sustainable cities) guidance lives in hundreds of reports, indicator sheets and policy briefs. Analysts told me they regularly lost an hour or more tracking down the source of a single figure. Keyword search fails here because the vocabulary of the question rarely matches the vocabulary of the source document.",
          "Retrieval-augmented generation fits this shape of problem: retrieve the few passages that actually matter, then let an LLM compose an answer grounded in them.",
        ],
      },
      {
        heading: "Chunking for policy text is not chunking for chat logs",
        paragraphs: [
          "Policy documents argue in long, structured arcs. Cutting on fixed token counts shredded tables and broke cross-references between indicators. What finally worked: split on document structure first (sections, annexes, tables kept whole), then on token budget, with generous overlap and section titles carried into every chunk's metadata.",
          "That metadata earns its keep twice - it improves retrieval recall, and it makes the citation layer possible.",
        ],
      },
      {
        heading: "No citation, no answer",
        paragraphs: [
          "The system refuses to answer unless retrieval confidence clears a threshold, and every generated sentence carries a pointer to its source passage. For a development-sector audience this is the difference between a toy and a tool: analysts can verify in seconds, which is exactly what made adoption happen.",
          "Serving runs on AWS Lambda behind a REST API, with encryption aligned to GDPR expectations for the document store. Net result measured with the pilot team: roughly 40% faster retrieval of policy evidence, and a lot fewer \"where did this number come from?\" threads.",
        ],
      },
    ],
  },
  {
    slug: "odk-to-donor-dashboard",
    title: "From ODK Forms to Donor Dashboards: an M&E Pipeline That Survives the Field",
    date: "2026-05-27",
    readingMinutes: 4,
    tags: ["M&E", "KoboToolbox", "Power BI"],
    excerpt:
      "Four thematic pillars, PEPFAR-funded reporting deadlines and patchy field connectivity - the data pipeline design decisions that kept numbers trustworthy.",
    sections: [
      {
        heading: "Design for the field first",
        paragraphs: [
          "Digital data collection fails in the field before it fails in the cloud. Forms are versioned like code, every revision is backwards-compatible with in-flight submissions, and enumerators can export and re-import when connectivity drops. Once that discipline exists in ODK/KoboToolbox, everything downstream gets easier.",
          "Validation happens at the form level - constraints, skip logic and required fields - because fixing nonsense at the point of capture is ten times cheaper than cleaning it in a dashboard.",
        ],
      },
      {
        heading: "One transformation layer, not ten spreadsheets",
        paragraphs: [
          "Submissions flow into a staging store, then through a single, documented transformation step into the reporting model that Power BI reads. The discipline that matters: no analyst-ever-edited copies. When a donor asks how a number was produced, the answer is a pipeline, not a person's memory.",
          "For the SSK programme across four thematic pillars, that meant milestone indicators refresh automatically instead of via a fortnightly spreadsheet merge - and the field teams I trained now trust the dashboard enough to argue with it, which is exactly the point.",
        ],
      },
      {
        heading: "Accuracy is a training outcome",
        paragraphs: [
          "Tooling aside, the measurable gain came from training field teams on digital reporting discipline - data accuracy rose by about 30% once enumerators understood how their entries became reports. People maintain data quality; pipelines just preserve it.",
        ],
      },
    ],
  },
];

export function getNote(slug: string): Note | undefined {
  return notes.find((n) => n.slug === slug);
}

export function formatDateLong(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
