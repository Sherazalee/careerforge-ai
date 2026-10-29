
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Sparkles,
  MapPin,
  Monitor,
  GraduationCap,
  Search,
  ExternalLink,
  Loader2,
  Target,
  ArrowRight,
  Compass,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  ShieldCheck,
} from "lucide-react";

import type { Resume } from "../lib/resume";
import {
  buildLinkedInURL,
  type WorkMode,
  type ExperienceLevel,
  type DatePosted,
  type JobFilters,
} from "../lib/jobsearch";

type SuggestedRole = {
  title: string;
  match: "Strong Match" | "Possible Match" | "Stretch Role";
  reason: string;
  searchKeywords: string[];
  improvement: string;
};

type AIResult = {
  profile: string;
  roles: SuggestedRole[];
  advice: string;
};

type Props = {
  resume: Resume;
  suggestedTitle?: string;
};

const inputClass =
  "w-full rounded-xl border border-[#E8E1D7] bg-[#FCFBF8] px-4 py-3.5 text-sm text-[#25252B] outline-none transition focus:border-[#B59A70] focus:ring-2 focus:ring-[#F1E8DA]";

const defaultFilters: JobFilters = {
  keyword: "",
  location: "",
  workMode: "any",
  experience: "any",
  datePosted: "week",
};

