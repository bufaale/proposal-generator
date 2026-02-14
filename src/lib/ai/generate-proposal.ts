import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { ProposalBrief, TemplateSection } from "@/types/database";

const proposalSectionSchema = z.object({
  type: z.string(),
  title: z.string(),
  content: z
    .string()
    .describe(
      "Detailed, professional content for this section. Use markdown formatting.",
    ),
  order: z.number(),
});

const generatedProposalSchema = z.object({
  title: z.string().describe("Professional proposal title"),
  sections: z.array(proposalSectionSchema),
  pricing_type: z.enum(["fixed", "hourly", "milestone"]),
  pricing_data: z.object({
    amount: z.number().optional(),
    currency: z.string().default("USD"),
    hourly_rate: z.number().optional(),
    estimated_hours: z.number().optional(),
    milestones: z
      .array(
        z.object({
          name: z.string(),
          amount: z.number(),
          due: z.string(),
        }),
      )
      .optional(),
  }),
});

export type GeneratedProposal = z.infer<typeof generatedProposalSchema>;

export async function generateProposal(
  brief: ProposalBrief,
  templateSections: TemplateSection[],
  aiModel: "haiku" | "sonnet",
): Promise<GeneratedProposal> {
  // Force Haiku for all plans — Sonnet + generateObject exceeds Vercel Hobby 60s timeout
  // TODO: Switch to streamObject + Vercel Pro for Sonnet support
  const modelId = "claude-haiku-4-5-20251001";
  void aiModel;

  const systemPrompt = `You are a professional proposal writer for freelancers and agencies.
Generate a complete, polished business proposal based on the project brief.
Write in a professional but approachable tone. Use markdown formatting in section content.
Be specific and detailed — avoid generic filler text.
Each section should be 150-400 words depending on complexity.`;

  const userPrompt = `Generate a complete proposal for the following project:

**Project Description:** ${brief.project_description}
${brief.client_name ? `**Client:** ${brief.client_name}` : ""}
${brief.client_company ? `**Company:** ${brief.client_company}` : ""}
${brief.industry ? `**Industry:** ${brief.industry}` : ""}
${brief.budget_range ? `**Budget Range:** ${brief.budget_range}` : ""}
${brief.timeline ? `**Timeline:** ${brief.timeline}` : ""}
${brief.special_requirements ? `**Special Requirements:** ${brief.special_requirements}` : ""}

The proposal must include these sections (in order):
${templateSections.map((s, i) => `${i + 1}. **${s.title}** (type: ${s.type}) — ${s.prompt_hint}`).join("\n")}

Generate pricing that matches the scope described. If budget range is provided, stay within it.`;

  const { object } = await generateObject({
    model: anthropic(modelId),
    schema: generatedProposalSchema,
    system: systemPrompt,
    prompt: userPrompt,
  });

  return object;
}
