
export type WorkMode =
  | "any"
  | "remote"
  | "hybrid"
  | "onsite";

export type ExperienceLevel =
  | "any"
  | "internship"
  | "entry"
  | "associate"
  | "mid"
  | "director"
  | "executive";

export type DatePosted =
  | "any"
  | "day"
  | "week"
  | "month";

export type JobFilters = {
  keyword: string;
  location: string;
  workMode: WorkMode;
  experience: ExperienceLevel;
  datePosted: DatePosted;
};

const workCodes: Record<WorkMode, string> = {
  any: "",
  onsite: "1",
  remote: "2",
  hybrid: "3",
};

const experienceCodes: Record<
  ExperienceLevel,
  string
> = {
  any: "",
  internship: "1",
  entry: "2",
  associate: "3",
  mid: "4",
  director: "5",
  executive: "6",
};

const dateCodes: Record<DatePosted, string> = {
  any: "",
  day: "r86400",
  week: "r604800",
  month: "r2592000",
};

export function buildLinkedInURL(
  filters: JobFilters
): string {
  const url = new URL(
    "https://www.linkedin.com/jobs/search/"
  );

  url.searchParams.set(
    "keywords",
    filters.keyword.trim()
  );

  if (filters.location.trim()) {
    url.searchParams.set(
      "location",
      filters.location.trim()
    );
  }

  const work = workCodes[filters.workMode];
  const experience = experienceCodes[filters.experience];
  const date = dateCodes[filters.datePosted];

  if (work) url.searchParams.set("f_WT", work);

  if (experience) {
    url.searchParams.set("f_E", experience);
  }

  if (date) url.searchParams.set("f_TPR", date);

  url.searchParams.set("sortBy", "R");

  return url.toString();
}