"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, Save, Send } from "lucide-react";
import type {
  Client,
  Template,
  ProposalSection,
  PricingData,
} from "@/types/database";

type WizardStep = "brief" | "loading" | "edit";

interface GeneratedProposal {
  id: string;
  title: string;
  sections: ProposalSection[];
  pricing_type: "fixed" | "hourly" | "milestone" | null;
  pricing_data: PricingData;
}

const industries = [
  "technology",
  "design",
  "marketing",
  "consulting",
  "content",
] as const;

export default function NewProposalPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("brief");

  // Brief form state
  const [projectDescription, setProjectDescription] = useState("");
  const [clientId, setClientId] = useState<string>("none");
  const [templateId, setTemplateId] = useState<string>("none");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");

  // Data fetched from API
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Generated proposal state
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSections, setEditSections] = useState<ProposalSection[]>([]);
  const [pricingType, setPricingType] = useState<
    "fixed" | "hourly" | "milestone"
  >("fixed");
  const [pricingData, setPricingData] = useState<PricingData>({});

  // UI state
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);

  // Fetch clients and templates on mount
  useEffect(() => {
    async function fetchData() {
      const [clientsRes, templatesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/templates"),
      ]);
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients);
      }
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates);
      }
    }
    fetchData();
  }, []);

  // Group templates by industry
  const templatesByIndustry = templates.reduce(
    (acc, t) => {
      const industry = t.industry || "other";
      if (!acc[industry]) acc[industry] = [];
      acc[industry].push(t);
      return acc;
    },
    {} as Record<string, Template[]>,
  );

  async function handleGenerate() {
    if (projectDescription.length < 20) {
      setError("Project description must be at least 20 characters.");
      return;
    }

    setError("");
    setStep("loading");

    // Find selected client for brief enrichment
    const selectedClient = clients.find((c) => c.id === clientId);

    const body: Record<string, unknown> = {
      project_description: projectDescription,
      budget_range: budgetRange || undefined,
      timeline: timeline || undefined,
      special_requirements: specialRequirements || undefined,
    };

    if (clientId !== "none") {
      body.client_id = clientId;
      body.client_name = selectedClient?.name;
      body.client_company = selectedClient?.company;
    }

    if (templateId !== "none") {
      body.template_id = templateId;
      const selectedTemplate = templates.find((t) => t.id === templateId);
      body.industry = selectedTemplate?.industry;
    }

    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to generate proposal.",
        );
        setStep("brief");
        return;
      }

      const data = await res.json();
      const p = data.proposal as GeneratedProposal;
      setProposal(p);
      setEditTitle(p.title);
      setEditSections([...p.sections]);
      setPricingType(p.pricing_type || "fixed");
      setPricingData(p.pricing_data || {});
      setStep("edit");
    } catch {
      setError("Network error. Please try again.");
      setStep("brief");
    }
  }

  async function handleRegenerateSection(index: number) {
    if (!proposal) return;
    setRegeneratingIdx(index);

    try {
      const res = await fetch("/api/proposals/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposal_id: proposal.id,
          section_index: index,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEditSections((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], content: data.content };
          return updated;
        });
      }
    } catch {
      // Silently fail for section regeneration
    } finally {
      setRegeneratingIdx(null);
    }
  }

  async function handleSave(shareAfterSave: boolean) {
    if (!proposal) return;
    setSaving(true);
    setError("");

    try {
      // Update the proposal via a PATCH-style call using the generate route's pattern
      // We'll save directly by calling a simple update
      const res = await fetch(`/api/proposals/${proposal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          sections: editSections,
          pricing_type: pricingType,
          pricing_data: pricingData,
          status: shareAfterSave ? "sent" : "draft",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(
          typeof data.error === "string" ? data.error : "Failed to save.",
        );
        setSaving(false);
        return;
      }

      if (shareAfterSave) {
        // Generate share link
        await fetch(`/api/proposals/${proposal.id}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      }

      router.push(`/dashboard/proposals/${proposal.id}`);
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  function updateSectionContent(index: number, content: string) {
    setEditSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], content };
      return updated;
    });
  }

  // --- STEP 1: Brief Form ---
  if (step === "brief") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Proposal</h1>
          <p className="mt-1 text-muted-foreground">
            Fill in the project details and let AI generate a professional
            proposal.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Project Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                Project Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the project in detail (minimum 20 characters)..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                {projectDescription.length}/20 characters minimum
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                      {client.company ? ` (${client.company})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default template</SelectItem>
                  {Object.entries(templatesByIndustry).map(
                    ([industry, temps]) => (
                      <SelectGroup key={industry}>
                        <SelectLabel className="capitalize">
                          {industry}
                        </SelectLabel>
                        {temps.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Input
                  id="budget"
                  placeholder="e.g. $5,000 - $10,000"
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  placeholder="e.g. 4-6 weeks"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Special Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific requirements, technologies, constraints..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={projectDescription.length < 20}
              className="w-full"
            >
              Generate Proposal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- STEP 2: Loading ---
  if (step === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Generating your proposal...</h2>
          <p className="mt-1 text-muted-foreground">
            AI is crafting a professional proposal based on your brief. This may
            take up to 30 seconds.
          </p>
        </div>
      </div>
    );
  }

  // --- STEP 3: Edit ---
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Proposal</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save as Draft
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Save &amp; Share
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Title */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {editSections.map((section, index) => (
        <Card key={`section-${index}`}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{section.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRegenerateSection(index)}
              disabled={regeneratingIdx === index}
            >
              {regeneratingIdx === index ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Regenerate
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={section.content}
              onChange={(e) => updateSectionContent(index, e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      ))}

      {/* Pricing Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pricing Type</Label>
            <Select
              value={pricingType}
              onValueChange={(v) =>
                setPricingType(v as "fixed" | "hourly" | "milestone")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {pricingType === "fixed" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={pricingData.amount ?? ""}
                  onChange={(e) =>
                    setPricingData({
                      ...pricingData,
                      amount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  placeholder="USD"
                  value={pricingData.currency ?? "USD"}
                  onChange={(e) =>
                    setPricingData({
                      ...pricingData,
                      currency: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          {pricingType === "hourly" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={pricingData.hourly_rate ?? ""}
                  onChange={(e) =>
                    setPricingData({
                      ...pricingData,
                      hourly_rate: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={pricingData.estimated_hours ?? ""}
                  onChange={(e) =>
                    setPricingData({
                      ...pricingData,
                      estimated_hours: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </div>
            </div>
          )}

          {pricingType === "milestone" && (
            <div className="space-y-3">
              {(pricingData.milestones ?? []).map((milestone, mIdx) => (
                <div
                  key={`milestone-${mIdx}`}
                  className="grid gap-2 sm:grid-cols-3"
                >
                  <Input
                    placeholder="Milestone name"
                    value={milestone.name}
                    onChange={(e) => {
                      const updated = [...(pricingData.milestones ?? [])];
                      updated[mIdx] = { ...updated[mIdx], name: e.target.value };
                      setPricingData({ ...pricingData, milestones: updated });
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={milestone.amount}
                    onChange={(e) => {
                      const updated = [...(pricingData.milestones ?? [])];
                      updated[mIdx] = {
                        ...updated[mIdx],
                        amount: Number(e.target.value),
                      };
                      setPricingData({ ...pricingData, milestones: updated });
                    }}
                  />
                  <Input
                    type="date"
                    value={milestone.due}
                    onChange={(e) => {
                      const updated = [...(pricingData.milestones ?? [])];
                      updated[mIdx] = { ...updated[mIdx], due: e.target.value };
                      setPricingData({ ...pricingData, milestones: updated });
                    }}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPricingData({
                    ...pricingData,
                    milestones: [
                      ...(pricingData.milestones ?? []),
                      { name: "", amount: 0, due: "" },
                    ],
                  })
                }
              >
                Add Milestone
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 pb-8">
        <Button
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save as Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Save &amp; Share
        </Button>
      </div>
    </div>
  );
}
