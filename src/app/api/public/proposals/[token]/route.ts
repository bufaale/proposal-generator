import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = createPublicClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select(
      "id, title, sections, pricing_type, pricing_data, brand_settings, valid_until, status, share_password, created_at",
    )
    .eq("share_token", token)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const password = url.searchParams.get("password");
  if (proposal.share_password && proposal.share_password !== password) {
    return NextResponse.json(
      { error: "Password required", password_protected: true },
      { status: 401 },
    );
  }

  const { data: comments } = await supabase
    .from("proposal_comments")
    .select("id, author_name, content, created_at")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: true });

  const { share_password: _, ...safeProposal } = proposal;
  return NextResponse.json({
    proposal: safeProposal,
    comments: comments || [],
  });
}
