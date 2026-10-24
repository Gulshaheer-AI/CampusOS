import { CvData, CvAuditResult } from "@/types";

/**
 * Robust Client-Side and Server-Side CV Parser
 * Extracts structured candidate identity, contact, education, experience,
 * projects, skills, languages, and certifications from arbitrary uploaded CV text (PDF, DOCX, TXT, JSON, MD).
 */
export function parseRawCvTextToCvData(rawText: string, fallback?: Partial<CvData>, fileName?: string): CvData {
  // Pre-clean Mojibake artifacts from input and ensure clean line splitting
  const preCleaned = rawText
    .replace(/â€¢/g, " • ")
    .replace(/â€[—–-]/g, " - ")
    .replace(/â€/g, " - ")
    .replace(/â[^\w\s]/g, " ")
    .replace(/•/g, " • ");

  const cleanText = preCleaned.trim();
  const defaultCandidateName = (fileName ? cleanCandidateNameFromFileName(fileName) : "") || fallback?.fullName || "Candidate Legal Name";

  if (!cleanText) {
    return {
      fullName: defaultCandidateName,
      title: fallback?.title || "",
      email: fallback?.email || "",
      phone: fallback?.phone || "",
      location: fallback?.location || "",
      websiteUrl: fallback?.websiteUrl,
      linkedinUrl: fallback?.linkedinUrl,
      githubUrl: fallback?.githubUrl,
      summary: fallback?.summary || "",
      fatherName: fallback?.fatherName,
      cnic: fallback?.cnic,
      domicile: fallback?.domicile,
      pecRegistrationNumber: fallback?.pecRegistrationNumber,
      nationality: fallback?.nationality,
      dateOfBirth: fallback?.dateOfBirth,
      drivingLicence: fallback?.drivingLicence,
      matricDivision: fallback?.matricDivision,
      fscDivision: fallback?.fscDivision,
      fypTitle: fallback?.fypTitle,
      fypSupervisor: fallback?.fypSupervisor,
      education: fallback?.education || [],
      experience: fallback?.experience || [],
      projects: fallback?.projects || [],
      skills: fallback?.skills || [],
      certifications: fallback?.certifications || [],
      languages: fallback?.languages || [],
      projectExperienceNarrative: fallback?.projectExperienceNarrative,
      additionalInfo: fallback?.additionalInfo,
      customSections: fallback?.customSections || [],
    };
  }

  // Check if it's already a JSON dump
  if (cleanText.startsWith("{") && cleanText.endsWith("}")) {
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed.fullName || parsed.name || parsed.email || parsed.education || parsed.experience) {
        return {
          fullName: parsed.fullName || parsed.name || defaultCandidateName,
          title: parsed.title || parsed.role || fallback?.title || "",
          email: parsed.email || fallback?.email || "",
          phone: parsed.phone || fallback?.phone || "",
          location: parsed.location || fallback?.location || "",
          websiteUrl: parsed.websiteUrl || fallback?.websiteUrl,
          linkedinUrl: parsed.linkedinUrl || fallback?.linkedinUrl,
          githubUrl: parsed.githubUrl || fallback?.githubUrl,
          summary: parsed.summary || parsed.bio || fallback?.summary || "",
          fatherName: parsed.fatherName || fallback?.fatherName,
          cnic: parsed.cnic || fallback?.cnic,
          domicile: parsed.domicile || fallback?.domicile,
          pecRegistrationNumber: parsed.pecRegistrationNumber || fallback?.pecRegistrationNumber,
          nationality: parsed.nationality || fallback?.nationality,
          dateOfBirth: parsed.dateOfBirth || fallback?.dateOfBirth,
          drivingLicence: parsed.drivingLicence || fallback?.drivingLicence,
          matricDivision: parsed.matricDivision || fallback?.matricDivision,
          fscDivision: parsed.fscDivision || fallback?.fscDivision,
          fypTitle: parsed.fypTitle || fallback?.fypTitle,
          fypSupervisor: parsed.fypSupervisor || fallback?.fypSupervisor,
          education: Array.isArray(parsed.education) ? parsed.education : fallback?.education || [],
          experience: Array.isArray(parsed.experience) ? parsed.experience : fallback?.experience || [],
          projects: Array.isArray(parsed.projects) ? parsed.projects : fallback?.projects || [],
          skills: Array.isArray(parsed.skills) ? parsed.skills : fallback?.skills || [],
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : fallback?.certifications || [],
          languages: Array.isArray(parsed.languages) ? parsed.languages : fallback?.languages || [],
          projectExperienceNarrative: parsed.projectExperienceNarrative || fallback?.projectExperienceNarrative,
          additionalInfo: parsed.additionalInfo || fallback?.additionalInfo,
          customSections: parsed.customSections || fallback?.customSections || [],
        };
      }
    } catch {
      // Not JSON, continue to text parsing
    }
  }

  // Split lines, ensuring section headers embedded within a line (e.g. "Currently Enrolled • LANGUAGES & CERTIFICATIONS") are split onto their own line
  const normalizedText = cleanText.replace(
    /\s*[•|–—]\s*(?=(?:LANGUAGES\s*&?\s*CERTIFICATIONS|PROJECT\s*EXPERIENCE|ADDITIONAL\s*INFORMATION|PROFESSIONAL\s*EXPERIENCE|WORK\s*EXPERIENCE|ACADEMIC\s*QUALIFICATIONS|EDUCATION|TECHNICAL\s*SKILLS|PROFILE|SUMMARY)\b)/gi,
    "\n"
  );

  const lines = normalizedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("---") && !l.startsWith("===") && !l.startsWith("___"));

  // 1. Extract Email
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = cleanText.match(emailRegex);
  const email = emailMatch ? emailMatch[1] : fallback?.email || "";

  // 2. Extract Phone
  const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/i;
  const phoneMatch = Array.from(cleanText.matchAll(new RegExp(phoneRegex.source, "g"))).find(match => match[0].replace(/\D/g, "").length >= 7 && match[0].replace(/\D/g, "").length <= 15);
  const phone = phoneMatch ? phoneMatch[1].trim() : fallback?.phone || "";

  // 3. Extract Links
  const linkedinMatch = cleanText.match(/(?:https?:\/\/)?([a-z]{2,3}\.linkedin\.com\/in\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  let linkedinUrl = fallback?.linkedinUrl;
  if (linkedinMatch) {
    linkedinUrl = linkedinMatch[0].startsWith("http") ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  const githubMatch = cleanText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  let githubUrl = fallback?.githubUrl;
  if (githubMatch) {
    githubUrl = githubMatch[0].startsWith("http") ? githubMatch[0] : `https://${githubMatch[0]}`;
  }

  const websiteMatch = cleanText.match(/(https?:\/\/(?!(?:www\.)?(?:linkedin|github)\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
  const websiteUrl = websiteMatch ? websiteMatch[1] : fallback?.websiteUrl;

  // 4. Extract Location (from explicit label OR pipe-separated contact line)
  let extractedLocation: string | undefined = undefined;

  // Check header lines first for pipe-separated location (e.g. "Faisalabad, Punjab, Pakistan | +92 305 ...")
  for (const line of lines.slice(0, 10)) {
    if (line.includes("|")) {
      const parts = line.split("|").map((p) => p.trim());
      for (const p of parts) {
        if (
          !p.includes("@") &&
          !/\+?\d{6,}/.test(p) &&
          !p.toLowerCase().includes("linkedin") &&
          !p.toLowerCase().includes("github") &&
          !p.toLowerCase().includes("http") &&
          p.length >= 3 &&
          p.length < 60 &&
          /(pakistan|punjab|lahore|karachi|islamabad|faisalabad|rawalpindi|usa|uk|germany|berlin|london|dublin|canada|city|state|remote|hybrid|[a-z]+,\s*[a-z]+)/i.test(p)
        ) {
          extractedLocation = p;
          break;
        }
      }
    }
    if (extractedLocation) break;
  }

  if (!extractedLocation) {
    const locMatch = cleanText.match(/\b(?:location|city|residence|address)\s*[:\-]\s*([^\n\r|]{3,50})/i);
    if (locMatch) {
      extractedLocation = locMatch[1].trim();
    }
  }

  if (!extractedLocation) {
    for (const line of lines.slice(0, 10)) {
      if (line.includes("|")) {
        const parts = line.split("|").map((p) => p.trim());
        for (const p of parts) {
          if (
            !p.includes("@") &&
            !/\+?\d{6,}/.test(p) &&
            !p.toLowerCase().includes("linkedin") &&
            !p.toLowerCase().includes("github") &&
            !p.toLowerCase().includes("http") &&
            p.length > 3 &&
            p.length < 60
          ) {
            extractedLocation = p;
            break;
          }
        }
      }
      if (extractedLocation) break;
    }
  }

  // 5. Extract Regional Statutory Fields (Pakistani, European, US)
  const fatherNameMatch = cleanText.match(/(?:father(?:'s)?\s*name|s\/o|d\/o)\s*[:\-]?\s*([a-zA-Z\s.]+)/i);
  const fatherName = fatherNameMatch ? fatherNameMatch[1].trim() : fallback?.fatherName;

  const cnicMatch = cleanText.match(/(?:cnic|nic|national\s*id)\s*[:\-]?\s*([0-9]{5}-[0-9]{7}-[0-9]|[0-9]{13})/i) || cleanText.match(/\b([0-9]{5}-[0-9]{7}-[0-9])\b/);
  const cnic = cnicMatch ? cnicMatch[1].trim() : fallback?.cnic;

  const domicileMatch = cleanText.match(/domicile\s*[:\-]?\s*([a-zA-Z\s,]+)/i);
  const domicile = domicileMatch ? domicileMatch[1].trim() : fallback?.domicile;

  // Strict word-boundary PEC registration matching (requires digits, ignores words like "specialist")
  const pecMatch = cleanText.match(/\b(?:pec\s*(?:reg(?:istration)?)?|pec\s*#)\s*(?:no\.?|number|#)?\s*[:\-]?\s*([a-zA-Z]{0,6}[/-]?\d{3,7}[a-zA-Z0-9/-]*)\b/i);
  const rawPec = pecMatch ? pecMatch[1].trim() : fallback?.pecRegistrationNumber;
  const pecRegistrationNumber = rawPec && /\d{3,}/.test(rawPec) && !/ialist|specialist/i.test(rawPec) ? rawPec : undefined;

  const nationalityMatch = cleanText.match(/nationality\s*[:\-]?\s*([a-zA-Z\s]+)/i);
  const nationality = nationalityMatch ? nationalityMatch[1].trim() : fallback?.nationality;

  const dobMatch = cleanText.match(/(?:date\s*of\s*birth|dob)\s*[:\-]?\s*([a-zA-Z0-9\s,/-]+)/i);
  const dateOfBirth = dobMatch ? dobMatch[1].trim() : fallback?.dateOfBirth;

  const licenceMatch = cleanText.match(/(?:driving\s*licen[sc]e)\s*[:\-]?\s*([a-zA-Z0-9\s,()-]+)/i);
  const drivingLicence = licenceMatch ? licenceMatch[1].trim() : fallback?.drivingLicence;

  const matricMatch = cleanText.match(/(?:matric|matriculation|ssc)\s*[:\-]?\s*([a-zA-Z0-9\s,().+/%–-]+)/i);
  const matricDivision = matricMatch ? matricMatch[1].trim() : fallback?.matricDivision;

  const fscMatch = cleanText.match(/(?:f\.?sc|intermediate|hssc|a-?levels?)\s*[:\-]?\s*([a-zA-Z0-9\s,().+/%–-]+)/i);
  const fscDivision = fscMatch ? fscMatch[1].trim() : fallback?.fscDivision;

  const fypMatch = cleanText.match(/(?:fyp|final\s*year\s*project|capstone)\s*(?:title)?\s*[:\-]?\s*([a-zA-Z0-9\s,().+/%–-]+)/i);
  const fypTitle = fypMatch ? fypMatch[1].trim() : fallback?.fypTitle;

  // 6. Extract Candidate Full Name
  let fullName = "";

  // Check explicit name label
  const nameLabelMatch = cleanText.match(/(?:candidate(?:\s*name)?|full\s*name|^name)\s*[:\-]?\s*([a-zA-Z\s.]{2,45})/im);
  if (nameLabelMatch) {
    const candidatePart = nameLabelMatch[1].trim();
    if (!candidatePart.toLowerCase().includes("curriculum") && !candidatePart.toLowerCase().includes("resume")) {
      fullName = formatTitleCase(candidatePart);
    }
  }

  if (!fullName) {
    for (const line of lines.slice(0, 6)) {
      if (/^(curriculum vitae|resume|profile|contact|name:|candidate:)/i.test(line)) {
        const stripped = line.replace(/^(curriculum vitae|resume|profile|contact|name:|candidate:)\s*[:\-]?\s*/i, "").trim();
        if (stripped.length > 2 && stripped.length < 45 && !stripped.includes("@") && !stripped.includes("|")) {
          fullName = formatTitleCase(stripped);
          break;
        }
        continue;
      }
      const cleanLine = line.replace(/^#+\s*/, "").replace(/\*\*+/g, "").trim();
      if (
        cleanLine.length >= 2 &&
        cleanLine.length <= 45 &&
        !cleanLine.includes("@") &&
        !cleanLine.includes("|") &&
        !cleanLine.includes("http") &&
        !cleanLine.includes(".com") &&
        !cleanLine.includes(".pdf") &&
        !cleanLine.includes(".docx") &&
        !/\d{4}/.test(cleanLine) &&
        !/^(experience|education|projects|skills|summary|objective|contact|profile|personal|technical)/i.test(cleanLine)
      ) {
        fullName = formatTitleCase(cleanLine);
        break;
      }
    }
  }

  if (!fullName && fileName) {
    const fromFile = cleanCandidateNameFromFileName(fileName);
    if (fromFile && fromFile !== "Candidate Legal Name") {
      fullName = fromFile;
    }
  }

  if (!fullName) {
    fullName = fallback?.fullName || "Candidate Legal Name";
  }

  // 7. Extract Title / Role / Professional Headline
  let title = "";
  for (const line of lines.slice(0, 8)) {
    const cleanLine = line.replace(/^#+\s*/, "").replace(/\*\*+/g, "").trim();
    if (
      cleanLine.toLowerCase() !== fullName.toLowerCase() &&
      /(specialist|developer|engineer|architect|designer|scientist|student|analyst|fellow|manager|lead|consultant|accountant|nurse|doctor|officer|coordinator|executive|administrator|supervisor|writer|editor|teacher|professor|counselor|director|pharmacist)/i.test(cleanLine) &&
      cleanLine.length < 120 &&
      !cleanLine.includes("@") &&
      !cleanLine.includes("|") &&
      !cleanLine.includes("http")
    ) {
      title = cleanLine;
      break;
    }
  }
  if (!title) {
    title = fallback?.title || "";
  }

  // 8. Section Partitioning
  const sections: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    languages: [],
    projects: [],
    additionalInfo: [],
  };

  const customSections: NonNullable<CvData["customSections"]> = [];
  let customSection: { title: string; content: string[] } | undefined;
  let currentSection = "header";
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const isBulletLine = /^[-*•–+¢#]/.test(trimmedLine) || trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.startsWith("*");
    const words = trimmedLine.split(/\s+/).filter(Boolean);
    // Section headers are concise titles (<= 7 words), not full sentences ending with period or bullets
    const isPlausibleHeader = !isBulletLine && words.length <= 7 && !trimmedLine.endsWith(".");

    if (isPlausibleHeader) {
      const lower = trimmedLine.toLowerCase().replace(/[^a-z& ]/g, " ").replace(/\s+/g, " ").trim();

      const isHeaderSummary =
        /\b(summary|profile|career objective|about me|personal profile)\b/i.test(lower) &&
        !/\b(experience|education|skills|competencies|certifications|projects)\b/i.test(lower);

      const isHeaderSkills =
        /\b(skills|competencies|proficiencies|expertise)\b/i.test(lower) &&
        !/\b(experience|history|employment|education|academic|projects)\b/i.test(lower);

      const isHeaderProjects =
        /^(projects|key projects|portfolio projects|selected projects|personal projects|project experience)\b/i.test(lower) ||
        (/\b(projects?|portfolio)\b/i.test(lower) && words.length <= 4 && !/\b(education|employment|skills)\b/i.test(lower));

      const isHeaderExperience =
        /\b(experience|employment|work history|career history|internships)\b/i.test(lower) &&
        !/\b(education|academic|qualifications|skills|competencies|project|projects)\b/i.test(lower);

      const isHeaderEducation =
        /\b(education|academic|academics|qualifications|educational background)\b/i.test(lower) &&
        !/\b(experience|employment|skills|certifications|credentials)\b/i.test(lower);

      const isHeaderLanguagesCerts =
        /\b(languages|certifications|credentials|certificates|licenses)\b/i.test(lower) &&
        !/\b(experience|education|employment)\b/i.test(lower);

      const isHeaderAdditional =
        /\b(additional information|additional details|mobility|availability|interests|volunteer|awards)\b/i.test(lower);

      if (/^(clinical rotations?|publications?|legal bar admissions?|bar admissions?|research(?: experience)?|professional memberships?|conferences?|presentations?|volunteering|awards|references|teaching(?: experience)?)$/i.test(lower) || (/^[A-Z][A-Z &/-]{2,}$/.test(trimmedLine) && currentSection === "header" && ![isHeaderSummary, isHeaderSkills, isHeaderExperience, isHeaderEducation, isHeaderLanguagesCerts, isHeaderProjects, isHeaderAdditional].some(Boolean))) {
        customSection = { title: trimmedLine, content: [] };
        customSections.push(customSection);
        currentSection = "custom";
        continue;
      }
      if (isHeaderSummary) {
        currentSection = "summary";
        continue;
      } else if (isHeaderSkills) {
        currentSection = "skills";
        continue;
      } else if (isHeaderExperience) {
        currentSection = "experience";
        continue;
      } else if (isHeaderEducation) {
        currentSection = "education";
        continue;
      } else if (isHeaderLanguagesCerts) {
        currentSection = "languages";
        continue;
      } else if (isHeaderProjects) {
        currentSection = "projects";
        continue;
      } else if (isHeaderAdditional) {
        currentSection = "additionalInfo";
        continue;
      }
    }

    if (currentSection === "custom" && customSection) customSection.content.push(line);
    if (currentSection !== "header" && sections[currentSection]) {
      sections[currentSection].push(line);
    }
  }

  // 9. Extract Summary
  const summaryLines = sections.summary.filter(
    (l) =>
      l.toLowerCase() !== fullName.toLowerCase() &&
      l !== title &&
      (!email || !l.includes(email)) &&
      !l.includes("|") &&
      !l.includes("http") &&
      !l.toLowerCase().includes("linkedin") &&
      !l.toLowerCase().includes("phone")
  );
  const summaryText = summaryLines.join(" ").replace(/^#+\s*/g, "").trim();
  const summary = summaryText || fallback?.summary || "";

  // 10. Extract Technical Skills with Multi-Line Continuation & Accurate Categories
  const structuredSkills: CvData["skills"] = [];
  const knownSkillCategories = [
    { key: "wordpress & web", name: "WordPress & Web Development" },
    { key: "wordpress", name: "WordPress & Web Development" },
    { key: "seo & marketing", name: "SEO & Digital Marketing" },
    { key: "seo", name: "SEO & Digital Marketing" },
    { key: "e-commerce", name: "E-commerce Solutions" },
    { key: "automation", name: "Automation & Integration" },
    { key: "databases & development", name: "Databases & Development" },
    { key: "databases", name: "Databases & Development" },
    { key: "version control", name: "Version Control & Collaboration" },
    { key: "analytics", name: "Analytics & Reporting" },
    { key: "programming languages", name: "Programming Languages & Core" },
    { key: "frontend & ui", name: "Frontend & UI Frameworks" },
    { key: "backend & apis", name: "Backend & Cloud APIs" },
    { key: "cloud & devops", name: "Cloud & DevOps" },
    { key: "tools & platforms", name: "Tools & Platforms" },
  ];

  if (sections.skills.length > 0) {
    // A. Reconstruct wrapped lines into distinct category paragraphs
    const combinedSkillLines: string[] = [];
    for (const rawLine of sections.skills) {
      const clean = rawLine.trim();
      if (!clean) continue;

      const startsCategory =
        knownSkillCategories.some((cat) => clean.toLowerCase().startsWith(cat.key)) ||
        clean.includes(":");

      if (startsCategory || combinedSkillLines.length === 0) {
        combinedSkillLines.push(clean);
      } else {
        // Line continuation from previous line (e.g. "Responsive Web Design")
        const prev = combinedSkillLines[combinedSkillLines.length - 1];
        if (prev.endsWith("•") || prev.endsWith(",")) {
          combinedSkillLines[combinedSkillLines.length - 1] = `${prev} ${clean}`;
        } else if (clean.startsWith("•") || clean.startsWith(",")) {
          combinedSkillLines[combinedSkillLines.length - 1] = `${prev} ${clean}`;
        } else {
          combinedSkillLines[combinedSkillLines.length - 1] = `${prev} • ${clean}`;
        }
      }
    }

    // B. Parse each category and its specific skill items
    for (const line of combinedSkillLines) {
      let category = "";
      let remaining = line;

      if (line.includes(":")) {
        const colonIdx = line.indexOf(":");
        category = line.slice(0, colonIdx).replace(/^[-*•#]\s*/, "").trim();
        remaining = line.slice(colonIdx + 1).trim();
      } else {
        const lowerLine = line.toLowerCase();
        for (const cat of knownSkillCategories) {
          if (lowerLine.startsWith(cat.key)) {
            category = cat.name;
            remaining = line.slice(cat.key.length).trim();
            break;
          }
        }
      }

      if (!category) {
        // Check if line contains a bullet
        if (line.includes("•")) {
          const firstBullet = line.indexOf("•");
          category = line.slice(0, firstBullet).replace(/^[-*•#]\s*/, "").trim();
          remaining = line.slice(firstBullet + 1).trim();
        } else {
          category = "Technical Competencies";
        }
      }

      // Clean remaining items
      const rawItems = remaining
        .replace(/^[:\-–•]/, "")
        .split(/[•,;|]/)
        .map((s) => s.trim())
        .filter(Boolean);

      // Clean items to ensure repeated category names aren't duplicated in item 1
      const cleanedItems: string[] = [];
      for (const item of rawItems) {
        let it = item;
        for (const cat of knownSkillCategories) {
          if (it.toLowerCase().startsWith(cat.key)) {
            it = it.slice(cat.key.length).trim();
            break;
          }
        }
        if (it.length > 0 && !cleanedItems.includes(it)) {
          cleanedItems.push(it);
        }
      }

      if (cleanedItems.length > 0) {
        structuredSkills.push({
          category: category || "Technical Competencies",
          items: cleanedItems,
        });
      }
    }
  }

  // 11. Extract Professional Experience with Strict Role / Company / Bullet Isolation
  const experienceEntries: CvData["experience"] = [];
  if (sections.experience.length > 0) {
    let curRole = "";
    let curComp = "";
    let curPeriod = "";
    let curBullets: string[] = [];

    const flushExp = () => {
      if (curRole || curComp || curBullets.length > 0) {
        experienceEntries.push({
          company: curComp,
          role: curRole,
          period: curPeriod,
          bullets: curBullets,
        });
        curRole = "";
        curComp = "";
        curPeriod = "";
        curBullets = [];
      }
    };

    const expDateRegex = /\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(19\d\d|20\d\d)\s*[-–—to/ ]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:19\d\d|20\d\d|present|current)\b/i;

    for (const rawLine of sections.experience) {
      const trimmedRaw = rawLine.trim();
      if (!trimmedRaw) continue;

      const isBullet =
        /^[-*•–+¢]\s*/.test(trimmedRaw) ||
        trimmedRaw.startsWith("•") ||
        trimmedRaw.startsWith("-") ||
        trimmedRaw.startsWith("*") ||
        trimmedRaw.startsWith("¢");
      const cleanLine = trimmedRaw.replace(/^[-*•–+#¢]\s*/, "").replace(/\*\*/g, "").trim();
      if (!cleanLine) continue;

      if (isBullet) {
        curBullets.push(cleanLine);
        continue;
      }

      // Check if line contains date
      const dMatch = cleanLine.match(expDateRegex);
      if (dMatch) {
        const lineDate = dMatch[0].trim();
        const textWithoutDate = cleanLine
          .replace(lineDate, "")
          .replace(/[-–—|,()]/g, " ")
          .replace(/\s{2,}/g, " ")
          .trim();

        if (curBullets.length > 0) {
          flushExp();
        }

        curPeriod = lineDate;

        if (textWithoutDate.length > 0) {
          if (textWithoutDate.includes(" at ")) {
            const parts = textWithoutDate.split(" at ");
            curRole = parts[0].trim();
            curComp = parts[1].trim();
          } else if (textWithoutDate.includes("|") || textWithoutDate.includes("—")) {
            const parts = textWithoutDate.split(/[|—]/);
            curRole = parts[0].trim();
            curComp = parts[1].trim();
          } else {
            curRole = textWithoutDate;
          }
        }
        continue;
      }

      // Line without date
      const isRoleName = /(specialist|developer|engineer|manager|consultant|lead|intern|designer|architect|analyst|trainee|accountant|auditor|nurse|doctor|officer|associate|executive|administrator|supervisor|writer|editor|teacher|professor|counselor|advisor|director|head|founder|partner|lawyer)/i.test(
        cleanLine
      );
      const isCompanyName = /(software house|technologies|solutions|agency|inc|corp|ltd|llc|organization|services|enterprises|self-employed|freelance|hospital|clinic|bank|university|college|school|group|firm|partners|associates|company|co\.|studio|consulting)/i.test(
        cleanLine
      );

      if (curBullets.length > 0) {
        flushExp();
      }

      if (isCompanyName && !curComp) {
        curComp = cleanLine;
      } else if (isRoleName && !curRole) {
        curRole = cleanLine;
      } else if (!curRole) {
        curRole = cleanLine;
      } else if (!curComp) {
        curComp = cleanLine;
      } else {
        curBullets.push(cleanLine);
      }
    }
    flushExp();
  }

  // 12. Extract Education Entries
  const educationEntries: CvData["education"] = [];
  if (sections.education.length > 0) {
    let curDeg = "";
    let curInst = "";
    let curYr = "";
    let curGpa = "";
    let curHigh = "";

    const flushEdu = () => {
      if (curDeg || curInst) {
        const finalInst = curInst;
        const finalDeg = curDeg;

        educationEntries.push({
          degree: finalDeg,
          institution: finalInst,
          year: curYr,
          gpa: curGpa || undefined,
          highlights: curHigh || undefined,
        });

        curDeg = "";
        curInst = "";
        curYr = "";
        curGpa = "";
        curHigh = "";
      }
    };

    const degreeRegex =
      /\b(bachelor|master|doctor|ph\.?d|b\.?s|m\.?s|bba|mba|b\.?com|m\.?com|b\.?a|m\.?a|mbbs|llb|llm|doctorate|diploma|associate|intermediate|matriculation|matric|f\.?sc|fsc|ics|a-?levels?|o-?levels?|high school|secondary|bsn|msn|dnp|md|jd|b\.?eng|m\.?eng|degree in|bachelor's|master's|doctor's)\b/i;
    const instRegex = /(university|college|institute|school|academy|board|bise|faculty|polytechnic|gymnasium)/i;
    const eduDateRegex = /\b((?:19\d\d|20\d\d)\s*[-–—to/ ]+\s*(?:19\d\d|20\d\d|present|current)|(?:19\d\d|20\d\d))\b/i;

    for (const rawLine of sections.education) {
      const cleanLine = rawLine.replace(/^[-*•–+#¢]\s*/, "").replace(/\*\*/g, "").trim();
      if (!cleanLine) continue;

      if (/^(?:languages|certifications|project experience|projects|additional information|technical competencies|professional experience)/i.test(cleanLine)) {
        break;
      }

      if (/(currently enrolled|ongoing|in progress|enrolled|graduated with honors|dean's list|merit scholarship|magna cum laude|summa cum laude|cum laude)/i.test(cleanLine)) {
        curHigh = curHigh ? `${curHigh} • ${cleanLine}` : cleanLine;
        continue;
      }

      const gpaMatch = cleanLine.match(/\b(?:c?gpa|grade|division|marks)[\s:]*([0-9.]+(?:\s*\/\s*[0-9.]+)?|[a-z+]+(?:\s+grade)?)\b/i);
      if (gpaMatch) {
        curGpa = gpaMatch[0];
      }

      const dMatch = cleanLine.match(eduDateRegex);
      const lineDate = dMatch ? dMatch[0].trim() : "";
      const textWithoutDate = lineDate ? cleanLine.replace(lineDate, "").replace(/[-–—|,()]/g, " ").replace(/\s{2,}/g, " ").trim() : cleanLine;

      if (cleanLine.includes("|") || cleanLine.includes("—")) {
        const parts = cleanLine.split(/[|—]/).map((p) => p.trim());
        flushEdu();
        for (const p of parts) {
          if (eduDateRegex.test(p) && !curYr) {
            curYr = p;
          } else if (instRegex.test(p) && !curInst) {
            curInst = p;
          } else if (degreeRegex.test(p) && !curDeg) {
            curDeg = p;
          } else if (!curDeg) {
            curDeg = p;
          } else if (!curInst) {
            curInst = p;
          }
        }
        flushEdu();
        continue;
      }

      const hasDeg = degreeRegex.test(textWithoutDate);
      const hasInst = instRegex.test(textWithoutDate);

      // If both degree and institution appear on this line (e.g. "Bachelor of Science in Data Analytics Government College University Faisalabad")
      if (hasDeg && hasInst) {
        flushEdu();
        const instWordMatch = textWithoutDate.match(instRegex);
        if (instWordMatch && instWordMatch.index !== undefined) {
          const beforeInst = textWithoutDate.slice(0, instWordMatch.index).trim();
          const fromInst = textWithoutDate.slice(instWordMatch.index).trim();
          const wordsBefore = beforeInst.split(/\s+/);
          const lastWord = wordsBefore[wordsBefore.length - 1];
          if (/^(government|punjab|national|federal|islamic|aga|fast|uet|nust|gc|lahore|karachi|delhi|oxford|cambridge|harvard|stanford|columbia|cornell|yale|chicago|michigan|texas)$/i.test(lastWord)) {
            wordsBefore.pop();
            curDeg = wordsBefore.join(" ");
            curInst = `${lastWord} ${fromInst}`;
          } else {
            curDeg = beforeInst;
            curInst = fromInst;
          }
        } else {
          curDeg = textWithoutDate;
        }
        if (lineDate) curYr = lineDate;
        continue;
      }

      if (hasDeg && !hasInst) {
        if (curDeg) {
          flushEdu();
        }
        curDeg = textWithoutDate;
        if (lineDate) curYr = lineDate;
        continue;
      }

      if (hasInst) {
        if (!curInst) {
          curInst = textWithoutDate;
        } else {
          if (curDeg) flushEdu();
          curInst = textWithoutDate;
        }
        if (lineDate && !curYr) curYr = lineDate;
        continue;
      }

      if (lineDate && textWithoutDate.length === 0) {
        curYr = lineDate;
        continue;
      }

      if (textWithoutDate.length > 2 && textWithoutDate.length < 80) {
        if (!curDeg) {
          curDeg = textWithoutDate;
        } else if (!curInst) {
          curInst = textWithoutDate;
        } else {
          curHigh = curHigh ? `${curHigh} • ${textWithoutDate}` : textWithoutDate;
        }
      }
    }
    flushEdu();
  }

  // 13. Extract Languages & Certifications
  const parsedLanguages: { language: string; proficiency: string; cefrLevel?: string }[] = [];
  const parsedCerts: string[] = [];

  if (sections.languages.length > 0) {
    for (const rawLine of sections.languages) {
      const cleanLine = rawLine.replace(/^[-*•–+#]\s*/, "").trim();
      if (!cleanLine) continue;

      const langMatch = cleanLine.match(/\b(german|english|urdu|french|spanish|arabic|punjabi|hindi)\b/i);
      const isCert = /(certificate|certification|completed|completion|certified|diploma|license)/i.test(cleanLine);

      if (langMatch) {
        const langName = langMatch[1].charAt(0).toUpperCase() + langMatch[1].slice(1).toLowerCase();
        let prof = cleanLine;
        if (cleanLine.includes(":")) {
          prof = cleanLine.split(":")[1].trim();
        } else if (cleanLine.includes("—")) {
          prof = cleanLine.split("—")[1].trim();
        } else if (cleanLine.includes("-")) {
          prof = cleanLine.split("-")[1].trim();
        } else {
          prof = cleanLine.replace(new RegExp(`^${langName}\\s*`, "i"), "").trim() || "Proficient";
        }

        const cefrMatch = prof.match(/\b([ABC][12])\b/i);
        parsedLanguages.push({
          language: langName,
          proficiency: prof,
          cefrLevel: cefrMatch ? cefrMatch[1].toUpperCase() : undefined,
        });

        if (isCert) {
          parsedCerts.push(cleanLine);
        }
      } else {
        parsedCerts.push(cleanLine);
      }
    }
  }

  // 14. Extract Projects
  const projectNarrative = sections.projects.join(" ").trim();
  const projectEntries: CvData["projects"] = [];
  if (sections.projects.length > 0) {
    let curName = "";
    let curTools = "";
    let curBullets: string[] = [];

    const flushProj = () => {
      if (curName || curBullets.length > 0) {
        projectEntries.push({
          name: curName || "Key Professional Project",
          tools: curTools || "",
          bullets: curBullets,
        });
        curName = "";
        curTools = "";
        curBullets = [];
      }
    };

    for (const rawLine of sections.projects) {
      const isBullet = /^[-*•–+]\s+/.test(rawLine) || rawLine.startsWith("•") || rawLine.startsWith("-");
      const cleanLine = rawLine.replace(/^[-*•–+#]\s*/, "").replace(/\*\*/g, "").trim();
      if (!cleanLine) continue;

      if (isBullet) {
        curBullets.push(cleanLine);
      } else if (!curName) {
        curName = cleanLine;
      } else if (cleanLine.toLowerCase().includes("tools:") || cleanLine.toLowerCase().includes("tech:")) {
        curTools = cleanLine.replace(/^(?:tools|tech|technologies)\s*[:\-]\s*/i, "").trim();
      } else {
        curBullets.push(cleanLine);
      }
    }
    flushProj();
  }

  // 15. Additional Information
  const additionalInfo = sections.additionalInfo.join(" ").trim();

  return {
    fullName,
    title,
    email,
    phone,
    location: extractedLocation || fallback?.location || "",
    websiteUrl,
    linkedinUrl,
    githubUrl,
    summary,
    fatherName,
    cnic,
    domicile,
    pecRegistrationNumber,
    nationality,
    dateOfBirth,
    drivingLicence,
    matricDivision,
    fscDivision,
    fypTitle,
    fypSupervisor: fallback?.fypSupervisor,
    education: educationEntries.length > 0 ? educationEntries : fallback?.education || [],
    experience: experienceEntries.length > 0 ? experienceEntries : fallback?.experience || [],
    projects: projectEntries.length > 0 ? projectEntries : fallback?.projects || [],
    skills: structuredSkills.length > 0 ? structuredSkills : fallback?.skills || [],
    certifications: parsedCerts.length > 0 ? parsedCerts : fallback?.certifications || [],
    languages: parsedLanguages.length > 0 ? parsedLanguages : fallback?.languages || [],
    projectExperienceNarrative: projectNarrative || fallback?.projectExperienceNarrative,
    additionalInfo: additionalInfo || fallback?.additionalInfo,
    customSections,
  };
}

/**
 * Extracts a candidate's clean human name from an uploaded file name
 * e.g. "Rajeel_Ahmad_CV.pdf" -> "Rajeel Ahmad"
 */
export function cleanCandidateNameFromFileName(fileName: string): string {
  if (!fileName) return "";
  const base = fileName
    .replace(/\.[^/.]+$/, "") // strip extension
    .replace(/[_-]/g, " ")
    .replace(/\b(cv|resume|curriculum|vitae|doc|docx|pdf|final|updated|new|latest|draft|academic|v\d+)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (base.length >= 2 && base.length <= 45 && !/\d{5}/.test(base)) {
    return formatTitleCase(base);
  }
  return base ? formatTitleCase(base) : "Candidate Legal Name";
}

function formatTitleCase(str: string): string {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Robust Client-Side and Server-Side File Text Extractor
 * Extracts real candidate text from PDF, DOCX, TXT, MD, and JSON buffers.
 * Automatically decompresses PDF FlateDecode streams and DOCX OpenXML documents!
 */
export async function extractTextFromCvFileBuffer(buffer: ArrayBuffer, fileName: string): Promise<string> {
  const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

  // 1. TXT / MD / JSON / Plain Text
  if (ext === ".txt" || ext === ".md" || ext === ".json") {
    try {
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(buffer);
    } catch {
      return "";
    }
  }

  // 2. DOCX (OpenXML Decompression from Zip Stream via mammoth + fallback)
  if (ext === ".docx") {
    try {
      const mammoth = await import("mammoth");
      const extractFn = mammoth.extractRawText || (mammoth.default && mammoth.default.extractRawText);
      if (extractFn) {
        const res = await extractFn({ arrayBuffer: buffer });
        if (res && res.value && res.value.trim().length > 15) {
          return res.value.trim();
        }
      }
    } catch (err) {
      console.warn("mammoth extraction warning, falling back to in-browser zip decoder:", err);
    }

    try {
      const { extractTextFromDocx } = await import("./rag-parser");
      const docxText = await extractTextFromDocx(buffer);
      if (docxText && docxText.trim().length > 15) {
        return docxText.trim();
      }
    } catch {}

    try {
      const u8 = new Uint8Array(buffer);
      let offset = 0;
      while (offset < u8.length - 30) {
        if (u8[offset] === 0x50 && u8[offset + 1] === 0x4b && u8[offset + 2] === 0x03 && u8[offset + 3] === 0x04) {
          const view = new DataView(u8.buffer, u8.byteOffset + offset);
          const compMethod = view.getUint16(8, true);
          const compSize = view.getUint32(18, true);
          const nameLen = view.getUint16(26, true);
          const extraLen = view.getUint16(28, true);
          const nameBytes = u8.subarray(offset + 30, offset + 30 + nameLen);
          const name = new TextDecoder().decode(nameBytes);

          if (name === "word/document.xml" || name.endsWith("document.xml")) {
            const fileData = u8.subarray(offset + 30 + nameLen + extraLen, offset + 30 + nameLen + extraLen + compSize);
            let xml = "";
            if (compMethod === 8 && typeof DecompressionStream !== "undefined") {
              const ds = new DecompressionStream("deflate-raw");
              const writer = ds.writable.getWriter();
              writer.write(fileData);
              writer.close();
              const reader = ds.readable.getReader();
              const chunks: Uint8Array[] = [];
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) chunks.push(value);
              }
              const totalBytes = chunks.reduce((acc, c) => acc + c.length, 0);
              const merged = new Uint8Array(totalBytes);
              let ptr = 0;
              for (const c of chunks) {
                merged.set(c, ptr);
                ptr += c.length;
              }
              xml = new TextDecoder("utf-8").decode(merged);
            } else {
              xml = new TextDecoder("utf-8").decode(fileData);
            }

            // Extract XML paragraph text from <w:t> tags
            const paragraphs = xml.split(/<\/w:p>/);
            const extractedLines: string[] = [];
            for (const p of paragraphs) {
              const tMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
              if (tMatches) {
                const line = tMatches.map((m) => m.replace(/<[^>]+>/g, "")).join("").trim();
                if (line.length > 0) extractedLines.push(line);
              }
            }
            if (extractedLines.length > 0) {
              return extractedLines.join("\n");
            }
          }
          offset += 30 + nameLen + extraLen + compSize;
        } else {
          offset++;
        }
      }
    } catch (err) {
      console.warn("DOCX extraction error:", err);
    }
  }

  // 3. PDF Text Extraction (unpdf + rag-parser + stream decompression fallback)
  if (ext === ".pdf") {
    try {
      const { extractText } = await import("unpdf");
      const unpdfRes = await extractText(new Uint8Array(buffer));
      if (unpdfRes && unpdfRes.text) {
        const textStr = Array.isArray(unpdfRes.text) ? unpdfRes.text.join("\n") : String(unpdfRes.text);
        if (textStr.trim().length > 15) {
          return textStr.trim();
        }
      }
    } catch (err) {
      console.warn("unpdf extraction warning, falling back to in-browser pdf stream decoder:", err);
    }

    try {
      const { extractTextFromPdf } = await import("./rag-parser");
      const ragPdfText = await extractTextFromPdf(buffer);
      if (ragPdfText && ragPdfText.trim().length > 15) {
        return ragPdfText.trim();
      }
    } catch {}

    try {
      const u8 = new Uint8Array(buffer);
      const latin1 = new TextDecoder("latin1").decode(buffer);
      const allTextChunks: string[] = [];

      // A. Scan and decompress all FlateDecode streams
      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match: RegExpExecArray | null;

      while ((match = streamRegex.exec(latin1)) !== null) {
        const streamStart = match.index + match[0].indexOf("\n") + 1;
        const streamLen = match[1].length;
        const streamBytes = u8.subarray(streamStart, streamStart + streamLen);

        if (streamBytes.length > 4 && typeof DecompressionStream !== "undefined") {
          try {
            const ds = new DecompressionStream("deflate");
            const writer = ds.writable.getWriter();
            writer.write(streamBytes);
            writer.close();
            const reader = ds.readable.getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) chunks.push(value);
            }
            const totalBytes = chunks.reduce((acc, c) => acc + c.length, 0);
            const merged = new Uint8Array(totalBytes);
            let ptr = 0;
            for (const c of chunks) {
              merged.set(c, ptr);
              ptr += c.length;
            }
            const decompressedText = new TextDecoder("latin1").decode(merged);

            // Extract Tj strings: (Rajeel Ahmad) Tj
            const tj = decompressedText.match(/\(([^()]+)\)\s*T[jd]/g);
            if (tj) {
              for (const m of tj) {
                const clean = m.replace(/\)\s*T[jd]$/, "").replace(/^\(/, "").trim();
                if (clean.length > 0 && !/[^\x20-\x7E]/.test(clean)) {
                  allTextChunks.push(clean);
                }
              }
            }

            // Extract TJ arrays: [(Rajeel) -10 (Ahmad)] TJ
            const tjArr = decompressedText.match(/\[(.*?)\]\s*TJ/g);
            if (tjArr) {
              for (const arr of tjArr) {
                const parts = arr.match(/\(([^()]+)\)/g);
                if (parts) {
                  const line = parts.map((s) => s.slice(1, -1)).join("");
                  if (line.trim().length > 0 && !/[^\x20-\x7E]/.test(line)) {
                    allTextChunks.push(line.trim());
                  }
                }
              }
            }
          } catch {
            // Not standard deflate stream or encrypted, continue
          }
        }
      }

      // B. Also extract uncompressed Tj strings
      const tjMatches = latin1.match(/\(([^()]+)\)\s*T[jd]/g);
      if (tjMatches) {
        for (const m of tjMatches) {
          const text = m.replace(/\)\s*T[jd]$/, "").replace(/^\(/, "").trim();
          if (text.length > 1 && !/[^\x20-\x7E]/.test(text)) {
            allTextChunks.push(text);
          }
        }
      }

      // C. Extract /Title and /Author metadata
      const metaMatches = latin1.match(/\/(?:Title|Author|Subject)\s*\(([^()]+)\)/g);
      if (metaMatches) {
        for (const m of metaMatches) {
          const val = m.replace(/^\/(?:Title|Author|Subject)\s*\(/, "").replace(/\)$/, "").trim();
          if (val.length > 2) allTextChunks.unshift(val);
        }
      }

      if (allTextChunks.length > 0) {
        return allTextChunks.join("\n");
      }

      // D. Fallback: continuous ASCII printable lines
      const asciiWords = latin1
        .replace(/[^\x20-\x7E\n\r\t]/g, "\n")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(
          (l) =>
            l.length >= 3 &&
            !l.startsWith("%PDF") &&
            !l.startsWith("endobj") &&
            !l.startsWith("obj") &&
            !l.includes("FlateDecode") &&
            !l.includes("Filter")
        );

      if (asciiWords.length > 5) {
        return asciiWords.join("\n").slice(0, 8000);
      }
    } catch (err) {
      console.warn("PDF extraction error:", err);
    }
  }

  return "";
}

/**
 * Apply AI Audit Verb Upgrades & Enhanced Bullet Points directly to candidate CV Data
 * Preserves the actual candidate identity, education, experience, and projects!
 * NEVER replaces user data with canned/dummy text!
 */
export function applyAiUpgradesToCvData(candidateCv: CvData, auditResult: Partial<CvAuditResult>): CvData {
  if (!auditResult) return candidateCv;

  const verbMap: Record<string, string> = {};
  if (Array.isArray(auditResult.actionVerbSuggestions)) {
    for (const v of auditResult.actionVerbSuggestions) {
      if (v.weak && v.replacement) {
        verbMap[v.weak.toLowerCase().trim()] = v.replacement.trim();
      }
    }
  }

  // Upgrade experience bullets while preserving the user's authentic achievements
  const updatedExperience = (candidateCv.experience || []).map((exp) => ({
    ...exp,
    bullets: exp.bullets.map((b) => {
      let upgraded = b;
      for (const [weak, strong] of Object.entries(verbMap)) {
        upgraded = upgraded.replace(new RegExp(`\\b${weak}\\b`, "gi"), strong);
      }
      return upgraded;
    }),
  }));

  // Upgrade project bullets while preserving the user's authentic projects
  const updatedProjects = (candidateCv.projects || []).map((proj) => ({
    ...proj,
    bullets: proj.bullets.map((b) => {
      let upgraded = b;
      for (const [weak, strong] of Object.entries(verbMap)) {
        upgraded = upgraded.replace(new RegExp(`\\b${weak}\\b`, "gi"), strong);
      }
      return upgraded;
    }),
  }));

  return {
    ...candidateCv,
    // Preserve candidate summary if already present
    summary: candidateCv.summary && candidateCv.summary.length > 20 ? candidateCv.summary : auditResult.enhancedCvText?.slice(0, 400) || candidateCv.summary,
    experience: updatedExperience,
    projects: updatedProjects,
  };
}
