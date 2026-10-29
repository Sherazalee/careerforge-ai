
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerForge AI | Smart Resume Builder",
  description:
    "Build, optimize and customize professional resumes with Gemini AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}