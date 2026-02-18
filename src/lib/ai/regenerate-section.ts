import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { ProposalSection } from "@/types/database";
import { sanitizeAiInput } from "@/lib/security/ai-safety";

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

  // Sanitize all user-provided data
  const safeSectionTitle = sanitizeAiInput(sectionTitle);
  const safePromptHint = sanitizeAiInput(promptHint);
  const safeUserInstructions = userInstructions ? sanitizeAiInput(userInstructions) : "";

  const context = otherSections
    .map((s) => `## ${sanitizeAiInput(s.title)}\n${sanitizeAiInput(s.content)}`)
    .join("\n\n");

  const prompt = `Regenerate the "${safeSectionTitle}" section of a business proposal.

<proposal_context>
${context}
</proposal_context>

Section purpose: ${safePromptHint}
${safeUserInstructions ? `\n<user_instructions>\n${safeUserInstructions}\n</user_instructions>` : ""}

Write 150-400 words in professional markdown. Be specific, not generic.`;

  const { object } = await generateObject({
    model: anthropic(modelId),
    schema: sectionSchema,
    system:
      "You are a professional proposal writer. Regenerate one section of an existing proposal, keeping it consistent with the other sections.",
    prompt,
    maxOutputTokens: 2000,
  });

  return object.content;
}
