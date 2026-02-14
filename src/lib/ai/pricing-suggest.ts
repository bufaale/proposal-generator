import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const pricingSuggestionSchema = z.object({
  fixed_price: z.number().describe("Suggested fixed project price in USD"),
  hourly_rate: z.number().describe("Suggested hourly rate in USD"),
  estimated_hours: z.number().describe("Estimated total hours"),
  price_range: z.object({
    low: z.number(),
    high: z.number(),
  }),
  confidence: z
    .enum(["low", "medium", "high"])
    .describe("Confidence in the estimate based on available info"),
  reasoning: z.string().describe("Brief explanation of pricing rationale"),
});

export type PricingSuggestion = z.infer<typeof pricingSuggestionSchema>;

export async function suggestPricing(
  projectDescription: string,
  industry: string | undefined,
  scope: string | undefined,
): Promise<PricingSuggestion> {
  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: pricingSuggestionSchema,
    system:
      "You are a freelance pricing expert. Suggest fair market pricing for freelance projects based on scope and industry. Use 2025 US market rates.",
    prompt: `Suggest pricing for this freelance project:

**Description:** ${projectDescription}
${industry ? `**Industry:** ${industry}` : ""}
${scope ? `**Scope Details:** ${scope}` : ""}

Provide fixed price, hourly rate, estimated hours, price range, and confidence level.`,
  });

  return object;
}
