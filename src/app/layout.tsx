import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusOS | From Classroom to Career",
  description:
    "AI-powered university student empowerment platform connecting interactive learning, concept exploration, coding playground, automated quiz generation, skill roadmaps, and career opportunities.",
  keywords: [
    "CampusOS",
    "EdTech",
    "AI Tutor",
    "CodePlay",
    "QuizForge",
    "Interactive Learning",
    "Skill Roadmaps",
    "Student Portfolio",
  ],
  authors: [{ name: "CampusOS Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06100b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="campus-theme min-h-screen antialiased">{children}</body>
    </html>
  );
}
