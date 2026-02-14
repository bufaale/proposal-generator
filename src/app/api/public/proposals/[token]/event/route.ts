import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { headers } from "next/headers";
import { z } from "zod";

function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

const schema = z.object({
  event_type: z.enum(["viewed", "accepted", "declined"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const supabase = createPublicClient();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, status, user_id")
    .eq("share_token", token)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const hdrs = await headers();

  await supabase.from("proposal_events").insert({
    proposal_id: proposal.id,
    event_type: parsed.data.event_type,
    viewer_ip: hdrs.get("x-forwarded-for") || hdrs.get("x-real-ip"),
    viewer_ua: hdrs.get("user-agent"),
  });

  if (
    parsed.data.event_type === "accepted" ||
    parsed.data.event_type === "declined"
  ) {
    await supabase
      .from("proposals")
      .update({ status: parsed.data.event_type })
      .eq("id", proposal.id);
  } else if (
    parsed.data.event_type === "viewed" &&
    proposal.status === "sent"
  ) {
    await supabase
      .from("proposals")
      .update({ status: "viewed" })
      .eq("id", proposal.id);
  }

  return NextResponse.json({ success: true });
}
