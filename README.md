# CareerForge AI

**An AI-powered resume builder, resume evaluator, career advisor, and job discovery workspace.**

CareerForge AI helps people present their experience clearly, compare resumes against target job descriptions, identify career paths, and discover relevant LinkedIn job searches. It combines a responsive Next.js interface with Google's Gemini API for AI-assisted writing and recommendations.

> **AI advisory notice:** AI-generated edits, scores, job-fit labels, and career advice are recommendations—not official Applicant Tracking System (ATS) results, hiring decisions, guarantees of employment, or mandatory changes. Users should independently verify all generated content before using it.

## Features

### 1. Resume Builder
- Edit personal details, professional summary, experience, education, skills, and projects.
- See changes immediately in the live document preview.
- Choose from four original templates: **Executive**, **Atelier**, **Signature**, and **Minimal**.
- Enhance individual text fields with Gemini AI and select a writing tone.
- Review proposed changes and choose **Apply** or **Discard**; the original is not replaced automatically.
- Save resume data locally in the current browser with `localStorage`.
- Export with your browser's **Print / Save as PDF** functionality.

### 2. Resume Evaluator
- Paste a target job description and compare it with the current resume.
- View an AI-estimated alignment score out of 100 and a category breakdown.
- Review documented strengths, missing or unclear evidence, and suggested enhancements.
- Re-evaluate after revising the resume.
- **Scores are AI-estimated guidance, not verified ATS scores or predictions of hiring outcomes.**

### 3. Career Role Advisor
- Describe practical abilities, tools, and projects in everyday language.
- Receive suggested job titles with reasons, qualitative fit labels, useful search keywords, and recommended next steps.
- Open LinkedIn searches for recommended titles.
- Suggested roles do not establish that a company is currently hiring.

### 4. AI Job Finder
- Request Gemini-generated job-title suggestions based on resume content and optional career interests.
- Search by target title, location, workplace arrangement (remote, hybrid, or on-site), experience level, and posting recency.
- Follow links to LinkedIn Jobs search results, or copy a search URL.
- **No LinkedIn login or LinkedIn API integration is required inside CareerForge.** LinkedIn itself may request login or alter/filter the resulting searches.
- This version does **not** retrieve or verify live job postings, apply for jobs automatically, or scrape LinkedIn.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Frontend | React, TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Next.js Route Handlers (Node.js) |
| AI | Google Gemini API, `@google/genai` |
| Local persistence | Browser `localStorage` |
| Resume export | Browser Print / Save as PDF |
| Hosting | Vercel |
| Version control | Git and GitHub |

There is no Python service, SQL database, account system, or separate Express server in the current implementation.

## Project Structure

```text
careerforge-ai/
├── .env.local                 # Local secrets; never commit
├── package.json
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/route.ts       # Existing Gemini writing tools
│   │   │   ├── career/route.ts   # Resume evaluation and role advice
│   │   │   ├── enhance/route.ts  # Inline resume-field enhancements
│   │   │   └── job-finder/route.ts # Job-title recommendations
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # Main workspace and navigation
│   ├── components/
│   │   ├── ResumePreview.tsx
│   │   ├── CareerIntelligence.tsx
│   │   └── JobFinder.tsx
│   └── lib/
│       ├── resume.ts
│       └── jobSearch.ts
└── public/
```

## Getting Started

### Prerequisites
- A supported current Node.js LTS release and npm.
- Git installed for version control.
- A Google AI Studio API key for a Gemini model available to your project.

### Install and run

