/**
 * Kamama portfolio mail layer.
 *
 * Provider-agnostic transactional email for contact-form leads:
 *  1. Resend  - RESEND_API_KEY + MAIL_FROM (plain fetch, zero deps, works on Vercel)
 *  2. SMTP    - SMTP_HOST (+ optional SMTP_PORT/SMTP_USER/SMTP_PASS) via nodemailer
 *  3. log     - MAIL_TRANSPORT=log renders the full email into the server log (local QA)
 *  4. none    - nothing configured: the lead is still stored in the DB, email skipped
 *
 * Resolution order: explicit MAIL_TRANSPORT override > Resend > SMTP > none.
 *
 * Security notes:
 * - Every user-supplied value is HTML-escaped before it enters email markup.
 * - Credentials are read from server-side env vars only; nothing client-shipped.
 * - sendMail never throws: mail failures must not fail an accepted contact lead.
 */

export interface MailAttachment {
  filename: string;
  /** Base64-encoded content. */
  content: string;
}

export interface MailMessage {
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachments?: MailAttachment[];
}

export type MailTransport = "resend" | "smtp" | "log" | "none";

export interface MailSendResult {
  sent: boolean;
  transport: MailTransport;
  /** Short human-readable reason when sent=false. */
  reason?: string;
}

/** Founder inbox - featured first on the Contact tab. */
export const FOUNDER_EMAIL = "muchiri.collin@aol.com";

export function resolveTransport(): MailTransport {
  const override = process.env.MAIL_TRANSPORT?.trim().toLowerCase();
  if (override === "none") return "none";
  if (override === "log") return "log";
  if (override === "resend" || override === "smtp") {
    // Explicit override, but only honored if its credentials exist (falls through otherwise).
    if (override === "resend" && process.env.RESEND_API_KEY) return "resend";
    if (override === "smtp" && process.env.SMTP_HOST) return "smtp";
  }
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return "none";
}

export function mailFrom(): string {
  return process.env.MAIL_FROM?.trim() || "Kamama Portfolio <onboarding@resend.dev>";
}

export function mailToFounder(): string {
  return process.env.MAIL_TO?.trim() || FOUNDER_EMAIL;
}

/** Escape user input for safe interpolation into email HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** ── Resend (REST API - no SDK dependency) ─────────────────────────── */
async function sendViaResend(msg: MailMessage): Promise<MailSendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: mailFrom(),
      to: [msg.to],
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      reply_to: msg.replyTo,
      attachments: msg.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { sent: false, transport: "resend", reason: `Resend ${res.status}: ${body.slice(0, 200)}` };
  }
  return { sent: true, transport: "resend" };
}

/** ── SMTP (nodemailer, lazy-imported so builds never require it) ───── */
async function sendViaSmtp(msg: MailMessage): Promise<MailSendResult> {
  try {
    const nodemailer = (await import("nodemailer")).default;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    await transport.sendMail({
      from: mailFrom(),
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
      attachments: msg.attachments,
    });
    return { sent: true, transport: "smtp" };
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 200) : "SMTP failure";
    return { sent: false, transport: "smtp", reason };
  }
}

/** ── Log transport (local QA: render the email into the server log) ── */
function sendViaLog(msg: MailMessage): MailSendResult {
  console.info(
    `[mail:log] to=${msg.to} subject="${msg.subject}" replyTo=${msg.replyTo ?? "-"}\n${msg.text}`
  );
  return { sent: true, transport: "log" };
}

/** Never throws - a mail failure must never fail an accepted lead. */
export async function sendMail(msg: MailMessage): Promise<MailSendResult> {
  const transport = resolveTransport();
  try {
    switch (transport) {
      case "resend":
        return await sendViaResend(msg);
      case "smtp":
        return await sendViaSmtp(msg);
      case "log":
        return sendViaLog(msg);
      default:
        return { sent: false, transport: "none", reason: "No mail transport configured" };
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 200) : "Unknown mail error";
    console.error("[mail] send failed:", reason);
    return { sent: false, transport, reason };
  }
}

/** ── Branded templates ─────────────────────────────────────────────── */

