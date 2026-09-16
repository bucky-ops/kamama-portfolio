"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagramSpec, DiagramStage } from "@/lib/profile-data";

/**
 * Expandable stage-by-stage architecture flow for flagship systems.
 *
 * Desktop (md+): a themed SVG pipeline — stage cards laid out serpentine
 * (2 per row, S-flow) with animated dashed connectors and arrowheads, so the
 * diagram stays large and readable inside the case-study dialog.
 * Mobile: the same stages as a vertical HTML list.
 * The HTML list is kept in the DOM on desktop in sr-only form, so screen
 * readers always get the full text regardless of viewport.
 */

/* ---------- SVG geometry (viewBox units) ---------- */
const COL_W = 200; // stage card width
const GAP_X = 56; // horizontal room for the arrow between cards
const GAP_Y = 46; // vertical room for the down connector between rows
const MARGIN = 6; // outer padding inside the viewBox
const HEADER_H = 30; // stage label strip inside a card
const ITEM_LINE = 20; // per-item line height
const CARD_R = 12; // card corner radius
const PAD = 10; // inner card padding

const FONT_LABEL = 11.5;
const FONT_NUM = 10;
const FONT_ITEM = 10.5;

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s;
}

interface CardLayout {
  stage: DiagramStage;
  index: number; // stage number, 0-based
  x: number;
  y: number;
  w: number;
  h: number;
  slot: 0 | 1; // column within the row
  row: number;
}

/** Serpentine placement: even rows run L→R (slots 0,1), odd rows R→L (slots 1,0). */
function layoutCards(stages: DiagramStage[]): CardLayout[] {
  const perRow = 2;
  const rows: CardLayout[][] = [];
  const rowCount = Math.ceil(stages.length / perRow);

  for (let r = 0; r < rowCount; r++) {
    const rowStages = stages.slice(r * perRow, (r + 1) * perRow);
    const maxItems = Math.max(...rowStages.map((s) => s.items.length), 1);
    const cardH = HEADER_H + PAD + maxItems * ITEM_LINE;
    const y =
      MARGIN + rows.reduce((acc, prev) => acc + prev[0].h + GAP_Y, 0);
    // Even rows place cards at slots 0,1 — odd rows at slots 1,0.
    const slots: (0 | 1)[] = r % 2 === 0 ? [0, 1] : [1, 0];
    rows.push(
      rowStages.map((stage, i) => ({
        stage,
        index: r * perRow + i,
        slot: slots[i],
        row: r,
        x: MARGIN + slots[i] * (COL_W + GAP_X),
        y,
        w: COL_W,
        h: cardH,
      }))
    );
  }
  return rows.flat();
}

