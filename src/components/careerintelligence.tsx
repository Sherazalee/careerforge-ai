
"use client";

import { useState } from "react";
import {
  Sparkles,
  Target,
  Compass,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Loader2,
  ShieldCheck,
  ArrowRight,
  BriefcaseBusiness,
  Search,
  RotateCcw,
} from "lucide-react";

import type { Resume } from "../lib/resume";

type Mode = "evaluate" | "roles";

type Evaluation = {
  score: number;
  verdict: string;
  overview: string;
  categories: {
    name: string;
    score: number;
  }[];
  strengths: string[];
  gaps: string[];
  suggestions: {
    title: string;
    reason: string;
    example: string;
  }[];
};

type CareerRole = {
  title: string;
  fit: "Strong Match" | "Possible Match" | "Stretch Role";
  reason: string;
  keywords: string[];
  nextStep: string;
};

type RoleAdvice = {
  profile: string;
  roles: CareerRole[];
  advice: string;
};

type Props = {
  resume: Resume;
  initialMode?: Mode;
  hideModeSwitcher?: boolean;
};

export default function CareerIntelligence({
  resume,
  initialMode = "evaluate",
  hideModeSwitcher = false,
}: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [job, setJob] = useState("");
  const [skills, setSkills] = useState("");
  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);
  const [advice, setAdvice] = useState<RoleAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [evaluatedJob, setEvaluatedJob] = useState("");

  async function runAnalysis() {
    setError("");
    setEvaluation(null);
    setAdvice(null);

    if (mode === "evaluate" && !job.trim()) {
      setError("Please paste your target job description.");
      return;
    }

    if (mode === "roles" && !skills.trim()) {
      setError("Please describe your skills and experience.");
      return;
    }

    setLoading(true);

    try {
      const resumeText = [
        `Name: ${resume.name}`,
        `Title: ${resume.title}`,
        `Summary: ${resume.summary}`,
        `Experience: ${resume.experience}`,
        `Education: ${resume.education}`,
        `Skills: ${resume.skills}`,
        `Projects: ${resume.projects}`,
      ].join("\n\n");

      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          resume: resumeText,
          job,
          skills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Evaluation failed."
        );
      }

      if (mode === "evaluate") {
        setEvaluation(data.result as Evaluation);
        setEvaluatedJob(job);
      } else {
        setAdvice(data.result as RoleAdvice);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to contact the AI service."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-[#E6E0D6] bg-[#FCFBF8] px-5 py-4 text-sm leading-7 text-[#28282C] outline-none focus:border-[#B59A70] focus:ring-2 focus:ring-[#F0E8DA]";

  return (
    <section className="no-print rounded-3xl border border-[#E8E1D6] bg-white p-6 shadow-sm md:p-9">
      <div className="mb-8 flex items-start gap-4">
        <div className="rounded-2xl bg-[#F0E6D7] p-4 text-[#997A4D]">
          <Sparkles size={25} />
        </div>

        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#A18760]">
            CareerForge Intelligence
          </p>
          <h3 className="text-xl font-extrabold">
            AI Career Intelligence
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#827A71]">
            Evaluate your resume or discover career
            opportunities based on your skills.
          </p>
        </div>
      </div>

      {/* Feature selection */}
      {!hideModeSwitcher && (
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => {
            setMode("evaluate");
            setError("");
          }}
          className={`rounded-2xl border p-5 text-left transition ${
            mode === "evaluate"
              ? "border-[#B59A70] bg-[#FAF5EC]"
              : "border-[#E9E4DC] hover:bg-[#FAF9F6]"
          }`}
        >
          <Target
            size={22}
            className="mb-3 text-[#9C7A4D]"
          />
          <p className="text-sm font-extrabold">
            Resume Evaluator
          </p>
          <p className="mt-1 text-xs leading-5 text-[#847D74]">
            Evaluate suitability for a job.
          </p>
        </button>

        <button
          onClick={() => {
            setMode("roles");
            setError("");
          }}
          className={`rounded-2xl border p-5 text-left transition ${
            mode === "roles"
              ? "border-[#B59A70] bg-[#FAF5EC]"
              : "border-[#E9E4DC] hover:bg-[#FAF9F6]"
          }`}
        >
          <Compass
            size={22}
            className="mb-3 text-[#9C7A4D]"
          />
          <p className="text-sm font-extrabold">
            Career Role Advisor
          </p>
          <p className="mt-1 text-xs leading-5 text-[#847D74]">
            Discover roles suited to your abilities.
          </p>
        </button>
      </div>
      )}

      {mode === "evaluate" ? (
        <div>
          <label
            htmlFor="evaluation-job"
            className="mb-3 block text-sm font-bold"
          >
            Target Job Description
          </label>

          <textarea
            id="evaluation-job"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            rows={7}
            maxLength={14000}
            placeholder="Paste the job advertisement, including responsibilities and requirements..."
            className={inputClass}
          />

          <p className="mt-3 text-xs leading-5 text-[#8D857B]">
            CareerForge will compare this job with
            your current resume information.
          </p>
        </div>
      ) : (
        <div>
          <label
            htmlFor="career-skills"
            className="mb-3 block text-sm font-bold"
          >
            Describe What You Can Do
          </label>

          <textarea
            id="career-skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            rows={7}
            maxLength={10000}
            placeholder="Example: I optimize WordPress websites, use Google PageSpeed Insights, improve Core Web Vitals, fix technical SEO issues, and work with Google Search Console..."
            className={inputClass}
          />

          <p className="mt-3 text-xs leading-5 text-[#8D857B]">
            Mention tools, tasks, projects and how
            much experience you have. We will also
            consider your resume information.
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        disabled={loading}
        onClick={runAnalysis}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#24252C] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#49364B] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : mode === "evaluate" ? (
          <Target size={18} />
        ) : (
          <Compass size={18} />
        )}
        {loading
          ? "Analyzing with Gemini..."
          : mode === "evaluate"
            ? "Evaluate My Resume"
            : "Discover Suitable Career Roles"}
        {!loading && <ArrowRight size={17} />}
      </button>

      {/* AI disclaimer */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E8DFD1] bg-[#FBF8F2] p-4">
        <ShieldCheck
          size={19}
          className="mt-0.5 shrink-0 text-[#95774C]"
        />
        <div>
          <p className="text-xs font-bold">
            AI Advisory Notice
          </p>
          <p className="mt-1 text-xs leading-6 text-[#777066]">
            These results are AI-generated recommendations,
            not compulsory verdicts. Scores are estimates,
            not official ATS ratings or hiring predictions.
            Use your judgement when making career decisions.
          </p>
        </div>
      </div>

      {/* Resume evaluation result */}
      {mode === "evaluate" && evaluation && (
        <div className="mt-9 space-y-7">
          <div className="rounded-3xl border border-[#E8E0D5] bg-[#FAF7F1] p-6">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-widest text-[#9D825B]">
              Resume Evaluation Result
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="relative h-32 w-32 shrink-0">
                <svg
                  viewBox="0 0 120 120"
                  className="h-full w-full"
                  role="img"
                  aria-label={`Estimated alignment score: ${evaluation.score} out of 100`}
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="49"
                    fill="none"
                    stroke="#E8E0D5"
                    strokeWidth="11"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="49"
                    fill="none"
                    stroke="#B18B57"
                    strokeWidth="11"
                    strokeLinecap="round"
                    strokeDasharray={`${
                      (evaluation.score / 100) * 307.88
                    } 307.88`}
                    transform="rotate(-90 60 60)"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">
                    {Math.round(evaluation.score)}
                  </span>
                  <span className="text-xs text-[#81786E]">
                    / 100
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xl font-extrabold">
                  {evaluation.verdict}
                </h4>
                <p className="mt-3 text-sm leading-7 text-[#70695F]">
                  {evaluation.overview}
                </p>
              </div>
            </div>

            <p className="mt-5 text-[11px] leading-5 text-[#8D8375]">
              Evaluated against the job description
              provided. This is an AI-estimated alignment
              score, not an official ATS score.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-base font-extrabold">
              Evaluation Breakdown
            </h4>

            <div className="space-y-5">
              {evaluation.categories.map((category, index) => (
                <div key={`${category.name}-${index}`}>
                  <div className="mb-2 flex justify-between gap-3 text-xs">
                    <span className="font-semibold">
                      {category.name}
                    </span>
                    <span className="font-bold">
                      {Math.round(category.score)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-[#EBE5DD]">
                    <div
                      className="h-full rounded-full bg-[#B18B57]"
                      style={{
                        width: `${category.score}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-extrabold">
              <CheckCircle2
                size={19}
                className="text-emerald-600"
              />
              Demonstrated Strengths
            </h4>

            <div className="space-y-3">
              {evaluation.strengths.map((strength, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"
                >
                  {strength}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-extrabold">
              <AlertCircle
                size={19}
                className="text-amber-600"
              />
              Missing or Unclear Evidence
            </h4>

            <div className="space-y-3">
              {evaluation.gaps.map((gap, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"
                >
                  {gap}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 flex items-center gap-2 font-extrabold">
              <Lightbulb
                size={19}
                className="text-[#9A784A]"
              />
              Recommended Improvements
            </h4>

            <div className="space-y-4">
              {evaluation.suggestions.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#EAE3D9] bg-white p-5"
                >
                  <h5 className="font-bold">{item.title}</h5>
                  <p className="mt-2 text-sm leading-6 text-[#797168]">
                    {item.reason}
                  </p>
                  {item.example && (
                    <div className="mt-3 rounded-xl bg-[#F8F5EF] p-3 text-xs leading-6 text-[#554B40]">
                      {item.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setEvaluation(null);
              setError("");
            }}
            className="flex items-center gap-2 rounded-xl border border-[#DCD0BE] px-5 py-3 text-sm font-bold hover:bg-[#FAF7F1]"
          >
            <RotateCcw size={16} />
            Re-evaluate After Editing
          </button>
          <p className="text-xs text-[#8D857B]">
            Evaluation based on a snapshot of your resume
            and the job description at the time of analysis.
            {evaluatedJob !== job
              ? " The job description has since changed."
              : ""}
          </p>
        </div>
      )}

      {/* Career advisor result */}
      {mode === "roles" && advice && (
        <div className="mt-9 space-y-6">
          <div className="rounded-2xl bg-[#F8F4EC] p-5">
            <h4 className="font-extrabold">
              Your Professional Profile
            </h4>
            <p className="mt-3 text-sm leading-7 text-[#746C62]">
              {advice.profile}
            </p>
          </div>

          <h4 className="text-lg font-extrabold">
            Recommended Career Paths
          </h4>

          {advice.roles.map((role, index) => (
            <div
              key={`${role.title}-${index}`}
              className="rounded-2xl border border-[#E8E0D5] p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h5 className="flex items-center gap-2 font-extrabold">
                  <BriefcaseBusiness
                    size={18}
                    className="text-[#9C7A4D]"
                  />
                  {role.title}
                </h5>

                <span className="rounded-full bg-[#F3EBDD] px-3 py-1.5 text-[11px] font-bold text-[#806038]">
                  {role.fit}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[#756D64]">
                {role.reason}
              </p>

              <p className="mt-4 text-xs font-bold">
                Useful Search Keywords
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {role.keywords.map((keyword, i) => (
                  <span
                    key={`${keyword}-${i}`}
                    className="rounded-lg bg-[#F8F5EF] px-3 py-1.5 text-xs text-[#645A4E]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="mt-4 rounded-xl bg-[#F8F5EF] p-4">
                <p className="text-xs font-bold">
                  Suggested Next Step
                </p>
                <p className="mt-2 text-xs leading-6 text-[#71685D]">
                  {role.nextStep}
                </p>
              </div>

              <a
                href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#84623B] hover:underline"
              >
                <Search size={15} />
                Search this role on LinkedIn
                <ArrowRight size={14} />
              </a>
            </div>
          ))}

          <div className="rounded-2xl bg-[#F8F4EC] p-5">
            <h4 className="font-extrabold">
              Career Development Advice
            </h4>
            <p className="mt-3 text-sm leading-7 text-[#746C62]">
              {advice.advice}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}