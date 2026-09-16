import type { Project } from "@/lib/profile-data";
import { profile } from "@/lib/profile-data";

/**
 * Print-only case-study one-pager.
 *
 * Rendered inside the case-study dialog but invisible on screen
 * (`hidden`); the @media print rules in globals.css hide every other
 * element and reveal only this subtree — producing a clean, black-on-white
 * branded one-pager when the visitor hits "Print / Save PDF" (or Ctrl/Cmd+P).
 */
export function CaseStudyPrint({ project }: { project: Project }) {
  const generated = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="print-sheet hidden" aria-hidden="true">
      {/* Branded letterhead */}
      <header className="print-sheet-header">
        <div className="print-sheet-brand">
          KAMAMA<span className="print-sheet-dot">●</span>
        </div>
        <div className="print-sheet-brand-meta">
          {profile.shortName} · Kamama Consulting Solutions
          <br />
          Case study one-pager · {generated}
        </div>
      </header>

      <h1 className="print-sheet-title">{project.title}</h1>
      <p className="print-sheet-meta">
        {project.cluster}
        {project.featured ? " · ★ Flagship system" : ""} ·{" "}
        {profile.role}
      </p>

      <section className="print-sheet-section">
        <h2>Problem</h2>
        <p>{project.problem}</p>
      </section>

      <section className="print-sheet-section">
        <h2>Architecture</h2>
        <p className="print-sheet-mono">{project.architecture}</p>
        <p>{project.caseStudy}</p>
      </section>

      {project.diagram ? (
        <section className="print-sheet-section">
          <h2>Stage-by-stage flow</h2>
          <ol className="print-sheet-stages">
            {project.diagram.stages.map((stage, i) => (
              <li key={stage.label}>
                <span className="print-sheet-stage-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{stage.label}:</strong> {stage.items.join(" · ")}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="print-sheet-section">
        <h2>Stack</h2>
        <p className="print-sheet-mono">{project.stack.join("  ·  ")}</p>
      </section>

      <section className="print-sheet-section">
        <h2>Outcome</h2>
        <p className="print-sheet-metric">{project.metric}</p>
      </section>

      <footer className="print-sheet-footer">
        <span>{profile.emails.founder}</span>
        <span>{profile.phone}</span>
        <span>kamama-portfolio.vercel.app</span>
      </footer>
    </div>
  );
}
