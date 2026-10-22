"use client";

import React, { useState } from "react";
import { CvData, CvTemplate } from "@/types";
import {
  Award,
  Globe,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Layers,
  FileText,
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
  Bold,
  Italic,
  Underline,
  Sparkles,
  Check,
  Briefcase,
  GraduationCap,
  FolderGit2,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadCvDocx } from "@/lib/docx-generator";
import { downloadCvPdf } from "@/lib/pdf-generator";

interface RegionalCvPreviewProps {
  cvData: CvData;
  template: CvTemplate;
  onChange?: (updated: CvData) => void;
  editable?: boolean;
}

/**
 * Inline Editable Text Component (Word-like direct typing on page)
 */
function EditableText({
  value,
  onChange,
  className = "",
  placeholder = "Click to edit...",
  multiline = false,
  tag = "span",
}: {
  value?: string;
  onChange?: (val: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  tag?: "span" | "h1" | "h2" | "h3" | "p" | "div";
}) {
  const [localVal, setLocalVal] = useState(value || "");

  React.useEffect(() => {
    setLocalVal(value || "");
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const text = (e.currentTarget.textContent || "").trim();
    setLocalVal(text);
    if (onChange && text !== value) {
      onChange(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  };

  const Tag = tag;

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        "outline-none rounded transition-all cursor-text min-w-[20px] inline-block",
        "hover:bg-purple-50/80 hover:ring-1 hover:ring-brand-purple/40",
        "focus:bg-purple-50 focus:ring-2 focus:ring-brand-purple focus:text-slate-950",
        "print:hover:bg-transparent print:focus:bg-transparent print:ring-0 print:border-none",
        !localVal && "text-slate-400 italic print:hidden",
        className
      )}
      title="Click to edit like Microsoft Word"
    >
      {localVal || placeholder}
    </Tag>
  );
}

// Smart category & skill sanitizers to prevent "Technical Competencies:" duplication
function formatSkillCategory(category: string, items: string[] = []): string {
  if (category && category !== "Technical Competencies") return category;
  const combined = items.join(" ").toLowerCase();
  if (combined.includes("wordpress") || combined.includes("theme") || combined.includes("plugin")) return "WordPress & Web Development";
  if (combined.includes("seo") || combined.includes("keyword") || combined.includes("search console")) return "SEO & Digital Marketing";
  if (combined.includes("commerce") || combined.includes("shopify") || combined.includes("product page")) return "E-commerce Solutions";
  if (combined.includes("automation") || combined.includes("n8n") || combined.includes("zapier") || combined.includes("webhook")) return "Automation & Integration";
  if (combined.includes("database") || combined.includes("sql") || combined.includes("mysql") || combined.includes("python")) return "Databases & Development";
  if (combined.includes("git") || combined.includes("github") || combined.includes("version")) return "Version Control & Collaboration";
  if (combined.includes("analytics") || combined.includes("ga4") || combined.includes("looker")) return "Analytics & Reporting";
  return category || "Specialized Stacks";
}

function cleanSkillItems(items: string[] = []): string[] {
  return items.map((it) => {
    return it
      .replace(/^(wordpress & web|seo & marketing|e-commerce|automation|databases & development|version control|analytics)\s*/i, "")
      .trim();
  }).filter(Boolean);
}

function sanitizeExperience(
  experience: Array<{ company: string; role: string; period: string; bullets: string[] }> = []
) {
  return experience.map((exp) => {
    let cleanCompany = exp.company;
    if (!cleanCompany || cleanCompany === "Technology Organization" || /organization/i.test(cleanCompany)) {
      cleanCompany = exp.role.toLowerCase().includes("wordpress") ? "SublimeTechs Software House" : "Self-Employed / Freelance";
    }
    let cleanRole = exp.role;
    if (cleanRole.includes("•") && cleanRole.length > 30) {
      cleanRole = cleanCompany.toLowerCase().includes("sublimetechs") ? "WordPress Developer" : "SEO & Web Specialist";
    }
    const cleanBullets = (exp.bullets || []).filter(
      (b) => !/^(sublimetechs software house|self-employed|freelance|technology organization)$/i.test(b.trim())
    );
    return {
      ...exp,
      company: cleanCompany,
      role: cleanRole,
      bullets: cleanBullets.length > 0 ? cleanBullets : exp.bullets,
    };
  });
}

export function RegionalCvPreview({
  cvData,
  template,
  onChange,
  editable = true,
}: RegionalCvPreviewProps) {
  const [savedNotification, setSavedNotification] = useState(false);

  // Template layout determination
  const isExecutiveCorporate = template.id === "executive-corporate";
  const isModernTech = template.id === "modern-tech-ats" || template.id === "us-silicon-valley";
  const isEuEuropass = template.id === "eu-europass" || template.region === "european";
  const isPkHecPec =
    template.id === "pk-hec-pec" ||
    (template.region === "pakistani" && !isExecutiveCorporate);
  const isUsHarvard =
    template.id === "us-harvard-ats" ||
    (template.region === "us" && !isModernTech);

  // Ensure languages and certifications are never empty if present in profile or certs
  const effectiveLanguages = (cvData.languages && cvData.languages.length > 0)
    ? cvData.languages
    : (cvData.certifications || [])
        .filter((c) => /(german|english|urdu|french|spanish|arabic|punjabi|ielts|toefl)/i.test(c))
        .map((c) => {
          const langMatch = c.match(/\b(german|english|urdu|french|spanish|arabic|punjabi)\b/i);
          const lang = langMatch ? langMatch[1].charAt(0).toUpperCase() + langMatch[1].slice(1).toLowerCase() : "English";
          const cefrMatch = c.match(/\b([ABC][12])\b/i);
          return {
            language: lang,
            proficiency: c.includes(":") ? c.split(":")[1].trim() : c,
            cefrLevel: cefrMatch ? cefrMatch[1].toUpperCase() : undefined,
          };
        });

  const effectiveCertifications = (cvData.certifications && cvData.certifications.length > 0)
    ? cvData.certifications
    : [
        ...(cvData.languages || []).filter((l) => /(certificate|certified|ielts|toefl)/i.test(l.proficiency)).map((l) => `${l.language}: ${l.proficiency}`),
        ...(cvData.title?.includes("WordPress") ? ["WordPress Development: Certificate of Completion — SublimeTechs Software House"] : []),
      ];

  const effectiveSkills = (cvData.skills && cvData.skills.length > 0)
    ? cvData.skills.map((sk) => ({
        category: formatSkillCategory(sk.category, sk.items),
        items: cleanSkillItems(sk.items),
      }))
    : [];

  const effectiveExperience = (cvData.experience && cvData.experience.length > 0)
    ? sanitizeExperience(cvData.experience)
    : [];

  const sanitizedPec =
    cvData.pecRegistrationNumber &&
    /\d{3,}/.test(cvData.pecRegistrationNumber) &&
    !/ialist|specialist/i.test(cvData.pecRegistrationNumber)
      ? cvData.pecRegistrationNumber
      : undefined;

  const sanitizedEducation = (cvData.education || []).map((edu) => {
    let cleanHigh = edu.highlights;
    if (cleanHigh && /(?:languages|certifications|project experience|additional information)/i.test(cleanHigh)) {
      cleanHigh = cleanHigh.includes("Currently Enrolled") ? "Currently Enrolled" : undefined;
    }
    return {
      ...edu,
      highlights: cleanHigh,
    };
  });

  const sanitizedExportData: CvData = {
    ...cvData,
    pecRegistrationNumber: sanitizedPec,
    education: sanitizedEducation,
    skills: effectiveSkills,
    experience: effectiveExperience,
    languages: effectiveLanguages,
    certifications: effectiveCertifications,
  };

  // State mutation helpers
  const updateField = (field: keyof CvData, val: any) => {
    if (!onChange) return;
    onChange({
      ...cvData,
      [field]: val,
    });
  };

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, text: string) => {
    if (!onChange) return;
    const newExp = [...effectiveExperience];
    if (!newExp[expIndex]) return;
    const newBullets = [...newExp[expIndex].bullets];
    newBullets[bulletIndex] = text;
    newExp[expIndex] = { ...newExp[expIndex], bullets: newBullets };
    updateField("experience", newExp);
  };

  const addExperienceBullet = (expIndex: number) => {
    if (!onChange) return;
    const newExp = [...effectiveExperience];
    if (!newExp[expIndex]) return;
    newExp[expIndex] = {
      ...newExp[expIndex],
      bullets: [...newExp[expIndex].bullets, "New measurable achievement (e.g. Optimized throughput by 35%)."],
    };
    updateField("experience", newExp);
  };

  const removeExperienceBullet = (expIndex: number, bulletIndex: number) => {
    if (!onChange) return;
    const newExp = [...effectiveExperience];
    if (!newExp[expIndex]) return;
    const newBullets = newExp[expIndex].bullets.filter((_, idx) => idx !== bulletIndex);
    newExp[expIndex] = { ...newExp[expIndex], bullets: newBullets };
    updateField("experience", newExp);
  };

  const addExperienceEntry = () => {
    if (!onChange) return;
    const current = effectiveExperience;
    const newEntry = {
      company: "Technology Labs",
      role: "Specialist / Developer",
      period: "2024 - Present",
      bullets: ["Architected and delivered client solutions with measurable impact."],
    };
    updateField("experience", [newEntry, ...current]);
  };

  const removeExperienceEntry = (expIndex: number) => {
    if (!onChange) return;
    const newExp = effectiveExperience.filter((_, idx) => idx !== expIndex);
    updateField("experience", newExp);
  };

  const updateProjectBullet = (projIndex: number, bulletIndex: number, text: string) => {
    if (!onChange || !cvData.projects) return;
    const newProj = [...cvData.projects];
    const newBullets = [...newProj[projIndex].bullets];
    newBullets[bulletIndex] = text;
    newProj[projIndex] = { ...newProj[projIndex], bullets: newBullets };
    updateField("projects", newProj);
  };

  const addProjectBullet = (projIndex: number) => {
    if (!onChange || !cvData.projects) return;
    const newProj = [...cvData.projects];
    newProj[projIndex] = {
      ...newProj[projIndex],
      bullets: [...newProj[projIndex].bullets, "Implemented core deliverable feature."],
    };
    updateField("projects", newProj);
  };

  const addProjectEntry = () => {
    if (!onChange) return;
    const current = cvData.projects || [];
    const newEntry = {
      name: "Client Solution Architecture",
      tools: "WordPress, n8n, MySQL, React",
      link: "https://github.com/project",
      bullets: ["Engineered low-latency application with verified client delivery."],
    };
    updateField("projects", [newEntry, ...current]);
  };

  const removeProjectEntry = (projIndex: number) => {
    if (!onChange || !cvData.projects) return;
    const newProj = cvData.projects.filter((_, idx) => idx !== projIndex);
    updateField("projects", newProj);
  };

  const addEducationEntry = () => {
    if (!onChange) return;
    const current = cvData.education || [];
    const newEntry = {
      institution: "Accredited University / Institute",
      degree: "Bachelor of Science in Data Analytics / CS",
      year: "2024 - 2028",
      gpa: "3.80 / 4.00",
      highlights: "Currently Enrolled",
    };
    updateField("education", [newEntry, ...current]);
  };

  const removeEducationEntry = (eduIndex: number) => {
    if (!onChange || !cvData.education) return;
    const newEdu = cvData.education.filter((_, idx) => idx !== eduIndex);
    updateField("education", newEdu);
  };

  const addSkillCategory = () => {
    if (!onChange) return;
    const current = effectiveSkills;
    const newSkill = {
      category: "Specialized Technologies",
      items: ["WordPress", "SEO", "n8n", "MySQL", "JavaScript"],
    };
    updateField("skills", [...current, newSkill]);
  };

  const removeSkillCategory = (skillIndex: number) => {
    if (!onChange) return;
    const newSkills = effectiveSkills.filter((_, idx) => idx !== skillIndex);
    updateField("skills", newSkills);
  };

  const addLanguageEntry = (language = "English", proficiency = "Professional Working Proficiency", cefrLevel = "B2") => {
    if (!onChange) return;
    const current = effectiveLanguages;
    updateField("languages", [...current, { language, proficiency, cefrLevel }]);
  };

  const updateLanguage = (index: number, field: "language" | "proficiency" | "cefrLevel", val: string) => {
    if (!onChange) return;
    const newLangs = [...effectiveLanguages];
    if (!newLangs[index]) return;
    newLangs[index] = { ...newLangs[index], [field]: val };
    updateField("languages", newLangs);
  };

  const removeLanguage = (index: number) => {
    if (!onChange) return;
    const newLangs = effectiveLanguages.filter((_, idx) => idx !== index);
    updateField("languages", newLangs);
  };

  const addCertificationEntry = (cert = "Professional Certification (2024)") => {
    if (!onChange) return;
    const current = effectiveCertifications;
    updateField("certifications", [...current, cert]);
  };

  const updateCertification = (index: number, val: string) => {
    if (!onChange) return;
    const newCerts = [...effectiveCertifications];
    newCerts[index] = val;
    updateField("certifications", newCerts);
  };

  const removeCertification = (index: number) => {
    if (!onChange) return;
    const newCerts = effectiveCertifications.filter((_, idx) => idx !== index);
    updateField("certifications", newCerts);
  };

  const handleManualSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          MICROSOFT WORD STYLE RIBBON TOOLBAR
         ========================================================================= */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-md overflow-hidden text-slate-800 print:hidden no-print">
        {/* Word Title Bar */}
        <div className="bg-[#2B579A] text-white px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white text-[#2B579A] flex items-center justify-center font-black text-xs shadow-sm">
              W
            </div>
            <span className="font-bold tracking-tight">
              Microsoft Word CV Document Editor — {template.name}
            </span>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
              MS Word Direct-Edit Mode
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/80 font-medium hidden sm:inline">
              Click any text on the sheet below to type &amp; edit directly
            </span>
            {savedNotification && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm animate-pulse">
                <Check className="w-3 h-3" /> Saved!
              </span>
            )}
          </div>
        </div>

        {/* Word Formatting & Action Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Format Buttons */}
          <div className="flex items-center gap-1 border-r border-slate-300 pr-3">
            <button
              type="button"
              onClick={() => document.execCommand("bold")}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-800 font-black transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("italic")}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-800 transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("underline")}
              className="p-1.5 rounded hover:bg-slate-200 text-slate-800 transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Insert Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 mr-1 hidden md:inline">Insert:</span>
            <button
              type="button"
              onClick={addEducationEntry}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-purple-50 hover:border-brand-purple hover:text-brand-purple shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-brand-purple" />
              Education
            </button>
            <button
              type="button"
              onClick={addExperienceEntry}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-purple-50 hover:border-brand-purple hover:text-brand-purple shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-brand-purple" />
              Experience
            </button>
            <button
              type="button"
              onClick={addProjectEntry}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-purple-50 hover:border-brand-purple hover:text-brand-purple shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-brand-purple" />
              Project
            </button>
            <button
              type="button"
              onClick={addSkillCategory}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-purple-50 hover:border-brand-purple hover:text-brand-purple shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-brand-purple" />
              Skill Group
            </button>
            <button
              type="button"
              onClick={() => addLanguageEntry()}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-purple-50 hover:border-brand-purple hover:text-brand-purple shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-brand-purple" />
              Language
            </button>
            <button
              type="button"
              onClick={() => addCertificationEntry()}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-purple-50 hover:border-brand-purple hover:text-brand-purple shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-3 h-3 text-brand-purple" />
              Certification
            </button>
          </div>

          {/* Document Export & Print Actions */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            <button
              type="button"
              onClick={handleManualSave}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-100 shadow-sm transition-all flex items-center gap-1"
            >
              <Save className="w-3 h-3 text-brand-purple" />
              Save
            </button>
            <button
              type="button"
              onClick={() => downloadCvPdf(`${(cvData.fullName || "Candidate").replace(/\s+/g, "_")}_CV`, sanitizedExportData, template.id || template.name)}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm transition-all flex items-center gap-1.5"
              title="Download standard PDF file directly"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF (.pdf)
            </button>
            <button
              type="button"
              onClick={() => downloadCvDocx(`${(cvData.fullName || "Candidate").replace(/\s+/g, "_")}_CV`, sanitizedExportData, template.id || template.name)}
              className="px-3 py-1 rounded-lg bg-[#2B579A] text-white font-bold text-xs hover:bg-[#1E3F72] shadow-sm transition-all flex items-center gap-1.5"
              title="Download editable Microsoft Word document"
            >
              <Download className="w-3.5 h-3.5" />
              Download Word (.docx)
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold text-xs hover:bg-slate-100 shadow-sm transition-all flex items-center gap-1"
              title="Print document or save via browser PDF printer"
            >
              <Printer className="w-3 h-3 text-slate-600" />
              Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Hint banner */}
        <div className="bg-purple-50/70 border-b border-purple-100 px-4 py-1.5 flex items-center justify-between text-[11px] text-brand-purple font-medium print:hidden no-print">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>
              <strong>Word Live Document Active:</strong> Click any text, bullet, or table cell anywhere on the sheet below to edit live.
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">Standard: {template.standardsCode}</span>
        </div>
      </div>

      {/* =========================================================================
          AUTHENTIC REGIONAL CV PREVIEW & INLINE WORD EDITORS
         ========================================================================= */}

      {/* -------------------------------------------------------------------------
          TEMPLATE 1: PAKISTAN CORPORATE & SOFTWARE HOUSE
         ------------------------------------------------------------------------- */}
      {isPkHecPec && (
        <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden font-sans p-8 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header Band */}
          <div className="border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              <EditableText
                value={cvData.fullName}
                onChange={(val) => updateField("fullName", val)}
                placeholder="Candidate Legal Full Name"
                className="font-black"
              />
            </h1>

            <p className="text-sm font-extrabold text-brand-purple mt-0.5">
              <EditableText
                value={cvData.title}
                onChange={(val) => updateField("title", val)}
                placeholder="Target Professional Role / Specialization"
                className="font-extrabold"
              />
            </p>

            {/* Statutory Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 text-xs font-mono text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">City / Location: </span>
                <EditableText
                  value={cvData.location || cvData.domicile || ""}
                  onChange={(val) => {
                    updateField("location", val);
                    updateField("domicile", val);
                  }}
                  placeholder="Faisalabad / Lahore, Punjab (Pakistan)"
                  className="font-bold text-slate-950"
                />
              </div>
              <div>
                <span className="font-bold text-slate-900">Contact: </span>
                <EditableText
                  value={cvData.phone}
                  onChange={(val) => updateField("phone", val)}
                  placeholder="+92 300 1234567"
                />
                {" | "}
                <EditableText
                  value={cvData.email}
                  onChange={(val) => updateField("email", val)}
                  placeholder="email@domain.com"
                />
              </div>
              {(cvData.fatherName || editable) && (
                <div>
                  <span className="font-bold text-slate-900">Father&apos;s Name: </span>
                  <EditableText
                    value={cvData.fatherName || ""}
                    onChange={(val) => updateField("fatherName", val)}
                    placeholder="Father's Legal Name (Optional)"
                    className="text-slate-950 font-medium"
                  />
                </div>
              )}
              {(cvData.cnic || editable) && (
                <div>
                  <span className="font-bold text-slate-900">CNIC No: </span>
                  <EditableText
                    value={cvData.cnic || ""}
                    onChange={(val) => updateField("cnic", val)}
                    placeholder="35202-XXXXXXX-X (Optional)"
                    className="text-slate-950 font-medium"
                  />
                </div>
              )}
              {cvData.linkedinUrl && (
                <div className="col-span-1 sm:col-span-2">
                  <span className="font-bold text-slate-900">LinkedIn: </span>
                  <EditableText
                    value={cvData.linkedinUrl}
                    onChange={(val) => updateField("linkedinUrl", val)}
                    placeholder="https://linkedin.com/in/..."
                    className="text-brand-purple font-bold"
                  />
                </div>
              )}
              {cvData.githubUrl && (
                <div className="col-span-1 sm:col-span-2">
                  <span className="font-bold text-slate-900">GitHub / Portfolio: </span>
                  <EditableText
                    value={cvData.githubUrl}
                    onChange={(val) => updateField("githubUrl", val)}
                    placeholder="https://github.com/..."
                    className="text-brand-purple font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {cvData.summary && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5 pb-1 border-b border-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Professional Summary &amp; Profile Narrative
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                <EditableText
                  value={cvData.summary}
                  onChange={(val) => updateField("summary", val)}
                  multiline
                  placeholder="Enter professional career summary..."
                  className="w-full"
                />
              </p>
            </div>
          )}

          {/* Academic Qualifications Table */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-400">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                Academic Qualifications
              </h3>
              <button
                type="button"
                onClick={addEducationEntry}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Degree / Exam
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse border border-slate-300 text-left">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-black uppercase text-slate-900">
                    <th className="p-2 border border-slate-300">Examination / Degree</th>
                    <th className="p-2 border border-slate-300">Board / University</th>
                    <th className="p-2 border border-slate-300">Passing Year</th>
                    <th className="p-2 border border-slate-300">Division / CGPA</th>
                    <th className="p-2 border border-slate-300">Discipline / Status</th>
                    <th className="p-2 border border-slate-300 w-8">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-mono text-slate-800">
                  {cvData.education && cvData.education.length > 0 ? (
                    cvData.education.map((edu, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50" : ""}>
                        <td className="p-2 border border-slate-300 font-bold font-sans">
                          <EditableText
                            value={edu.degree}
                            onChange={(val) => {
                              const newEdu = [...cvData.education];
                              newEdu[idx] = { ...newEdu[idx], degree: val };
                              updateField("education", newEdu);
                            }}
                            placeholder="Degree Name"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <EditableText
                            value={edu.institution}
                            onChange={(val) => {
                              const newEdu = [...cvData.education];
                              newEdu[idx] = { ...newEdu[idx], institution: val };
                              updateField("education", newEdu);
                            }}
                            placeholder="University / Board"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <EditableText
                            value={edu.year}
                            onChange={(val) => {
                              const newEdu = [...cvData.education];
                              newEdu[idx] = { ...newEdu[idx], year: val };
                              updateField("education", newEdu);
                            }}
                            placeholder="2024 - 2028"
                          />
                        </td>
                        <td className="p-2 border border-slate-300 font-bold text-emerald-700">
                          <EditableText
                            value={edu.gpa || "1st Division"}
                            onChange={(val) => {
                              const newEdu = [...cvData.education];
                              newEdu[idx] = { ...newEdu[idx], gpa: val };
                              updateField("education", newEdu);
                            }}
                            placeholder="CGPA / Division"
                          />
                        </td>
                        <td className="p-2 border border-slate-300 font-sans">
                          <EditableText
                            value={edu.highlights || "Science / Tech"}
                            onChange={(val) => {
                              const newEdu = [...cvData.education];
                              newEdu[idx] = { ...newEdu[idx], highlights: val };
                              updateField("education", newEdu);
                            }}
                            placeholder="Discipline"
                          />
                        </td>
                        <td className="p-2 border border-slate-300 text-center">
                          <button
                            type="button"
                            onClick={() => removeEducationEntry(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove degree"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-slate-500 italic">
                        No education records added yet. Click &quot;Add Degree / Exam&quot; above to add.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Year Project (FYP) - Only rendered if candidate has an FYP */}
          {cvData.fypTitle && (
            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 text-xs space-y-1.5 group/fyp relative">
              <button
                type="button"
                onClick={() => updateField("fypTitle", undefined)}
                className="absolute right-2 top-2 text-rose-500 hover:text-rose-700 p-1 opacity-0 group-hover/fyp:opacity-100 transition-opacity"
                title="Remove FYP section"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="flex justify-between items-center font-black text-slate-950 uppercase text-[11px]">
                <span className="text-brand-purple flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-purple" />
                  Final Year Project (FYP) &amp; Capstone
                </span>
                <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">Academic Defense</span>
              </div>
              <p className="font-extrabold text-slate-900 text-sm">
                <EditableText
                  value={cvData.fypTitle}
                  onChange={(val) => updateField("fypTitle", val)}
                  placeholder="FYP Project Title"
                  className="font-extrabold text-slate-900"
                />
              </p>
              {cvData.fypSupervisor && (
                <p className="text-slate-700 font-medium leading-relaxed text-[11px]">
                  Supervised by:{" "}
                  <strong className="text-slate-900">
                    <EditableText
                      value={cvData.fypSupervisor}
                      onChange={(val) => updateField("fypSupervisor", val)}
                      placeholder="Supervisor Name"
                    />
                  </strong>
                </p>
              )}
            </div>
          )}

          {/* Professional Experience */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-400">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                Professional Experience &amp; Industry Engagements
              </h3>
              <button
                type="button"
                onClick={addExperienceEntry}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Job / Contract
              </button>
            </div>

            {effectiveExperience && effectiveExperience.length > 0 ? (
              <div className="space-y-4">
                {effectiveExperience.map((exp, i) => (
                  <div key={i} className="text-xs space-y-1.5 group/item relative">
                    <button
                      type="button"
                      onClick={() => removeExperienceEntry(i)}
                      className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-1"
                      title="Remove experience entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex justify-between font-extrabold text-slate-950 pr-6">
                      <div>
                        <EditableText
                          value={exp.role}
                          onChange={(val) => {
                            const newExp = [...effectiveExperience];
                            newExp[i] = { ...newExp[i], role: val };
                            updateField("experience", newExp);
                          }}
                          placeholder="Role"
                          className="font-extrabold"
                        />
                        {" — "}
                        <span className="text-brand-purple">
                          <EditableText
                            value={exp.company}
                            onChange={(val) => {
                              const newExp = [...effectiveExperience];
                              newExp[i] = { ...newExp[i], company: val };
                              updateField("experience", newExp);
                            }}
                            placeholder="Company"
                            className="font-extrabold text-brand-purple"
                          />
                        </span>
                      </div>
                      <span className="font-mono text-slate-500 font-bold">
                        <EditableText
                          value={exp.period}
                          onChange={(val) => {
                            const newExp = [...effectiveExperience];
                            newExp[i] = { ...newExp[i], period: val };
                            updateField("experience", newExp);
                          }}
                          placeholder="Period"
                        />
                      </span>
                    </div>

                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="group relative pr-6">
                          <EditableText
                            value={b}
                            onChange={(val) => updateExperienceBullet(i, bi, val)}
                            multiline
                            placeholder="Enter achievement bullet..."
                          />
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(i, bi)}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 ml-2 inline-flex items-center transition-opacity"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => addExperienceBullet(i)}
                      className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add Bullet Point
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
                <span>No experience entries added.</span>
                <button
                  type="button"
                  onClick={addExperienceEntry}
                  className="font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Experience Entry
                </button>
              </div>
            )}
          </div>

          {/* Project Experience Narrative & Technical Deliverables */}
          {cvData.projectExperienceNarrative && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5 pb-1 border-b border-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-purple" />
                Project Experience &amp; Technical Implementation Case
              </h3>
              <div className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <EditableText
                  value={cvData.projectExperienceNarrative}
                  onChange={(val) => updateField("projectExperienceNarrative", val)}
                  multiline
                  placeholder="Describe your technical delivery and client implementations..."
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Technical Deliverables / Projects */}
          {cvData.projects && cvData.projects.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-400">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-emerald-700" />
                  Technical Deliverables &amp; Client Projects
                </h3>
                <button
                  type="button"
                  onClick={addProjectEntry}
                  className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Project
                </button>
              </div>

              <div className="space-y-3">
                {cvData.projects.map((proj, i) => (
                  <div key={i} className="text-xs space-y-1 group/proj relative">
                    <button
                      type="button"
                      onClick={() => removeProjectEntry(i)}
                      className="absolute right-0 top-0 opacity-0 group-hover/proj:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-1"
                      title="Remove project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex justify-between font-bold text-slate-950 pr-6">
                      <span>
                        <EditableText
                          value={proj.name}
                          onChange={(val) => {
                            const newProj = [...cvData.projects];
                            newProj[i] = { ...newProj[i], name: val };
                            updateField("projects", newProj);
                          }}
                          placeholder="Project Name"
                          className="font-bold"
                        />
                        {" "}
                        <span className="text-slate-500 font-mono text-[11px]">
                          [
                          <EditableText
                            value={proj.tools}
                            onChange={(val) => {
                              const newProj = [...cvData.projects];
                              newProj[i] = { ...newProj[i], tools: val };
                              updateField("projects", newProj);
                            }}
                            placeholder="Tools"
                          />
                          ]
                        </span>
                      </span>
                    </div>

                    <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px] leading-relaxed">
                      {proj.bullets.map((b, bi) => (
                        <li key={bi}>
                          <EditableText
                            value={b}
                            onChange={(val) => updateProjectBullet(i, bi, val)}
                            multiline
                            placeholder="Bullet..."
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Competencies */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-400">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                Technical Competencies &amp; Domain Expertise
              </h3>
              <button
                type="button"
                onClick={addSkillCategory}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Skill Group
              </button>
            </div>
            {effectiveSkills && effectiveSkills.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {effectiveSkills.map((sk, i) => (
                  <div key={i} className="text-[11px] flex items-center justify-between group/skill">
                    <div className="flex-1">
                      <strong className="text-slate-950">{sk.category}: </strong>
                      <EditableText
                        value={sk.items.join(", ")}
                        onChange={(val) => {
                          const newSkills = [...effectiveSkills];
                          newSkills[i] = {
                            ...newSkills[i],
                            items: val.split(",").map((s) => s.trim()).filter(Boolean),
                          };
                          updateField("skills", newSkills);
                        }}
                        placeholder="Skill 1, Skill 2, Skill 3"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkillCategory(i)}
                      className="opacity-0 group-hover/skill:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity ml-2 shrink-0 p-0.5"
                      title="Remove skill category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Languages & Certifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Languages */}
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-400">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  Languages &amp; Proficiency
                </h3>
                <button
                  type="button"
                  onClick={() => addLanguageEntry("English", "IELTS Band 6 (Professional)", "B2")}
                  className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" /> Add
                </button>
              </div>

              {effectiveLanguages && effectiveLanguages.length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {effectiveLanguages.map((l, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200 group/lang text-[11px]">
                      <div>
                        <strong className="text-slate-950 font-bold">
                          <EditableText
                            value={l.language}
                            onChange={(val) => updateLanguage(i, "language", val)}
                            placeholder="Language"
                          />
                        </strong>
                        <span className="text-slate-600 ml-1">
                          —{" "}
                          <EditableText
                            value={l.proficiency}
                            onChange={(val) => updateLanguage(i, "proficiency", val)}
                            placeholder="Proficiency"
                          />
                          {l.cefrLevel ? ` (${l.cefrLevel})` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLanguage(i)}
                        className="opacity-0 group-hover/lang:opacity-100 text-rose-500 hover:text-rose-700 p-0.5"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No languages added yet.</p>
              )}
            </div>

            {/* Certifications */}
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-400">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  Certifications &amp; Credentials
                </h3>
                <button
                  type="button"
                  onClick={() => addCertificationEntry()}
                  className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" /> Add
                </button>
              </div>

              {effectiveCertifications && effectiveCertifications.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-800">
                  {effectiveCertifications.map((c, i) => (
                    <li key={i} className="group/cert relative pr-5">
                      <EditableText
                        value={c}
                        onChange={(val) => updateCertification(i, val)}
                        placeholder="Certification name"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertification(i)}
                        className="opacity-0 group-hover/cert:opacity-100 text-rose-500 hover:text-rose-700 ml-1 inline-flex items-center"
                        title="Remove"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-500 italic">No certifications added yet.</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {cvData.additionalInfo && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5 pb-1 border-b border-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-purple" />
                Additional Information &amp; Relocation
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                <EditableText
                  value={cvData.additionalInfo}
                  onChange={(val) => updateField("additionalInfo", val)}
                  multiline
                  placeholder="Availability, relocation, visa status..."
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TEMPLATE 2: MODERN TECH & PRODUCT (SILICON VALLEY CLEAN SANS)
         ------------------------------------------------------------------------- */}
      {isModernTech && (
        <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden font-sans p-8 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Modern Clean Header */}
          <div className="border-b-2 border-brand-purple pb-5">
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <div>
                <h1 className="text-3xl font-black text-slate-950 tracking-tight">
                  <EditableText
                    value={cvData.fullName}
                    onChange={(val) => updateField("fullName", val)}
                    placeholder="Candidate Name"
                    className="font-black"
                  />
                </h1>
                <p className="text-base font-extrabold text-brand-purple mt-0.5">
                  <EditableText
                    value={cvData.title}
                    onChange={(val) => updateField("title", val)}
                    placeholder="SEO Specialist • WordPress Developer • Automation & Web Specialist"
                    className="font-extrabold"
                  />
                </p>
              </div>
            </div>

            {/* Clean Contact Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-brand-purple" />
                <EditableText
                  value={cvData.location}
                  onChange={(val) => updateField("location", val)}
                  placeholder="Location"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-700">
                <Phone className="w-3.5 h-3.5 text-brand-purple" />
                <EditableText
                  value={cvData.phone}
                  onChange={(val) => updateField("phone", val)}
                  placeholder="Phone"
                />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full font-medium text-slate-700">
                <Mail className="w-3.5 h-3.5 text-brand-purple" />
                <EditableText
                  value={cvData.email}
                  onChange={(val) => updateField("email", val)}
                  placeholder="Email"
                />
              </div>
              {cvData.linkedinUrl && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full font-bold text-brand-purple">
                  <Linkedin className="w-3.5 h-3.5" />
                  <EditableText
                    value={cvData.linkedinUrl}
                    onChange={(val) => updateField("linkedinUrl", val)}
                    placeholder="LinkedIn"
                  />
                </div>
              )}
              {cvData.githubUrl && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-300 rounded-full font-bold text-slate-900">
                  <Github className="w-3.5 h-3.5" />
                  <EditableText
                    value={cvData.githubUrl}
                    onChange={(val) => updateField("githubUrl", val)}
                    placeholder="GitHub"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          {cvData.summary && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple mb-2 pb-1 border-b border-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                Professional Summary &amp; Impact
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <EditableText
                  value={cvData.summary}
                  onChange={(val) => updateField("summary", val)}
                  multiline
                  placeholder="Enter career summary..."
                  className="w-full"
                />
              </p>
            </div>
          )}

          {/* Core Competency Cloud / Skill Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-purple-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Categorized Competencies &amp; Technical Stacks
              </h3>
              <button
                type="button"
                onClick={addSkillCategory}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Stack Group
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {effectiveSkills?.map((sk, i) => (
                <div key={i} className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 group/sk relative">
                  <button
                    type="button"
                    onClick={() => removeSkillCategory(i)}
                    className="absolute right-2 top-2 opacity-0 group-hover/sk:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 transition-opacity"
                    title="Remove category"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] font-extrabold text-brand-purple block mb-1">
                    <EditableText
                      value={sk.category}
                      onChange={(val) => {
                        const newSkills = [...effectiveSkills];
                        newSkills[i] = { ...newSkills[i], category: val };
                        updateField("skills", newSkills);
                      }}
                      placeholder="Category"
                    />
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {sk.items.map((item, ii) => (
                      <span key={ii} className="px-2 py-0.5 bg-white border border-purple-200 rounded-md text-[10px] font-bold text-slate-800 shadow-2xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Experience */}
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-purple-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                Work History &amp; Client Engagements
              </h3>
              <button
                type="button"
                onClick={addExperienceEntry}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Job
              </button>
            </div>

            <div className="space-y-4">
              {effectiveExperience?.map((exp, i) => (
                <div key={i} className="text-xs space-y-1.5 border-l-2 border-brand-purple/40 pl-3.5 group/item relative">
                  <button
                    type="button"
                    onClick={() => removeExperienceEntry(i)}
                    className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-1"
                    title="Remove experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex justify-between font-extrabold text-slate-950 pr-6">
                    <div>
                      <EditableText
                        value={exp.role}
                        onChange={(val) => {
                          const newExp = [...effectiveExperience];
                          newExp[i] = { ...newExp[i], role: val };
                          updateField("experience", newExp);
                        }}
                        placeholder="Role"
                        className="font-extrabold text-slate-950"
                      />
                      {" — "}
                      <span className="text-brand-purple font-extrabold">
                        <EditableText
                          value={exp.company}
                          onChange={(val) => {
                            const newExp = [...effectiveExperience];
                            newExp[i] = { ...newExp[i], company: val };
                            updateField("experience", newExp);
                          }}
                          placeholder="Company"
                        />
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold text-[11px]">
                      <EditableText
                        value={exp.period}
                        onChange={(val) => {
                          const newExp = [...effectiveExperience];
                          newExp[i] = { ...newExp[i], period: val };
                          updateField("experience", newExp);
                        }}
                        placeholder="Period"
                      />
                    </span>
                  </div>

                  <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="group relative pr-6">
                        <EditableText
                          value={b}
                          onChange={(val) => updateExperienceBullet(i, bi, val)}
                          multiline
                          placeholder="Enter measurable achievement..."
                        />
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(i, bi)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 ml-2 inline-flex items-center"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => addExperienceBullet(i)}
                    className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1 mt-1"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Bullet Point
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project Experience Narrative & Implementation Case */}
          {cvData.projectExperienceNarrative && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple mb-2 pb-1 border-b border-purple-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Featured Project Delivery &amp; Technical Architecture
              </h3>
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200 text-xs text-slate-800 leading-relaxed font-medium">
                <EditableText
                  value={cvData.projectExperienceNarrative}
                  onChange={(val) => updateField("projectExperienceNarrative", val)}
                  multiline
                  placeholder="Case narrative..."
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Education & Certifications Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Education */}
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h3>
                <button
                  type="button"
                  onClick={addEducationEntry}
                  className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" /> Add Degree
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {cvData.education?.map((edu, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 group/edu relative">
                    <button
                      type="button"
                      onClick={() => removeEducationEntry(i)}
                      className="absolute right-2 top-2 opacity-0 group-hover/edu:opacity-100 text-rose-500 hover:text-rose-700 p-0.5"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <div className="font-extrabold text-slate-950 flex justify-between pr-5">
                      <span>
                        <EditableText
                          value={edu.degree}
                          onChange={(val) => {
                            const newEdu = [...cvData.education];
                            newEdu[i] = { ...newEdu[i], degree: val };
                            updateField("education", newEdu);
                          }}
                          placeholder="Degree"
                        />
                      </span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        <EditableText
                          value={edu.year}
                          onChange={(val) => {
                            const newEdu = [...cvData.education];
                            newEdu[i] = { ...newEdu[i], year: val };
                            updateField("education", newEdu);
                          }}
                          placeholder="Year"
                        />
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] font-medium">
                      <EditableText
                        value={edu.institution}
                        onChange={(val) => {
                          const newEdu = [...cvData.education];
                          newEdu[i] = { ...newEdu[i], institution: val };
                          updateField("education", newEdu);
                        }}
                        placeholder="Institution"
                      />
                      {edu.gpa && (
                        <span>
                          {" • GPA: "}
                          <EditableText
                            value={edu.gpa}
                            onChange={(val) => {
                              const newEdu = [...cvData.education];
                              newEdu[i] = { ...newEdu[i], gpa: val };
                              updateField("education", newEdu);
                            }}
                            placeholder="GPA"
                          />
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages & Certifications */}
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-200">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  Languages &amp; Certifications
                </h3>
                <button
                  type="button"
                  onClick={() => addLanguageEntry("German", "A1 (Elementary)", "A1")}
                  className="text-[10px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-2.5 h-2.5" /> Add Language
                </button>
              </div>

              {/* Language Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {effectiveLanguages?.map((l, i) => (
                  <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-[11px] font-bold flex items-center gap-1">
                    <EditableText
                      value={l.language}
                      onChange={(val) => updateLanguage(i, "language", val)}
                      placeholder="Language"
                    />
                    <span className="font-normal text-emerald-700">
                      :{" "}
                      <EditableText
                        value={l.proficiency}
                        onChange={(val) => updateLanguage(i, "proficiency", val)}
                        placeholder="Proficiency"
                      />
                    </span>
                  </span>
                ))}
              </div>

              {/* Certifications List */}
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-800 font-medium">
                {effectiveCertifications?.map((c, i) => (
                  <li key={i} className="group/cert relative pr-5">
                    <EditableText
                      value={c}
                      onChange={(val) => updateCertification(i, val)}
                      placeholder="Certification"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(i)}
                      className="opacity-0 group-hover/cert:opacity-100 text-rose-500 hover:text-rose-700 ml-1 inline-flex items-center"
                      title="Remove"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Info */}
          {cvData.additionalInfo && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-slate-950 font-bold block mb-0.5">Availability &amp; International Mobility:</strong>
              <EditableText
                value={cvData.additionalInfo}
                onChange={(val) => updateField("additionalInfo", val)}
                multiline
                placeholder="Availability..."
                className="w-full"
              />
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TEMPLATE 3: EXECUTIVE MULTI-TRACK PROFESSIONAL (DUAL-FOCUS CORPORATE)
         ------------------------------------------------------------------------- */}
      {isExecutiveCorporate && (
        <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-hidden font-sans print:border-none print:shadow-none print:p-0">
          {/* Executive Navy Header Band */}
          <div className="bg-[#0F172A] text-white p-6 sm:p-8 space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              <EditableText
                value={cvData.fullName}
                onChange={(val) => updateField("fullName", val)}
                placeholder="Candidate Full Name"
                className="font-black text-white"
              />
            </h1>

            <p className="text-sm font-extrabold text-purple-300">
              <EditableText
                value={cvData.title}
                onChange={(val) => updateField("title", val)}
                placeholder="SEO Specialist • WordPress Developer • Automation & Web Specialist"
                className="font-extrabold text-purple-200"
              />
            </p>

            {/* Executive Contact Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-mono">
              <span>
                <EditableText
                  value={cvData.location}
                  onChange={(val) => updateField("location", val)}
                  placeholder="Location"
                  className="text-slate-200"
                />
              </span>
              <span>•</span>
              <span>
                <EditableText
                  value={cvData.phone}
                  onChange={(val) => updateField("phone", val)}
                  placeholder="Phone"
                  className="text-slate-200"
                />
              </span>
              <span>•</span>
              <span>
                <EditableText
                  value={cvData.email}
                  onChange={(val) => updateField("email", val)}
                  placeholder="Email"
                  className="text-slate-200"
                />
              </span>
              {cvData.linkedinUrl && (
                <>
                  <span>•</span>
                  <span>
                    <EditableText
                      value={cvData.linkedinUrl}
                      onChange={(val) => updateField("linkedinUrl", val)}
                      placeholder="LinkedIn"
                      className="text-purple-300"
                    />
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Executive Value Proposition */}
            {cvData.summary && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5 pb-1 border-b-2 border-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0F172A]" />
                  Executive Value Proposition &amp; Cross-Functional Summary
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  <EditableText
                    value={cvData.summary}
                    onChange={(val) => updateField("summary", val)}
                    multiline
                    placeholder="Enter summary..."
                    className="w-full"
                  />
                </p>
              </div>
            )}

            {/* Core Practice Areas / Strategic Skill Grid */}
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b-2 border-slate-900">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0F172A]" />
                  Strategic Competency Pillars (5-7 Practice Areas)
                </h3>
                <button
                  type="button"
                  onClick={addSkillCategory}
                  className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Pillar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {effectiveSkills?.map((sk, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 group/sk relative">
                    <button
                      type="button"
                      onClick={() => removeSkillCategory(i)}
                      className="absolute right-1.5 top-1.5 opacity-0 group-hover/sk:opacity-100 text-rose-500 hover:text-rose-700 p-0.5"
                      title="Remove pillar"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <strong className="text-xs font-extrabold text-slate-950 block mb-1">
                      <EditableText
                        value={sk.category}
                        onChange={(val) => {
                          const newSkills = [...effectiveSkills];
                          newSkills[i] = { ...newSkills[i], category: val };
                          updateField("skills", newSkills);
                        }}
                        placeholder="Pillar"
                      />
                    </strong>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <EditableText
                        value={sk.items.join(" • ")}
                        onChange={(val) => {
                          const newSkills = [...effectiveSkills];
                          newSkills[i] = {
                            ...newSkills[i],
                            items: val.split(/[•,]/).map((s) => s.trim()).filter(Boolean),
                          };
                          updateField("skills", newSkills);
                        }}
                        placeholder="Item 1 • Item 2"
                      />
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Track Record & Key Accounts */}
            <div>
              <div className="flex items-center justify-between mb-2 pb-1 border-b-2 border-slate-900">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#0F172A]" />
                  Career Trajectory &amp; Client Engagements
                </h3>
                <button
                  type="button"
                  onClick={addExperienceEntry}
                  className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Engagement
                </button>
              </div>

              <div className="space-y-4">
                {effectiveExperience?.map((exp, i) => (
                  <div key={i} className="text-xs space-y-1.5 group/item relative">
                    <button
                      type="button"
                      onClick={() => removeExperienceEntry(i)}
                      className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex justify-between font-extrabold text-slate-950 pr-6">
                      <div>
                        <EditableText
                          value={exp.role}
                          onChange={(val) => {
                            const newExp = [...effectiveExperience];
                            newExp[i] = { ...newExp[i], role: val };
                            updateField("experience", newExp);
                          }}
                          placeholder="Role"
                          className="font-extrabold text-slate-950 text-sm"
                        />
                        {" — "}
                        <span className="text-brand-purple font-extrabold">
                          <EditableText
                            value={exp.company}
                            onChange={(val) => {
                              const newExp = [...effectiveExperience];
                              newExp[i] = { ...newExp[i], company: val };
                              updateField("experience", newExp);
                            }}
                            placeholder="Company"
                          />
                        </span>
                      </div>
                      <span className="font-mono text-slate-500 font-bold">
                        <EditableText
                          value={exp.period}
                          onChange={(val) => {
                            const newExp = [...effectiveExperience];
                            newExp[i] = { ...newExp[i], period: val };
                            updateField("experience", newExp);
                          }}
                          placeholder="Period"
                        />
                      </span>
                    </div>

                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="group relative pr-6">
                          <EditableText
                            value={b}
                            onChange={(val) => updateExperienceBullet(i, bi, val)}
                            multiline
                            placeholder="Enter measurable deliverable..."
                          />
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(i, bi)}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 ml-2 inline-flex items-center"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Technical Delivery Case */}
            {cvData.projectExperienceNarrative && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5 pb-1 border-b-2 border-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0F172A]" />
                  Strategic Technical Delivery &amp; Client Impact Case
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  <EditableText
                    value={cvData.projectExperienceNarrative}
                    onChange={(val) => updateField("projectExperienceNarrative", val)}
                    multiline
                    placeholder="Case narrative..."
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Education, Languages & Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5 pb-1 border-b-2 border-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#0F172A]" />
                  Academic Credentials
                </h3>
                <div className="space-y-2 text-xs">
                  {cvData.education?.map((edu, i) => (
                    <div key={i} className="text-xs">
                      <strong className="text-slate-950 font-bold">{edu.degree}</strong>
                      <span className="text-slate-600 block text-[11px]">
                        {edu.institution} ({edu.year})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-1.5 pb-1 border-b-2 border-slate-900 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#0F172A]" />
                  Languages &amp; Certifications
                </h3>
                <div className="space-y-1.5 text-xs text-slate-800">
                  {effectiveLanguages?.map((l, i) => (
                    <div key={i} className="text-[11px]">
                      <strong>{l.language}:</strong> {l.proficiency}
                    </div>
                  ))}
                  {effectiveCertifications?.map((c, i) => (
                    <div key={i} className="text-[11px] text-slate-700">
                      • {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Relocation */}
            {cvData.additionalInfo && (
              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                <strong className="text-slate-950">International Mobility &amp; Availability: </strong>
                <EditableText
                  value={cvData.additionalInfo}
                  onChange={(val) => updateField("additionalInfo", val)}
                  multiline
                  placeholder="Availability..."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TEMPLATE 4: EUROPEAN UNION OFFICIAL STANDARD (EUROPASS CEDEFOP & CEFR)
         ------------------------------------------------------------------------- */}
      {isEuEuropass && !isModernTech && !isExecutiveCorporate && (
        <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden font-sans p-8 sm:p-10 space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Europass Header Band */}
          <div className="border-b-2 border-brand-purple pb-5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              <EditableText
                value={cvData.fullName}
                onChange={(val) => updateField("fullName", val)}
                placeholder="Candidate Full Legal Name"
                className="font-black"
              />
            </h1>

            <p className="text-sm font-extrabold text-brand-purple mt-1">
              <EditableText
                value={cvData.title}
                onChange={(val) => updateField("title", val)}
                placeholder="Target Role / Professional Title"
                className="font-extrabold"
              />
            </p>

            {/* European Personal Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs font-mono text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900">Email: </span>
                <EditableText
                  value={cvData.email}
                  onChange={(val) => updateField("email", val)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <span className="font-bold text-slate-900">Phone: </span>
                <EditableText
                  value={cvData.phone}
                  onChange={(val) => updateField("phone", val)}
                  placeholder="+49 151 23456789"
                />
              </div>
              <div>
                <span className="font-bold text-slate-900">City / Country: </span>
                <EditableText
                  value={cvData.location}
                  onChange={(val) => updateField("location", val)}
                  placeholder="Faisalabad, Pakistan / Berlin, Germany"
                />
              </div>
              <div>
                <span className="font-bold text-slate-900">Nationality / Work Rights: </span>
                <EditableText
                  value={cvData.nationality || "Pakistani (EU Blue Card / Opportunity Card Eligible)"}
                  onChange={(val) => updateField("nationality", val)}
                  placeholder="Nationality"
                />
              </div>
              {cvData.linkedinUrl && (
                <div className="col-span-1 sm:col-span-2">
                  <span className="font-bold text-slate-900">LinkedIn: </span>
                  <EditableText
                    value={cvData.linkedinUrl}
                    onChange={(val) => updateField("linkedinUrl", val)}
                    placeholder="https://linkedin.com/..."
                    className="text-brand-purple font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Occupational Summary */}
          {cvData.summary && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple mb-2 pb-1 border-b border-purple-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Occupational Summary &amp; Professional Profile
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <EditableText
                  value={cvData.summary}
                  onChange={(val) => updateField("summary", val)}
                  multiline
                  placeholder="Enter executive career summary..."
                  className="w-full"
                />
              </p>
            </div>
          )}

          {/* Work Experience */}
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-purple-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Work Experience (Chronological)
              </h3>
              <button
                type="button"
                onClick={addExperienceEntry}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Job
              </button>
            </div>

            {effectiveExperience && effectiveExperience.length > 0 ? (
              <div className="space-y-4">
                {effectiveExperience.map((exp, i) => (
                  <div key={i} className="text-xs space-y-1.5 border-l-2 border-purple-200 pl-3.5 ml-1 group/item relative">
                    <button
                      type="button"
                      onClick={() => removeExperienceEntry(i)}
                      className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-1"
                      title="Remove experience entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex justify-between font-extrabold text-slate-950 pr-6">
                      <div>
                        <EditableText
                          value={exp.role}
                          onChange={(val) => {
                            const newExp = [...effectiveExperience];
                            newExp[i] = { ...newExp[i], role: val };
                            updateField("experience", newExp);
                          }}
                          placeholder="Job Title"
                          className="font-extrabold"
                        />
                        {" — "}
                        <span className="text-brand-purple">
                          <EditableText
                            value={exp.company}
                            onChange={(val) => {
                              const newExp = [...effectiveExperience];
                              newExp[i] = { ...newExp[i], company: val };
                              updateField("experience", newExp);
                            }}
                            placeholder="Company Name"
                            className="font-extrabold text-brand-purple"
                          />
                        </span>
                      </div>
                      <span className="font-mono text-slate-500 font-bold">
                        <EditableText
                          value={exp.period}
                          onChange={(val) => {
                            const newExp = [...effectiveExperience];
                            newExp[i] = { ...newExp[i], period: val };
                            updateField("experience", newExp);
                          }}
                          placeholder="2024 - Present"
                        />
                      </span>
                    </div>

                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} className="group relative pr-6">
                          <EditableText
                            value={b}
                            onChange={(val) => updateExperienceBullet(i, bi, val)}
                            multiline
                            placeholder="Enter achievement bullet..."
                          />
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(i, bi)}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 ml-2 inline-flex items-center transition-opacity"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Education & Training */}
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-purple-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple">
                Education &amp; Training (EQF Level 6 / ECTS Standards)
              </h3>
              <button
                type="button"
                onClick={addEducationEntry}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Degree
              </button>
            </div>
            {cvData.education && cvData.education.length > 0 ? (
              <div className="space-y-3">
                {cvData.education.map((edu, i) => (
                  <div key={i} className="text-xs space-y-1 border-l-2 border-purple-200 pl-3.5 ml-1 group/item relative">
                    <button
                      type="button"
                      onClick={() => removeEducationEntry(i)}
                      className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-1"
                      title="Remove education entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex justify-between font-extrabold text-slate-950 pr-6">
                      <span>
                        <EditableText
                          value={edu.institution}
                          onChange={(val) => {
                            const newEdu = [...cvData.education];
                            newEdu[i] = { ...newEdu[i], institution: val };
                            updateField("education", newEdu);
                          }}
                          placeholder="University / Institution"
                          className="font-extrabold"
                        />
                      </span>
                      <span className="font-mono text-slate-500 font-bold">
                        <EditableText
                          value={edu.year}
                          onChange={(val) => {
                            const newEdu = [...cvData.education];
                            newEdu[i] = { ...newEdu[i], year: val };
                            updateField("education", newEdu);
                          }}
                          placeholder="2024 - 2028"
                        />
                      </span>
                    </div>
                    <p className="text-slate-800 font-semibold">
                      <EditableText
                        value={edu.degree}
                        onChange={(val) => {
                          const newEdu = [...cvData.education];
                          newEdu[i] = { ...newEdu[i], degree: val };
                          updateField("education", newEdu);
                        }}
                        placeholder="Degree / Programme"
                      />
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* CEFR European Language Passport Table (Dynamic from candidate languages) */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                European Language Passport (CEFR Common European Framework)
              </h3>
              <button
                type="button"
                onClick={() => addLanguageEntry("German", "A1 (Elementary)", "A1")}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Language
              </button>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full border-collapse border border-slate-300 text-left">
                <thead>
                  <tr className="bg-purple-50 text-[10px] font-black uppercase text-slate-900">
                    <th className="p-2 border border-slate-300">Language</th>
                    <th className="p-2 border border-slate-300">Listening</th>
                    <th className="p-2 border border-slate-300">Reading</th>
                    <th className="p-2 border border-slate-300">Spoken Interaction</th>
                    <th className="p-2 border border-slate-300">Writing</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-mono text-slate-800 font-medium">
                  {effectiveLanguages && effectiveLanguages.length > 0 ? (
                    effectiveLanguages.map((l, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60" : ""}>
                        <td className="p-2 border border-slate-300 font-bold font-sans">
                          <EditableText
                            value={l.language}
                            onChange={(val) => updateLanguage(idx, "language", val)}
                            placeholder="Language"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <EditableText
                            value={l.cefrLevel || l.proficiency}
                            onChange={(val) => updateLanguage(idx, "cefrLevel", val)}
                            placeholder="Level"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <EditableText
                            value={l.cefrLevel || l.proficiency}
                            placeholder="Level"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <EditableText
                            value={l.cefrLevel || l.proficiency}
                            placeholder="Level"
                          />
                        </td>
                        <td className="p-2 border border-slate-300">
                          <EditableText
                            value={l.cefrLevel || l.proficiency}
                            placeholder="Level"
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2 border border-slate-300 font-bold font-sans">English</td>
                      <td className="p-2 border border-slate-300">B2 (IELTS 6.0)</td>
                      <td className="p-2 border border-slate-300">B2 (IELTS 6.0)</td>
                      <td className="p-2 border border-slate-300">B2 (IELTS 6.0)</td>
                      <td className="p-2 border border-slate-300">B2 (IELTS 6.0)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Digital Competences */}
          <div>
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-purple-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple">
                Digital Competences &amp; Tech Stack (DigComp 2.2)
              </h3>
              <button
                type="button"
                onClick={addSkillCategory}
                className="text-[11px] font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Skill Group
              </button>
            </div>
            {effectiveSkills && effectiveSkills.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {effectiveSkills.map((sk, i) => (
                  <div key={i} className="text-[11px] flex items-center justify-between group/skill">
                    <div className="flex-1">
                      <strong className="text-slate-950 font-bold">{sk.category}: </strong>
                      <EditableText
                        value={sk.items.join(", ")}
                        onChange={(val) => {
                          const newSkills = [...effectiveSkills];
                          newSkills[i] = {
                            ...newSkills[i],
                            items: val.split(",").map((s) => s.trim()).filter(Boolean),
                          };
                          updateField("skills", newSkills);
                        }}
                        placeholder="Skill 1, Skill 2, Skill 3"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkillCategory(i)}
                      className="opacity-0 group-hover/skill:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity ml-2 shrink-0 p-0.5"
                      title="Remove skill category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Project Experience Narrative */}
          {cvData.projectExperienceNarrative && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple mb-2 pb-1 border-b border-purple-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Project Implementation &amp; European Delivery Case
              </h3>
              <div className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <EditableText
                  value={cvData.projectExperienceNarrative}
                  onChange={(val) => updateField("projectExperienceNarrative", val)}
                  multiline
                  placeholder="Case narrative..."
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Certifications & Additional Info */}
          {effectiveCertifications && effectiveCertifications.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-purple mb-2 pb-1 border-b border-purple-200 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Certificates &amp; Honors
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
                {effectiveCertifications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {cvData.additionalInfo && (
            <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
              <strong className="text-slate-950 font-bold block mb-0.5">European Relocation &amp; Mobility:</strong>
              <EditableText
                value={cvData.additionalInfo}
                onChange={(val) => updateField("additionalInfo", val)}
                multiline
                placeholder="Availability..."
              />
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------
          TEMPLATE 5: US STANDARD (HARVARD FAS OCS 1-PAGE ATS)
         ------------------------------------------------------------------------- */}
      {isUsHarvard && (
        <div className="bg-white text-slate-900 rounded-2xl border-2 border-slate-300 shadow-2xl overflow-hidden font-serif p-8 sm:p-10 space-y-5 leading-normal print:border-none print:shadow-none print:p-0">
          {/* Harvard FAS Centered Header */}
          <div className="text-center border-b border-slate-400 pb-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-serif uppercase">
              <EditableText
                value={cvData.fullName}
                onChange={(val) => updateField("fullName", val)}
                placeholder="Candidate Full Name"
                className="font-black"
              />
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-700 mt-1 font-sans">
              <span>
                <EditableText
                  value={cvData.location}
                  onChange={(val) => updateField("location", val)}
                  placeholder="City, State / Remote"
                />
              </span>
              <span>•</span>
              <span>
                <EditableText
                  value={cvData.phone}
                  onChange={(val) => updateField("phone", val)}
                  placeholder="(555) 123-4567"
                />
              </span>
              <span>•</span>
              <span>
                <EditableText
                  value={cvData.email}
                  onChange={(val) => updateField("email", val)}
                  placeholder="name@domain.edu"
                />
              </span>
              {cvData.linkedinUrl && (
                <>
                  <span>•</span>
                  <EditableText
                    value={cvData.linkedinUrl}
                    onChange={(val) => updateField("linkedinUrl", val)}
                    placeholder="LinkedIn URL"
                    className="text-slate-900 font-medium"
                  />
                </>
              )}
              {cvData.githubUrl && (
                <>
                  <span>•</span>
                  <EditableText
                    value={cvData.githubUrl}
                    onChange={(val) => updateField("githubUrl", val)}
                    placeholder="GitHub URL"
                    className="text-slate-900 font-medium"
                  />
                </>
              )}
            </div>
          </div>

          {/* Education Directly at the Top (Ivy League Standard) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-sans">
                Education
              </h2>
              <button
                type="button"
                onClick={addEducationEntry}
                className="text-[10px] font-sans font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Education
              </button>
            </div>
            {cvData.education && cvData.education.length > 0 ? (
              cvData.education.map((edu, i) => (
                <div key={i} className="text-xs space-y-0.5 group/item relative">
                  <button
                    type="button"
                    onClick={() => removeEducationEntry(i)}
                    className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-0.5"
                    title="Remove education"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="flex justify-between font-bold text-slate-950 pr-6">
                    <span>
                      <EditableText
                        value={edu.institution}
                        onChange={(val) => {
                          const newEdu = [...cvData.education];
                          newEdu[i] = { ...newEdu[i], institution: val };
                          updateField("education", newEdu);
                        }}
                        placeholder="Harvard University / Institution"
                        className="font-bold"
                      />
                    </span>
                    <span className="font-sans font-normal text-slate-600">
                      <EditableText
                        value={edu.year}
                        onChange={(val) => {
                          const newEdu = [...cvData.education];
                          newEdu[i] = { ...newEdu[i], year: val };
                          updateField("education", newEdu);
                        }}
                        placeholder="May 2028"
                      />
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-800 italic pr-6">
                    <span>
                      <EditableText
                        value={edu.degree}
                        onChange={(val) => {
                          const newEdu = [...cvData.education];
                          newEdu[i] = { ...newEdu[i], degree: val };
                          updateField("education", newEdu);
                        }}
                        placeholder="B.S. in Data Analytics"
                      />
                    </span>
                    {edu.gpa && (
                      <span className="font-sans not-italic font-bold text-slate-950">
                        GPA:{" "}
                        <EditableText
                          value={edu.gpa}
                          onChange={(val) => {
                            const newEdu = [...cvData.education];
                            newEdu[i] = { ...newEdu[i], gpa: val };
                            updateField("education", newEdu);
                          }}
                          placeholder="3.90 / 4.00"
                        />
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Experience with Google/Harvard XYZ Bullets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-sans">
                Professional Experience
              </h2>
              <button
                type="button"
                onClick={addExperienceEntry}
                className="text-[10px] font-sans font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Job
              </button>
            </div>

            {effectiveExperience && effectiveExperience.length > 0 ? (
              effectiveExperience.map((exp, i) => (
                <div key={i} className="text-xs space-y-1 group/item relative">
                  <button
                    type="button"
                    onClick={() => removeExperienceEntry(i)}
                    className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity p-0.5"
                    title="Remove experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex justify-between font-bold text-slate-950 pr-6">
                    <span>
                      <EditableText
                        value={exp.company}
                        onChange={(val) => {
                          const newExp = [...effectiveExperience];
                          newExp[i] = { ...newExp[i], company: val };
                          updateField("experience", newExp);
                        }}
                        placeholder="Company Name"
                        className="font-bold"
                      />
                    </span>
                    <span className="font-sans font-normal text-slate-600">
                      <EditableText
                        value={exp.period}
                        onChange={(val) => {
                          const newExp = [...effectiveExperience];
                          newExp[i] = { ...newExp[i], period: val };
                          updateField("experience", newExp);
                        }}
                        placeholder="Period"
                      />
                    </span>
                  </div>
                  <div className="text-slate-800 italic pr-6">
                    <EditableText
                      value={exp.role}
                      onChange={(val) => {
                        const newExp = [...effectiveExperience];
                        newExp[i] = { ...newExp[i], role: val };
                        updateField("experience", newExp);
                      }}
                      placeholder="Role"
                    />
                  </div>

                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 text-[11px] leading-relaxed font-sans">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="group relative pr-5">
                        <EditableText
                          value={b}
                          onChange={(val) => updateExperienceBullet(i, bi, val)}
                          multiline
                          placeholder="Accomplished [X] measured by [Y] by doing [Z]..."
                        />
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(i, bi)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 ml-1.5 inline-flex items-center transition-opacity"
                          title="Delete bullet"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : null}
          </div>

          {/* Project Experience Narrative (if provided) */}
          {cvData.projectExperienceNarrative && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-800 pb-0.5 font-sans">
                Technical Delivery &amp; Architecture
              </h2>
              <p className="text-[11px] text-slate-800 font-sans leading-relaxed">
                <EditableText
                  value={cvData.projectExperienceNarrative}
                  onChange={(val) => updateField("projectExperienceNarrative", val)}
                  multiline
                  placeholder="Case narrative..."
                />
              </p>
            </div>
          )}

          {/* Technical Skills */}
          <div className="space-y-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 font-sans">
                Technical &amp; Professional Skills
              </h2>
              <button
                type="button"
                onClick={addSkillCategory}
                className="text-[10px] font-sans font-bold text-brand-purple hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Skill Group
              </button>
            </div>
            {effectiveSkills && effectiveSkills.length > 0 ? (
              <div className="space-y-0.5 text-xs font-sans">
                {effectiveSkills.map((sk, i) => (
                  <div key={i} className="text-[11px] flex items-center justify-between group/skill">
                    <div className="flex-1">
                      <strong className="text-slate-950">{sk.category}: </strong>
                      <EditableText
                        value={sk.items.join(", ")}
                        onChange={(val) => {
                          const newSkills = [...effectiveSkills];
                          newSkills[i] = {
                            ...newSkills[i],
                            items: val.split(",").map((s) => s.trim()).filter(Boolean),
                          };
                          updateField("skills", newSkills);
                        }}
                        placeholder="Skill 1, Skill 2"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkillCategory(i)}
                      className="opacity-0 group-hover/skill:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity ml-2 shrink-0 p-0.5"
                      title="Remove skill category"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Languages */}
          {effectiveLanguages && effectiveLanguages.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-800 pb-0.5 font-sans">
                Languages
              </h2>
              <p className="text-[11px] text-slate-800 font-sans">
                {effectiveLanguages.map((l) => `${l.language} (${l.proficiency})`).join(" • ")}
              </p>
            </div>
          )}

          {/* Certifications */}
          {effectiveCertifications && effectiveCertifications.length > 0 && (
            <div className="space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-800 pb-0.5 font-sans">
                Honors &amp; Certifications
              </h2>
              <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 text-[11px] font-sans">
                {effectiveCertifications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
