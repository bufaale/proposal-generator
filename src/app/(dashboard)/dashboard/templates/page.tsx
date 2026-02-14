import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/stripe/plans";
import { CreateTemplateDialog } from "@/components/clients/create-template-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutTemplate, Layers } from "lucide-react";
import type { Template } from "@/types/database";

const industryColors: Record<string, string> = {
  technology:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  design:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  marketing:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  consulting:
    "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  content: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
};

function IndustryBadge({ industry }: { industry: string | null }) {
  if (!industry) return null;
  const colorClass =
    industryColors[industry] ??
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  return (
    <Badge variant="outline" className={colorClass}>
      {industry.charAt(0).toUpperCase() + industry.slice(1)}
    </Badge>
  );
}

function TemplateCard({ template }: { template: Template }) {
  const sectionCount = template.sections_schema?.length ?? 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <IndustryBadge industry={template.industry} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="h-3 w-3" />
            {sectionCount} sections
          </span>
        </div>
        <CardTitle className="mt-2">{template.name}</CardTitle>
        {template.description && (
          <CardDescription>{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto">
        <Button asChild className="w-full">
          <Link href={`/dashboard/proposals/new?template_id=${template.id}`}>
            Use Template
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default async function TemplatesLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all accessible templates (system + user's own)
  const { data: templatesData } = await supabase
    .from("templates")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user!.id}`)
    .order("created_at", { ascending: false });

  const templates = (templatesData ?? []) as Template[];

  // Split into system and custom templates
  const systemTemplates = templates.filter((t) => t.user_id === null);
  const customTemplates = templates.filter((t) => t.user_id !== null);

  // Fetch user profile for plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("id", user!.id)
    .single();

  const plan = getUserPlan(profile?.subscription_plan ?? null);
  const canCreateTemplates = plan.limits.templates === "all_custom";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="mt-1 text-muted-foreground">
            Choose a template to start your proposal
          </p>
        </div>
        {canCreateTemplates && <CreateTemplateDialog />}
      </div>

      {/* System Templates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">System Templates</h2>
        {systemTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <LayoutTemplate className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-4">No system templates available.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {systemTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>

      {/* Custom Templates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Templates</h2>
          {!canCreateTemplates && (
            <Badge variant="secondary">Business plan required</Badge>
          )}
        </div>
        {customTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <LayoutTemplate className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-4">No custom templates yet.</p>
              {canCreateTemplates ? (
                <p className="mt-1 text-sm">
                  Create your first custom template to reuse across proposals.
                </p>
              ) : (
                <p className="mt-1 text-sm">
                  Upgrade to Business plan to create custom templates.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
