import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { ProposalSection } from "@/types/database";

const sectionSchema = z.object({
  content: z.string().describe("Regenerated section content in markdown"),
});

export async function regenerateSection(
  sectionTitle: string,
  _sectionType: string,
  promptHint: string,
  otherSections: ProposalSection[],
  userInstructions: string | undefined,
  aiModel: "haiku" | "sonnet",
): Promise<string> {
  const modelId =
    aiModel === "sonnet"
      ? "claude-sonnet-4-5-20250929"
      : "claude-haiku-4-5-20251001";

  const context = otherSections
    .map((s) => `## ${s.title}\n${s.content}`)
    .join("\n\n");

  const prompt = `Regenerate the "${sectionTitle}" section of a business proposal.

Context from other sections:
${context}

Section purpose: ${promptHint}
${userInstructions ? `\nUser instructions: ${userInstructions}` : ""}

Write 150-400 words in professional markdown. Be specific, not generic.`;

  const { object } = await generateObject({
    model: anthropic(modelId),
    schema: sectionSchema,
    system:
      "You are a professional proposal writer. Regenerate one section of an existing proposal, keeping it consistent with the other sections.",
    prompt,
  });

  return object.content;
}
