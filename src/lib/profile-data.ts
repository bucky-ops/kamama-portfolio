/**
 * Kamama Portfolio — Single source of truth for all profile content.
 * Built from: Collins Kamama Master Resume (2026) + Kamama Portfolio Complete Wireframe.
 * Founder email muchiri.collin@aol.com is REQUIRED in the contact section per client brief.
 */

export const profile = {
  name: "Muchiri Collins Kamama",
  shortName: "Collins Kamama",
  logo: "KAMAMA",
  role: "Solution Architect · Full Stack Developer · Data Scientist",
  headline: "I build production-grade systems that operate, not just demo",
  subhead:
    "Bridging technical innovation and development impact — 5+ years architecting data-intensive platforms for the UN system, NGOs, government, and enterprise across East Africa.",
  location: "Nairobi, Kenya (UTC+3)",
  phone: "+254 700 845 084",
  emails: {
    founder: "muchiri.collin@aol.com", // REQUIRED by client brief
    personal: "kamamamuchiri@yahoo.com",
    secure: "911recaro@protonmail.com",
  },
  socials: {
    github: "https://github.com/bucky-ops",
    githubHandle: "bucky-ops",
    twitter: "https://twitter.com/blurred_cmk",
    twitterHandle: "@blurred_cmk",
    linkedin: "https://www.linkedin.com/in/collins-kamama",
    linkedinHandle: "in/collins-kamama",
  },
  stats: [
    { value: "5+", label: "Years Experience" },
    { value: "10+", label: "Cloud Apps Shipped" },
    { value: "99.9%", label: "Uptime Maintained" },
    { value: "500K+", label: "Daily Transactions" },
  ],
  workAuth:
    "Kenyan national — eligible for remote/home-based ICA contracts globally; hybrid-ready; international travel 1–4×/year.",
} as const;

export const nav = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export const philosophy = [
  {
    step: "01",
    title: "Trust & Ingestion",
    text: "Verified, compliant data pipelines — GDPR-aligned, donor-reportable from day one.",
  },
  {
    step: "02",
    title: "Intelligence Layer",
    text: "NLP, RAG and predictive models (LangChain, Llama 3.1, scikit-learn) tuned for accuracy.",
  },
  {
    step: "03",
    title: "Decision & Action",
    text: "Dashboards and APIs that turn data into auditable, evidence-based decisions.",
  },
  {
    step: "04",
    title: "Deployment & Ops",
    text: "HA PostgreSQL, AWS, Docker, CI/CD — systems that keep running after the demo.",
  },
];

export const trustLogos = [
  "United Nations",
  "UNDP Kenya",
  "Nakuru County Government",
  "TechSavanna Kenya",
];

export const skillCards = [
  {
    icon: "code",
    title: "Full-Stack Development",
    metric: "10+ cloud-native apps shipped",
    metricNote: "AWS · Vercel · Heroku",
    tags: ["Node.js", "TypeScript", "React", "Next.js", "Express", "Flask", "REST/GraphQL"],
  },
  {
    icon: "brain",
    title: "Data Science & AI",
    metric: "85% predictive accuracy",
    metricNote: "NLP · RAG · LangChain · Llama 3.1",
    tags: ["Python", "Pandas", "NumPy", "scikit-learn", "Power BI", "Tableau"],
  },
  {
    icon: "database",
    title: "Database Engineering",
    metric: "99.9% uptime @ 500K+ daily tx",
    metricNote: "Tier 3 PostgreSQL HA",
    tags: ["PostgreSQL HA", "Replication", "Query Tuning", "MySQL", "MongoDB", "ETL"],
  },
  {
    icon: "cloud",
    title: "Cloud & DevOps",
    metric: "35% infra cost reduction",
    metricNote: "Optimization + IaC",
    tags: ["AWS EC2/S3/Lambda/RDS", "Docker", "CI/CD", "GitHub Actions", "IaC", "Linux"],
  },
];

export type ProjectCluster =
  | "Enterprise Blockchain"
  | "AI & Analytics"
  | "Climate & Civic"
  | "Infrastructure";

export const projectFilters: ("All" | ProjectCluster)[] = [
  "All",
  "Enterprise Blockchain",
  "AI & Analytics",
  "Climate & Civic",
  "Infrastructure",
];

