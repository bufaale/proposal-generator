import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function notifyProposalEvent(
  ownerEmail: string,
  proposalTitle: string,
  eventType: "viewed" | "accepted" | "declined" | "commented",
  metadata?: { author_name?: string; comment?: string },
) {
  const subjects: Record<string, string> = {
    viewed: `Your proposal "${proposalTitle}" was viewed`,
    accepted: `Your proposal "${proposalTitle}" was accepted!`,
    declined: `Your proposal "${proposalTitle}" was declined`,
    commented: `New comment on "${proposalTitle}"`,
  };

  try {
    await getResend().emails.send({
      from: process.env.EMAIL_FROM || "ProposalAI <noreply@proposalai.com>",
      to: ownerEmail,
      subject: subjects[eventType],
      text: `Your proposal "${proposalTitle}" received a new event: ${eventType}.${
        metadata?.comment
          ? `\n\nComment from ${metadata.author_name}:\n${metadata.comment}`
          : ""
      }\n\nView your proposal dashboard at ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/proposals`,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}
