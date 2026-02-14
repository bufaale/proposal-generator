"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Share2,
  Download,
  Copy,
  Eye,
  Loader2,
  Check,
} from "lucide-react";

interface ProposalActionsProps {
  proposalId: string;
  shareToken: string | null;
}

export function ProposalActions({
  proposalId,
  shareToken: initialToken,
}: ProposalActionsProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    initialToken
      ? `${window.location.origin}/p/${initialToken}`
      : "",
  );
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  async function handleShare() {
    setSharing(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.share_url);
        setShareDialogOpen(true);
      }
    } catch {
      // Silently fail
    } finally {
      setSharing(false);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyContent() {
    // Copy proposal content as plain text from the page
    const sections = document.querySelectorAll("[data-slot='card']");
    let text = "";
    sections.forEach((section) => {
      const title = section.querySelector("h3, [data-slot='card-title']");
      const content = section.querySelector(".prose");
      if (title && content) {
        text += `${title.textContent}\n\n${content.textContent}\n\n---\n\n`;
      }
    });
    if (text) {
      await navigator.clipboard.writeText(text.trim());
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/proposals/${proposalId}/edit`}>
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          disabled={sharing}
        >
          {sharing ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="mr-1 h-4 w-4" />
          )}
          Share
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`/api/proposals/${proposalId}/pdf`} download>
            <Download className="mr-1 h-4 w-4" />
            Download PDF
          </a>
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyContent}>
          {copiedContent ? (
            <Check className="mr-1 h-4 w-4" />
          ) : (
            <Copy className="mr-1 h-4 w-4" />
          )}
          {copiedContent ? "Copied!" : "Copy to Clipboard"}
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/proposals/${proposalId}/preview`}>
            <Eye className="mr-1 h-4 w-4" />
            Preview
          </Link>
        </Button>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Proposal</DialogTitle>
            <DialogDescription>
              Share this link with your client. They can view and comment on the
              proposal.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={handleCopyLink} variant="outline" size="sm">
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </>
  );
}
