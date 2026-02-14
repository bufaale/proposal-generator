import type {
  ProposalSection,
  PricingData,
  BrandSettings,
} from "@/types/database";

interface ProposalViewProps {
  title: string;
  sections: ProposalSection[];
  pricing_type: "fixed" | "hourly" | "milestone" | null;
  pricing_data: PricingData;
  brand_settings: BrandSettings;
  valid_until: string | null;
  client_name?: string;
  created_at: string;
}

export function ProposalView({
  title,
  sections,
  pricing_type,
  pricing_data,
  brand_settings,
  valid_until,
  client_name,
  created_at,
}: ProposalViewProps) {
  const primaryColor = brand_settings?.primary_color || "#2563eb";
  const secondaryColor = brand_settings?.secondary_color || "#1e40af";
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header / Cover */}
      <div className="mb-8 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900 sm:p-12">
        {brand_settings?.logo_url && (
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand_settings.logo_url}
              alt="Company logo"
              className="h-12 w-auto"
            />
          </div>
        )}
        <h1
          className="mb-3 text-3xl font-bold sm:text-4xl"
          style={{ color: primaryColor }}
        >
          {title}
        </h1>
        {client_name && (
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Prepared for {client_name}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400 dark:text-gray-500">
          <span>Created {new Date(created_at).toLocaleDateString()}</span>
          {valid_until && (
            <span>
              Valid until {new Date(valid_until).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      {sortedSections.map((section, i) => (
        <div
          key={i}
          className="mb-6 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900"
        >
          <h2
            className="mb-4 border-b-2 pb-2 text-xl font-bold"
            style={{
              color: primaryColor,
              borderBottomColor: secondaryColor,
            }}
          >
            {section.title}
          </h2>
          <div className="prose prose-gray max-w-none dark:prose-invert">
            {section.content.split("\n").map((line, j) =>
              line.trim() === "" ? (
                <br key={j} />
              ) : (
                <p key={j} className="mb-2 leading-relaxed text-gray-700 dark:text-gray-300">
                  {line}
                </p>
              ),
            )}
          </div>
        </div>
      ))}

      {/* Pricing */}
      {pricing_data && pricing_type && (
        <div className="mb-6 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">
          <h2
            className="mb-4 border-b-2 pb-2 text-xl font-bold"
            style={{
              color: primaryColor,
              borderBottomColor: secondaryColor,
            }}
          >
            Investment
          </h2>

          {pricing_type === "fixed" && pricing_data.amount != null && (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <span className="text-gray-600 dark:text-gray-400">
                Total Investment
              </span>
              <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                ${pricing_data.amount.toLocaleString()}{" "}
                <span className="text-sm font-normal text-gray-400">
                  {pricing_data.currency || "USD"}
                </span>
              </span>
            </div>
          )}

          {pricing_type === "hourly" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <span className="text-gray-600 dark:text-gray-400">
                  Hourly Rate
                </span>
                <span className="text-xl font-bold" style={{ color: primaryColor }}>
                  ${pricing_data.hourly_rate}/hr
                </span>
              </div>
              {pricing_data.estimated_hours != null && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">
                    Estimated Hours
                  </span>
                  <span className="text-xl font-bold" style={{ color: primaryColor }}>
                    {pricing_data.estimated_hours}h
                  </span>
                </div>
              )}
              {pricing_data.hourly_rate != null &&
                pricing_data.estimated_hours != null && (
                  <div className="flex items-center justify-between rounded-lg border-2 p-4" style={{ borderColor: primaryColor }}>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Estimated Total
                    </span>
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                      $
                      {(
                        pricing_data.hourly_rate * pricing_data.estimated_hours
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
            </div>
          )}

          {pricing_type === "milestone" && pricing_data.milestones && (
            <div className="space-y-3">
              {pricing_data.milestones.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
                >
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {m.name}
                    </span>
                    {m.due && (
                      <span className="ml-2 text-sm text-gray-400">
                        Due: {new Date(m.due).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-lg font-bold"
                    style={{ color: primaryColor }}
                  >
                    ${m.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-lg border-2 p-4" style={{ borderColor: primaryColor }}>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Total
                </span>
                <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                  $
                  {pricing_data.milestones
                    .reduce((sum, m) => sum + m.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Valid Until */}
      {valid_until && (
        <div className="mb-6 text-center text-sm text-gray-400 dark:text-gray-500">
          This proposal is valid until{" "}
          {new Date(valid_until).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mb-8 text-center text-xs text-gray-300 dark:text-gray-600">
        Generated with ProposalAI
      </div>
    </div>
  );
}
