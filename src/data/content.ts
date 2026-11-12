export const siteContent = {
  meta: {
    siteName: "Christopher Corbin",
    title: "Christopher Corbin — DevOps & Cloud Engineer",
    description:
      "DevOps & Cloud Engineer. I build software and the cloud it runs on: the app, the infrastructure as code, and the pipelines that release it safely with feature flags and automatic rollback, built for reliability and security.",
    ogDescription:
      "DevOps & cloud engineer who builds the app, the infrastructure and the pipeline. ~$150K/yr saved · CI cut from 30+ to under 10 min · 500+ vulnerabilities fixed.",
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
      { label: "deploy", href: "#deploy" },
      { label: "contact", href: "#contact" },
    ],
    resume: { label: "resume ↓", href: "/resume" },
  },
  hero: {
    command: "whoami --role",
    commandOutput: "DevOps & cloud engineer who writes the code too: apps, infrastructure as code, CI/CD, AI",
    nameLines: ["Christopher", "Corbin"],
    summary:
      "I build software and the cloud it runs on: the app, the infrastructure as code, and the pipelines that release it safely with feature flags and automatic rollback, built for reliability and security.",
    ctas: [
      { label: "watch a deploy", href: "#deploy", variant: "solid" },
      { label: "view projects", href: "#projects", variant: "outline" },
      { label: "resume", href: "/resume", variant: "ghost" },
    ],
    status: "● Barbados · open to relocation",
    photo: {
      titlebar: "corbin@re-invent — photo.jpg",
      src: "/images/profile.jpg",
      alt: "Christopher Corbin at AWS re:Invent",
    },
  },
  metrics: {
    saved: {
      label: "# annual cloud spend saved",
      value: 150,
      prefix: "$",
      suffix: "K",
      caption:
        "Right-sized compute and automated cost guardrails across a 14-account AWS org — about 20% of total cloud spend.",
      chartLabel: "monthly cloud cost, FY25",
      chartTrend: "▼ trending down",
      points: "0,10 50,24 100,18 150,38 200,50 250,60 300,66",
    },
    ci: {
      from: 30,
      to: 10,
      display: "<10",
      sub: " min CI",
      beforeValue: "30+ min",
      afterValue: "<10 min",
      caption:
        "pipeline runs on GovTech's case management system that took 30+ minutes, now under 10 after splitting them into parallel jobs and 4 sharded e2e runs",
    },
    cve: {
      value: 500,
      suffix: "+",
      sub: " vulnerabilities",
      scanLabel: "found",
      scanResult: "patched",
      squares: 30,
      caption:
        "hunted down and remediated across production AWS environments, with automated scanning that files every finding and closes it once fixed",
    },
  },
  dora: {
    label: "$ how-i-ship --at-a-glance",
    labelComment: "# practices, not vanity numbers",
    cells: [
      { label: "Deploy frequency", value: "On merge", caption: "every merge deploys to sandbox automatically; staging and production through approved promotion PRs", green: false },
      { label: "Release integrity", value: "Build once", caption: "the exact image that passed testing is the one promoted to production", green: false },
      { label: "Vuln tracking", value: "Automated", caption: "scanner findings filed as issues, assigned, and closed once fixed", green: true },
      { label: "Rollback", value: "Automatic", caption: "feature flags revert on error alarms; a deploy that rolls back fails loudly instead of passing", green: false },
    ],
  },
  about: {
    title: "About",
    path: "~/about",
    cmd: "cat about.md",
    paragraphs: [
      "I build and run the cloud systems behind live public services in Barbados, and I've been tech lead on four of them, from first design through to production.",
      "As a cloud and DevOps engineer at <strong>GovTech Barbados</strong>, I work across the whole stack. I write the application, from Next.js front ends to serverless and container back ends, and I build what it runs on: infrastructure as code, CI/CD pipelines that test a release once and promote that same build through every environment, and safeguards like feature flags and automatic rollback. On the government's case management system, that cut pipeline runs from over 30 minutes to under 10, giving the team back about three hours of waiting every working day.",
      "A lot of my job is removing manual work. Security findings used to be triaged by hand; now a pipeline I built files each one as an issue, assigns it, and closes it when the fix ships. I've also added AI code review to the pipeline, so low-risk pull requests get approved faster. I'm genuinely excited about what AI can do, and I'm always looking for the next place it can save a team time.",
      "On the security side, I'm on <strong>Protexxa</strong>'s SysOps team, where I build hardened golden images and keep a multi-account AWS environment aligned with CIS benchmarks using Inspector and Systems Manager. That work helped the company become SOC 2 compliant.",
      "I started in hands-on tech support and operations and studied Computer Science at UWI, so I judge a system by how it holds up for the person using it. I'm as comfortable in a planning session with a ministry as I am reviewing a pull request.",
      "I'm the founder of <strong>246Labs</strong>, a product studio for software, cloud and AI, where I take products from first idea to live customers. I build them to solve real local problems: SumDeTing, a Socratic maths tutor for Barbadian students, and Bim Weather, a forecast and storm-alert service, both run on Claude via Amazon Bedrock. The studio also builds for clients, such as CargoLink Barbados, a booking and tracking platform for shipping cargo to and from the island.",
    ],
  },
  experience: {
    title: "Experience",
    path: "~/experience",
    cmd: "git log --oneline",
    entries: [
      {
        role: "Cloud Infrastructure Developer",
        dates: "Jan 2026 – Present",
        company: "GovTech Barbados",
        note: null,
        bullets: [
          "Led delivery as tech lead on 4 public services, taking each from design to production, including the GovTech Hub staff intranet, Service Hub and SME discovery questionnaire",
          "Cut CI pipeline time from 30+ minutes to under 10 for the government's case management system by parallelising jobs and sharding end-to-end tests, saving about 3 hours of pipeline time per day",
          "Designed a build-once release process that promotes one tested container image through every environment, reducing image builds per release from 15 to 3, with AWS AppConfig feature flags and automated rollback",
          "Automated vulnerability management with a pipeline that files Amazon Inspector findings as issues, assigns owners and closes them once fixed, and added AI code review to CI/CD",
          "Implemented Datadog monitoring and alerting as code across the platform's public services",
        ],
        dot: "accent",
      },
      {
        role: "Founder",
        dates: "2026 – Present",
        company: "246Labs · Barbados",
        note: "own studio",
        bullets: [
          "Founded a product studio for software, cloud and AI, taking products from first idea to paying customers",
          "Built and launched SumDeTing, a Socratic AI maths tutor, and Bim Weather, a forecast and storm-alert service, on Claude via Amazon Bedrock",
          "Delivered custom software for paying clients from requirements through to production support, including CargoLink Barbados, a booking and tracking platform for shipping cargo to and from the island",
          "Provisioned every product with OpenTofu and shipped it through CI/CD from day one, on AWS Lambda, ECS Fargate and CloudFront",
        ],
        dot: "green",
      },
      {
        role: "AWS SysOps / Cloud & Security Engineer",
        dates: "Feb 2025 – Present",
        company: "Protexxa · Remote",
        note: "concurrent contract",
        bullets: [
          "Led Amazon Connect engineering across 3 AWS regions, cutting response times by 35% for 1,000+ users",
          "Built hardened golden images and maintained CIS Benchmark alignment across a 14-account AWS organisation (2,000+ resources) using Amazon Inspector and Systems Manager",
          "Supported SOC 2 compliance, achieving a 97.2% audit score with zero critical findings",
          "Remediated 500+ vulnerabilities within 30 days across production AWS accounts",
          "Reduced cloud spend by about $150K a year by right-sizing EC2 and RDS",
        ],
        dot: "gray",
      },
    ],
  },
  skills: {
    title: "Skills",
    path: "~/stack",
    cmd: "ls",
    // Plain-English one-liner shown when a tag is hovered or focused
    tips: {
      "TypeScript": "JavaScript with types, so mistakes are caught before the code runs",
      "JavaScript": "The language of the web, running in every browser",
      "Next.js": "A framework for building fast websites and web apps with React",
      "React": "A library for building interactive screens from reusable pieces",
      "Node.js": "Runs JavaScript on servers, powering back ends and tools",
      "Python": "A versatile language for automation, data and back-end services",
      "PostgreSQL": "A reliable open-source database for storing an app's data",
      "Playwright": "Automated tests that click through an app like a real user would",
      "Bash": "Command-line scripts that automate everyday tasks",
      "GitHub Actions": "Automation that tests and deploys code every time it changes",
      "OIDC (keyless)": "Lets pipelines sign in to AWS without storing long-lived passwords",
      "Build once, promote by digest": "The exact build that passed testing is the one that goes live",
      "Feature flags (AppConfig)": "Switches that turn features on or off without a new release",
      "Trunk-based delivery": "Small changes merged often, so every release is small and safe",
      "Blue/Green": "Run the new version beside the old one, then switch traffic over in one step",
      "Canary": "Send a small slice of users to the new version first, and roll back if anything breaks",
      "CodeDeploy": "AWS service that rolls out new versions and rolls back automatically",
      "Docker": "Packages an app with everything it needs, so it runs the same everywhere",
      "Docker hardening": "Slimming and locking down containers so there's less to attack",
      "Amplify": "AWS hosting that builds and publishes a site on every push",
      "AWS": "Amazon's cloud platform, where most of my infrastructure runs",
      "Azure": "Microsoft's cloud platform, popular with enterprises and government",
      "GCP": "Google Cloud Platform, Google's cloud for apps, data and AI",
      "OpenTofu": "Open-source tool for describing cloud infrastructure as code",
      "Terraform": "The original infrastructure-as-code tool OpenTofu grew from",
      "CDK": "Defines AWS infrastructure in a regular programming language",
      "CloudFormation": "AWS's own service for building infrastructure from templates",
      "ECS Fargate": "Runs containers on AWS without managing any servers",
      "Lambda": "Runs code on demand with no servers, paying only while it runs",
      "CloudFront": "AWS's global network that serves sites quickly, close to users",
      "Route 53": "AWS's DNS service, pointing domain names to the right place",
      "VPC": "A private, isolated network for cloud resources",
      "Datadog": "Monitoring that shows how systems are doing and alerts on problems",
      "CloudWatch": "AWS's built-in monitoring, logs and alarms",
      "Monitoring as code": "Dashboards and alerts written as code and reviewed like any change",
      "Drift detection": "Checks that what's running still matches what's defined in code",
      "SOC 2": "An audit standard proving a company keeps customer data secure",
      "NIST CSF": "A widely used framework for managing cybersecurity risk",
      "CIS Benchmarks": "Industry checklists for configuring systems securely",
      "IAM · SCPs": "Controls over who can do what in AWS, down to whole accounts",
      "Inspector": "AWS scanner that finds vulnerabilities in servers and containers",
      "Security Hub": "One place to see security findings across every AWS account",
      "Systems Manager": "AWS tooling to patch, configure and manage servers at scale",
      "Golden images": "Pre-hardened server templates every new machine starts from",
      "WAF": "A web firewall that blocks malicious traffic before it reaches an app",
      "Secrets Manager": "Stores and rotates passwords and keys so they never sit in code",
      "Claude on Bedrock": "Anthropic's Claude AI, run securely inside AWS",
      "Claude API": "Building apps directly on Anthropic's Claude models",
      "MCP": "An open standard for connecting AI assistants to tools and data",
      "AI code review": "AI that reviews every pull request before a person does",
      "Claude skills": "Reusable instructions that teach Claude a team's way of working",
      "Prompt evals": "Tests that check an AI's answers stay accurate and on task",
    } as Record<string, string>,
    cards: [
      {
        title: "development/",
        tags: ["TypeScript", "JavaScript", "Next.js", "React", "Node.js", "Python", "PostgreSQL", "Playwright", "Bash"],
      },
      {
        title: "ci/cd & delivery/",
        tags: ["GitHub Actions", "OIDC (keyless)", "Build once, promote by digest", "Feature flags (AppConfig)", "Trunk-based delivery", "Blue/Green", "Canary", "CodeDeploy", "Docker", "Amplify"],
      },
      {
        title: "cloud & iac/",
        tags: ["AWS", "Azure", "GCP", "OpenTofu", "Terraform", "CDK", "CloudFormation", "ECS Fargate", "Lambda", "CloudFront", "Route 53", "VPC"],
      },
      {
        title: "observability/",
        tags: ["Datadog", "CloudWatch", "Monitoring as code", "Drift detection"],
      },
      {
        title: "security & compliance/",
        tags: ["SOC 2", "NIST CSF", "CIS Benchmarks", "IAM · SCPs", "Inspector", "Security Hub", "Systems Manager", "Golden images", "Docker hardening", "WAF", "Secrets Manager"],
      },
      {
        title: "ai/",
        tags: ["Claude on Bedrock", "Claude API", "MCP", "AI code review", "Claude skills", "Prompt evals"],
      },
    ],
  },
  projects: {
    title: "Featured projects",
    path: "~/projects",
    cmd: "ls --featured",
    cards: [
      {
        titlebar: "246labs · studio",
        dot: "accent",
        wide: true,
        title: "246Labs: a product studio for software, cloud and AI",
        description:
          "The studio I founded to take products from first idea to live customers. It's home to SumDeTing and Bim Weather, and builds software for clients like CargoLink Barbados. Every product ships the same way: provisioned with OpenTofu, hardened by default, and deployed through CI/CD from the first commit, with Claude on Amazon Bedrock powering the AI features.",
        highlight: "▸ 246labs.cloud · Next.js on Amplify · OpenTofu · self-hosted Matomo analytics",
        flow: ["Idea", "OpenTofu", "GitHub Actions", "ECS · Lambda · Amplify", "*Live on 246labs.cloud"],
        links: [
          { label: "view code →", href: "https://github.com/chrisfixesit/246labs-site", primary: false },
          { label: "visit 246labs.cloud →", href: "https://246labs.cloud", primary: true },
        ],
      },
      {
        titlebar: "246labs / sumdeting · live",
        dot: "green",
        wide: false,
        title: "SumDeTing: Socratic AI Maths Tutor",
        description:
          "A Bajan maths tutor that won't just give the answer. Claude on Amazon Bedrock finds where a student's working went wrong and guides them one hint at a time, from Common Entrance to CSEC and CAPE. Optional accounts sync progress across devices, with parental consent for under-13s, and chats are never stored on the server.",
        highlight: "▸ serverless Lambda · DynamoDB · SES · KaTeX · Playwright e2e · hardened Docker",
        flow: ["Student", "CloudFront", "Lambda", "*Claude on Bedrock"],
        links: [
          { label: "view code →", href: "https://github.com/chrisfixesit/Sumdeting", primary: false },
          { label: "architecture →", href: "https://github.com/chrisfixesit/Sumdeting#architecture", primary: false },
          { label: "try it live →", href: "https://sumdeting.246labs.cloud", primary: true },
        ],
      },
      {
        titlebar: "246labs / bim-weather · live",
        dot: "green",
        wide: false,
        title: "Bim Weather: Forecasts and Storm Alerts",
        description:
          "A plain-language Barbados weather dashboard and hurricane alerter. Code, not AI, decides the storm threat level from the National Hurricane Center feed; Claude on Amazon Bedrock then explains it calmly, and alerts go out only when the level changes. It installs like an app and works offline, so the last guidance is still there when the power and internet drop.",
        highlight: "▸ Fargate behind CloudFront + WAF · Web Push · offline PWA · Beryl 2024 replay",
        flow: ["NOAA / NHC feed", "Threat engine", "*Claude explains", "Web Push"],
        links: [
          { label: "view code →", href: "https://github.com/chrisfixesit/hurricane-ready", primary: false },
          { label: "architecture →", href: "https://github.com/chrisfixesit/hurricane-ready#architecture", primary: false },
          { label: "try it live →", href: "https://bimweather.246labs.cloud", primary: true },
        ],
      },
      {
        titlebar: "246labs / cargolink · client",
        dot: "green",
        wide: false,
        title: "CargoLink Barbados: Cargo Logistics Platform",
        description:
          "A shipping platform built for CargoLink Barbados, a client that moves cargo to and from the island. Customers book a shipment and track it in one place instead of chasing it by phone, and it works as well on a phone as on a desk. Hosted on AWS and deployed through CI/CD.",
        highlight: "▸ client project · live at cargolinkbarbados.com · AWS · CI/CD",
        flow: ["Customer", "Booking", "*Shipment tracking", "Operators"],
        links: [
          { label: "case study →", href: "https://246labs.cloud/work/cargolink", primary: false },
          { label: "visit live →", href: "https://cargolinkbarbados.com", primary: true },
        ],
      },
      {
        titlebar: "zero-downtime-pipeline · open source",
        dot: "accent",
        wide: false,
        title: "Zero-Downtime Delivery Pipeline",
        description:
          "A reference pipeline for releasing without downtime. Each deploy starts the new version beside the old one, sends it 10% of traffic for five minutes, and rolls back on its own if errors spike. GitHub Actions signs in to AWS without stored keys, and all of it is defined in OpenTofu.",
        highlight: "▸ ECS Fargate · CodeDeploy · CloudWatch alarms · OIDC · watch it roll back ↓",
        flow: ["GitHub OIDC", "CodeDeploy", "10% canary", "*Auto-rollback"],
        links: [
          { label: "view code →", href: "https://github.com/chrisfixesit/zero-downtime-pipeline", primary: false },
          { label: "architecture →", href: "https://github.com/chrisfixesit/zero-downtime-pipeline#how-a-deploy-flows", primary: false },
          { label: "watch the demo ↓", href: "#deploy", primary: true },
        ],
      },
    ],
  },
  certifications: {
    title: "Certifications & education",
    path: "~/certs-and-education",
    cmd: "ls",
    badges: [
      { name: "BSc Computer Science, UWI", meta: "degree", url: null, image: null, inProgress: false, muted: false, education: true },
      { name: "AWS Solutions Architect – Associate", meta: "'25", url: "https://www.credly.com/badges/97e63154-4551-4d04-b887-fdf87a609961/public_url", image: "/images/badges/aws-saa.png", inProgress: false, muted: false, education: false },
      { name: "CompTIA Security+ ce", meta: "'24", url: "https://www.credly.com/badges/0407670a-35ff-49d6-ad3b-5680d7e8e2d9/public_url", image: "/images/badges/security-plus.png", inProgress: false, muted: false, education: false },
      { name: "AWS DevOps Engineer – Professional", meta: "in progress", url: null, image: null, inProgress: true, muted: false, education: false },
      { name: "Anthropic Academy · AI Engineering", meta: "8 courses", url: null, image: null, inProgress: false, muted: true, education: false },
      { name: "Anthropic · Claude with Amazon Bedrock", meta: null, url: null, image: null, inProgress: false, muted: true, education: false },
      { name: "Anthropic · Introduction to Model Context Protocol", meta: null, url: null, image: null, inProgress: false, muted: true, education: false },
      { name: "Cisco · Introduction to Cybersecurity", meta: null, url: "https://www.credly.com/badges/43fbe669-ad92-42c6-a8de-4107a90a2087/public_url", image: "/images/badges/cisco-intro-cyber.png", inProgress: false, muted: true, education: false },
      { name: "Cisco · Networking Basics", meta: null, url: "https://www.credly.com/badges/802f49a6-d9c1-4707-a3a6-02669c71f978/public_url", image: "/images/badges/cisco-networking.png", inProgress: false, muted: true, education: false },
    ],
  },
  contact: {
    title: "Contact",
    path: "~",
    cmd: "./connect.sh",
    heading: "Let's connect.",
    blurb:
      "Open to cloud, DevOps and platform engineering roles, remote or on-site. Happy to relocate and travel.",
    email: "christophercorbin24@gmail.com",
    location: "Based in Barbados",
    now: "● now: studying for AWS DevOps Engineer – Professional · building at 246Labs",
    clients: { label: "Have a project? Client work goes through 246Labs", linkLabel: "246labs.cloud →", href: "https://246labs.cloud" },
    github: "https://github.com/chrisfixesit",
    githubDisplay: "github.com/chrisfixesit",
    linkedin: "https://www.linkedin.com/in/christophercorbin",
    linkedinDisplay: "linkedin.com/in/christophercorbin",
  },
  footer: {
    copyright: "© 2026 Christopher Corbin",
    links: [
      { label: "github", href: "https://github.com/chrisfixesit" },
      { label: "linkedin", href: "https://www.linkedin.com/in/christophercorbin" },
      { label: "email", href: "mailto:christophercorbin24@gmail.com" },
      { label: "resume", href: "/resume" },
    ],
  },
} as const;

