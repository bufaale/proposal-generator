import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Proposal } from "@/types/database";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
});

function createStyles(primaryColor: string, secondaryColor: string) {
  return StyleSheet.create({
    page: {
      fontFamily: "Inter",
      fontSize: 11,
      paddingTop: 60,
      paddingBottom: 60,
      paddingHorizontal: 50,
      color: "#1f2937",
    },
    coverPage: {
      fontFamily: "Inter",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
      paddingHorizontal: 50,
    },
    coverLogo: {
      width: 120,
      height: 60,
      objectFit: "contain" as const,
      marginBottom: 24,
    },
    coverCompanyName: {
      fontSize: 14,
      fontWeight: 700,
      color: secondaryColor,
      textAlign: "center",
      marginBottom: 32,
      letterSpacing: 1,
      textTransform: "uppercase" as const,
    },
    coverTitle: {
      fontSize: 32,
      fontWeight: 700,
      color: primaryColor,
      textAlign: "center",
      marginBottom: 20,
    },
    coverSubtitle: {
      fontSize: 14,
      color: "#6b7280",
      textAlign: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: primaryColor,
      marginBottom: 12,
      marginTop: 24,
      borderBottomWidth: 2,
      borderBottomColor: secondaryColor,
      paddingBottom: 6,
    },
    paragraph: {
      fontSize: 11,
      lineHeight: 1.6,
      marginBottom: 8,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 50,
      right: 50,
      fontSize: 9,
      color: "#9ca3af",
      textAlign: "center",
    },
    pricingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    pricingLabel: { fontSize: 11 },
    pricingValue: { fontSize: 11, fontWeight: 700 },
    validUntil: {
      fontSize: 10,
      color: "#6b7280",
      marginTop: 16,
    },
  });
}

export function ProposalPDF({ proposal }: { proposal: Proposal }) {
  const primaryColor = proposal.brand_settings?.primary_color || "#2563eb";
  const secondaryColor = proposal.brand_settings?.secondary_color || "#1e40af";
  const styles = createStyles(primaryColor, secondaryColor);
  const sections = proposal.sections || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {proposal.brand_settings?.logo_url && (
            <Image
              src={proposal.brand_settings.logo_url}
              style={styles.coverLogo}
            />
          )}
          {proposal.brand_settings?.company_name && (
            <Text style={styles.coverCompanyName}>
              {proposal.brand_settings.company_name}
            </Text>
          )}
          <Text style={styles.coverTitle}>{proposal.title}</Text>
          <Text style={styles.coverSubtitle}>
            Prepared for{" "}
            {(proposal.brief as { client_name?: string })?.client_name ||
              "Client"}
          </Text>
          {proposal.valid_until && (
            <Text style={styles.validUntil}>
              Valid until:{" "}
              {new Date(proposal.valid_until).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {sections.map((section, i) => (
          <View key={i} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.split("\n").map((line, j) => (
              <Text key={j} style={styles.paragraph}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        {proposal.pricing_data && (
          <View>
            {proposal.pricing_type === "fixed" &&
              proposal.pricing_data.amount && (
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Total Investment</Text>
                  <Text style={styles.pricingValue}>
                    ${proposal.pricing_data.amount.toLocaleString()}{" "}
                    {proposal.pricing_data.currency || "USD"}
                  </Text>
                </View>
              )}
            {proposal.pricing_type === "hourly" && (
              <>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Hourly Rate</Text>
                  <Text style={styles.pricingValue}>
                    ${proposal.pricing_data.hourly_rate}/hr
                  </Text>
                </View>
                {proposal.pricing_data.estimated_hours && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Estimated Hours</Text>
                    <Text style={styles.pricingValue}>
                      {proposal.pricing_data.estimated_hours}h
                    </Text>
                  </View>
                )}
              </>
            )}
            {proposal.pricing_type === "milestone" &&
              proposal.pricing_data.milestones?.map((m, i) => (
                <View key={i} style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>{m.name}</Text>
                  <Text style={styles.pricingValue}>
                    ${m.amount.toLocaleString()}
                  </Text>
                </View>
              ))}
          </View>
        )}

        <Text style={styles.footer}>
          {proposal.brand_settings?.company_name || "Generated with ProposalAI"}
        </Text>
      </Page>
    </Document>
  );
}
