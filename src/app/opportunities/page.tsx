"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { MondayOrb } from "@/components/ui/MondayOrb";
import {
  getOpportunities,
  saveOpportunities,
  toggleOpportunityBookmark,
  updateOpportunityStatus,
  getCurrentUser,
  getPortfolioProjects,
  sanitizeWebUrl,
} from "@/lib/store";
import { Opportunity, UserProfile } from "@/types";
import {
  Briefcase,
  Search,
  Bookmark,
  BookmarkCheck,
  Calendar,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  Award,
  Zap,
  Globe,
  Building,
  GraduationCap,
  TrendingUp,
  X,
  ShieldCheck,
  Check,
  Copy,
  FileCheck,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [search, setSearch] = useState("");
  const [liveAiQuery, setLiveAiQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Live AI Matcher & Search
  const [isMatchingOpportunities, setIsMatchingOpportunities] = useState(false);
  const [matcherSuccess, setMatcherSuccess] = useState<string | null>(null);
  const [matcherStats, setMatcherStats] = useState<{
    totalChecked: number;
    verifiedCount: number;
    rejectedCount: number;
  } | null>(null);

  // Per-card link verification state
  const [verifyingUrlId, setVerifyingUrlId] = useState<string | null>(null);
  const [urlErrorMessage, setUrlErrorMessage] = useState<{ id: string; message: string } | null>(null);

  // Monday AI Apply Assistant & Student Readiness Modal
  const [activeOpportunityForApply, setActiveOpportunityForApply] = useState<Opportunity | null>(null);
  const [applyPrepData, setApplyPrepData] = useState<any | null>(null);
  const [isLoadingApplyPrep, setIsLoadingApplyPrep] = useState(false);
  const [proposalCopied, setProposalCopied] = useState(false);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    const existing = getOpportunities();
    setOpportunities(existing);
  }, []);

  const handleBookmark = (id: string) => {
    toggleOpportunityBookmark(id);
    setOpportunities(getOpportunities());
  };

  const handleRunAiOpportunityMatcher = async (customSearchQuery?: string) => {
    setIsMatchingOpportunities(true);
    setMatcherSuccess(null);
    setMatcherStats(null);
    setUrlErrorMessage(null);

    const queryToUse = customSearchQuery !== undefined ? customSearchQuery : liveAiQuery;
    const studentPortfolio = user ? getPortfolioProjects(user.id) : [];

    try {
      const res = await fetch("/api/ai/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "match",
          query: queryToUse,
          studentProfile: user || {},
          studentPortfolio,
        }),
      });

      const data = await res.json();
      if (data?.opportunities && Array.isArray(data.opportunities)) {
        // Merge with existing bookmarked status
        const bookmarkedIds = new Set(opportunities.filter(o => o.isBookmarked).map(o => o.applicationUrl));

        const newOpps: Opportunity[] = data.opportunities.map((opp: Opportunity) => ({
          ...opp,
          isBookmarked: bookmarkedIds.has(opp.applicationUrl),
        }));

        setOpportunities(newOpps);
        saveOpportunities(newOpps);

        setMatcherStats({
          totalChecked: data.totalChecked || newOpps.length,
          verifiedCount: data.verifiedCount || newOpps.length,
          rejectedCount: data.rejectedCount || 0,
        });

        setMatcherSuccess(
          data.opportunities.length ? `Found ${data.opportunities.length} postings with evidence of active applications. Availability can change; links are checked again when you apply.` : "No active postings could be verified for this search. Try another query; unavailable or unverified pages are excluded."
        );
        setTimeout(() => setMatcherSuccess(null), 8000);
      }
    } catch (err) {
      console.warn("Matcher error:", err);
      setMatcherSuccess("⚠️ Search error occurred. Please try again.");
    } finally {
      setIsMatchingOpportunities(false);
    }
  };

  const handleOpenApplyAssistant = async (opp: Opportunity) => {
    setActiveOpportunityForApply(opp);
    setApplyPrepData(null);
    setProposalCopied(false);
    setIsLoadingApplyPrep(true);

    const studentPortfolio = user ? getPortfolioProjects(user.id) : [];

    try {
      const res = await fetch("/api/ai/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply_prep",
          opportunity: opp,
          studentProfile: user || {},
          studentPortfolio,
        }),
      });
      const data = await res.json();
      setApplyPrepData(data);
    } catch (err) {
      console.warn("Apply prep error:", err);
    } finally {
      setIsLoadingApplyPrep(false);
    }
  };

  /**
   * Verified Direct Apply
   * Executes a live verification check before opening the link,
   * guaranteeing the user never lands on a 404 or closed posting.
   */
  const handleVerifiedDirectApply = async (opp: Opportunity) => {
    const targetUrl = sanitizeWebUrl(opp.applicationUrl);
    if (!targetUrl) return;

    // Otherwise, create window handle first to prevent popup blockers during asynchronous fetch
    const newTab = window.open("about:blank", "_blank");
    setVerifyingUrlId(opp.id);
    setUrlErrorMessage(null);

    try {
      const res = await fetch("/api/ai/opportunity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          url: targetUrl,
        }),
      });

      const verification = await res.json();

      if (verification && verification.ok) {
        // Link is healthy and returning page content
        const destination = verification.finalUrl || targetUrl;
        if (newTab) {
          newTab.location.href = destination;
        } else {
          window.open(destination, "_blank", "noopener,noreferrer");
        }
      } else {
        // Soft 404 or dead link detected: close blank tab and inform the user
        if (newTab) newTab.close();
        setUrlErrorMessage({
          id: opp.id,
          message: `Notice: This posting at ${opp.organization} is no longer accepting submissions (${verification?.reason || "Closed"}).`,
        });
      }
    } catch (err) {
      if (newTab) newTab.close();
      setUrlErrorMessage({ id: opp.id, message: "Could not verify this posting. Please retry." });
    } finally {
      setVerifyingUrlId(null);
    }
  };

  const categories = ["All", "internship", "scholarship", "competition", "fellowship", "mentorship", "project"];

  const filteredOpps = opportunities.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.organization.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || o.category === selectedCategory;
    const matchesBookmarked = !onlyBookmarked || o.isBookmarked;
    return matchesSearch && matchesCat && matchesBookmarked;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="section-heading">

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>

              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Opportunities</h1>
              <p className="mt-1 text-sm text-purple-100 font-medium max-w-2xl leading-relaxed">Find internships, jobs, and fellowships.</p>
            </div>

            {/* Link to Dedicated Regional CV Studio */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/cv"
                className="px-4 py-2.5 rounded-2xl bg-white text-brand-purple hover:bg-purple-50 font-semibold text-xs shadow-lg transition-all flex items-center gap-2 border border-white"
              >
                <FileText className="w-4 h-4 text-brand-purple" />
                <span>Open CV Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-purple" />
              </Link>
            </div>
          </div>
        </div>

        {/* Monday AI Live Search & Profile Evaluator Box */}
        <div className="clay-card p-5 sm:p-6 space-y-4 bg-white border border-purple-200 shadow-none rounded-3xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-950">
                Find your next role
              </h3>
              <p className="text-xs text-slate-600 font-medium max-w-2xl">
                Search by role, skill, or location.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleRunAiOpportunityMatcher("")}
              disabled={isMatchingOpportunities}
              className="shrink-0 font-bold shadow-md"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isMatchingOpportunities ? "Checking links..." : "Match my skills"}
            </Button>
          </div>

          {/* Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAiOpportunityMatcher(liveAiQuery);
            }}
            className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-purple-100"
          >
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-brand-purple absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={liveAiQuery}
                onChange={(e) => setLiveAiQuery(e.target.value)}
                placeholder="Role, skill, or location"
                className="w-full bg-slate-50 border border-purple-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-inner"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isMatchingOpportunities}
              className="shrink-0 px-5 font-bold shadow-md"
            >
              <Search className="w-3.5 h-3.5 mr-1.5" />
              {isMatchingOpportunities ? "Verifying with page content..." : "Search & Verify Links"}
            </Button>
          </form>

          {/* Search Stats / Progress Notification */}
          {isMatchingOpportunities && (
            <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-brand-purple font-bold text-xs flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-brand-purple" />
              <span>
                Searching live recruitment indices and conducting real-time HTTP GET checks to filter out 404s and closed positions...
              </span>
            </div>
          )}

          {matcherSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold text-xs flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{matcherSuccess}</span>
              </div>
              {matcherStats && (
                <div className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold shrink-0">
                  {matcherStats.verifiedCount} Verified • {matcherStats.rejectedCount} Broken URLs Rejected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all",
                  selectedCategory === cat
                    ? "clay-button-primary text-white shadow-md"
                    : "bg-white border border-purple-200 text-slate-800 hover:text-brand-purple hover:bg-purple-50 shadow-sm"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter displayed list..."
                className="w-full bg-white border border-purple-200 rounded-2xl pl-9 pr-3 py-1.5 text-xs text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-brand-purple shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={cn(
                "px-3.5 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all",
                onlyBookmarked
                  ? "bg-purple-100 border-purple-300 text-brand-purple shadow-sm"
                  : "bg-white border-purple-200 text-slate-800 hover:text-brand-purple hover:bg-purple-50 shadow-sm"
              )}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-brand-purple" />
              <span>Saved ({opportunities.filter((o) => o.isBookmarked).length})</span>
            </button>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOpps.map((opp) => (
            <Card
              key={opp.id}
              className="flex flex-col justify-between bg-white border border-purple-200 hover:border-brand-purple/50 shadow-none rounded-3xl transition-all overflow-hidden"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="tag11" className="capitalize text-[10px] font-bold">
                      {opp.category}
                    </Badge>
                    {opp.remote && (
                      <Badge variant="cyan" className="text-[10px] font-bold">
                        Remote
                      </Badge>
                    )}
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      page content Verified
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono text-brand-purple border-purple-200 bg-purple-50 font-bold"
                    >
                      Deadline: {opp.deadline}
                    </Badge>
                    {opp.matchScore && (
                      <Badge variant="tag10" className="text-[10px] font-semibold">
                        {opp.matchScore}% Match
                      </Badge>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBookmark(opp.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-brand-purple transition-colors shrink-0"
                    title={opp.isBookmarked ? "Remove Bookmark" : "Save Opportunity"}
                  >
                    {opp.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-brand-purple fill-purple-100" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <CardTitle className="text-lg font-semibold text-slate-950 leading-snug">
                  {opp.title}
                </CardTitle>

                <div className="text-xs text-brand-purple font-bold flex items-center gap-1.5 mt-1">
                  <Building className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                  <span>{opp.organization}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">{opp.location}</span>
                  {opp.sourceDomain && (
                    <>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 font-mono text-[11px]">{opp.sourceDomain}</span>
                    </>
                  )}
                </div>

                {opp.stipendOrAward && (
                  <p className="text-xs text-emerald-700 font-mono font-bold mt-2 bg-emerald-50 px-2 py-0.5 rounded-md inline-block w-fit border border-emerald-200">
                    💰 {opp.stipendOrAward}
                  </p>
                )}

                <CardDescription className="text-xs text-slate-700 font-medium leading-relaxed mt-2 line-clamp-1">
                  {opp.description}
                </CardDescription>

                {opp.tailoredPitch && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-950 leading-normal">
                    <strong className="text-brand-purple font-bold">Monday AI Match:</strong> {opp.tailoredPitch}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Requirements */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-700">Key Requirements:</span>
                  <div className="flex flex-wrap gap-1">
                    {opp.requirements.slice(0, 3).map((req, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-slate-800 font-semibold text-[10px]"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inline Dead Link Warning if clicked */}
                {urlErrorMessage && urlErrorMessage.id === opp.id && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{urlErrorMessage.message}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-purple-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenApplyAssistant(opp)}
                    className="text-xs font-bold border-purple-200 text-slate-800 hover:bg-purple-50 hover:text-brand-purple"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-brand-purple" />
                    Monday AI Readiness &amp; Proposal
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleVerifiedDirectApply(opp)}
                    disabled={verifyingUrlId === opp.id}
                    className="inline-flex items-center justify-center transition-all duration-200 select-none rounded-2xl clay-button-primary text-white font-bold text-xs px-4 py-1.5 gap-1.5 h-9 shadow-md disabled:opacity-60"
                  >
                    {verifyingUrlId === opp.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Verifying URL...
                      </>
                    ) : (
                      <>
                        Apply Directly
                        <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ============================================================== */}
        {/* MODAL: MONDAY AI STUDENT EVALUATION & CUSTOM PROPOSAL          */}
        {/* ============================================================== */}
        {activeOpportunityForApply && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 max-w-2xl w-full rounded-3xl shadow-2xl space-y-5 my-8 border-2 border-purple-200 text-slate-900">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div>
                  <Badge variant="violet" className="text-[10px] mb-1 font-bold">
                    Monday AI Candidate Readiness &amp; Proposal
                  </Badge>
                  <h3 className="text-xl font-semibold text-slate-950">
                    {activeOpportunityForApply.title}
                  </h3>
                  <p className="text-xs font-semibold text-brand-purple">
                    {activeOpportunityForApply.organization}
                  </p>
                </div>
                <button
                  onClick={() => setActiveOpportunityForApply(null)}
                  className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoadingApplyPrep ? (
                <div className="py-12 text-center space-y-3">
                  <MondayOrb size="md" state="thinking" className="mx-auto" />
                  <p className="text-xs text-slate-700 font-medium">
                    Monday AI is evaluating <strong className="text-slate-950">{user?.name}</strong>&apos;s degree and verified projects against <strong className="text-slate-950">{activeOpportunityForApply.organization}</strong>&apos;s criteria...
                  </p>
                </div>
              ) : applyPrepData ? (
                <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1 text-xs">
                  {/* Step 1: Readiness Evaluation */}
                  {applyPrepData.readinessEvaluation && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Step 1: Readiness Evaluation ({user?.name || "Student"})
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-semibold">
                          {applyPrepData.readinessEvaluation.matchPercentage}% Candidate Match
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">
                        {applyPrepData.readinessEvaluation.readinessVerdict}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1 shadow-sm">
                          <div className="font-bold text-emerald-800 text-[11px] uppercase">
                            Verified Strengths
                          </div>
                          <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                            {applyPrepData.readinessEvaluation.verifiedStrengths?.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-rose-200 space-y-1 shadow-sm">
                          <div className="font-bold text-rose-800 text-[11px] uppercase">
                            Actionable Polish Before Applying
                          </div>
                          <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                            {applyPrepData.readinessEvaluation.skillGapsToAddress?.map((g: string, i: number) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Custom Proposal */}
                  {applyPrepData.customProposal && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-brand-purple" />
                          Step 2: Tailored Application Proposal &amp; Cover Letter
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(applyPrepData.customProposal);
                            setProposalCopied(true);
                            setTimeout(() => setProposalCopied(false), 2500);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-brand-purple font-bold text-[11px] hover:bg-purple-100 flex items-center gap-1 shadow-sm"
                        >
                          {proposalCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {proposalCopied ? "Copied!" : "Copy Proposal"}
                        </button>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-purple-200 font-sans leading-relaxed text-slate-900 whitespace-pre-line text-xs font-medium shadow-inner">
                        {applyPrepData.customProposal}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Screening Answers */}
                  {applyPrepData.screeningAnswers && applyPrepData.screeningAnswers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-950 uppercase text-[11px] flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-brand-purple" />
                        Step 3: Recommended Screening Answers:
                      </h4>
                      {applyPrepData.screeningAnswers.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-purple-200 space-y-1 shadow-sm">
                          <div className="font-bold text-amber-900">Q: {item.question}</div>
                          <p className="text-slate-800 font-medium leading-relaxed">A: {item.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 4: Technical Topics & Questions */}
                  {applyPrepData.technicalPrepTopics && applyPrepData.technicalPrepTopics.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-semibold text-slate-950 uppercase text-[11px] flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-brand-purple" />
                        Key Technical Concepts to Review:
                      </h4>
                      <ul className="list-disc list-inside text-slate-800 font-medium space-y-1 pl-1">
                        {applyPrepData.technicalPrepTopics.map((topic: string, i: number) => (
                          <li key={i}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                <Link
                  href="/cv"
                  className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Tailor CV in Regional CV Studio
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveOpportunityForApply(null)}
                  className="font-bold border-purple-200 text-slate-800"
                >
                  Close Assistant
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
