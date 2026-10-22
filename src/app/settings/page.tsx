"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { getCurrentUser, setCurrentUser, resetToDemoData } from "@/lib/store";
import { UserProfile } from "@/types";
import { userProfileSchema } from "@/lib/validators";
import {
  User,
  Settings,
  Bell,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [learningPace, setLearningPace] = useState<"casual" | "regular" | "intensive">("regular");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [interestsText, setInterestsText] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    setUser(current);
    setName(current.name);
    setEmail(current.email);
    setDegree(current.degree || "");
    setDepartment(current.department || "");
    setBio(current.bio || "");
    setLearningPace(current.learningPace);
    setEmailNotifications(current.emailNotifications);
    setInterestsText(current.interests.join(", "));
  }, []);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);

    const interests = interestsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const result = userProfileSchema.safeParse({
      name,
      email,
      degree,
      department,
      bio,
      interests,
      learningPace,
      emailNotifications,
      themePreference: user.themePreference,
    });

    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    const updatedUser: UserProfile = {
      ...user,
      name,
      email,
      degree,
      department,
      bio,
      interests,
      learningPace,
      emailNotifications,
    };

    setCurrentUser(updatedUser);
    setUser(updatedUser);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    resetToDemoData();
    window.location.href = "/";
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-6 sm:p-8 relative overflow-hidden text-white shadow-xl rounded-3xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/15 px-3 py-0.5 rounded-full mb-2">
              User Profile
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Account &amp; Preferences
            </h1>
            <p className="mt-1 text-sm text-purple-100 font-medium">
              Manage your personal academic identity, notification channels, and privacy settings.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-800 text-sm flex items-center gap-2 font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Your profile and preferences were updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 text-rose-800 text-sm flex items-center gap-2 font-bold shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Card */}
          <Card className="border-2 border-purple-100 bg-white shadow-clay rounded-3xl text-slate-900">
            <CardHeader className="border-b border-purple-50 pb-4">
              <CardTitle className="text-lg font-black text-brand-purple flex items-center gap-2">
                <User className="w-5 h-5 text-brand-purple" />
                Academic Identity
              </CardTitle>
              <CardDescription className="text-xs text-slate-600 font-medium">
                Information displayed across your courses, peer challenges, and public portfolio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-name" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="user-email" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-degree" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Degree / Program
                  </label>
                  <input
                    id="user-degree"
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.S. in Computer Science (3rd Year)"
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="user-dept" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Department / College
                  </label>
                  <input
                    id="user-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user-bio" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Academic Bio / Statement
                </label>
                <textarea
                  id="user-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your technical interests and career aspirations..."
                  className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner resize-y font-medium"
                />
              </div>

              <div>
                <label htmlFor="user-interests" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Technical Interests (comma-separated)
                </label>
                <input
                  id="user-interests"
                  type="text"
                  value={interestsText}
                  onChange={(e) => setInterestsText(e.target.value)}
                  placeholder="Algorithms, Next.js, Distributed Systems, ML"
                  className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card className="border-2 border-purple-100 bg-white shadow-clay rounded-3xl text-slate-900">
            <CardHeader className="border-b border-purple-50 pb-4">
              <CardTitle className="text-lg font-black text-brand-purple flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand-purple" />
                Learning &amp; Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-pace" className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Study Pace Target
                  </label>
                  <select
                    id="user-pace"
                    value={learningPace}
                    onChange={(e) => setLearningPace(e.target.value as any)}
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  >
                    <option value="casual">Casual (3-5 hours/week)</option>
                    <option value="regular">Regular (8-12 hours/week)</option>
                    <option value="intensive">Intensive (15-20+ hours/week)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="notifs"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-purple bg-white border-2 border-purple-200 focus:ring-brand-purple"
                  />
                  <label htmlFor="notifs" className="text-sm text-slate-700 font-semibold select-none">
                    Receive weekly digest &amp; deadline alerts
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="submit" size="md" className="clay-button-primary bg-[#6653E6] text-white font-black px-6 py-2.5 rounded-xl shadow-md border-none">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>

        {/* Danger Zone: Account Deletion */}
        <Card className="border-2 border-rose-200 bg-rose-50/40 rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black text-rose-700 flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-600" />
              Data Reset &amp; Account Deletion
            </CardTitle>
            <CardDescription className="text-rose-600/80 font-medium">
              Permanent removal of all personal attempts, notes, and local workspace sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-600 font-medium max-w-md">
              Resetting local data will wipe any saved custom quizzes, challenge submissions, and
              restore pristine default fixtures for Alex Chen, Prof. Vance, and Jordan Taylor.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteConfirmOpen(true)}
              className="font-bold rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset All Workspace Data
            </Button>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-950 text-center">Are you absolutely sure?</h3>
              <p className="text-xs text-slate-600 text-center leading-relaxed font-medium">
                This action will erase all custom attempts, saved conversation history, and local changes.
                Demo data will be freshly reseeded.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)} className="rounded-xl font-bold">
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleDeleteAccount} className="rounded-xl font-bold">
                  Confirm Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
