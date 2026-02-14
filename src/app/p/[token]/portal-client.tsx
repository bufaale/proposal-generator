"use client";

import { useState } from "react";
import { PasswordGate } from "@/components/portal/password-gate";
import { ProposalView } from "@/components/portal/proposal-view";
import { ActionButtons } from "@/components/portal/action-buttons";
import { CommentSection } from "@/components/portal/comment-section";
import { ViewTracker } from "@/components/portal/view-tracker";
import type {
  ProposalSection,
  PricingData,
  BrandSettings,
  Proposal,
} from "@/types/database";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

interface ProposalData {
  title: string;
  sections: ProposalSection[];
  pricing_type: Proposal["pricing_type"];
  pricing_data: PricingData;
  brand_settings: BrandSettings;
  valid_until: string | null;
  status: Proposal["status"];
  brief?: { client_name?: string } | null;
  created_at: string;
}

interface PortalClientProps {
  token: string;
  passwordRequired: boolean;
}

export function PortalClient({ token, passwordRequired }: PortalClientProps) {
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [unlocked, setUnlocked] = useState(!passwordRequired);

  async function handleUnlock(password: string) {
    try {
      const res = await fetch(
        `/api/public/proposals/${token}?password=${encodeURIComponent(password)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setProposal(data.proposal);
        setComments(data.comments || []);
        setUnlocked(true);
      }
    } catch {
      // Error handled by PasswordGate
    }
  }

  if (!unlocked || !proposal) {
    return <PasswordGate token={token} onUnlock={handleUnlock} />;
  }

  const briefData = proposal.brief as { client_name?: string } | null;

  return (
    <div className="px-4 py-8 sm:py-12">
      <ViewTracker token={token} />

      <ProposalView
        title={proposal.title}
        sections={proposal.sections || []}
        pricing_type={proposal.pricing_type}
        pricing_data={proposal.pricing_data || {}}
        brand_settings={proposal.brand_settings || {}}
        valid_until={proposal.valid_until}
        client_name={briefData?.client_name}
        created_at={proposal.created_at}
      />

      <div className="mb-6">
        <ActionButtons token={token} status={proposal.status} />
      </div>

      <CommentSection token={token} comments={comments} />
    </div>
  );
}