```bash
# Run from the folder containing package.json
npm install

# Create .env.local as shown below, then:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create `.env.local` in the project root (next to `package.json`):

```dotenv
GEMINI_API_KEY=your_private_api_key_here
GEMINI_MODEL=your_available_gemini_model_id
```

Obtain an API key from [Google AI Studio](https://aistudio.google.com/apikey). Use a model identifier your project can actually access. The application reads `GEMINI_MODEL` from the environment and may fall back to a model named in its API route source if the variable is absent.

**Never put a key in client components, use `NEXT_PUBLIC_` for this key, commit `.env.local`, or paste keys into public issues or screenshots.**

Verify `.gitignore` includes:

```gitignore
.env*
!.env.example
node_modules/
.next/
```

If using a `.env.example`, include variable names and placeholder values only, not real keys.

## Available Commands

```bash
npm run dev       # Local development
npx tsc --noEmit  # TypeScript checking
npm run build     # Optimized production build
npm run start     # Serve production build locally
```

## How to Use

1. Open **Resume Builder** and replace sample personal and career information with accurate details.
2. Switch through the editor's sections and choose a resume template.
3. Use **Enhance with AI** beside supported fields, review its proposed text, and apply only if correct.
4. Use **Resume Evaluator** to paste a specific job description and review estimated alignment, strengths, gaps, and recommended changes.
5. Use **Career Role Advisor** if you know your abilities but are unsure what job titles to search for.
6. Use **AI Job Finder** to refine a role by location, work arrangement, seniority, and recency, then open the corresponding LinkedIn Jobs search.
7. Return to **Resume Builder** and use **Export PDF**; select **Save as PDF** in the browser dialog.

## AI Design and Limitations

- Gemini runs through server-side route handlers; the browser does not directly call the Google API with the private key.
- Gemini may produce inaccurate or incomplete information. Never add unverified qualifications, achievements, statistics, or experience to a resume.
- The evaluator score is a model-generated estimate. It is not calibrated against employer recruiting decisions or a commercial ATS.
- Missing mention of a skill does not prove a candidate lacks that skill.
- The job finder suggests **searches and role titles**, not verified vacancies. LinkedIn search filters are not a stable contracted API and may change.
- PDF export relies on browser printing. Long resumes and complex templates may require manual print adjustments.
- Data saved with `localStorage` belongs to the current browser/device. It is not an account-based backup and can be lost when browser storage is cleared.
- Current builds do not include user accounts, cloud resume storage, or uploaded PDF/DOCX parsing.

## Privacy and Security

Resume information can include names, contact information, education, work history, and other personal data.

- Editing and autosaving happen in local browser storage.
- When users request an AI enhancement, evaluation, career recommendation, or AI job-role suggestion, relevant text is sent to the CareerForge server route and then to Google's Gemini API for processing.
- Do not describe all user information as staying only on-device; AI requests transmit submitted content to the provider.
- Review Google's Gemini API data-use terms and choose an appropriate API plan before production use with real personal data.
- Do not submit sensitive information unnecessarily. Consider minimizing personal contact details included in AI prompts.
- A public rollout should include authentication or abuse protections, rate limiting, spend/quota controls, a privacy policy, and a process for user data handling.
- If a secret was committed or shared publicly, revoke/rotate it promptly.

## Deploy to Vercel

### 1. Verify locally

```bash
npx tsc --noEmit
npm run build
```

Resolve build errors before pushing.

### 2. Push to GitHub

From the project root:

```bash
git status
git add .
git commit -m "feat: launch CareerForge AI career workspace"
git push -u origin main
```

If the repository is new, initialize Git, create a GitHub repository, set the remote, and then push. Check `git status` and tracked files first to ensure no secrets are staged.

### 3. Import into Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Select **Add New → Project** and import the GitHub repository.
3. Confirm the framework is **Next.js**.
4. If your repository contains an outer folder and the Next.js app is nested, choose the **Root Directory** that contains `package.json`.
5. Add `GEMINI_API_KEY` and `GEMINI_MODEL` in Vercel Project Environment Variables for **Production** (and Preview if needed).
6. Click **Deploy**.
7. Open the generated Vercel URL and test all four workspaces, Gemini calls, and PDF export.

Environment-variable changes apply to new deployments; redeploy after editing them. Future pushes to the configured production branch can trigger automatic deployments.

### Pre-launch testing checklist

- [ ] `npx tsc --noEmit` succeeds.
- [ ] `npm run build` succeeds.
- [ ] `.env.local` and API keys are absent from Git commits.
- [ ] All four workspace tabs open correctly.
- [ ] Resume data persists after refresh in the same browser.
- [ ] All four templates render and PDF print works.
- [ ] Gemini inline enhancement returns text and Apply/Discard work.
- [ ] Evaluator produces a score and advisory notice.
- [ ] Career advisor suggests appropriate job titles.
- [ ] Job Finder filters create LinkedIn search URLs.
- [ ] Mobile layout is usable.
- [ ] Public Gemini endpoints have abuse controls before wider launch.

## Planned Enhancements

- Upload and parse existing PDF/DOCX resumes.
- Save multiple tailored resume versions.
- Add account authentication and private cloud storage.
- Improve PDF pagination, accessibility, and template customization.
- Provide structured, evidence-linked resume suggestions.
- Add a licensed jobs data source if actual live vacancy cards are needed.
- Add API rate limiting, request logging policies, monitoring, and user-facing privacy controls.

## Contributing

This project is currently maintained as a learning and portfolio project. Contributions and feature requests can be discussed through repository issues once the repository is available. Do not include real resumes, API keys, or other personal information in public issues.

## License

No license has been selected yet. Unless a license is added, the repository is **not automatically open source** merely because it is hosted publicly. Add an appropriate `LICENSE` file if you intend to permit third-party reuse.

---

**CareerForge AI** — Build your resume. Understand your strengths. Discover your direction.