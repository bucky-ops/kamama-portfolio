/**
 * Kamama Portfolio - Notes (engineering blog).
 * Short first-person write-ups grounded in Collins Kamama's real project work
 * (resume 2026). Content is hand-authored here so it stays editable in one place.
 */

export interface NoteSection {
  heading: string;
  paragraphs: string[];
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