export interface Project {
  repo: string; // GitHub repo slug under bucky-ops ("" = client deployment)
  title: string;
  cluster: ProjectCluster;
  problem: string;
  architecture: string;
  stack: string[];
  metric: string;
  caseStudy: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    repo: "blockchain-inventory-system",
    title: "Blockchain Inventory System",
    cluster: "Enterprise Blockchain",
    problem:
      "Enterprises lose audit integrity when inventory ledgers can be silently edited.",
    architecture: "Immutable on-chain ledger + AI demand forecasting",
    stack: ["TypeScript", "Ethereum", "Hardhat", "React", "PostgreSQL"],
    metric: "40% faster stock reconciliation · tamper-proof trails",
    caseStudy:
      "Enterprise-grade inventory system leveraging blockchain for immutable auditing and AI forecasting.",
    featured: true,
  },
  {
    repo: "sdg-rag-system",
    title: "SDG Knowledge Retrieval System (RAG)",
    cluster: "AI & Analytics",
    problem:
      "UN-Habitat SDG 11 documentation is vast; teams lose hours searching for citations.",
    architecture: "Llama 3.1 + LangChain RAG over vector embeddings, serverless inference on AWS Lambda",
    stack: ["Python", "LangChain", "Llama 3.1", "AWS Lambda", "GDPR-aligned encryption"],
    metric: "40% faster retrieval of policy evidence",
    caseStudy:
      "Academic capstone turned production RAG: vector search over UN-Habitat SDG 11 corpus with RESTful querying APIs.",
    featured: true,
  },
  {
    repo: "Global-Climate-Food-Security-Intelligence-Platform-GCF-SIP-",
    title: "Global Climate & Food Security Intelligence Platform",
    cluster: "Climate & Civic",
    problem:
      "Food-insecurity early warning is fragmented across siloed datasets and reports.",
    architecture: "End-to-end data science platform: ingestion → models → dashboards",
    stack: ["Python", "scikit-learn", "Geospatial", "PostgreSQL", "Dashboards"],
    metric: "Predicts food insecurity hotspots before crisis peaks",
    caseStudy:
      "Production-grade, end-to-end AI platform predicting food insecurity for climate adaptation planning.",
    featured: true,
  },
  {
    repo: "Kenya-Childhood-Malnutrition-Risk-Prediction-System",
    title: "Kenya Childhood Malnutrition Risk Prediction",
    cluster: "Climate & Civic",
    problem:
      "Acute malnutrition interventions arrive late without risk stratification.",
    architecture: "Open-source digital tool: survey data → ML risk model → county dashboards",
    stack: ["TypeScript", "Python", "ML", "DHIS2-style data", "Open Data"],
    metric: "Risk flags for early nutrition intervention",
    caseStudy:
      "Digital public good predicting acute childhood malnutrition risk across Kenyan counties.",
    featured: false,
  },
  {
    repo: "Auto-JIPS",
    title: "Auto-JIPS — Job Intelligence & Profiling",
    cluster: "AI & Analytics",
    problem:
      "Manual CV/job profiling is slow, biased and unstructured at scale.",
    architecture: "NLP parsing pipeline + hybrid profiling engine",
    stack: ["Python", "NLP", "scikit-learn", "Automation"],
    metric: "Automated parsing & skills inference end-to-end",
    caseStudy:
      "Algorithm-driven job intelligence: automated extraction, profiling and matching with NLP.",
    featured: false,
  },
  {
    repo: "nairobiflow-traffic-management",
    title: "NairobiFlow Traffic Management",
    cluster: "Infrastructure",
    problem:
      "Nairobi congestion lacks a unified, real-time signal of network state.",
    architecture: "Intelligent traffic management with live data simulation & control APIs",
    stack: ["JavaScript", "Real-time", "APIs", "Dashboards"],
    metric: "Production-ready intelligent traffic control",
    caseStudy:
      "Comprehensive intelligent traffic management platform for Nairobi's road network.",
    featured: false,
  },
  {
    repo: "isp-field-ops-automation",
    title: "ISP Field Ops Automation",
    cluster: "Infrastructure",
    problem:
      "ISP field crews juggle dispatch, inventory and SLA proof across paper and chat.",
    architecture: "Enterprise field-operations platform with real-time dispatch",
    stack: ["Automation", "Real-time", "Ops Tooling", "Scheduling"],
    metric: "Enterprise-grade field ops orchestration",
    caseStudy:
      "Field operations and automation platform for ISPs: dispatch, SLAs, and real-time crew tracking.",
    featured: false,
  },
  {
    repo: "", // client deployment — resume project
    title: "Blockchain Audit Management System",
    cluster: "Enterprise Blockchain",
    problem:
      "Procurement audits fail when evidence trails can be retro-edited.",
    architecture: "Flask/Ethereum backend + React frontend, tamper-proof audit trails",
    stack: ["Flask", "Ethereum", "React", "Web3"],
    metric: "+35% procurement transparency",
    caseStudy:
      "Full-stack blockchain audit system for financial & procurement workflows, aligned with international donor compliance.",
    featured: false,
  },
];

