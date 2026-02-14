insert into public.templates (user_id, name, description, industry, sections_schema, is_public) values
(
  null,
  'Web Development Project',
  'Complete proposal for web development projects with phases, tech stack, and milestone pricing.',
  'technology',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize the project goals, approach, and expected outcomes"},
    {"type": "scope", "title": "Project Scope", "prompt_hint": "Define what is included and excluded from the project"},
    {"type": "tech_stack", "title": "Technology Stack", "prompt_hint": "List and justify the technologies, frameworks, and tools"},
    {"type": "deliverables", "title": "Deliverables", "prompt_hint": "List all tangible deliverables with descriptions"},
    {"type": "timeline", "title": "Project Timeline", "prompt_hint": "Break down the project into phases with durations"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Present pricing with milestone-based payment schedule"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Standard terms: revisions, IP, payment terms, warranties"}
  ]'::jsonb,
  true
),
(
  null,
  'Graphic Design Package',
  'Creative proposal for graphic design work including brief, revisions, and deliverable formats.',
  'design',
  '[
    {"type": "executive_summary", "title": "Creative Brief", "prompt_hint": "Summarize the design challenge, brand context, and creative direction"},
    {"type": "scope", "title": "Design Scope", "prompt_hint": "Define deliverables, dimensions, formats, and usage rights"},
    {"type": "process", "title": "Creative Process", "prompt_hint": "Outline the design process: research, concepts, revisions, delivery"},
    {"type": "deliverables", "title": "Deliverables & Formats", "prompt_hint": "List all files, formats (AI, PSD, PNG, SVG), and dimensions"},
    {"type": "timeline", "title": "Timeline", "prompt_hint": "Timeline with revision rounds and approval checkpoints"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Fixed pricing with breakdown per deliverable"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Revision policy, IP transfer, usage rights, payment terms"}
  ]'::jsonb,
  true
),
(
  null,
  'Digital Marketing Campaign',
  'Strategic proposal for digital marketing with channels, KPIs, and monthly retainer structure.',
  'marketing',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize marketing goals, target audience, and proposed strategy"},
    {"type": "audit", "title": "Current State Analysis", "prompt_hint": "Brief analysis of current marketing efforts and opportunities"},
    {"type": "strategy", "title": "Marketing Strategy", "prompt_hint": "Define channels, tactics, content strategy, and ad spend allocation"},
    {"type": "kpis", "title": "KPIs & Success Metrics", "prompt_hint": "Measurable goals: traffic, conversions, ROI, engagement rates"},
    {"type": "timeline", "title": "Campaign Timeline", "prompt_hint": "Monthly breakdown of activities and milestones"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Monthly retainer with breakdown: management fee, ad spend, tools"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Contract length, reporting frequency, cancellation policy"}
  ]'::jsonb,
  true
),
(
  null,
  'Business Consulting Engagement',
  'Professional consulting proposal with problem statement, methodology, and recommendations.',
  'consulting',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize the business challenge and proposed consulting approach"},
    {"type": "problem", "title": "Problem Statement", "prompt_hint": "Define the core business problem, impact, and urgency"},
    {"type": "methodology", "title": "Methodology & Approach", "prompt_hint": "Describe the consulting framework, research methods, and analysis approach"},
    {"type": "deliverables", "title": "Deliverables", "prompt_hint": "List reports, presentations, recommendations, and implementation guides"},
    {"type": "timeline", "title": "Engagement Timeline", "prompt_hint": "Phases: discovery, analysis, recommendations, implementation support"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Fee structure: fixed project fee or hourly with estimated hours"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Confidentiality, IP, engagement scope, travel expenses, payment terms"}
  ]'::jsonb,
  true
),
(
  null,
  'Content & Copywriting',
  'Content strategy proposal with deliverables, revision rounds, and content calendar.',
  'content',
  '[
    {"type": "executive_summary", "title": "Executive Summary", "prompt_hint": "Summarize content goals, target audience, and brand voice direction"},
    {"type": "strategy", "title": "Content Strategy", "prompt_hint": "Define content pillars, formats, distribution channels, and SEO approach"},
    {"type": "deliverables", "title": "Content Deliverables", "prompt_hint": "List all content pieces: blog posts, emails, social, landing pages"},
    {"type": "process", "title": "Writing Process", "prompt_hint": "Outline: brief, outline, draft, revisions, final delivery"},
    {"type": "timeline", "title": "Content Calendar", "prompt_hint": "Publishing schedule with deadlines and review checkpoints"},
    {"type": "pricing", "title": "Investment", "prompt_hint": "Per-piece or retainer pricing with revision rounds included"},
    {"type": "terms", "title": "Terms & Conditions", "prompt_hint": "Revision rounds, content ownership, usage rights, kill fee"}
  ]'::jsonb,
  true
);
