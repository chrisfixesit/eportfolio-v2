export const siteContent = {
  meta: {
    siteName: "Christopher Corbin",
    title: "Christopher Corbin — DevOps & Cloud Engineer",
    description:
      "DevOps & Cloud Engineer. I automate the path from commit to production — CI/CD, infrastructure as code, and zero-downtime deploys — built for reliability and real cost savings.",
    ogDescription:
      "CI/CD, infrastructure as code, and zero-downtime deploys for public-sector services. Zero failed requests · ~$150K/yr saved · SOC 2 97.2%.",
    domain: "christophercorbin.cloud",
    url: "https://christophercorbin.cloud",
    ogImage: "/images/og-image.png",
  },
  nav: {
    prompt: "~/christopher-corbin — zsh",
    links: [
      { label: "about", href: "#about" },
      { label: "experience", href: "#experience" },
      { label: "skills", href: "#skills" },
      { label: "projects", href: "#projects" },
      { label: "contact", href: "#contact" },
    ],
    resume: { label: "resume ↓", href: "/resume" },
  },
  hero: {
    commands: [
      "$ whoami --role --location",
      "$ terraform apply -auto-approve",
      "$ gh workflow run deploy.yml",
      "$ aws ce get-cost-and-usage",
    ],
    kicker: "// DevOps & Cloud Engineer — CI/CD · IaC · reliability",
    nameLines: ["Christopher", "Corbin"],
    summary:
      "I automate the path from commit to production — CI/CD pipelines, infrastructure as code, and zero-downtime deploys for public-sector services, built for reliability and real cost savings.",
    ctas: [
      { label: "→ view projects", href: "#projects", variant: "solid" },
      {
        label: "get in touch",
        href: "mailto:christophercorbin24@gmail.com",
        variant: "outline",
      },
      { label: "↓ resume", href: "/resume", variant: "ghost" },
    ],
    status: "● Barbados — open to relocation",
    photo: {
      titlebar: "corbin@re-invent — photo.jpg",
      src: "/images/profile.jpg",
      alt: "Christopher Corbin at AWS re:Invent",
    },
  },
  metrics: {
    saved: {
      label: "ANNUAL CLOUD SPEND SAVED",
      value: 150,
      prefix: "$",
      suffix: "K",
      caption:
        "Right-sized compute and automated cost guardrails across a 14-account AWS org — about 20% of total cloud spend.",
      chartLabel: "monthly cloud cost, FY25",
      chartTrend: "▼ trending down",
      points: "0,10 50,24 100,18 150,38 200,50 250,60 300,66",
    },
    cells: [
      {
        value: "0",
        sub: " failed",
        subColor: "green",
        caption:
          "requests on blue/green deploys — canary shifting + auto-rollback, keyless OIDC CI/CD",
      },
      {
        value: "Claude",
        sub: " on Bedrock",
        subColor: "accent",
        caption: "LLM workloads shipped via IaC + CI/CD — Anthropic-certified",
      },
    ],
  },
  dora: {
    label: "$ delivery --at-a-glance",
    labelComment: "# DORA",
    cells: [
      { label: "Deploy frequency", value: "On merge", caption: "every PR ships via CI/CD", green: false },
      { label: "Lead time", value: "< 1 hr", caption: "commit → production", green: false },
      { label: "Change-fail rate", value: "< 5%", caption: "canary + auto-rollback", green: true },
      { label: "MTTR", value: "Minutes", caption: "alarm-triggered rollback", green: false },
    ],
  },
  about: {
    label: "01 / about",
    cmd: "cat about.md",
    paragraphs: [
      "I'm a Cloud Infrastructure Developer at <strong>GovTech Barbados</strong>, where I design, provision, and secure the infrastructure behind public-sector digital services. Everything is defined as code with Terraform and CloudFormation and shipped through automated CI/CD.",
      "Before that, I strengthened security across a 14-account AWS org with 2,000+ resources: SOC 2 at a 97.2% audit score with zero critical findings, 500+ CVEs remediated within 30 days, and ~$150K/yr in cloud savings.",
      "I also deploy and operate LLM workloads on AWS — provisioning, securing, and shipping Claude on Amazon Bedrock through the same IaC and CI/CD pipelines as everything else. Anthropic-certified across the Claude API, agentic coding, and MCP.",
    ],
  },
  experience: {
    label: "02 / experience",
    cmd: "— git log --oneline",
    entries: [
      {
        role: "Cloud Infrastructure Developer",
        dates: "Jan 2026 – Present",
        company: "GovTech Barbados",
        summary:
          "IaC (Terraform, CloudFormation) for public-sector services · GitHub Actions CI/CD · IAM, secrets & network controls · CloudWatch / X-Ray observability · technical lead for a multidisciplinary delivery team.",
        dot: "accent",
      },
      {
        role: "AWS SysOps / Cloud & Security Engineer",
        dates: "Feb 2025 – Dec 2025",
        company: "Protexxa — Remote",
        summary:
          "Lead engineer on Amazon Connect across 3 regions (+35% response time for 1,000+ users) · SOC 2 at 97.2% · EC2/RDS optimization saving ~$150K/yr · 500+ CVEs in <30 days · 14 accounts, 2,000+ resources.",
        dot: "green",
      },
      {
        role: "Technical Guide & Operations · Apple Rep",
        dates: "2021 – 2024",
        company: "TORE Barbados · iShop",
        summary:
          "Operations leadership and equipment reliability (-20% downtime) · Apple technical support, customer education, and escalation handling.",
        dot: "gray",
      },
    ],
  },
  skills: {
    label: "03 / skills",
    cmd: "— ls ~/stack",
    cards: [
      {
        title: "ci/cd & automation/",
        tags: ["GitHub Actions", "CodePipeline", "Docker hardening", "Blue/Green"],
        more: "+5 more",
      },
      {
        title: "cloud & iac/",
        tags: ["Terraform", "CloudFormation", "CDK", "OpenTofu", "ECS · Lambda"],
        more: "+8 more",
      },
      {
        title: "security & compliance/",
        tags: ["SOC 2", "NIST CSF", "CIS Benchmarks", "Zero Trust", "Vuln Mgmt"],
        more: "+5 more",
      },
      {
        title: "cloud + ai/",
        tags: ["Claude API", "Claude on Bedrock", "MCP", "Python · Bash"],
        more: "+4 more",
      },
    ],
  },
  projects: {
    label: "04 / featured projects",
    cards: [
      {
        titlebar: "math-mentor · live demo",
        dot: "green",
        title: "MathMentor Barbados — Socratic AI Tutor",
        description:
          "Bajan Socratic math tutor on Claude via Bedrock. Serverless Lambda enforces one-hint-at-a-time pedagogy; KaTeX frontend; OpenTofu behind CloudFront.",
        highlight: "▸ syllabus-aware, Common Entrance → CSEC/CXC",
        links: [
          { label: "view code →", href: "https://github.com/christophercorbin/math-mentor", primary: false },
          { label: "live demo →", href: "https://d297i0l0pfbu7x.cloudfront.net", primary: true },
        ],
      },
      {
        titlebar: "hurricane-ready · live demo",
        dot: "green",
        title: "Hurricane-Ready — Bajan Storm Alerts",
        description:
          "Watches the NOAA/NHC feed, computes threat deterministically (software decides, not AI), and has Claude explain it calmly. Hardened container on ECS Fargate.",
        highlight: "▸ SMS/email/webhook alerts · Beryl 2024 replay",
        links: [
          { label: "view code →", href: "https://github.com/christophercorbin/hurricane-ready", primary: false },
          { label: "live demo →", href: "https://d1a03jmlh4dne2.cloudfront.net", primary: true },
        ],
      },
      {
        titlebar: "secure-landing-zone · open source",
        dot: "accent",
        title: "Secure Public-Sector Landing Zone",
        description:
          "Modular OpenTofu landing zone: org guardrails as code (SCPs, region allowlists, IMDSv2), CIS-aligned detective baseline, and AI-generated SOC 2 evidence.",
        highlight: "▸ CloudTrail · Config · Security Hub",
        links: [
          { label: "view code →", href: "https://github.com/christophercorbin/secure-landing-zone", primary: false },
          { label: "docs →", href: "https://github.com/christophercorbin/secure-landing-zone#readme", primary: true },
        ],
      },
      {
        titlebar: "zero-downtime-pipeline · open source",
        dot: "accent",
        title: "Zero-Downtime Delivery Pipeline",
        description:
          "Blue/green ECS Fargate through CodeDeploy with 10% canary traffic shifting, CloudWatch alarm-triggered auto rollback, and keyless OIDC CI/CD — all in OpenTofu.",
        highlight: "▸ live chaos-rollback demo · zero failed requests",
        links: [
          { label: "view code →", href: "https://github.com/christophercorbin/zero-downtime-pipeline", primary: false },
          { label: "docs →", href: "https://github.com/christophercorbin/zero-downtime-pipeline#readme", primary: true },
        ],
      },
    ],
  },
  certifications: {
    label: "05 / certifications",
    badges: [
      { name: "AWS Solutions Architect – Associate", meta: "'25", inProgress: false },
      { name: "CompTIA Security+ ce", meta: "'24", inProgress: false },
      { name: "Cybersecurity Analyst", meta: "'24", inProgress: false },
      { name: "BSc Computer Science — UWI", meta: null, inProgress: false },
      { name: "AWS DevOps Pro", meta: "— in progress", inProgress: true },
      { name: "Anthropic AI Engineering", meta: "8 courses", inProgress: false },
    ],
  },
  contact: {
    label: "06 / contact",
    cmd: "— ./connect.sh",
    heading: "Let's connect.",
    blurb:
      "Open to cloud architecture & security engineering roles. Open to relocation and willing to travel.",
    email: "christophercorbin24@gmail.com",
    phone: "+1 (246) 248-7457",
    phoneHref: "tel:+12462487457",
    location: "Barbados · open to relocation",
    github: "https://github.com/christophercorbin",
    githubDisplay: "github.com/christophercorbin",
    linkedin: "https://www.linkedin.com/in/christophercorbin",
    linkedinDisplay: "linkedin.com/in/christophercorbin",
  },
  footer: {
    copyright: "© 2026 Christopher Corbin — built with Astro · deployed on AWS Amplify",
    links: [
      { label: "github", href: "https://github.com/christophercorbin" },
      { label: "linkedin", href: "https://www.linkedin.com/in/christophercorbin" },
      { label: "email", href: "mailto:christophercorbin24@gmail.com" },
      { label: "resume", href: "/resume" },
    ],
  },
} as const;

