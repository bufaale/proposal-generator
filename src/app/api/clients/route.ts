import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkClientLimit } from "@/lib/usage";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ clients: clients || [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkClientLimit();
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Client limit reached (${limit.used}/${limit.limit}). Upgrade your plan.`,
      },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: client, error } = await supabase
    .from("clients")
    .insert({ user_id: user.id, ...parsed.data })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client }, { status: 201 });
}