export const timeline = [
  {
    period: "Sep 2026 — Present",
    org: "UN Volunteers (UNV) / UNDP Kenya",
    role: "Online Volunteer, M&E — GEF SGP",
    points: [
      "Review grantee narrative & financial reports for completeness, quality and consistency",
      "Consolidate programme data for donor, annual and terminal-evaluation reporting",
      "Strengthen programme databases, records management and audit readiness",
    ],
    tag: "UN System",
  },
  {
    period: "Jan 2026 — Present",
    org: "Binti Rising Initiative CBO / SSK Programme",
    role: "M&E Officer",
    points: [
      "Manage ODK/KoboToolbox digital data collection across four thematic pillars",
      "Automated Power BI dashboards for real-time milestone tracking (PEPFAR-supported)",
      "Train field teams on digital reporting — data accuracy up 30%",
    ],
    tag: "NGO / Donor",
  },
  {
    period: "Jan 2020 — Present",
    org: "Kamama Consulting Solutions",
    role: "Principal Technology Consultant & Founder",
    points: [
      "Architected 10+ cloud-native apps on AWS (Node.js/Express, REST/GraphQL) — infra costs down 35%",
      "Tier 3 PostgreSQL HA: streaming replication, SSL/TLS, DR — 99.9% uptime @ 500K+ daily tx",
      "Blockchain audit system (Flask/Ethereum + React); predictive models at 85% accuracy",
      "Power BI/Tableau executive & donor compliance dashboards across sectors",
    ],
    tag: "Founder",
  },
  {
    period: "Jan 2025 — Jul 2025",
    org: "United Nations Office at Nairobi (UNON)",
    role: "Information Management Assistant (Intern)",
    points: [
      "Optimized PostgreSQL archival DB (1,200+ records) — accessibility +30%",
      "Python automation of 550+ record ingestion — manual processing time −15%",
      "GDPR-compliant migration of 2,000+ sensitive records — zero violations",
    ],
    tag: "UN System",
  },
  {
    period: "May 2022 — Jul 2022",
    org: "Nakuru County Government",
    role: "ICT & E-Government Intern",
    points: [
      "Migrated 520+ public-sector records to PostgreSQL — turnaround −30%, zero data loss",
      "Resolved 150+ issues across 5 departments — 95% first-contact resolution",
      "Endpoint security across 50+ workstations — security incidents −40%",
    ],
    tag: "Government",
  },
  {
    period: "Jun 2019 — Mar 2022",
    org: "Metro Supermarket Group",
    role: "Operations Manager & IT Systems Coordinator",
    points: [
      "Led manual-ledger → digital POS transition: KES 100K+ monthly tx at 99.9% accuracy",
      "Demand forecasting cut stock-outs 25%; 15+ suppliers at 95% on-time delivery",
      "Supervised 25+ staff with zero tax-compliance penalties",
    ],
    tag: "Private Sector",
  },
];

export const education = [
  {
    school: "Jomo Kenyatta University of Agriculture and Technology (JKUAT)",
    degree: "BBIT — Bachelor of Business Information Technology",
    detail: "Second Class Upper Division (Honours) · 2019–2023",
    note: "Capstone: predictive analytics model (85% accuracy) — Python scikit-learn + PostgreSQL",
  },
  {
    school: "Jomo Kenyatta University of Agriculture and Technology (JKUAT)",
    degree: "Diploma in Information Technology",
    detail: "2017–2019",
    note: "Database systems, software engineering, web development, statistics",
  },
];

export const certifications = [
  { name: "UN Ethics, Information Security, Fraud & Corruption Prevention", year: "2025", status: "Complete" },
  { name: "Cisco Cybersecurity Essentials", year: "2025", status: "Complete" },
  { name: "Blockchain Fundamentals Certification", year: "2025", status: "Complete" },
  { name: "Project Management Essentials", year: "2023", status: "Complete" },
  { name: "Google Data Analytics Professional Certificate", year: "In progress", status: "Progress" },
  { name: "AWS Certified Solutions Architect — Associate", year: "In progress", status: "Progress" },
];

export const interests = [
  "Evidence-Based Development",
  "SDG Implementation",
  "Data for Social Good",
  "Tech for Humanitarian Action",
  "Open Source Contributions",
];

export const testimonials = [
  {
    quote:
      "Placeholder — replace with a recommendation from Alice Ndungu on records digitization and data governance at UNON.",
    name: "Mr.s Alice Ndungu",
    title: "Supervisor, UNON FMTS Unit",
    proof: "gaithuru-ndungu@un.org",
  },
  {
    quote:
      "Placeholder — replace with a recommendation from James Ndegwa on county systems migration and IT support.",
    name: "Mr. James Ndegwa",
    title: "Dept. Administrator, Nakuru County ICT",
    proof: "info@nakuru.go.ke · 051-2214142",
  },
  {
    quote:
      "Placeholder — replace with a recommendation from Victor Rotich on campus IT reliability and mentorship.",
    name: "Mr. Victor Rotich",
    title: "Head of Department IT, PUEA Nakuru Campus",
    proof: "Tel: 0713-242-910",
  },
];

export const projectTypes = [
  "Enterprise System",
  "Blockchain",
  "AI / RAG",
  "M&E Dashboard",
  "Consulting",
] as const;

export const budgetRanges = [
  "Under $1,000",
  "$1,000 – $5,000",
  "$5,000 – $15,000",
  "$15,000+",
  "Retainer / Negotiable",
] as const;

export const availability = [
  "Open to collaboration — Enterprise & civic tech",
  "Blockchain + AI systems",
  "Governance platforms",
];