export default function JobFinder({
  resume,
  suggestedTitle,
}: Props) {
  const [filters, setFilters] =
    useState<JobFilters>(defaultFilters);

  const [interests, setInterests] = useState("");
  const [recommendations, setRecommendations] =
    useState<AIResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (suggestedTitle?.trim()) {
      setFilters((prev) => ({
        ...prev,
        keyword: suggestedTitle,
      }));
    }
  }, [suggestedTitle]);

  function update<K extends keyof JobFilters>(
    key: K,
    value: JobFilters[K]
  ) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCopied(false);
  }

  const searchURL = useMemo(
    () => buildLinkedInURL(filters),
    [filters]
  );

  function searchLinkedIn(title?: string) {
    const keyword = (title ?? filters.keyword).trim();

    if (!keyword) {
      setError("Please enter a target job title.");
      return;
    }

    setError("");

    const url = buildLinkedInURL({
      ...filters,
      keyword,
    });

    // Triggered by a direct user click.
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copySearchLink() {
    if (!filters.keyword.trim()) {
      setError("Enter a job title before copying a search link.");
      return;
    }

    try {
      await navigator.clipboard.writeText(searchURL);
      setCopied(true);
      setError("");
    } catch {
      setError(
        "Unable to copy. Try opening the LinkedIn search instead."
      );
    }
  }

  async function suggestRoles() {
    setError("");
    setRecommendations(null);

    const resumeText = [
      `Professional Title: ${resume.title}`,
      `Summary: ${resume.summary}`,
      `Experience: ${resume.experience}`,
      `Education: ${resume.education}`,
      `Skills: ${resume.skills}`,
      `Projects: ${resume.projects}`,
    ].join("\n\n");

    if (
      !resumeText.replace(
        /Professional Title:|Summary:|Experience:|Education:|Skills:|Projects:/g,
        ""
      ).trim() &&
      !interests.trim()
    ) {
      setError(
        "Add resume details or describe your career interests."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/job-finder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeText.slice(0, 14000),
          interests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to recommend job roles."
        );
      }

      if (
        !data.result ||
        !Array.isArray(data.result.roles)
      ) {
        throw new Error("Unexpected AI response.");
      }

      setRecommendations(data.result as AIResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to contact Gemini."
      );
    } finally {
      setLoading(false);
    }
  }

  function chooseRole(title: string) {
    update("keyword", title);

    document
      .getElementById("job-finder-search")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  const matchStyles: Record<
    SuggestedRole["match"],
    string
  > = {
    "Strong Match": "bg-emerald-50 text-emerald-800",
    "Possible Match": "bg-[#F6ECDD] text-[#82633B]",
    "Stretch Role": "bg-[#F1EAF1] text-[#604863]",
  };

  return (
    <section className="no-print space-y-8">
      {/* Intro */}
      <div className="rounded-3xl bg-[#25262D] p-7 text-white md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#D7BA8C]">
              <Sparkles size={16} />
              CareerForge Job Discovery
            </p>

            <h3 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Find your next opportunity.
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Discover relevant job titles using AI, refine
              your search preferences, and open matching
              LinkedIn job searches in one click.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-[#E6CC9F]">
            <BriefcaseBusiness size={32} />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200">
            AI role discovery
          </span>
          <span className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200">
            Smart search filters
          </span>
          <span className="rounded-full border border-white/15 px-4 py-2 text-xs text-slate-200">
            LinkedIn redirects
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Main two-column workspace */}
      <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Search panel */}
        <div
          id="job-finder-search"
          className="scroll-mt-6 rounded-3xl border border-[#E8E1D7] bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-7 flex items-start gap-3">
            <div className="rounded-xl bg-[#F2E8D9] p-3 text-[#967347]">
              <SlidersHorizontal size={22} />
            </div>

            <div>
              <h4 className="text-xl font-extrabold">
                Job Search Filters
              </h4>
              <p className="mt-2 text-sm text-[#80786F]">
                Customize your LinkedIn search.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="job-keyword"
                className="mb-2 flex items-center gap-2 text-sm font-bold"
              >
                <Search size={16} />
                Target Job Title
              </label>

              <input
                id="job-keyword"
                type="text"
                value={filters.keyword}
                onChange={(e) =>
                  update("keyword", e.target.value)
                }
                placeholder="e.g. Technical SEO Specialist"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="job-location"
                className="mb-2 flex items-center gap-2 text-sm font-bold"
              >
                <MapPin size={16} />
                Preferred Location
              </label>

              <input
                id="job-location"
                type="text"
                value={filters.location}
                onChange={(e) =>
                  update("location", e.target.value)
                }
                placeholder="e.g. London, United Kingdom"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="work-mode"
                className="mb-2 flex items-center gap-2 text-sm font-bold"
              >
                <Monitor size={16} />
                Work Arrangement
              </label>

              <select
                id="work-mode"
                value={filters.workMode}
                onChange={(e) =>
                  update(
                    "workMode",
                    e.target.value as WorkMode
                  )
                }
                className={inputClass}
              >
                <option value="any">Any arrangement</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="experience-level"
                className="mb-2 flex items-center gap-2 text-sm font-bold"
              >
                <GraduationCap size={16} />
                Experience Level
              </label>

              <select
                id="experience-level"
                value={filters.experience}
                onChange={(e) =>
                  update(
                    "experience",
                    e.target.value as ExperienceLevel
                  )
                }
                className={inputClass}
              >
                <option value="any">All experience levels</option>
                <option value="internship">Internship</option>
                <option value="entry">Entry level</option>
                <option value="associate">Associate</option>
                <option value="mid">Mid-Senior level</option>
                <option value="director">Director</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="date-posted"
                className="mb-2 block text-sm font-bold"
              >
                Date Posted
              </label>

              <select
                id="date-posted"
                value={filters.datePosted}
                onChange={(e) =>
                  update(
                    "datePosted",
                    e.target.value as DatePosted
                  )
                }
                className={inputClass}
              >
                <option value="any">Any time</option>
                <option value="day">Past 24 hours</option>
                <option value="week">Past week</option>
                <option value="month">Past month</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => searchLinkedIn()}
            disabled={!filters.keyword.trim()}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-[#49364B] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#352738] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search size={18} />
            Search Jobs on LinkedIn
            <ExternalLink size={15} />
          </button>

          <button
            onClick={copySearchLink}
            disabled={!filters.keyword.trim()}
            className="mt-3 w-full rounded-xl border border-[#E4DACD] bg-[#FAF8F4] px-5 py-3 text-xs font-bold text-[#715837] disabled:opacity-50"
          >
            {copied ? "Link Copied!" : "Copy Search Link"}
          </button>

          <p className="mt-5 text-xs leading-6 text-[#82796D]">
            This opens LinkedIn search results using your
            selected filters. It does not submit job applications.
            LinkedIn may require sign-in.
          </p>
        </div>

        {/* AI discovery panel */}
        <div className="rounded-3xl border border-[#E8E1D7] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7 flex items-start gap-3">
            <div className="rounded-xl bg-[#F2E8D9] p-3 text-[#967347]">
              <Compass size={22} />
            </div>

            <div>
              <h4 className="text-xl font-extrabold">
                AI Role Discovery
              </h4>
              <p className="mt-2 text-sm leading-6 text-[#80786F]">
                Let Gemini suggest positions based on
                your actual skills and experience.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#F8F5EF] p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-[#806440]">
              <CheckCircle2 size={16} />
              Resume Connected
            </p>

            <p className="text-sm font-bold">
              {resume.title || "Your professional profile"}
            </p>

            <p className="mt-2 text-xs leading-6 text-[#837A70]">
              Gemini will review the skills, experience,
              projects and education currently entered
              in your Resume Builder.
            </p>
          </div>

          <label
            htmlFor="career-interests"
            className="mt-6 mb-2 block text-sm font-bold"
          >
            Additional Interests or Career Goals
          </label>

          <textarea
            id="career-interests"
            rows={6}
            maxLength={3000}
            value={interests}
            onChange={(e) =>
              setInterests(e.target.value)
            }
            placeholder="Optional: I want to move into AI automation, technical SEO, data analytics, or web performance roles..."
            className={`${inputClass} leading-7`}
          />

          <button
            onClick={suggestRoles}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#25262D] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#49364B] disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Sparkles size={18} />
            )}

            {loading
              ? "Analyzing Career Profile..."
              : "Find Suitable Job Roles"}

            {!loading && <ArrowRight size={16} />}
          </button>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#FAF7F1] p-4">
            <ShieldCheck
              size={19}
              className="mt-0.5 shrink-0 text-[#97764A]"
            />
            <p className="text-xs leading-6 text-[#7A7166]">
              AI suggestions are advisory, not hiring
              decisions or guarantees. Review suggested
              roles against your actual qualifications.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendation results */}
      {recommendations && (
        <section className="space-y-6">
          <div className="rounded-3xl border border-[#E8E1D7] bg-white p-6 md:p-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#967347]">
              Gemini Career Insights
            </p>

            <h4 className="text-xl font-extrabold">
              Your Professional Profile
            </h4>

            <p className="mt-3 text-sm leading-7 text-[#756D64]">
              {recommendations.profile}
            </p>
          </div>

          <div>
            <h4 className="text-xl font-extrabold">
              Suggested Job Titles
            </h4>

            <p className="mt-2 text-sm text-[#81786F]">
              Explore these roles using your current
              search filters.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {recommendations.roles.map((role, index) => (
              <article
                key={`${role.title}-${index}`}
                className="rounded-3xl border border-[#E8E1D7] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="rounded-xl bg-[#F1E8DB] p-3 text-[#957348]">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${matchStyles[role.match]}`}
                  >
                    {role.match}
                  </span>
                </div>

                <h5 className="mt-5 text-xl font-extrabold">
                  {role.title}
                </h5>

                <p className="mt-3 text-sm leading-7 text-[#756D64]">
                  {role.reason}
                </p>

                <div className="mt-5">
                  <p className="mb-3 text-xs font-bold">
                    Search Keywords
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {role.searchKeywords.map((word, i) => (
                      <span
                        key={`${word}-${i}`}
                        className="rounded-lg bg-[#F8F5EF] px-3 py-2 text-xs text-[#6F6150]"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-[#FAF7F1] p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-bold">
                    <Target size={15} />
                    Suggested Improvement
                  </p>

                  <p className="text-xs leading-6 text-[#786E61]">
                    {role.improvement}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() =>
                      chooseRole(role.title)
                    }
                    className="rounded-xl border border-[#DFD4C5] px-4 py-3 text-xs font-bold text-[#765B38] hover:bg-[#FAF6EE]"
                  >
                    Use This Role
                  </button>

                  <button
                    onClick={() =>
                      searchLinkedIn(role.title)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#49364B] px-4 py-3 text-xs font-bold text-white hover:bg-[#352738]"
                  >
                    Open LinkedIn
                    <ExternalLink size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-[#E8E1D7] bg-[#FAF7F1] p-6">
            <h4 className="font-extrabold">
              Career Development Advice
            </h4>

            <p className="mt-3 text-sm leading-7 text-[#756D64]">
              {recommendations.advice}
            </p>
          </div>
        </section>
      )}

      {/* Important limitation */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#E8E1D7] bg-white p-5">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0 text-[#9B7D51]"
        />

        <p className="text-xs leading-6 text-[#81786F]">
          CareerForge currently recommends search terms
          and redirects to LinkedIn. It does not retrieve,
          verify, or rank live vacancies. The results
          displayed by LinkedIn may differ from the
          selected filters or require authentication.
        </p>
      </div>
    </section>
  );
}