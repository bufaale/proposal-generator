import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type {
  Proposal,
  ProposalSection,
  PricingData,
  BrandSettings,
} from "@/types/database";

export default async function ProposalPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: proposalData } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposalData) {
    notFound();
  }

  const proposal = proposalData as unknown as Proposal;
  const sections = proposal.sections as ProposalSection[];
  const pricing = proposal.pricing_data as PricingData;
  const brand = proposal.brand_settings as BrandSettings;
  const primaryColor = brand?.primary_color || "#2563eb";
  const secondaryColor = brand?.secondary_color || "#1e40af";

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar - not printed */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/proposals/${id}`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Editor
            </Link>
          </Button>
          <p className="text-sm text-gray-500">Preview Mode</p>
        </div>
      </div>

      {/* Proposal Content */}
      <div className="mx-auto max-w-4xl px-8 py-12">
        {/* Header with brand */}
        <div className="mb-12 border-b-4 pb-8" style={{ borderColor: primaryColor }}>
          {(brand?.logo_url || brand?.company_name) && (
            <div className="mb-6 flex items-center gap-3">
              {brand?.logo_url && (
                <img
                  src={brand.logo_url}
                  alt="Company logo"
                  className="h-12 object-contain"
                />
              )}
              {brand?.company_name && (
                <span className="text-lg font-semibold text-gray-700">
                  {brand.company_name}
                </span>
              )}
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-900">
            {proposal.title}
          </h1>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span>
              Created: {new Date(proposal.created_at).toLocaleDateString()}
            </span>
            {proposal.valid_until && (
              <span>
                Valid until:{" "}
                {new Date(proposal.valid_until).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, index) => (
            <div key={`preview-section-${index}`}>
              <h2
                className="mb-4 text-2xl font-semibold"
                style={{ color: secondaryColor }}
              >
                {section.title}
              </h2>
              <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        {proposal.pricing_type && (
          <div className="mt-12 border-t-4 pt-8" style={{ borderColor: primaryColor }}>
            <h2
              className="mb-6 text-2xl font-semibold"
              style={{ color: secondaryColor }}
            >
              Investment
            </h2>

            {proposal.pricing_type === "fixed" && (
              <div
                className="rounded-lg p-6 text-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <p className="text-sm uppercase tracking-wider opacity-80">
                  Total Investment
                </p>
                <p className="mt-2 text-4xl font-bold">
                  {pricing.currency ?? "USD"}{" "}
                  {(pricing.amount ?? 0).toLocaleString()}
                </p>
              </div>
            )}

            {proposal.pricing_type === "hourly" && (
              <div
                className="rounded-lg p-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="grid gap-4 sm:grid-cols-2 text-center">
                  <div>
                    <p className="text-sm uppercase tracking-wider opacity-80">
                      Hourly Rate
                    </p>
                    <p className="mt-1 text-3xl font-bold">
                      ${pricing.hourly_rate ?? 0}
                    </p>
                  </div>
                  {pricing.estimated_hours && (
                    <div>
                      <p className="text-sm uppercase tracking-wider opacity-80">
                        Estimated Total
                      </p>
                      <p className="mt-1 text-3xl font-bold">
                        $
                        {(
                          (pricing.hourly_rate ?? 0) * pricing.estimated_hours
                        ).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm opacity-80">
                        ({pricing.estimated_hours} hours)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {proposal.pricing_type === "milestone" &&
              pricing.milestones &&
              pricing.milestones.length > 0 && (
                <div className="space-y-3">
                  {pricing.milestones.map((m, mIdx) => (
                    <div
                      key={`preview-milestone-${mIdx}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{m.name}</p>
                        {m.due && (
                          <p className="text-sm text-gray-500">
                            Due: {new Date(m.due).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <p
                        className="text-xl font-bold"
                        style={{ color: primaryColor }}
                      >
                        ${m.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <div
                    className="mt-4 rounded-lg p-4 text-right text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span className="text-sm uppercase tracking-wider opacity-80">
                      Total:{" "}
                    </span>
                    <span className="text-2xl font-bold">
                      $
                      {pricing.milestones
                        .reduce((sum, m) => sum + m.amount, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t pt-8 text-center text-sm text-gray-400">
          <p>
            {brand?.company_name
              ? `${brand.company_name} — Confidential and intended for the recipient only.`
              : "This proposal was generated with ProposalAI. Confidential and intended for the recipient only."}
          </p>
        </div>
      </div>
    </div>
  );
}
