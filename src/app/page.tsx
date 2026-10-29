"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  Sparkles,
  WandSparkles,
  Loader2,
  Check,
  X,
  RotateCcw,
  CheckCircle2,
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  Code2,
  Target,
  Compass,
  Save,
  LayoutTemplate,
  Search,
} from "lucide-react";

import { initialResume, type Resume } from "../lib/resume";
import ResumePreview, {
  type TemplateType,
} from "../components/resumepreview";
import CareerIntelligence from "../components/careerintelligence";
import JobFinder from "../components/jobfinder";

// These import paths retain the lowercase filenames in your uploaded file.

type Workspace = "builder" | "evaluator" | "advisor" | "jobs";
type Section = "personal" | "experience" | "education" | "skills";
type Tone = "professional" | "confident" | "concise";

type PendingEdit = {
  field: keyof Resume;
  original: string;
  proposed: string;
};

const workspaces = [
  { id: "builder", label: "Resume Builder", icon: FileText },
  { id: "evaluator", label: "Resume Evaluator", icon: Target },
  { id: "advisor", label: "Career Role Advisor", icon: Compass },
  { id: "jobs", label: "AI Job Finder", icon: Search },
] as const;

const sections = [
  { id: "personal", label: "Personal", icon: UserRound },
  { id: "experience", label: "Experience", icon: BriefcaseBusiness },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills & Projects", icon: Code2 },
] as const;

const fields: Record<
  Section,
  {
    key: keyof Resume;
    label: string;
    multiline?: boolean;
    ai?: boolean;
  }[]
> = {
  personal: [
    { key: "name", label: "Full Name" },
    { key: "title", label: "Professional Title" },
    { key: "email", label: "Email Address" },
    { key: "phone", label: "Phone Number" },
    { key: "location", label: "Location" },
    {
      key: "summary",
      label: "Professional Summary",
      multiline: true,
      ai: true,
    },
  ],
  experience: [
    {
      key: "experience",
      label: "Work Experience",
      multiline: true,
      ai: true,
    },
  ],
  education: [
    {
      key: "education",
      label: "Education",
      multiline: true,
      ai: true,
    },
  ],
  skills: [
    {
      key: "skills",
      label: "Skills (comma separated)",
      multiline: true,
      ai: true,
    },
    {
      key: "projects",
      label: "Projects",
      multiline: true,
      ai: true,
    },
  ],
};

const templates: {
  id: TemplateType;
  label: string;
  background: string;
}[] = [
  { id: "executive", label: "Executive", background: "#FFFFFF" },
  { id: "atelier", label: "Atelier", background: "#F9F6F0" },
  { id: "signature", label: "Signature", background: "#25262D" },
  { id: "minimal", label: "Minimal", background: "#F0EDF0" },
];

const pageTitle: Record<Workspace, string> = {
  builder: "Build your professional story.",
  evaluator: "Evaluate your job readiness.",
  advisor: "Discover your career direction.",
  jobs: "Find your next opportunity.",
};

const pageDescription: Record<Workspace, string> = {
  builder:
    "Edit your resume, enhance sections with AI, and preview your professional document.",
  evaluator:
    "Evaluate your resume against a target job and receive AI-powered recommendations.",
  advisor:
    "Discover job titles and career opportunities that align with your skills and experience.",
  jobs:
    "Find suitable job roles using Gemini and search LinkedIn with your preferred filters.",
};

