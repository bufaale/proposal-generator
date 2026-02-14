import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  password: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  const { data: proposal } = await supabase
    .from("proposals")
    .select("share_token, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const shareToken =
    proposal.share_token || crypto.randomBytes(16).toString("hex");

  const { error } = await supabase
    .from("proposals")
    .update({
      share_token: shareToken,
      share_password: parsed.data?.password || null,
      status: proposal.status === "draft" ? "sent" : proposal.status,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/p/${shareToken}`;
  return NextResponse.json({ share_token: shareToken, share_url: shareUrl });
}