export const resumeContent = {
  title: "Christopher Corbin — Résumé",
  name: "Christopher Corbin",
  tagline: "DevOps & Cloud Engineer · CI/CD · Infrastructure as Code · Reliability",
  contactLines: [
    "christophercorbin24@gmail.com",
    "+1 (246) 248-7457",
    "github.com/christophercorbin",
    "linkedin.com/in/christophercorbin",
  ],
  location: "Barbados · open to relocation",
  summary:
    "I automate the path from commit to production — CI/CD pipelines, infrastructure as code, and zero-downtime deploys for public-sector digital services. Everything shipped through automation, SOC 2 compliant, and engineered to save real money. I also deploy and operate LLM workloads on AWS — Claude on Amazon Bedrock, shipped through the same IaC and CI/CD pipelines as everything else.",
  dora: [
    { label: "Deploy freq", value: "On merge", green: false },
    { label: "Lead time", value: "< 1 hr", green: false },
    { label: "Change-fail", value: "< 5%", green: true },
    { label: "MTTR", value: "Minutes", green: false },
  ],
  experience: [
    {
      role: "Cloud Infrastructure Developer",
      dates: "Jan 2026 – Present",
      company: "GovTech Barbados",
      bullets: [
        "IaC with Terraform & CloudFormation for public-sector services; GitHub Actions CI/CD across environments.",
        "IAM, secrets & network controls; CloudWatch / X-Ray observability and alerting.",
        "Technical lead for a multidisciplinary delivery team.",
      ],
    },
    {
      role: "AWS SysOps / Cloud & Security Engineer",
      dates: "Feb 2025 – Dec 2025",
      company: "Protexxa — Remote",
      bullets: [
        "Lead engineer on Amazon Connect across 3 regions — +35% response time for 1,000+ users.",
        "Drove SOC 2 to a 97.2% audit score with zero critical findings across a 14-account org (2,000+ resources).",
        "EC2/RDS optimization saving ~$150K/yr; 500+ CVEs remediated in under 30 days.",
      ],
    },
    {
      role: "Technical Guide & Operations · Apple Rep",
      dates: "2021 – 2024",
      company: "TORE Barbados · iShop",
      bullets: [
        "Operations leadership and equipment reliability (-20% downtime); Apple technical support, customer education & escalation.",
      ],
    },
  ],
  projects: [
    {
      title: "MathMentor Barbados — Socratic AI Tutor",
      description:
        "Bajan Socratic math tutor on Claude via Bedrock. Serverless Lambda enforces one-hint-at-a-time pedagogy; OpenTofu behind CloudFront.",
    },
    {
      title: "Secure Public-Sector Landing Zone",
      description:
        "Modular OpenTofu landing zone: org guardrails as code (SCPs, IMDSv2), CIS-aligned baseline, AI-generated SOC 2 evidence.",
    },
    {
      title: "Hurricane-Ready — Bajan Storm Alerts",
      description:
        "Deterministic threat scoring on the NOAA/NHC feed with Claude explanations; hardened container on ECS Fargate.",
    },
    {
      title: "Zero-Downtime Delivery Pipeline",
      description:
        "Blue/green ECS Fargate via CodeDeploy, 10% canary shifting, alarm-triggered auto rollback, keyless OIDC CI/CD — all in OpenTofu.",
    },
  ],
  skills: [
    { key: "cloud & iac/", value: "AWS · Terraform · CloudFormation · CDK · OpenTofu · ECS · Lambda · CloudFront" },
    { key: "security/", value: "SOC 2 · NIST CSF · CIS Benchmarks · Zero Trust · Vulnerability Management · IAM" },
    { key: "devsecops/", value: "GitHub Actions · CodePipeline · Docker hardening · Blue/Green · CloudWatch · X-Ray" },
    { key: "cloud + ai/", value: "Claude API · Claude on Bedrock · MCP · Python · Bash" },
  ],
  certifications: [
    "AWS Solutions Architect – Associate '25",
    "CompTIA Security+ ce '24 · Cybersecurity Analyst '24",
    "Anthropic AI Engineering — 8 courses",
    "AWS DevOps Pro — in progress",
  ],
  education: {
    degree: "BSc Computer Science",
    school: "University of the West Indies (UWI)",
  },
} as const;

export type SiteContent = typeof siteContent;
export type ResumeContent = typeof resumeContent;
