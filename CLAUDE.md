# CLAUDE.md — Christopher Corbin E-Portfolio v2

## Project

Personal portfolio site at https://christophercorbin.cloud. Single-page (with a separate /resume route), content-focused, no dynamic features beyond a contact form.

## Stack

- **Frontend:** Astro 6 + Tailwind CSS v4 + React 19 (islands only, used for the contact form)
- **Backend:** AWS Amplify Gen 2 in `amplify/` (CDK): TypeScript Lambda behind a Function URL, DynamoDB, SES
- **Hosting:** AWS Amplify Hosting in account `590716168923`; security and cache headers in `customHttp.yml`
- **DNS:** Amazon Route 53 hosted zone, managed with OpenTofu in `chrisfixesit/tofu-or-not-tofu` (`accounts/management/dns`), not in this repo
- **CI:** GitHub Actions `verify` job on PRs and main (`astro check` + build), plus CodeRabbit review (`.coderabbit.yaml`). Amplify handles deploys.

Architecture diagram: `docs/architecture.drawio.png` (the PNG embeds the editable draw.io diagram). Update it when the architecture changes.

## Repository structure

```
src/
  pages/       # Astro routes: index.astro, resume.astro
  components/  # Astro section components + ContactForm React island
  data/        # content.ts: all site and résumé copy as a structured TS object
  layouts/     # BaseLayout.astro
  styles/      # global.css (Tailwind v4 @theme tokens + custom utilities)
public/
  images/      # incl. badges/ (local Credly badge images)
amplify/       # Amplify Gen 2 backend: contact-form function, table, Function URL
scripts/       # build helpers: write-contact-env.mjs, generate-og-image.mjs
docs/
  architecture.drawio.png
  superpowers/
    specs/     # Design specs
    plans/     # Implementation plans
```

## Important: Tailwind v4 (not v3)

This project uses Tailwind CSS **v4** with the Vite plugin pattern. Key differences from v3:
- **No `tailwind.config.mjs` file.** Theme tokens (colors, fonts, spacing) live in `src/styles/global.css` via `@theme { ... }` directives.
- **Custom utilities** use `@utility` directive in CSS, not the v3 plugin syntax.
- **Content scanning is automatic** via `@tailwindcss/vite`.
- **Import** uses `@import "tailwindcss";` (not the three `@tailwind base/components/utilities` directives).

When adding new design tokens (colors, fonts, spacing), edit `src/styles/global.css`. Don't create a JS config file.

## Conventions

- **Content lives in `src/data/content.ts`.** Components consume from it. Don't hardcode copy in components.
- **Tailwind first.** Use utility classes; only fall back to scoped `<style>` blocks when Tailwind can't express it.
- **No client-side JS unless necessary.** Astro ships zero JS by default. The only React island is `ContactForm.tsx`.
- **TypeScript strict.** No `any`. No `// @ts-expect-error` without an explanation comment.

## Local dev

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # static build to dist/
npm run preview      # preview the built site
```

## Deployment

- `git push origin main` → Amplify auto-builds and deploys to prod environment
- `git push origin dev-feature-x` → Amplify auto-creates a preview env and posts the URL on the PR

## Where the spec/decision history lives

- Design spec: `docs/superpowers/specs/2026-05-02-eportfolio-v2-greenfield-design.md`
- PR 1 plan: `docs/superpowers/plans/2026-05-03-eportfolio-v2-pr1-bootstrap.md`

## Out of scope (intentional)

- No dynamic project pages, blog, or CMS
- No user accounts or authentication
- No analytics dashboards
- No admin panel
- The contact form is the only dynamic feature

## Old repo

v1 (`AWS-eportfolio`, no longer on GitHub) used multi-account S3+CloudFront+SAM. Don't reference its patterns; they don't apply here.
