import { createServerClient } from "@supabase/ssr";
import type { Metadata } from "next";
import type {
  ProposalSection,
  PricingData,
  BrandSettings,
  Proposal,
} from "@/types/database";
import { ProposalView } from "@/components/portal/proposal-view";
import { ActionButtons } from "@/components/portal/action-buttons";
import { CommentSection } from "@/components/portal/comment-section";
import { ViewTracker } from "@/components/portal/view-tracker";
import { PortalClient } from "./portal-client";
import { FileX, Clock } from "lucide-react";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const supabase = createPublicClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("title")
    .eq("share_token", token)
    .single();

  return {
    title: proposal ? `${proposal.title} - ProposalAI` : "Proposal Not Found",
  };
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ password?: string }>;
}) {
  const { token } = await params;
  const { password } = await searchParams;
  const supabase = createPublicClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select(
      "id, title, sections, pricing_type, pricing_data, brand_settings, valid_until, status, share_password, brief, created_at",
    )
    .eq("share_token", token)
    .single();

  // Not found
  if (!proposal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <FileX className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Proposal Not Found
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            This proposal may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  // Password protected
  if (proposal.share_password && proposal.share_password !== password) {
    return <PortalClient token={token} passwordRequired />;
  }

  // Expired
  if (proposal.valid_until && new Date(proposal.valid_until) < new Date()) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Clock className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Proposal Expired
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            This proposal expired on{" "}
            {new Date(proposal.valid_until).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            .
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Please contact the sender for an updated proposal.
          </p>
        </div>
      </div>
    );
  }

  // Fetch comments
  const { data: comments } = await supabase
    .from("proposal_comments")
    .select("id, author_name, content, created_at")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: true });

  const briefData = proposal.brief as { client_name?: string } | null;

  return (
    <div className="px-4 py-8 sm:py-12">
      <ViewTracker token={token} />

      <ProposalView
        title={proposal.title}
        sections={(proposal.sections as ProposalSection[]) || []}
        pricing_type={proposal.pricing_type as Proposal["pricing_type"]}
        pricing_data={(proposal.pricing_data as PricingData) || {}}
        brand_settings={(proposal.brand_settings as BrandSettings) || {}}
        valid_until={proposal.valid_until}
        client_name={briefData?.client_name}
        created_at={proposal.created_at}
      />

      <div className="mb-6">
        <ActionButtons
          token={token}
          status={proposal.status as Proposal["status"]}
        />
      </div>

      <CommentSection
        token={token}
        comments={(comments as Comment[]) || []}
      />
    </div>
  );
}
