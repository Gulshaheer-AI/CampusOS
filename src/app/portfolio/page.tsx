"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import {
  getCurrentUser,
  getPortfolioProjects,
  togglePortfolioVisibility,
  savePortfolioProject,
  sanitizeWebUrl,
  getStudents,
} from "@/lib/store";
import { generateProjectZip } from "@/lib/zip-generator";
import { UserProfile, PortfolioProject } from "@/types";
import {
  UserCheck,
  Globe,
  Github,
  Eye,
  EyeOff,
  Share2,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Plus,
  Shield,
  Layers,
  FileArchive,
  Download,
  UploadCloud,
  X,
  AlertCircle,
  FileCode,
  Check,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

function PortfolioContent() {
  const searchParams = useSearchParams();
  const studentParam = searchParams.get("student");

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [shareCopied, setShareCopied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRecruiterView, setIsRecruiterView] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newDemoUrl, setNewDemoUrl] = useState("");
  const [newGithubUrl, setNewGithubUrl] = useState("");

  // ZIP upload state
  const [uploadedZip, setUploadedZip] = useState<{
    name: string;
    size: number;
    dataUrl?: string;
  } | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const active = getCurrentUser();
    setCurrentUser(active);

    const allStudents = [active, ...getStudents()];

    if (studentParam) {
      const match = allStudents.find((s) => s.id === studentParam);
      if (match) {
        setViewedUser(match);
        const userProjects = getPortfolioProjects(match.id);
        if (match.id !== active.id) {
          setIsRecruiterView(true);
          setProjects(userProjects.filter((p) => p.isPublic));
        } else {
          setIsRecruiterView(false);
          setProjects(userProjects);
        }
        return;
      }
    }

    setViewedUser(active);
    setIsRecruiterView(false);
    setProjects(getPortfolioProjects(active.id));
  }, [studentParam]);

  const handleToggle = (projectId: string) => {
    if (isRecruiterView) return;
    togglePortfolioVisibility(projectId);
    if (viewedUser) {
      setProjects(getPortfolioProjects(viewedUser.id));
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(
        `${window.location.origin}/portfolio?student=${viewedUser?.id}`,
      );
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZipError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !file.name.endsWith(".zip") &&
      !file.name.endsWith(".tar.gz") &&
      !file.name.endsWith(".rar")
    ) {
      setZipError(
        "Please select a valid archive file (.zip, .tar.gz, or .rar).",
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setZipError("ZIP archive exceeds maximum size limit of 50 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedZip({
        name: file.name,
        size: file.size,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !viewedUser) return;

    const tags = newTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const sanitizedDemo = sanitizeWebUrl(newDemoUrl);
    const sanitizedGithub = sanitizeWebUrl(newGithubUrl);

    const project: PortfolioProject = {
      id: `proj-${Date.now()}`,
      userId: viewedUser.id,
      title: newTitle.trim(),
      description: newDesc.trim() || "Independent engineering project.",
      tags: tags.length > 0 ? tags : ["Software Engineering"],
      demoUrl: sanitizedDemo,
      githubUrl: sanitizedGithub,
      zipFileName: uploadedZip?.name,
      zipFileSize: uploadedZip?.size,
      zipFileUrl: uploadedZip?.dataUrl,
      isPublic: true,
      verified: false,
      completedAt: new Date().toISOString().slice(0, 10),
    };

    savePortfolioProject(project);
    setProjects(getPortfolioProjects(viewedUser.id));
    setShowAddModal(false);

    // Reset form
    setNewTitle("");
    setNewDesc("");
    setNewTags("");
    setNewDemoUrl("");
    setNewGithubUrl("");
    setUploadedZip(null);
    setZipError(null);
  };

  const handleDownloadProjectZip = (proj: PortfolioProject) => {
    if (
      proj.zipFileUrl &&
      proj.zipFileUrl.startsWith("data:application/zip;base64,")
    ) {
      const anchor = document.createElement("a");
      anchor.href = proj.zipFileUrl;
      anchor.download =
        proj.zipFileName ||
        `${proj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } else {
      // Generate genuine, extractable ZIP archive dynamically
      const blob = generateProjectZip(proj);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        proj.zipFileName ||
        `${proj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-codebase.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "ZIP Codebase";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!viewedUser) return null;

  return (
    <div className="space-y-5">
      {/* Main Hero Banner - Royal Purple Clay Card */}
      <div className="section-heading">

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              {isRecruiterView
                ? `${viewedUser.name}'s Portfolio`
                : "Portfolio"}
            </h1>
            <p className="mt-1 text-sm text-purple-100 font-medium">Share your projects and experience.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!isRecruiterView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="border-white/40 text-white hover:bg-white/15 font-bold rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1.5 text-emerald-300" />
                Add Project
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleCopyShareLink}
              className="clay-button-white bg-white text-brand-purple hover:bg-purple-50 font-semibold rounded-xl shadow-md border-none"
            >
              <Share2 className="w-4 h-4 mr-1.5 text-brand-purple" />
              {shareCopied ? "Link Copied!" : "Share Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL: ADD MANUAL PROJECT */}
      {showAddModal && !isRecruiterView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 my-8 text-slate-900">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                Add Project to Portfolio
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine"
                  className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief summary of architectural decisions and results..."
                  className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Technologies / Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. TypeScript, Next.js, Raft, Docker"
                  className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                />
              </div>

              {/* Sanitized Web URL inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Website / Demo URL
                  </label>
                  <input
                    type="text"
                    value={newDemoUrl}
                    onChange={(e) => setNewDemoUrl(e.target.value)}
                    placeholder="e.g. myproject.vercel.app"
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                  />
                  {newDemoUrl && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Preview: {sanitizeWebUrl(newDemoUrl)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={newGithubUrl}
                    onChange={(e) => setNewGithubUrl(e.target.value)}
                    placeholder="e.g. github.com/username/repo"
                    className="w-full bg-slate-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-slate-950 font-medium focus:outline-none focus:border-brand-purple"
                  />
                  {newGithubUrl && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Preview: {sanitizeWebUrl(newGithubUrl)}
                    </p>
                  )}
                </div>
              </div>

              {/* ZIP Archive Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Upload Project Archive (.zip)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-purple-200 hover:border-brand-purple rounded-xl p-4 text-center cursor-pointer transition-colors bg-purple-50/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,.tar.gz,.rar"
                    onChange={handleZipFileChange}
                    className="hidden"
                  />
                  {uploadedZip ? (
                    <div className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-2.5 shadow-sm">
                      <div className="flex items-center gap-2 text-left truncate mr-2">
                        <FileArchive className="w-4 h-4 text-amber-500 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {uploadedZip.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {formatFileSize(uploadedZip.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedZip(null);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-6 h-6 text-brand-purple mx-auto" />
                      <p className="text-xs text-slate-800 font-semibold">
                        Click to attach codebase ZIP archive
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Supports .zip, .tar.gz up to 50 MB
                      </p>
                    </div>
                  )}
                </div>
                {zipError && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {zipError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-100">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  className="font-bold shadow-md"
                >
                  Publish Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Card Header */}
      <div className="rounded-2xl border border-purple-100 bg-white shadow-none p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#153e25] to-[#9B88F7] flex items-center justify-center text-white text-2xl font-semibold shadow-md shrink-0">
            {viewedUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-slate-950">
                {viewedUser.name}
              </h2>
              <Badge variant="purple" className="text-[10px]">
                Verified Student
              </Badge>
              {isRecruiterView && (
                <Badge variant="mint" className="text-[10px]">
                  Recruiter Ready
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-brand-purple font-bold">
              {viewedUser.degree} • {viewedUser.department}
            </p>
            <p className="text-xs text-slate-600 font-medium max-w-2xl mt-1 leading-relaxed">
              {viewedUser.bio}
            </p>
          </div>

          {isRecruiterView && (
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1 shrink-0">
              <span className="font-bold text-brand-purple block">
                Candidate Information:
              </span>
              <p className="text-slate-700 font-medium">{viewedUser.email}</p>
              <Link
                href="/cv"
                className="text-brand-purple font-bold hover:underline inline-flex items-center gap-1 mt-1"
              >
                <Briefcase className="w-3.5 h-3.5" />
                View Regional CV
              </Link>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-purple-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-500 mr-2">
            Verified Skills:
          </span>
          {viewedUser.interests.map((skill, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-brand-purple font-mono text-xs font-bold"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-purple" />
            Verified Portfolio Projects ({projects.length})
          </h3>
          <span className="text-xs text-brand-purple font-bold">
            {projects.filter((p) => p.isPublic).length} Publicly Visible
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className={cn(
                "bg-white border border-purple-100 shadow-none flex flex-col justify-between hover:border-purple-300 transition-all rounded-2xl",
                !proj.isPublic && "opacity-75 border-dashed",
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {proj.verified && (
                      <Badge
                        variant="tag10"
                        className="text-[10px] flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                    <Badge
                      variant="tag2"
                      className="text-[10px] flex items-center gap-1"
                    >
                      <FileArchive className="w-3 h-3" />
                      ZIP Source
                    </Badge>
                    {!proj.isPublic && (
                      <Badge variant="outline">Private Draft</Badge>
                    )}
                  </div>

                  {!isRecruiterView && (
                    <button
                      type="button"
                      onClick={() => handleToggle(proj.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-purple hover:bg-purple-50 transition-colors"
                      title={proj.isPublic ? "Make Private" : "Make Public"}
                      aria-label="Toggle project visibility"
                    >
                      {proj.isPublic ? (
                        <Eye className="w-4 h-4 text-brand-purple" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>

                <CardTitle className="text-lg font-semibold text-slate-950">
                  {proj.title}
                </CardTitle>
                <CardDescription className="line-clamp-1 text-xs text-slate-600 font-medium leading-relaxed mt-1">
                  {proj.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {proj.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-purple-50 border border-purple-100 text-brand-purple text-[10px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* ZIP Archive Download Action */}
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-800 truncate mr-2 font-medium">
                    <FileArchive className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate text-[11px] font-mono">
                      {proj.zipFileName ||
                        `${proj.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.zip`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadProjectZip(proj)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-purple-300 text-brand-purple text-[11px] font-bold hover:bg-purple-50 transition-colors shrink-0 shadow-sm"
                    title="Download verifiable codebase ZIP archive"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-purple" />
                    Download ZIP
                  </button>
                </div>

                {/* Links Row */}
                <div className="flex items-center justify-between pt-2 border-t border-purple-100 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono font-medium">
                    Completed: {proj.completedAt}
                  </span>

                  <div className="flex items-center gap-2">
                    {proj.githubUrl && (
                      <a
                        href={sanitizeWebUrl(proj.githubUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-brand-purple p-1 transition-colors"
                        title="View GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a
                        href={sanitizeWebUrl(proj.demoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-purple hover:text-purple-700 p-1 transition-colors"
                        title="View Live Demo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Privacy Note */}
      <div className="p-4 rounded-2xl border border-purple-100 bg-white shadow-none flex items-start gap-3 text-xs text-slate-700 font-medium">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Portfolio Privacy Guarantee:</strong> Only projects explicitly
          marked as public are accessible to outside visitors. Your course
          grades, raw quiz attempts, personal tutor chats, and contact
          information are kept strictly private.
        </span>
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="p-8 text-center text-brand-purple font-bold">
            Loading Portfolio...
          </div>
        }
      >
        <PortfolioContent />
      </Suspense>
    </AppShell>
  );
}