function shell(title: string, bodyHtml: string, footerNote: string): string {
  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#0D1117;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#161B22;border:1px solid #21262D;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:20px 28px;border-bottom:1px solid #21262D;">
          <span style="font-family:Arial,sans-serif;font-size:18px;font-weight:800;color:#F9B872;letter-spacing:-0.01em;">KAMAMA</span>
          <span style="font-family:monospace;font-size:11px;color:#8B949E;margin-left:8px;">CONSULTING SOLUTIONS</span>
        </td></tr>
        <tr><td style="padding:28px;font-family:Arial,sans-serif;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#C9D1D9;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #21262D;">
          <p style="margin:0;font-family:monospace;font-size:11px;line-height:1.6;color:#8B949E;">${footerNote}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function row(label: string, valueHtml: string): string {
  return `<tr>
    <td style="padding:6px 0;font-family:monospace;font-size:11px;color:#8B949E;vertical-align:top;width:130px;">${label}</td>
    <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;color:#C9D1D9;">${valueHtml}</td>
  </tr>`;
}

export interface LeadEmailInput {
  name: string;
  email: string;
  organization?: string | null;
  projectType: string;
  budgetRange?: string | null;
  message: string;
  receivedAt: string;
}

/** Notification email to the founder: full lead details. */
export function leadNotificationEmail(lead: LeadEmailInput): MailMessage {
  const e = escapeHtml;
  const orgRow = lead.organization ? row("ORGANIZATION", e(lead.organization)) : "";
  const budgetRow = lead.budgetRange ? row("BUDGET", e(lead.budgetRange)) : "";

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("NAME", e(lead.name))}
      ${row("EMAIL", `<a href="mailto:${e(lead.email)}" style="color:#F9B872;">${e(lead.email)}</a>`)}
      ${orgRow}
      ${row("PROJECT TYPE", e(lead.projectType))}
      ${budgetRow}
      ${row("RECEIVED", e(lead.receivedAt))}
    </table>
    <div style="margin:16px 0 0;padding:16px;background:#0D1117;border:1px solid #21262D;border-radius:12px;">
      <p style="margin:0 0 8px;font-family:monospace;font-size:11px;color:#8B949E;">MESSAGE</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#C9D1D9;white-space:pre-wrap;">${e(lead.message)}</p>
    </div>`;

  const text = [
    `New project lead from the portfolio contact form`,
    ``,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    lead.organization ? `Organization: ${lead.organization}` : "",
    `Project type: ${lead.projectType}`,
    lead.budgetRange ? `Budget: ${lead.budgetRange}` : "",
    `Received: ${lead.receivedAt}`,
    ``,
    `Message:`,
    lead.message,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    to: mailToFounder(),
    replyTo: lead.email,
    subject: `New lead: ${lead.name}${lead.organization ? ` (${lead.organization})` : ""} - ${lead.projectType}`,
    html: shell("New project lead", body, `Kamama Consulting Solutions - lead inbox notification - ${lead.receivedAt}`),
    text,
  };
}

/** Auto-reply to the visitor: acknowledgment + response-time expectation. */
export function autoReplyEmail(lead: LeadEmailInput): MailMessage {
  const e = escapeHtml;
  const body = `
    <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#C9D1D9;">
      Hi ${e(lead.name.split(" ")[0] || lead.name)},
    </p>
    <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#C9D1D9;">
      Thanks for reaching out through the portfolio. Your message about
      <strong style="color:#F9B872;">${e(lead.projectType)}</strong> landed safely and
      you can expect a scoped reply within 24 hours.
    </p>
    <div style="margin:0 0 14px;padding:14px 16px;background:#0D1117;border:1px solid #21262D;border-radius:12px;">
      <p style="margin:0 0 6px;font-family:monospace;font-size:11px;color:#8B949E;">YOUR MESSAGE (copy)</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#C9D1D9;white-space:pre-wrap;">${e(lead.message)}</p>
    </div>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#C9D1D9;">
      In the meantime, the <a href="https://kamama-portfolio.vercel.app/?tab=projects" style="color:#F9B872;">projects</a>
      and <a href="https://kamama-portfolio.vercel.app/?tab=notes" style="color:#F9B872;">engineering notes</a>
      pages show how previous systems were designed and shipped.
    </p>`;

  return {
    to: lead.email,
    subject: `Received: ${lead.projectType} inquiry - Kamama Consulting`,
    html: shell(
      "Message received",
      body,
      "You are receiving this because you submitted the contact form at kamama-portfolio.vercel.app"
    ),
    text: [
      `Hi ${lead.name.split(" ")[0] || lead.name},`,
      ``,
      `Thanks for reaching out through the portfolio. Your message about ${lead.projectType} landed safely and you can expect a scoped reply within 24 hours.`,
      ``,
      `Your message (copy):`,
      lead.message,
      ``,
      `Kamama Consulting Solutions - https://kamama-portfolio.vercel.app`,
    ].join("\n"),
  };
}
