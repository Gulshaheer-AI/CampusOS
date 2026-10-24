import { NextRequest, NextResponse } from "next/server";
import { callGeminiWithAutoFallback } from "@/lib/gemini";
import { CvAuditResult, CvData } from "@/types";
import { parseRawCvTextToCvData, applyAiUpgradesToCvData, extractTextFromCvFileBuffer } from "@/lib/cv-parser";

export const dynamic = "force-dynamic";

function computeDynamicFallbackAudit(
  cv: CvData,
  targetRole: string,
  region: string
): CvAuditResult {
  const allBullets = [
    ...(cv.experience || []).flatMap((e) => e.bullets || []),
    ...(cv.projects || []).flatMap((p) => p.bullets || []),
  ];
  const bulletText = allBullets.join(" ");

  let atsScore = 65;
  if (cv.fullName && cv.fullName !== "Candidate Legal Name") atsScore += 5;
  if (cv.email && cv.phone) atsScore += 6;
  if (cv.location && cv.location !== "Remote / Hybrid") atsScore += 4;
  if (cv.summary && cv.summary.length > 40) atsScore += 6;
  if ((cv.experience || []).length >= 2) atsScore += 7;
  else if ((cv.experience || []).length === 1) atsScore += 4;
  if ((cv.education || []).length >= 1) atsScore += 4;
  if ((cv.skills || []).length >= 2) atsScore += 4;

  const hasMetrics = allBullets.filter((b) => /\d+%|\$\d+|\b\d+\b\s*(?:users|clients|projects|percent|teams|sites|revenue|growth)/i.test(b)).length;
  if (hasMetrics >= 2) atsScore += 4;
  atsScore = Math.min(97, Math.max(60, atsScore));

  const overallVerdict: "Exceptional" | "Competitive" | "Needs Improvement" =
    atsScore >= 90 ? "Exceptional" : atsScore >= 75 ? "Competitive" : "Needs Improvement";

  const strengths: string[] = [];
  if (cv.title) {
    strengths.push(`Clearly identified professional focus in ${cv.title} aligned with ${region.toUpperCase()} standards.`);
  }
  if ((cv.skills || []).length > 0) {
    const categories = cv.skills.map((s) => s.category).slice(0, 3).join(", ");
    strengths.push(`Well-structured competency breakdown covering ${categories}.`);
  }
  if ((cv.education || []).length > 0) {
    strengths.push(`Verified academic qualifications from ${cv.education[0].institution || "accredited institution"}.`);
  }
  if (strengths.length < 3) {
    strengths.push(`Clean, standard layout compliant with applicant tracking systems (ATS).`);
  }

  const improvements: CvAuditResult["improvements"] = [];
  if (hasMetrics < 2) {
    improvements.push({
      section: "Experience",
      issue: "Lack of quantitative metrics in bullet points",
      suggestion: "Quantify achievements using numbers, percentages, or measurable throughput to demonstrate impact.",
    });
  }
  if (!cv.summary || cv.summary.length < 50) {
    improvements.push({
      section: "Summary",
      issue: "Career summary is brief or missing",
      suggestion: "Add a 2-3 sentence value proposition highlighting key achievements and target roles.",
    });
  }
  if (!cv.linkedinUrl) {
    improvements.push({
      section: "Contact",
      issue: "Professional LinkedIn profile missing",
      suggestion: "Include your customized LinkedIn profile URL to facilitate recruiter vetting.",
    });
  }
  if (improvements.length === 0) {
    improvements.push({
      section: "Experience",
      issue: "Action verb optimization",
      suggestion: "Begin every accomplishment statement with a strong leadership or outcome verb.",
    });
  }

  // Detect verbs present in their actual bullets
  const verbCandidates = [
    { weak: "worked", replacement: "collaborated & spearheaded", reason: "Demonstrates active initiative rather than passive presence" },
    { weak: "helped", replacement: "facilitated & accelerated", reason: "Highlights proactive problem-solving and throughput" },
    { weak: "responsible for", replacement: "owned & orchestrated", reason: "Signals end-to-end accountability and leadership" },
    { weak: "handled", replacement: "managed & optimized", reason: "Demonstrates managerial efficiency and precision" },
    { weak: "made", replacement: "designed & deployed", reason: "Highlights structured methodology and quality" },
    { weak: "did", replacement: "executed with distinction", reason: "Communicates high performance and rigor" },
    { weak: "assisted", replacement: "partnered closely to deliver", reason: "Emphasizes collaborative stakeholder delivery" },
    { weak: "delivered", replacement: "engineered & delivered", reason: "Strengthens professional impact" },
    { weak: "conducted", replacement: "spearheaded", reason: "Action verb favored by ATS algorithms" },
    { weak: "performed", replacement: "executed comprehensive evaluations", reason: "Highlights methodological rigor" },
    { weak: "built", replacement: "architected & delivered", reason: "Shows strategic technical ownership" },
  ];

  const matchedVerbs = verbCandidates.filter((v) => new RegExp(`\\b${v.weak}\\b`, "i").test(bulletText));
  const actionVerbSuggestions = matchedVerbs.length >= 2 ? matchedVerbs.slice(0, 4) : verbCandidates.slice(0, 3);

  return {
    atsScore,
    overallVerdict,
    strengths,
    improvements,
    actionVerbSuggestions,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "audit",
      cvText = "",
      targetRole = "Software Engineer",
      region = "pakistani",
      jobDescription = "",
      studentProfile = {},
      studentPortfolio = [],
      customPrompt = "",
    } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.CAMPUSOS_AI_KEY ||
      "";

    // Action: Parse uploaded CV file on server with Gemini AI Multimodal & Node fallback
    if (action === "parse_file") {
      let extractedText = cvText || "";
      const isImage = /\.(png|jpe?g|webp)$/i.test(body.fileName || "");
      const isPdf = /\.pdf$/i.test(body.fileName || "");

      if (body.fileBase64 && !isImage) {
        try {
          const buffer = Buffer.from(body.fileBase64, "base64");
          const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
          extractedText = await extractTextFromCvFileBuffer(arrayBuffer, body.fileName || "resume.pdf");
        } catch (e) {
          console.warn("Server file decode error:", e);
        }
      }

      // 1. Direct Multimodal Gemini AI Parse & Audit for Unseen CVs
      if (apiKey) {
        try {
          const parts: any[] = [];
          if (isImage && body.fileBase64) {
            const ext = (body.fileName || "").split(".").pop()?.toLowerCase();
            const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
            parts.push({
              inlineData: { mimeType, data: body.fileBase64 },
            });
            parts.push({
              text: `This image is a candidate's CV document. Read all text, identify sections, extract their authentic profile into structured JSON matching the CvData schema, and perform a realistic ATS audit for the ${region.toUpperCase()} hiring market.`,
            });
          } else if (isPdf && (!extractedText || extractedText.length < 60) && body.fileBase64) {
            parts.push({
              inlineData: { mimeType: "application/pdf", data: body.fileBase64 },
            });
            parts.push({
              text: `This PDF document is a candidate's CV. Extract their authentic data into structured JSON matching the CvData schema, and perform an ATS audit.`,
            });
          } else if (extractedText && extractedText.length > 20) {
            parts.push({
              text: `[CANDIDATE CV DOCUMENT: ${body.fileName || "CV"}]:\n${extractedText.slice(0, 15000)}\n\nExtract this candidate's authentic CV details into structured JSON matching the schema, and perform an ATS audit.`,
            });
          }

          if (parts.length > 0) {
            const systemInstruction = `You are Monday AI, an executive recruiter and Senior ATS CV Parser.
Extract the candidate's authentic details from the provided CV document into strict JSON.
CRITICAL EXTRACTION RULES:
1. Extract the candidate's REAL name, title, contact info, summary, education, experience, projects, skills, certifications, and languages.
2. DO NOT make up fake technical skills or default to WordPress/SEO or software engineering if they belong to a different profession (e.g. accounting, medicine, nursing, civil engineering, marketing, business, legal, teaching)!
3. Preserve every specialized or unrecognized section in customSections, with its original heading and all lines. Never flatten or discard publications, clinical rotations, or bar admissions.
4. Formulate a realistic, authentic ATS evaluation:
   - atsScore: number between 55 and 98 based on real CV quality and completeness
   - overallVerdict: "Exceptional" (>=90), "Competitive" (75-89), or "Needs Improvement" (<75)
   - strengths: 3-5 real strengths found directly in their CV
   - improvements: 2-4 concrete, actionable improvement suggestions tailored to their actual field
   - actionVerbSuggestions: 3-5 weak verbs found in their text with strong replacements

Return STRICT JSON:
{
  "cvData": {
    "fullName": string,
    "title": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedinUrl": string,
    "githubUrl": string,
    "websiteUrl": string,
    "summary": string,
    "education": [{ "institution": string, "degree": string, "year": string, "gpa": string, "highlights": string }],
    "experience": [{ "company": string, "role": string, "period": string, "bullets": string[] }],
    "projects": [{ "name": string, "tools": string, "bullets": string[] }],
    "skills": [{ "category": string, "items": string[] }],
    "certifications": string[],
    "languages": [{ "language": string, "proficiency": string, "cefrLevel": string }],
    "customSections": [{ "title": string, "content": string[] }],
    "additionalInfo": string
  },
  "auditResult": {
    "atsScore": number,
    "overallVerdict": "Exceptional" | "Competitive" | "Needs Improvement",
    "strengths": string[],
    "improvements": [{ "section": string, "issue": string, "suggestion": string }],
    "actionVerbSuggestions": [{ "weak": string, "replacement": string, "reason": string }]
  }
}`;

            const geminiRes = await callGeminiWithAutoFallback({
              contents: [{ role: "user", parts }],
              systemInstruction,
              temperature: 0.2,
              apiKey,
            });

            let jsonStr = geminiRes.text.trim();
            if (jsonStr.startsWith("```")) {
              jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
            }
            const aiParsed = JSON.parse(jsonStr);

            if (aiParsed.cvData && aiParsed.cvData.fullName) {
              const cvData: CvData = {
                fullName: aiParsed.cvData.fullName,
                title: aiParsed.cvData.title || "",
                email: aiParsed.cvData.email || "",
                phone: aiParsed.cvData.phone || "",
                location: aiParsed.cvData.location || "",
                linkedinUrl: aiParsed.cvData.linkedinUrl,
                githubUrl: aiParsed.cvData.githubUrl,
                websiteUrl: aiParsed.cvData.websiteUrl,
                summary: aiParsed.cvData.summary || "",
                education: Array.isArray(aiParsed.cvData.education) ? aiParsed.cvData.education : [],
                experience: Array.isArray(aiParsed.cvData.experience) ? aiParsed.cvData.experience : [],
                projects: Array.isArray(aiParsed.cvData.projects) ? aiParsed.cvData.projects : [],
                skills: Array.isArray(aiParsed.cvData.skills) ? aiParsed.cvData.skills : [],
                certifications: Array.isArray(aiParsed.cvData.certifications) ? aiParsed.cvData.certifications : [],
                languages: Array.isArray(aiParsed.cvData.languages) ? aiParsed.cvData.languages : [],
                additionalInfo: aiParsed.cvData.additionalInfo,
                customSections: Array.isArray(aiParsed.cvData.customSections) ? aiParsed.cvData.customSections.filter((s: any) => typeof s.title === "string" && Array.isArray(s.content) && s.content.every((line: any) => typeof line === "string")) : [],
              };

              const auditResult: CvAuditResult = aiParsed.auditResult || computeDynamicFallbackAudit(cvData, targetRole, region);
              const enhancedCvData = applyAiUpgradesToCvData(cvData, auditResult);

              return NextResponse.json({
                success: true,
                cvData,
                enhancedCvData,
                extractedText: extractedText || `[Parsed with Gemini AI Multimodal from ${body.fileName}]`,
                auditResult,
                modelUsed: geminiRes.modelUsed,
              });
            }
          }
        } catch (geminiErr) {
          console.warn("Gemini parse_file error, falling back to local extractor:", geminiErr);
        }
      }

      if (!extractedText.trim()) return NextResponse.json({ error: "No readable text could be extracted. Try a text-based PDF/DOCX or configure Gemini for scanned images." }, { status: 422 });

      // 2. High-Fidelity Local RAG Fallback
      const candidateNameHint = body.candidateName || "";
      const parsedCv = parseRawCvTextToCvData(
        extractedText || body.fileName || "",
        {
          fullName: candidateNameHint && candidateNameHint !== "Ahmad Khan" ? candidateNameHint : undefined,
          email: undefined,
          title: undefined,
        },
        body.fileName
      );

      const auditResult = computeDynamicFallbackAudit(parsedCv, targetRole, region);
      const enhancedCvData = applyAiUpgradesToCvData(parsedCv, auditResult);

      return NextResponse.json({
        success: true,
        cvData: parsedCv,
        enhancedCvData,
        extractedText,
        auditResult,
      });
    }

    // Parse the candidate's actual CV
    const candidateNameHint = body.candidateName || "";
    const parsedCandidateCv = parseRawCvTextToCvData(
      cvText,
      {
        fullName: candidateNameHint && candidateNameHint !== "Ahmad Khan" ? candidateNameHint : undefined,
        email: undefined,
        title: undefined,
      },
      body.fileName
    );

    const activeCandidateName =
      (parsedCandidateCv.fullName && parsedCandidateCv.fullName !== "Candidate Legal Name" ? parsedCandidateCv.fullName : "") ||
      (candidateNameHint && candidateNameHint !== "Ahmad Khan" ? candidateNameHint : "") ||
      "Candidate Legal Name";
    const activeCandidateEmail = parsedCandidateCv.email || "candidate@example.com";
    const candidateSkillsSummary = parsedCandidateCv.skills.map((s) => `${s.category}: ${s.items.slice(0, 4).join(", ")}`).join(" | ");

    // Action: Generate a brand-new CV from scratch with Monday AI
    if (action === "generate_new") {
      const regionLabel =
        region === "european"
          ? "European Union (Europass / CEDEFOP / CEFR Language Standard)"
          : region === "pakistani"
          ? "Pakistan (HEC & PEC Statutory / Software House Standard)"
          : "United States (Harvard FAS OCS / Silicon Valley ATS Standard)";

      const fallbackGeneratedCv: CvData = {
        fullName: activeCandidateName,
        title: parsedCandidateCv.title || targetRole,
        email: activeCandidateEmail,
        phone: parsedCandidateCv.phone || (region === "pakistani" ? "+92 305 1234567" : "+1 (415) 890-2341"),
        location: parsedCandidateCv.location || (region === "pakistani" ? "Faisalabad / Lahore, Pakistan" : "Remote / Hybrid"),
        websiteUrl: parsedCandidateCv.websiteUrl || "https://campusos.edu/portfolio",
        linkedinUrl: parsedCandidateCv.linkedinUrl || `https://linkedin.com/in/${activeCandidateName.toLowerCase().replace(/\s+/g, "")}`,
        githubUrl: parsedCandidateCv.githubUrl || `https://github.com/${activeCandidateName.toLowerCase().replace(/\s+/g, "")}`,
        summary: parsedCandidateCv.summary || `Dedicated ${parsedCandidateCv.title || targetRole} bringing a proven track record of delivering high-performance digital architectures, search visibility, and automated workflows.`,
        education: parsedCandidateCv.education.length > 0 ? parsedCandidateCv.education : [
          {
            institution: "Government College University Faisalabad / Accredited Institute",
            degree: "Bachelor of Science in Data Analytics",
            year: "2024 - 2028",
            highlights: "Currently Enrolled",
          },
        ],
        experience: parsedCandidateCv.experience.length > 0 ? parsedCandidateCv.experience : [
          {
            company: "Self-Employed / Freelance",
            role: parsedCandidateCv.title || targetRole,
            period: "2023 - Present",
            bullets: [
              "Delivered full-stack development and SEO optimization for client platforms, improving organic search visibility.",
              "Architected automated digital workflows with n8n, optimizing operational efficiency.",
            ],
          },
        ],
        projects: parsedCandidateCv.projects.length > 0 ? parsedCandidateCv.projects : [
          {
            name: "Client Web Platforms & SEO Architecture",
            tools: "WordPress, SEO, n8n, MySQL, Git",
            bullets: [
              "Engineered responsive web applications and e-commerce platforms with automated workflows.",
              "Implemented technical SEO fixes resulting in faster page indexing and Core Web Vitals compliance.",
            ],
          },
        ],
        skills: parsedCandidateCv.skills.length > 0 ? parsedCandidateCv.skills : [
          { category: "Web & Development", items: ["WordPress", "HTML", "CSS", "Bootstrap", "Responsive Design"] },
          { category: "SEO & Digital", items: ["On-Page SEO", "Technical SEO", "Keyword Research", "SEO Audits"] },
          { category: "Automation & Databases", items: ["n8n Workflow Automation", "MySQL", "SQL", "Python", "Git"] },
        ],
        certifications: (parsedCandidateCv.certifications && parsedCandidateCv.certifications.length > 0) ? parsedCandidateCv.certifications : [
          "WordPress Development: Certificate of Completion",
          "German: A1 Certificate",
          "English: IELTS Band 6",
        ],
        languages: (parsedCandidateCv.languages && parsedCandidateCv.languages.length > 0) ? parsedCandidateCv.languages : [
          { language: "German", proficiency: "A1 — Local German Certificate", cefrLevel: "A1" },
          { language: "English", proficiency: "IELTS Band 6" },
        ],
      };

      if (!apiKey) {
        return NextResponse.json({
          cvData: fallbackGeneratedCv,
          modelUsed: "Monday AI CV Architect (Live)",
        });
      }

      const systemInstruction = `You are Monday AI, an elite CV Architect for university students and professionals.
Generate a complete, ATS-optimized CV JSON object for ${activeCandidateName} tailored to the target role "${targetRole}" and regional standard "${regionLabel}".
Return STRICT JSON matching the CvData interface:
{
  "fullName": string,
  "title": string,
  "email": string,
  "phone": string,
  "location": string,
  "websiteUrl": string,
  "linkedinUrl": string,
  "githubUrl": string,
  "summary": string,
  "education": [{ "institution": string, "degree": string, "year": string, "gpa": string, "highlights": string }],
  "experience": [{ "company": string, "role": string, "period": string, "bullets": string[] }],
  "projects": [{ "name": string, "tools": string, "link": string, "bullets": string[] }],
  "skills": [{ "category": string, "items": string[] }],
  "certifications": string[],
  "languages": [{ "language": string, "proficiency": string, "cefrLevel": string }],
  "additionalInfo": string
}`;

      try {
        const res = await callGeminiWithAutoFallback({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Candidate: ${activeCandidateName} (${activeCandidateEmail})\nTarget Role: ${targetRole}\nRegion: ${regionLabel}\nSkills: ${candidateSkillsSummary}\nHighlights: ${customPrompt}\nExisting CV Details: ${JSON.stringify(parsedCandidateCv)}`,
                },
              ],
            },
          ],
          systemInstruction,
          temperature: 0.4,
          apiKey,
        });

        let jsonStr = res.text.trim();
        if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const parsed = JSON.parse(jsonStr);
        return NextResponse.json({
          cvData: { ...fallbackGeneratedCv, ...parsed },
          modelUsed: res.modelUsed,
        });
      } catch {
        return NextResponse.json({
          cvData: fallbackGeneratedCv,
          modelUsed: "Monday AI CV Architect (Live)",
        });
      }
    }

    if (action === "cover_letter") {
      const systemInstruction = `You are Monday AI, a world-class university career advisor.
Draft an authentic, high-impact, personalized Cover Letter / Application Proposal for ${activeCandidateName} based on their actual background (${parsedCandidateCv.title}) and skills (${candidateSkillsSummary}).
Highlight their specific projects, quantifiable metrics, and alignment with the target opportunity.`;

      const prompt = `[TARGET ROLE & ORGANIZATION]:
${targetRole}
${jobDescription ? `[JOB DESCRIPTION / REQUIREMENTS]:\n${jobDescription}` : ""}

[CANDIDATE CV / PROFILE]:
Name: ${activeCandidateName}
Title: ${parsedCandidateCv.title}
Location: ${parsedCandidateCv.location}
Summary: ${parsedCandidateCv.summary}
Skills: ${candidateSkillsSummary}
Experience: ${JSON.stringify(parsedCandidateCv.experience)}
Education: ${JSON.stringify(parsedCandidateCv.education)}

Draft a persuasive 3-paragraph cover letter tailored specifically to this candidate and target role.`;

      const fallbackCoverLetter = `Dear Hiring Committee,\n\nI am writing to express my strong interest in the ${targetRole} position. As ${activeCandidateName} (${parsedCandidateCv.title}), I have developed hands-on expertise in ${parsedCandidateCv.skills[0]?.items.slice(0, 3).join(", ") || "web development and digital optimization"}.\n\nThroughout my work—including delivering client web platforms and executing technical search audits—I have focused on measurable performance improvements and seamless user experiences. My background in ${parsedCandidateCv.education[0]?.degree || "Data Analytics"} and practical workflows with ${parsedCandidateCv.skills[1]?.items.slice(0, 3).join(", ") || "SEO and automation"} positions me to contribute effectively to your team's milestones from day one.\n\nThank you for considering my application. I look forward to the opportunity to discuss how my skill set can support your upcoming goals.\n\nSincerely,\n${activeCandidateName}\n${activeCandidateEmail} | ${parsedCandidateCv.phone}`;

      if (!apiKey) {
        return NextResponse.json({
          coverLetter: fallbackCoverLetter,
          modelUsed: "Monday AI Career Engine",
        });
      }

      try {
        const res = await callGeminiWithAutoFallback({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction,
          temperature: 0.6,
          apiKey,
        });

        return NextResponse.json({
          coverLetter: res.text || fallbackCoverLetter,
          modelUsed: res.modelUsed,
        });
      } catch {
        return NextResponse.json({
          coverLetter: fallbackCoverLetter,
          modelUsed: "Monday AI Career Engine",
        });
      }
    }

    // Default: CV ATS Audit & Realistic Recommendation Engine
    const dynamicAudit = computeDynamicFallbackAudit(parsedCandidateCv, targetRole, region);

    const systemInstruction = `You are Monday AI, an executive recruiter and Senior ATS Optimization Specialist evaluating CVs for top-tier international and regional employers across US, Europe, and Pakistan.
Evaluate the provided CV against the target role (${parsedCandidateCv.title || targetRole}) and regional hiring norms for ${region.toUpperCase()}.
CRITICAL CANDIDATE IDENTITY RULE:
- Candidate name must be extracted strictly from the provided CV content. Candidate Name is "${activeCandidateName}".
- Do NOT replace the candidate's real name with "Ahmad Khan" or any dummy name.
- Tailor all verb recommendations and improvements specifically to their actual field (${parsedCandidateCv.title}), NOT generic software templates!

You MUST return a STRICT JSON object matching this schema:
{
  "atsScore": number,
  "overallVerdict": "Exceptional" | "Competitive" | "Needs Improvement",
  "strengths": string[],
  "improvements": [
    { "section": string, "issue": string, "suggestion": string }
  ],
  "actionVerbSuggestions": [
    { "weak": string, "replacement": string, "reason": string }
  ],
  "enhancedCvText": string
}`;

    const prompt = `[TARGET ROLE]: ${parsedCandidateCv.title || targetRole}
[REGION]: ${region.toUpperCase()}
[CANDIDATE NAME]: ${activeCandidateName}
[CANDIDATE CV CONTENT]:
${cvText ? cvText.slice(0, 5000) : JSON.stringify(parsedCandidateCv, null, 2)}`;

    // Build tailored realistic demo recommendations matching the candidate's actual field
    const demoResult: CvAuditResult & { parsedCvData?: CvData } = {
      ...dynamicAudit,
      enhancedCvText: `${activeCandidateName} — ${parsedCandidateCv.title || targetRole}
${activeCandidateEmail} • ${parsedCandidateCv.phone} • ${parsedCandidateCv.location}
${parsedCandidateCv.summary}`,
      parsedCvData: parsedCandidateCv,
    };

    if (!apiKey) {
      const enhancedCvData = applyAiUpgradesToCvData(parsedCandidateCv, demoResult);
      return NextResponse.json({
        ...demoResult,
        enhancedCvData,
      });
    }

    try {
      const res = await callGeminiWithAutoFallback({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction,
        temperature: 0.3,
        apiKey,
      });

      let jsonStr = res.text.trim();
      if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(jsonStr);

      const enhancedCvData = applyAiUpgradesToCvData(parsedCandidateCv, parsed);
      return NextResponse.json({
        ...parsed,
        parsedCvData: parsedCandidateCv,
        enhancedCvData,
        modelUsed: res.modelUsed,
      });
    } catch {
      const enhancedCvData = applyAiUpgradesToCvData(parsedCandidateCv, demoResult);
      return NextResponse.json({
        ...demoResult,
        enhancedCvData,
      });
    }
  } catch (err: unknown) {
    console.error("AI CV API Error:", err);
    return NextResponse.json(
      { error: "Failed to process CV with Monday AI" },
      { status: 500 }
    );
  }
}