export default function Home() {
  const [workspace, setWorkspace] = useState<Workspace>("builder");
  const [section, setSection] = useState<Section>("personal");
  const [resume, setResume] = useState<Resume>(initialResume);
  const [template, setTemplate] = useState<TemplateType>("executive");

  const [ready, setReady] = useState(false);
  const [busyField, setBusyField] = useState<keyof Resume | null>(null);
  const [pending, setPending] = useState<PendingEdit | null>(null);
  const [tone, setTone] = useState<Tone>("professional");

  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Load the saved resume and selected template.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("careerforge_resume");
      const selected = localStorage.getItem("careerforge_template");

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          const values = parsed as Record<string, unknown>;
          const safe = { ...initialResume };

          for (const key of Object.keys(initialResume) as (keyof Resume)[]) {
            const value = values[key];

            if (typeof value === "string") {
              safe[key] = value;
            }
          }

          setResume(safe);
        }
      }

      if (
        selected === "executive" ||
        selected === "atelier" ||
        selected === "signature" ||
        selected === "minimal"
      ) {
        setTemplate(selected);
      }
    } catch {
      // Continue with sample data when storage is unavailable.
    }

    setReady(true);
  }, []);

  // Save changes after the initial storage load.
  useEffect(() => {
    if (!ready) return;

    try {
      localStorage.setItem("careerforge_resume", JSON.stringify(resume));
      localStorage.setItem("careerforge_template", template);
    } catch {
      // Storage may be disabled or full.
    }
  }, [resume, template, ready]);

  function update(field: keyof Resume, value: string) {
    setResume((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPending((prev) => (prev?.field === field ? null : prev));
    setNotice("");
  }

  async function enhance(field: keyof Resume) {
    const original = resume[field];

    if (!original.trim()) {
      setError("Please add information before enhancing it.");
      return;
    }

    setError("");
    setNotice("");
    setPending(null);
    setBusyField(field);

    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field,
          content: original,
          tone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI enhancement failed.");
      }

      if (typeof data.result !== "string") {
        throw new Error("Unexpected Gemini response format.");
      }

      setPending({
        field,
        original,
        proposed: data.result,
      });

      setNotice("Gemini suggestion is ready for review.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to enhance this field."
      );
    } finally {
      setBusyField(null);
    }
  }

  function acceptSuggestion() {
    if (!pending) return;

    const { field, original, proposed } = pending;

    if (resume[field] !== original) {
      setError(
        "Your original text has changed. Please generate a new suggestion."
      );
      setPending(null);
      return;
    }

    setResume((prev) => ({
      ...prev,
      [field]: proposed,
    }));

    setPending(null);
    setNotice("Gemini suggestion applied successfully.");
  }

  function reset() {
    if (!window.confirm("Reset your current resume to the sample data?")) {
      return;
    }

    setResume({ ...initialResume });
    setPending(null);
    setError("");
    setNotice("Sample resume restored.");
  }

  // Generate a PDF on the server and download the returned file.
  async function downloadPDF() {
    if (exporting || !ready || workspace !== "builder") return;

    setExporting(true);
    setError("");
    setNotice("");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 90_000);

    try {
      const printableResume = document.querySelector<HTMLElement>(
        "main > .print-only-resume"
      );

      if (!printableResume) {
        throw new Error("The printable resume could not be found.");
      }

      const styles: string[] = [];

      // Copy compiled Tailwind and globals.css rules into the PDF request.
      for (const sheet of Array.from(document.styleSheets)) {
        if (sheet.disabled) continue;

        const media = sheet.media.mediaText;

        try {
          const rules = Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n");

          if (rules.trim()) {
            styles.push(
              media ? `@media ${media} {\n${rules}\n}` : rules
            );
          }
        } catch {
          throw new Error(
            "An application stylesheet could not be read. Keep the resume styles in your local globals.css file."
          );
        }
      }

      if (!styles.length) {
        throw new Error(
          "Resume styles have not loaded. Refresh the page and try again."
        );
      }

      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          html: printableResume.outerHTML,
          css: styles.join("\n"),
        }),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => null);

        const message =
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Unable to download the PDF. Check that the PDF export route is configured.";

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob.size || !blob.type.includes("application/pdf")) {
        throw new Error("The server did not return a valid PDF.");
      }

      const safeName =
        resume.name
          .trim()
          .replace(/[^a-zA-Z0-9_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 80) || "Resume";

      const objectUrl = URL.createObjectURL(blob);

      try {
        const link = document.createElement("a");

        link.href = objectUrl;
        link.download = `${safeName}-Resume.pdf`;

        document.body.appendChild(link);

        try {
          link.click();
        } finally {
          link.remove();
        }
      } finally {
        // Give the browser time to begin reading the download.
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }

      setNotice("Your PDF is ready to download.");
    } catch (err) {
      setError(
        err instanceof Error && err.name === "AbortError"
          ? "PDF generation took too long. Please try again."
          : err instanceof Error
            ? err.message
            : "Unable to export the resume."
      );
    } finally {
      window.clearTimeout(timeout);
      setExporting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#E7E1D8] bg-[#FCFBF8] px-4 py-3.5 text-sm leading-7 text-[#28282C] outline-none transition focus:border-[#A68A61] focus:ring-2 focus:ring-[#F1E9DD]";

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#25252B] print:min-h-0 print:bg-white">
      {/* HEADER */}
      <header className="no-print bg-[#1B1C22] text-white">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#C7A977] p-2.5 text-[#1B1C22]">
              <FileText size={22} />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                CareerForge <span className="text-[#C7A977]">AI</span>
              </h1>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Your Intelligent Career Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <CheckCircle2 size={15} className="text-[#C7A977]" />
              Saved locally
            </span>

            {workspace === "builder" && (
              <button
                type="button"
                onClick={downloadPDF}
                disabled={exporting || !ready}
                aria-busy={exporting}
                className="rounded-xl bg-[#C7A977] px-5 py-3 text-sm font-bold text-[#1B1C22] transition hover:bg-[#DDC391] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center gap-2">
                  {exporting ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Download size={17} />
                  )}

                  {exporting ? "Generating PDF..." : "Export PDF"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* WORKSPACE NAVIGATION */}
      <nav
        className="no-print border-b border-[#E6DFD5] bg-white"
        aria-label="CareerForge workspaces"
      >
        <div className="mx-auto flex max-w-[1700px] gap-2 overflow-x-auto px-5 py-3 lg:px-10">
          {workspaces.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setWorkspace(item.id);
                  setError("");
                  setNotice("");
                }}
                aria-current={workspace === item.id ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition ${
                  workspace === item.id
                    ? "bg-[#25262D] text-white"
                    : "text-[#756F67] hover:bg-[#F7F5F0]"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* SCREEN CONTENT */}
      <div className="no-print mx-auto max-w-[1700px] px-5 pb-14 pt-9 lg:px-10">
        <div className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#987A50]">
            CareerForge Workspace
          </p>

          <h2 className="text-3xl font-extrabold tracking-tight">
            {pageTitle[workspace]}
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#79736B]">
            {pageDescription[workspace]}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </div>
        )}

        {/* WORKSPACE 1: RESUME BUILDER */}
        {workspace === "builder" && (
          <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
            {/* RESUME EDITOR */}
            <section className="min-w-0 rounded-3xl border border-[#E8E1D7] bg-white p-5 shadow-sm md:p-8">
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold">Resume Editor</h3>

                  <p className="mt-1 text-xs text-[#817A72]">
                    Edit your information and enhance it with Gemini.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  className="flex items-center gap-2 rounded-lg border border-[#E7E1D8] px-3 py-2 text-xs font-bold hover:bg-[#F7F5F0]"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>

              {/* EDITOR SECTION TABS */}
              <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {sections.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setSection(item.id);
                        setPending(null);
                      }}
                      aria-pressed={section === item.id}
                      className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold transition ${
                        section === item.id
                          ? "bg-[#49364B] text-white"
                          : "bg-[#F6F3EE] text-[#716A63] hover:bg-[#EBE4D9]"
                      }`}
                    >
                      <Icon size={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* AI TONE */}
              <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F8F4EE] p-3">
                <span className="flex items-center gap-2 text-xs font-bold text-[#77654C]">
                  <Sparkles size={15} />
                  AI Writing Tone
                </span>

                <select
                  aria-label="AI writing tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="rounded-lg border border-[#DED4C6] bg-white px-3 py-2 text-xs font-semibold"
                >
                  <option value="professional">Professional</option>
                  <option value="confident">Confident</option>
                  <option value="concise">Concise</option>
                </select>
              </div>

              {/* EDITABLE FIELDS */}
              <div className="space-y-7">
                {fields[section].map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={field.key}
                      className="mb-2 block text-sm font-bold"
                    >
                      {field.label}
                    </label>

                    {field.multiline ? (
                      <textarea
                        id={field.key}
                        value={resume[field.key]}
                        rows={field.key === "experience" ? 11 : 6}
                        onChange={(e) => update(field.key, e.target.value)}
                        className={inputClass}
                      />
                    ) : (
                      <input
                        id={field.key}
                        type="text"
                        value={resume[field.key]}
                        onChange={(e) => update(field.key, e.target.value)}
                        className={inputClass}
                      />
                    )}

                    {field.ai && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => enhance(field.key)}
                          disabled={busyField !== null}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#DED0BE] bg-[#FAF5ED] px-4 py-2.5 text-xs font-bold text-[#795C37] transition hover:bg-[#F0E5D6] disabled:opacity-50"
                        >
                          {busyField === field.key ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <WandSparkles size={16} />
                          )}

                          {busyField === field.key
                            ? "Enhancing..."
                            : "Enhance with AI"}
                        </button>
                      </div>
                    )}

                    {pending?.field === field.key && (
                      <div className="mt-4 rounded-2xl border border-[#D8C6AA] bg-[#FFFCF7] p-5">
                        <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#795C37]">
                          <Sparkles size={17} />
                          Gemini Suggestion
                        </p>

                        <div className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm leading-7 text-[#4B453D]">
                          {pending.proposed}
                        </div>

                        <p className="mt-3 text-xs leading-5 text-[#81776A]">
                          Review this AI recommendation before applying it.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={acceptSuggestion}
                            className="flex items-center gap-2 rounded-xl bg-[#49364B] px-4 py-2.5 text-xs font-bold text-white"
                          >
                            <Check size={16} />
                            Apply Changes
                          </button>

                          <button
                            type="button"
                            onClick={() => setPending(null)}
                            className="flex items-center gap-2 rounded-xl border border-[#E0D6C8] bg-white px-4 py-2.5 text-xs font-bold"
                          >
                            <X size={16} />
                            Discard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-2 border-t border-[#EEE8E0] pt-5 text-xs text-[#8E857B]">
                <Save size={14} />
                Changes are automatically saved locally.
              </div>
            </section>

            {/* LIVE PREVIEW */}
            <section className="min-w-0 xl:sticky xl:top-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-extrabold">
                    <LayoutTemplate size={19} className="text-[#94744A]" />
                    Live Resume Preview
                  </h3>

                  <p className="mt-1 text-xs text-[#8E857B]">
                    Choose a resume template.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={downloadPDF}
                  disabled={exporting || !ready}
                  aria-busy={exporting}
                  className="flex items-center gap-2 rounded-xl bg-[#25262D] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {exporting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}

                  {exporting ? "Generating..." : "Download PDF"}
                </button>
              </div>

              {/* TEMPLATE SELECTOR */}
              <div className="mb-4 grid grid-cols-4 gap-2 rounded-2xl border border-[#E8E1D7] bg-white p-3">
                {templates.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setTemplate(item.id)}
                    aria-pressed={template === item.id}
                    className={`rounded-xl border p-2 transition ${
                      template === item.id
                        ? "border-[#B89A70] bg-[#F9F3E9]"
                        : "border-[#ECE7E0] hover:border-[#C7A977]"
                    }`}
                  >
                    <div
                      className="mb-2 flex h-14 items-center justify-center rounded-md"
                      style={{ backgroundColor: item.background }}
                    >
                      <div className="space-y-1">
                        <div className="h-1 w-8 bg-[#C7A977]" />
                        <div className="h-0.5 w-10 bg-[#B5ADA4]" />
                        <div className="h-0.5 w-7 bg-[#B5ADA4]" />
                      </div>
                    </div>

                    <p className="text-center text-[10px] font-bold">
                      {item.label}
                    </p>
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#E7E0D7] bg-white shadow-xl shadow-[#DCD6CD]/40">
                <ResumePreview resume={resume} template={template} />
              </div>
            </section>
          </div>
        )}

        {/* WORKSPACE 2: RESUME EVALUATOR */}
        {workspace === "evaluator" && (
          <div className="mx-auto max-w-[1050px]">
            <CareerIntelligence
              key="evaluator"
              resume={resume}
              initialMode="evaluate"
              hideModeSwitcher
            />
          </div>
        )}

        {/* WORKSPACE 3: CAREER ROLE ADVISOR */}
        {workspace === "advisor" && (
          <div className="mx-auto max-w-[1050px]">
            <CareerIntelligence
              key="advisor"
              resume={resume}
              initialMode="roles"
              hideModeSwitcher
            />
          </div>
        )}

        {/* WORKSPACE 4: AI JOB FINDER */}
        {workspace === "jobs" && (
          <div className="mx-auto max-w-[1400px]">
            <JobFinder resume={resume} />
          </div>
        )}
      </div>

      <footer className="no-print border-t border-[#E7E0D7] py-6 text-center text-xs text-[#91877A]">
        CareerForge AI · Intelligent Career Tools
      </footer>

      {/*
        Keep this directly under main.
        globals.css hides it on screen.
        downloadPDF sends this copy to the PDF generation route.
      */}
      {workspace === "builder" && (
        <div className="print-only-resume">
          <ResumePreview resume={resume} template={template} />
        </div>
      )}
    </main>
  );
}