export function ArchitectureDiagram({
  spec,
  title,
  defaultOpen = false,
}: {
  spec: DiagramSpec;
  title: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const stages = spec.stages;
  const cards = layoutCards(stages);
  const lastRow = cards[cards.length - 1]?.row ?? 0;

  // viewBox size from the furthest card edges.
  const maxSlot = Math.max(...cards.map((c) => c.slot), 0);
  const vbW = MARGIN * 2 + (maxSlot + 1) * COL_W + maxSlot * GAP_X;
  const vbH =
    MARGIN * 2 +
    cards.reduce((acc, c) => (c.row === lastRow ? Math.max(acc, c.y + c.h) : acc), 0);

  const flowLabel = stages.map((s) => s.label).join(" → ");

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-background/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full min-h-11 items-center gap-2 px-3.5 py-2.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        <Network className="size-3.5 text-primary" aria-hidden="true" />
        <span>Architecture — {title}</span>
        <ChevronDown
          className={cn("ml-auto size-3.5 transition-transform duration-200", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <div className="border-t border-border/70 p-3 md:p-4">
            {/* SVG pipeline — desktop */}
            <div className="hidden rounded-lg border border-border/60 bg-secondary/20 p-2 md:block">
              <svg
                viewBox={`0 0 ${vbW} ${vbH}`}
                className="h-auto w-full"
                role="img"
                aria-label={`Architecture flow for ${title}: ${flowLabel}`}
              >
                {/* connectors first — cards paint above them; fade in last
                    so the flow appears to animate out of the stages */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.55, ease: "easeOut" }}
                  aria-hidden="true"
                >
                  {cards.map((c, i) => {
                    const next = cards[i + 1];
                    if (!next) return null;
                    const midY = c.y + c.h / 2;
                    if (next.row === c.row) {
                      // horizontal arrow — direction follows the serpentine row
                      const even = c.row % 2 === 0;
                      // line runs source-edge → target-side so the dash
                      // animation flows with the data; head touches the target.
                      const sx = even ? c.x + c.w + 6 : c.x - 6;
                      const ex = even ? next.x - 10 : next.x + next.w + 10;
                      const tipX = even ? ex + 8 : ex - 8;
                      return (
                        <g key={`c-${i}`}>
                          <line
                            x1={sx}
                            y1={midY}
                            x2={ex}
                            y2={midY}
                            stroke="currentColor"
                            className="diagram-flow-line text-primary/70"
                            strokeWidth={1.5}
                          />
                          <polygon
                            points={`${tipX},${midY} ${ex},${midY - 3.5} ${ex},${midY + 3.5}`}
                            className="fill-primary/70"
                          />
                        </g>
                      );
                    }
                    // row change — vertical connector down the shared column
                    const x = c.x + c.w / 2;
                    const y1 = c.y + c.h + 6;
                    const y2 = next.y - 10;
                    return (
                      <g key={`c-${i}`}>
                        <line
                          x1={x}
                          y1={y1}
                          x2={x}
                          y2={y2}
                          stroke="currentColor"
                          className="diagram-flow-line text-primary/70"
                          strokeWidth={1.5}
                        />
                        <polygon
                          points={`${x},${y2 + 9} ${x - 3.5},${y2 + 3} ${x + 3.5},${y2 + 3}`}
                          className="fill-primary/70"
                        />
                      </g>
                    );
                  })}
                </motion.g>

                {cards.map((c) => (
                  <motion.g
                    key={c.stage.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.32,
                      delay: 0.08 + c.index * 0.09,
                      ease: "easeOut",
                    }}
                  >
                    <rect
                      x={c.x}
                      y={c.y}
                      width={c.w}
                      height={c.h}
                      rx={CARD_R}
                      className="fill-card stroke-border transition-colors hover:stroke-primary/50"
                      strokeWidth={1}
                    />
                    <text
                      x={c.x + PAD}
                      y={c.y + PAD + FONT_NUM + 1}
                      fontSize={FONT_NUM}
                      className="font-mono fill-primary"
                    >
                      {String(c.index + 1).padStart(2, "0")}
                    </text>
                    <text
                      x={c.x + PAD + 22}
                      y={c.y + PAD + FONT_NUM + 2}
                      fontSize={FONT_LABEL}
                      fontWeight={600}
                      className="fill-foreground"
                    >
                      {truncate(c.stage.label, 20)}
                      <title>{c.stage.label}</title>
                    </text>
                    {c.stage.items.map((item, k) => (
                      <g key={item}>
                        <circle
                          cx={c.x + PAD + 4}
                          cy={c.y + HEADER_H + PAD + k * ITEM_LINE + 6}
                          r={2}
                          className="fill-primary/70"
                        />
                        <text
                          x={c.x + PAD + 14}
                          y={c.y + HEADER_H + PAD + k * ITEM_LINE + FONT_ITEM - 1}
                          fontSize={FONT_ITEM}
                          className="fill-muted-foreground"
                        >
                          {truncate(item, 30)}
                          <title>{item}</title>
                        </text>
                      </g>
                    ))}
                  </motion.g>
                ))}
              </svg>
              <p className="mt-1.5 px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
                data flow · {flowLabel}
              </p>
            </div>

            {/* Vertical stage list — mobile, sr-only on desktop */}
            <div className="space-y-2 md:sr-only">
              {stages.map((stage, i) => (
                <div
                  key={stage.label}
                  className="rounded-lg border border-border/70 bg-secondary/25 p-2.5"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wide text-primary">
                    {String(i + 1).padStart(2, "0")} · {stage.label}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {stage.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-[11px] leading-snug text-foreground/90"
                      >
                        <span
                          className="mt-1 size-1 shrink-0 rounded-full bg-primary/70"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
