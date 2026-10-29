
import type { Resume } from "../lib/resume";

export type TemplateType =
  | "executive"
  | "atelier"
  | "signature"
  | "minimal";

type Props = {
  resume: Resume;
  template: TemplateType;
};

function Section({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  if (!content.trim()) return null;

  return (
    <section className="resume-section mb-6">
      <h2 className="resume-heading mb-3 text-[11px] font-bold uppercase tracking-[0.18em]">
        {title}
      </h2>
      <div className="whitespace-pre-wrap break-words text-[11px] leading-[1.8]">
        {content}
      </div>
    </section>
  );
}

function Skills({ value }: { value: string }) {
  const skills = value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (!skills.length) return null;

  return (
    <section className="resume-section mb-6">
      <h2 className="resume-heading mb-3 text-[11px] font-bold uppercase tracking-[0.18em]">
        Core Skills
      </h2>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className="resume-skill">
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}

function Contact({ resume }: { resume: Resume }) {
  return (
    <p className="mt-3 break-words text-[10px] leading-5 opacity-75">
      {[resume.email, resume.phone, resume.location]
        .filter(Boolean)
        .join("  •  ")}
    </p>
  );
}

function MainSections({ resume }: { resume: Resume }) {
  return (
    <>
      <Section title="Profile" content={resume.summary} />
      <Section
        title="Professional Experience"
        content={resume.experience}
      />
      <Section title="Education" content={resume.education} />
      <Skills value={resume.skills} />
      <Section title="Projects" content={resume.projects} />
    </>
  );
}

export default function ResumePreview({
  resume,
  template,
}: Props) {
  const name = resume.name || "Your Name";
  const title = resume.title || "Professional Title";

  if (template === "signature") {
    return (
      <article className="resume-document resume-signature bg-white text-slate-800">
        <div className="grid min-h-[850px] grid-cols-[34%_66%]">
          <aside className="resume-sidebar bg-[#222329] px-5 py-10 text-white sm:px-7">
            <div className="mb-10 h-1 w-10 bg-[#C7A977]" />

            <h1 className="break-words text-2xl font-bold leading-tight">
              {name}
            </h1>

            <p className="mt-4 text-xs leading-6 text-[#D9C6A8]">
              {title}
            </p>

            <div className="my-9 h-px bg-white/20" />

            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#D9C6A8]">
              Contact
            </h2>

            <div className="space-y-3 break-words text-[10px] leading-5 text-slate-200">
              <p>{resume.email}</p>
              <p>{resume.phone}</p>
              <p>{resume.location}</p>
            </div>

            <div className="mt-10">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[#D9C6A8]">
                Skills
              </h2>

              <div className="space-y-2 text-[10px] leading-5">
                {resume.skills
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .map((skill, index) => (
                    <p key={index}>{skill}</p>
                  ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0 px-6 py-10 sm:px-9">
            <Section title="Profile" content={resume.summary} />
            <Section
              title="Experience"
              content={resume.experience}
            />
            <Section
              title="Education"
              content={resume.education}
            />
            <Section title="Projects" content={resume.projects} />
          </div>
        </div>
      </article>
    );
  }

  if (template === "atelier") {
    return (
      <article className="resume-document resume-atelier min-h-[850px] bg-[#F9F6F0] px-7 py-10 text-[#39352F] sm:px-11">
        <div className="mb-10 border-b border-[#BCAC96] pb-9">
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-[#927960]">
            Curriculum Vitae
          </p>

          <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            {name}
          </h1>

          <p className="mt-4 text-xs uppercase tracking-[0.17em] text-[#8D7158]">
            {title}
          </p>

          <Contact resume={resume} />
        </div>

        <div className="resume-content">
          <MainSections resume={resume} />
        </div>
      </article>
    );
  }

  if (template === "executive") {
    return (
      <article className="resume-document resume-executive min-h-[850px] bg-white px-7 py-10 text-[#252525] sm:px-11">
        <header className="mb-8 border-b-2 border-[#252525] pb-6 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-wide">
            {name}
          </h1>

          <p className="mt-2 text-xs font-medium uppercase tracking-widest">
            {title}
          </p>

          <Contact resume={resume} />
        </header>

        <MainSections resume={resume} />
      </article>
    );
  }

  return (
    <article className="resume-document resume-minimal min-h-[850px] bg-white px-7 py-10 text-slate-800 sm:px-11">
      <header className="mb-10">
        <div className="mb-6 h-1 w-12 bg-[#49364B]" />

        <h1 className="text-4xl font-extrabold tracking-[-0.05em]">
          {name}
        </h1>

        <p className="mt-3 text-sm font-medium text-[#725B71]">
          {title}
        </p>

        <Contact resume={resume} />
      </header>

      <MainSections resume={resume} />
    </article>
  );
}