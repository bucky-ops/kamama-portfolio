"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  /** Shared item title (used as share sheet title + aria-label). */
  title: string;
  /** Short descriptive text for native share sheets. */
  text?: string;
  /** Absolute URL to share. Defaults to origin + `path`. */
  url?: string;
  /** Relative deep link used when no absolute `url` is given. */
  path?: string;
  label?: string;
  className?: string;
}

/**
 * Share via the Web Share API when available (mobile / Safari / Edge),
 * with a clipboard-copy fallback + toast everywhere else. Zero deps.
 */
export function ShareButton({
  title,
  text,
  url,
  path = "/",
  label = "Share",
  className,
}: ShareButtonProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    url ??
    (typeof window !== "undefined" ? `${window.location.origin}${path}` : path);

  const onShare = async () => {
    // Native share sheet first.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: text ?? title, url: shareUrl });
        return; // user completed (or cancelled) the native sheet - nothing else to do
      } catch {
        return; // cancelled - treat as no-op, never punish the user
      }
    }
    // Clipboard fallback.
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      toast({ title: "Link copied", description: shareUrl });
    } catch {
      toast({
        title: "Couldn't share",
        description: "Copy the address from the browser bar instead.",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label={`${label}: ${title}`}
      className={
        className ??
        "inline-flex min-h-9 items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 print:hidden"
      }
    >
      {copied ? (
        <Check className="size-3.5 text-primary" aria-hidden="true" />
      ) : (
        <Share2 className="size-3.5" aria-hidden="true" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
