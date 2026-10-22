"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { contactFormSchema, ContactFormData } from "@/lib/validators";
import { Mail, CheckCircle2, AlertCircle, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    role: "student",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    // Simulate API submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Persist to local inquiry log if running in browser
      if (typeof window !== "undefined") {
        try {
          const inquiries = JSON.parse(localStorage.getItem("campusos_inquiries") || "[]");
          inquiries.push({ ...result.data, timestamp: new Date().toISOString() });
          localStorage.setItem("campusos_inquiries", JSON.stringify(inquiries));
        } catch {
          // ignore storage error
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Hero Banner - Royal Purple Clay Card */}
        <div className="clay-card-purple p-8 sm:p-14 relative overflow-hidden text-white shadow-xl rounded-3xl mb-12 text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-400/20 blur-[70px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-200 bg-white/15 px-3 py-1 rounded-full mb-3">
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Contact the CampusOS Team
            </h1>
            <p className="mt-3 text-sm sm:text-base text-purple-100 font-medium">
              Have questions about course integration, feedback on the learning tools, or bug reports?
              We&apos;d love to hear from you.
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-10 shadow-clay">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Message Sent Successfully</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto font-medium">
                Thank you, <strong className="text-slate-900">{formData.name}</strong>. We received your note regarding{" "}
                <em className="text-brand-purple font-semibold">&quot;{formData.subject}&quot;</em> and our academic support team will reply to{" "}
                <strong className="text-slate-900">{formData.email}</strong> shortly.
              </p>
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="border-2 border-purple-200 text-brand-purple font-bold hover:bg-purple-50"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      name: "",
                      email: "",
                      role: "student",
                      subject: "",
                      message: "",
                    });
                  }}
                >
                  Send Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Chen"
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    University or Personal Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. alex.chen@university.edu"
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Primary Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  >
                    <option value="student">University Student</option>
                    <option value="teacher">Instructor / Faculty</option>
                    <option value="other">Institutional IT / Administrator</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Subject *
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Question about CS101 quiz generation"
                    className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner font-medium"
                  />
                  {errors.subject && (
                    <p className="mt-1.5 text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need help with, report a bug, or suggest a new feature or roadmap..."
                  className="w-full bg-white border-2 border-purple-100 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-200 transition-colors shadow-inner resize-y font-medium"
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-rose-500 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" size="lg" isLoading={isSubmitting} className="clay-button-primary bg-[#6653E6] text-white font-black px-8 py-3 rounded-2xl shadow-lg border-none">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Inquiry
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