export const resumeContent = {
  title: "Christopher Corbin — Résumé",
  name: "Christopher Corbin",
  tagline: "DevOps & Cloud Engineer · Full-stack development · Infrastructure as Code · AI",
  contactLines: [
    "christophercorbin.cloud",
    "christophercorbin24@gmail.com",
    "github.com/chrisfixesit",
    "linkedin.com/in/christophercorbin",
  ],
  location: "Barbados · open to relocation",
  summary:
    "DevOps and cloud engineer who builds software, the cloud infrastructure it runs on, and the automated pipelines that release it safely. Cut build and test time from over 30 minutes to under 10, saved about $150K a year in cloud costs, and helped a company achieve SOC 2 compliance. Uses AI to automate repetitive tasks and improve team efficiency, with Claude on Amazon Bedrock.",
  sections: {
    experience: { title: "Experience", path: "~/experience", cmd: "git log --oneline" },
    projects: { title: "Selected projects", path: "~/projects", cmd: "ls --featured" },
    skills: { title: "Skills", path: "~/stack", cmd: "ls" },
    certifications: { title: "Certifications", path: "~/certs", cmd: "ls" },
    education: { title: "Education", path: "~/education", cmd: "cat degree.md" },
  },
  experience: [
    {
      role: "Cloud Infrastructure Developer",
      dates: "Jan 2026 – Present",
      company: "GovTech Barbados",
      bullets: [
        "Led delivery as tech lead on 4 public services, taking each from design to production, including the GovTech Hub staff intranet, Service Hub and SME discovery questionnaire",
        "Cut CI pipeline time from 30+ minutes to under 10 for the government's case management system by parallelising jobs and sharding end-to-end tests, saving about 3 hours of pipeline time per day",
        "Designed a build-once release process that promotes one tested container image through every environment, reducing image builds per release from 15 to 3, with AWS AppConfig feature flags and automated rollback",
        "Automated vulnerability management with a pipeline that files Amazon Inspector findings as issues, assigns owners and closes them once fixed; added AI code review to CI/CD and Datadog monitoring and alerting as code",
      ],
    },
    {
      role: "Founder — 246Labs",
      dates: "2026 – Present",
      company: "246Labs, Barbados · product studio for software, cloud and AI (246labs.cloud)",
      bullets: [
        "Founded a product studio for software, cloud and AI, taking products from first idea to paying customers",
        "Built and launched SumDeTing, a Socratic AI maths tutor, and Bim Weather, a forecast and storm-alert service, on Claude via Amazon Bedrock",
        "Delivered custom software for paying clients from requirements through to production support, including CargoLink Barbados, a booking and tracking platform for shipping cargo to and from the island",
        "Provisioned every product with OpenTofu and shipped it through CI/CD from day one, on AWS Lambda, ECS Fargate and CloudFront",
      ],
    },
    {
      role: "AWS SysOps / Cloud & Security Engineer",
      dates: "Feb 2025 – Present",
      company: "Protexxa — Remote · concurrent contract",
      bullets: [
        "Led Amazon Connect engineering across 3 AWS regions, cutting response times by 35% for 1,000+ users",
        "Built hardened golden images and maintained CIS Benchmark alignment across a 14-account AWS organisation (2,000+ resources), remediating 500+ vulnerabilities within 30 days",
        "Supported SOC 2 compliance, achieving a 97.2% audit score with zero critical findings",
        "Reduced cloud spend by about $150K a year by right-sizing EC2 and RDS",
      ],
    },
    {
      role: "Technical Guide & Operations · Apple Rep",
      dates: "2021 – 2024",
      company: "TORE Barbados · iShop",
      bullets: [
        "Operations leadership and equipment reliability (-20% downtime); Apple technical support",
      ],
    },
  ],
  projects: [
    {
      title: "SumDeTing: Socratic AI Maths Tutor",
      url: "sumdeting.246labs.cloud",
      description:
        "Bajan maths tutor on Claude via Amazon Bedrock that guides students one hint at a time. Serverless Lambda, DynamoDB and SES, deployed with OpenTofu.",
    },
    {
      title: "Bim Weather: Forecasts and Storm Alerts",
      url: "bimweather.246labs.cloud",
      description:
        "Barbados weather dashboard and hurricane alerter with deterministic NOAA/NHC threat scoring. Hardened container on ECS Fargate behind CloudFront and WAF.",
    },
    {
      title: "CargoLink Barbados: Cargo Logistics Platform",
      url: "cargolinkbarbados.com",
      description:
        "Client project: shipment booking and tracking for a Barbados cargo shipper, built mobile-first. Hosted on AWS and deployed through CI/CD.",
    },
    {
      title: "Zero-Downtime Delivery Pipeline",
      url: null,
      description:
        "Blue/green ECS Fargate deploys with 10% canary shifting, alarm-triggered rollback and keyless OIDC CI/CD, all in OpenTofu.",
    },
  ],
  skills: [
    { key: "development/", value: "TypeScript · JavaScript · Next.js · React · Node.js · Python · PostgreSQL · Playwright" },
    { key: "cloud & iac/", value: "AWS · Azure · GCP · OpenTofu · Terraform · CDK · CloudFormation · ECS Fargate · Lambda · CloudFront" },
    { key: "devsecops/", value: "GitHub Actions · Build once, promote by digest · AppConfig feature flags · Inspector · Systems Manager · Golden images · SOC 2 · NIST CSF · CIS" },
    { key: "observability + ai/", value: "Datadog · CloudWatch · Claude on Bedrock · Claude API · MCP · AI code review · Prompt evals" },
  ],
  certifications: [
    "AWS Solutions Architect – Associate '25",
    "CompTIA Security+ ce '24",
    "Anthropic Academy · AI Engineering, 8 courses",
    "AWS DevOps Engineer – Professional (in progress)",
  ],
  education: {
    degree: "BSc Computer Science",
    school: "University of the West Indies (UWI)",
  },
} as const;

export type SiteContent = typeof siteContent;
export type ResumeContent = typeof resumeContent;
