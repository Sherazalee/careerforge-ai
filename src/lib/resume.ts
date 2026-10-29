
export type Resume = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
};

export const initialResume: Resume = {
  name: "Alex Morgan",
  title: "Full Stack Developer",
  email: "alex@example.com",
  phone: "+1 555 010 2020",
  location: "New York, USA",
  summary:
    "Full stack developer experienced in building web applications using React, Next.js, Node.js and modern development tools.",
  experience:
    "Software Developer | Tech Studio | 2023 - Present\nBuilt responsive web applications using React and Next.js.\nWorked with backend APIs and databases.\n\nJunior Developer | Digital Labs | 2021 - 2023\nDeveloped reusable interface components.\nCollaborated with designers and developers.",
  education:
    "Bachelor of Science in Computer Science\nState University | 2021",
  skills:
    "JavaScript, TypeScript, React, Next.js, Node.js, Python, SQL, Git, REST APIs",
  projects:
    "AI Chatbot — Developed a conversational chatbot using an AI API.\nPortfolio Website — Built a responsive developer portfolio.",
};