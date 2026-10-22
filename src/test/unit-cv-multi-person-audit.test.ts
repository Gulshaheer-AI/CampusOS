import { describe, it, expect } from "vitest";
import { parseRawCvTextToCvData, applyAiUpgradesToCvData } from "@/lib/cv-parser";
import { CvAuditResult } from "@/types";

// ============================================================================
// 5 DIVERSE REAL-WORLD CV DATA FIXTURES (For Testing & Verification Only)
// ============================================================================

// 1. Person 1: User's Authentic CV (SEO Specialist & WordPress Developer)
const cvPerson1_Rajeel = `RAJEEL AHMAD
SEO Specialist • WordPress Developer • Automation & Web Specialist
rajeelahmad633@gmail.com | +92 305 8952816 | Faisalabad, Punjab, Pakistan | pk.linkedin.com/in/rajeel-ahmad-217622260
PROFESSIONAL SUMMARY
WordPress Developer and SEO Specialist with 3+ years of hands-on experience building and optimizing websites for blogs and e-commerce clients. Skilled in WordPress development, responsive frontend design, on-page and off-page SEO, keyword research, SEO audits, technical optimization and content optimization. Also experienced with workflow automation using n8n, MySQL databases, Git and GitHub. Currently pursuing a Bachelor of Science in Data Analytics, bringing a data-driven approach to web performance, search visibility and digital workflows.
TECHNICAL COMPETENCIES & DOMAIN EXPERTISE
WordPress & Web: WordPress, Theme Customization, Plugin Configuration, HTML, CSS, Bootstrap, Responsive Web Design
SEO & Marketing: On-Page SEO, Off-Page SEO, Technical SEO, Keyword Research, SEO Audits, Content Optimization, Digital Marketing
E-commerce: WordPress E-commerce, Shopify, Product Page Optimization
Automation: n8n Workflow Automation, Workflow Integration, Automated Digital Processes
Databases & Development: MySQL, SQL, Python, C, C++, Database Management
Version Control: Git, GitHub
Analytics: Data Analytics & Visualization, Data-driven Web Performance
PROFESSIONAL EXPERIENCE
Freelance WordPress Developer & SEO Specialist Jun 2023 – Present
Self-Employed
 • Delivered WordPress development and SEO services for blog and e-commerce clients.
 • Built and optimized e-commerce websites, improving site structure and product-page performance.
 • Conducted keyword research, on-page SEO and content optimization to improve organic search visibility.
 • Performed SEO audits and implemented technical fixes related to site speed, indexing and website visibility.
WordPress Developer Jun 2022 – Jun 2023
SublimeTechs Software House
 • Developed and maintained WordPress websites for clients, including theme customization and plugin configuration.
 • Built responsive, mobile-friendly layouts using HTML, CSS and Bootstrap.
 • Collaborated with design and development team members to deliver functional, client-ready websites.
ACADEMIC QUALIFICATIONS
Bachelor of Science in Data Analytics 2024 – 2028
Government College University Faisalabad
Currently Enrolled
Intermediate 2022 – 2024
Matriculation 2020 – 2022
LANGUAGES & PROFESSIONAL CREDENTIALS
 • English: Fluent (B2/C1)
 • German: Basic (A1)
 • German: A1 — Local German Certificate
 • IELTS Band 6
 • WordPress Development: Certificate of Completion — SublimeTechs Software House
International Mobility & Availability:
Open to opportunities with European/German companies in WordPress Development, SEO, Web Development, Digital Marketing and entry-level Automation/Workflow roles.`;

// 2. Person 2: Elena Rostova (Civil & Structural Engineer - European Format)
const cvPerson2_Elena = `Elena Rostova
Senior Structural & Civil Engineer
elena.rostova@engineer-net.eu | +49 89 289 01 | Munich, Bavaria, Germany | linkedin.com/in/elena-rostova-structural
PROFESSIONAL SUMMARY
Chartered Civil Engineer with 6+ years designing post-tensioned concrete and steel structures across DACH region. Expert in Eurocodes EC2/EC3, seismic analysis, and BIM modeling. Proven track record managing multi-million euro infrastructural projects with zero compliance infractions.
TECHNICAL SKILLS & DOMAIN EXPERTISE
Structural Design: Eurocodes (EC2, EC3, EC8), Reinforced Concrete, Structural Steel, Seismic Analysis
CAD & BIM: AutoCAD, Revit Structure, Navisworks, Tekla Structures, BIM 360
Analysis Software: SOFiSTiK, ETABS, SAP2000, STAAD.Pro, SCIA Engineer
PROFESSIONAL EXPERIENCE
Lead Structural Engineer Jan 2021 - Present
Hochtief Construction AG
 • Spearheaded structural stability analysis for 14-story residential tower using finite element modeling in SOFiSTiK.
 • Optimized rebar reinforcement schedules, cutting material wastage by 12% across 3 concurrent municipal projects.
 • Collaborated with site geotechnical engineers to resolve foundation settlement challenges in complex clay strata.
Structural Design Engineer Aug 2018 - Dec 2020
Bilfinger Engineering
 • Executed seismic retrofitting evaluations for bridge infrastructure adhering strictly to Eurocode standards.
 • Produced detailed construction documentation and structural shop drawings for contractor execution.
EDUCATION & QUALIFICATIONS
Master of Science in Structural Engineering 2018 - 2020
Technical University of Munich (TUM)
Bachelor of Science in Civil Engineering 2014 - 2018
University of Stuttgart
Graduated with Distinction
LANGUAGES & CERTIFICATIONS
 • German: Native (C2)
 • English: Professional Working (C1)
 • Chartered Structural Engineer (VDI / EurIng)`;

// 3. Person 3: Marcus Vance (Finance & Investment Banking - US Wall Street Format)
const cvPerson3_Marcus = `Marcus Vance
Senior Financial Analyst & Investment Banking Associate
m.vance@wharton-alumni.edu | +1 (212) 555-0198 | New York, NY | linkedin.com/in/marcus-vance-finance
PROFESSIONAL SUMMARY
Wall Street investment banking associate with 4+ years advising on M&A transactions, LBO debt structuring, and quantitative corporate valuations totaling $1.8B in deal flow. Expert in 3-statement modeling, Bloomberg Terminal, and complex financial analysis.
CORE COMPETENCIES & EXPERTISE
Financial Modeling: LBO Modeling, DCF Valuation, Mergers & Acquisitions, 3-Statement Forecasting
Data & Analytics: Bloomberg Terminal, Capital IQ, FactSet, SQL, Advanced Financial Excel
Corporate Finance: Due Diligence, Board Presentations, Equity Offerings, Capital Allocation
PROFESSIONAL EXPERIENCE
Investment Banking Associate (TMT Group) Jul 2021 - Present
Morgan Stanley
 • Built 3-statement financial models, discounted cash flow (DCF), and leveraged buyout (LBO) models for 8 closed transactions.
 • Coordinated buy-side due diligence and confidential information memorandums (CIM) for $450M cross-border SaaS acquisition.
 • Presented valuation pitch decks to corporate board committees for sell-side advisory mandates.
Financial Valuation Analyst Jun 2020 - Aug 2020
Goldman Sachs
 • Executed comparable company analysis (Comps) and precedent transactions for tech equity offerings.
ACADEMIC QUALIFICATIONS
Bachelor of Science in Economics (Finance Concentration) 2017 - 2021
The Wharton School, University of Pennsylvania
Magna Cum Laude • GPA: 3.89 / 4.00
LANGUAGES & CERTIFICATIONS
 • English: Native
 • CFA Charterholder (Passed Level I, II, III on first attempt)
 • FINRA Series 7 and Series 63 Licensed`;

// 4. Person 4: Dr. Amara Patel (Healthcare & Clinical Lead - Medical Format)
const cvPerson4_Amara = `Dr. Amara Patel, DNP, RN
Clinical Nurse Specialist & Critical Care Lead
amara.patel@hopkins-health.org | +1 (410) 955-5000 | Baltimore, MD | linkedin.com/in/amara-patel-dnp
PROFESSIONAL SUMMARY
Board-certified Clinical Nurse Specialist with 7+ years of acute and intensive care (ICU) experience leading interdisciplinary patient rounds, clinical quality improvement, and sepsis protocols. Recognized for compassionate care and clinical mentorship.
CLINICAL COMPETENCIES & EXPERTISE
Clinical Nursing: Critical Care Nursing, Ventilator Management, Hemodynamic Monitoring, IV Pharmacology
Healthcare Systems: Epic Systems EMR, Cerner, Philips IntelliSpace Patient Monitoring
Regulatory: Joint Commission Standards, HIPAA Compliance, Sepsis Protocols, Patient Advocacy
PROFESSIONAL EXPERIENCE
Intensive Care Unit (ICU) Lead Charge Nurse Jan 2020 - Present
Johns Hopkins Hospital
 • Directed a 24-bed medical ICU clinical team delivering critical hemodialysis, mechanical ventilation, and pharmacological titration.
 • Implemented hospital-wide central line bundle that reduced catheter-associated bloodstream infections (CLABSI) by 38%.
 • Conducted daily multidisciplinary rounds with attending physicians, pharmacists, and respiratory therapists.
Staff Registered Nurse (Telemetry & Step-Down) Jun 2019 - Dec 2019
MedStar Health
 • Managed acute cardiovascular patient telemetry monitoring and post-operative recovery interventions.
ACADEMIC QUALIFICATIONS
Doctor of Nursing Practice (DNP) 2021 - 2024
Johns Hopkins University School of Nursing
Bachelor of Science in Nursing (BSN) 2015 - 2019
University of Maryland
Summa Cum Laude • GPA: 3.94 / 4.00
LANGUAGES & PROFESSIONAL CREDENTIALS
 • English: Native
 • Spanish: Medical Conversational
 • Registered Nurse (RN) — Maryland Board of Nursing
 • Critical Care Registered Nurse (CCRN)
 • Advanced Cardiac Life Support (ACLS)`;

// 5. Person 5: Sarah Jenkins (Growth Marketing & Operations - Digital Agency Format)
const cvPerson5_Sarah = `Sarah Jenkins
Director of Growth Marketing & Digital Operations
sarah.jenkins@growthlab.io | +1 (415) 321-7788 | San Francisco, CA | linkedin.com/in/sarah-jenkins-growth
PROFESSIONAL SUMMARY
Data-driven marketing leader with 8+ years scaling B2B SaaS revenue from $5M to $45M ARR. Expert in omni-channel acquisition, demand generation funnels, conversion rate optimization (CRO), and marketing operations.
TECHNICAL SKILLS & DOMAIN EXPERTISE
Growth & Strategy: Demand Generation, Paid Acquisition, CRO, Product-Led Growth (PLG), Funnel Analytics
Platforms & Tools: Google Analytics 4, HubSpot, Marketo, Salesforce CRM, Segment, Mixpanel
Performance Channels: Google Ads, LinkedIn Ads, Search Engine Optimization (SEO), Email Automation
PROFESSIONAL EXPERIENCE
Director of Growth & Demand Generation Mar 2022 - Present
CloudScale Inc.
 • Orchestrated multi-channel paid acquisition strategy (Google Ads, LinkedIn, Meta) scaling annual pipeline by 64%.
 • Redesigned conversion rate optimization (CRO) funnel, boosting qualified trial conversion from 3.2% to 6.8%.
 • Managed $4.2M paid media budget delivering a 4.1x return on ad spend (ROAS).
Senior Performance Marketing Manager Feb 2019 - Feb 2022
Amplitude Platforms
 • Built automated lead nurturing workflows in HubSpot and Marketo, improving marketing qualified lead (MQL) velocity by 45%.
ACADEMIC QUALIFICATIONS
Bachelor of Arts in Communications & Media Studies 2013 - 2017
New York University (NYU)
Dean's Honor List
LANGUAGES & CERTIFICATIONS
 • English: Native
 • Google Analytics 4 Certified
 • HubSpot Inbound Marketing Master`;

describe("CV Auditor & Parser Test across 5 Diverse Real-World Professionals", () => {
  // Test 1: User's Real CV (Rajeel Ahmad)
  it("Person 1 (Rajeel Ahmad): extracts 100% authentic education, experience, and skills without dummy fallback", () => {
    const parsed = parseRawCvTextToCvData(cvPerson1_Rajeel, {}, "Rajeel_Ahmad.pdf");

    expect(parsed.fullName).toBe("Rajeel Ahmad");
    expect(parsed.title).toContain("WordPress Developer");
    expect(parsed.email).toBe("rajeelahmad633@gmail.com");
    expect(parsed.phone).toContain("305 8952816");
    expect(parsed.location).toContain("Faisalabad");

    // Education: Verify 3 real entries, NO dummy "Bachelor Degree", NO dummy "2024 - 2028"
    expect(parsed.education).toHaveLength(3);
    expect(parsed.education[0].degree).toBe("Bachelor of Science in Data Analytics");
    expect(parsed.education[0].institution).toBe("Government College University Faisalabad");
    expect(parsed.education[0].year).toContain("2024");
    expect(parsed.education[0].highlights).toContain("Currently Enrolled");
    expect(parsed.education[1].degree).toBe("Intermediate");
    expect(parsed.education[2].degree).toBe("Matriculation");

    // Experience: Verify both jobs with correct roles, companies, and bullets
    expect(parsed.experience).toHaveLength(2);
    expect(parsed.experience[0].role).toContain("Freelance WordPress Developer");
    expect(parsed.experience[0].company).toBe("Self-Employed");
    expect(parsed.experience[0].bullets.length).toBe(4);
    expect(parsed.experience[1].role).toBe("WordPress Developer");
    expect(parsed.experience[1].company).toBe("SublimeTechs Software House");
    expect(parsed.experience[1].bullets.length).toBe(3);

    // Skills: Verify real domains
    const cats = parsed.skills.map((s) => s.category);
    expect(cats).toContain("WordPress & Web");
    expect(cats).toContain("SEO & Marketing");
    expect(cats).toContain("Automation");

    // AI Upgrade test: Verify applying AI fixes preserves authentic education!
    const mockAudit: CvAuditResult = {
      atsScore: 92,
      overallVerdict: "Exceptional",
      strengths: ["Strong quantitative SEO deliverables"],
      improvements: [],
      actionVerbSuggestions: [
        { weak: "delivered", replacement: "spearheaded & delivered", reason: "Strong impact" },
        { weak: "built", replacement: "architected & optimized", reason: "Demonstrates technical depth" },
      ],
    };
    const upgraded = applyAiUpgradesToCvData(parsed, mockAudit);
    expect(upgraded.education[0].degree).toBe("Bachelor of Science in Data Analytics");
    expect(upgraded.education[0].institution).toBe("Government College University Faisalabad");
    expect(upgraded.experience[0].bullets[0]).toContain("spearheaded & delivered");
  });

  // Test 2: Civil & Structural Engineer (Elena Rostova)
  it("Person 2 (Elena Rostova - Civil Engineer): extracts European M.S. and B.S. degrees without software dev distortion", () => {
    const parsed = parseRawCvTextToCvData(cvPerson2_Elena, {}, "Elena_Rostova_CV.pdf");

    expect(parsed.fullName).toBe("Elena Rostova");
    expect(parsed.title).toContain("Structural");
    expect(parsed.email).toBe("elena.rostova@engineer-net.eu");
    expect(parsed.location).toContain("Munich");

    // Education: 2 university engineering degrees
    expect(parsed.education).toHaveLength(2);
    expect(parsed.education[0].degree).toContain("Master of Science in Structural Engineering");
    expect(parsed.education[0].institution).toContain("Technical University of Munich");
    expect(parsed.education[1].degree).toContain("Bachelor of Science in Civil Engineering");
    expect(parsed.education[1].institution).toContain("University of Stuttgart");

    // Experience: verify structural engineering roles
    expect(parsed.experience[0].role).toContain("Lead Structural Engineer");
    expect(parsed.experience[0].company).toContain("Hochtief");
    expect(parsed.experience[0].bullets.length).toBe(3);

    // Skills: verify civil engineering skills (AutoCAD, Eurocodes) NOT web software tools
    const allSkills = parsed.skills.flatMap((s) => s.items).join(" ");
    expect(allSkills).toContain("Eurocodes");
    expect(allSkills).toContain("AutoCAD");
    expect(allSkills).not.toContain("React");
  });

  // Test 3: Wall Street Financial Analyst (Marcus Vance)
  it("Person 3 (Marcus Vance - Finance): extracts Wharton degree, GPA, Morgan Stanley and Goldman Sachs roles", () => {
    const parsed = parseRawCvTextToCvData(cvPerson3_Marcus, {}, "Marcus_Vance_Resume.pdf");

    expect(parsed.fullName).toBe("Marcus Vance");
    expect(parsed.title).toContain("Financial Analyst");
    expect(parsed.email).toBe("m.vance@wharton-alumni.edu");
    expect(parsed.location).toContain("New York");

    // Education: Wharton School
    expect(parsed.education).toHaveLength(1);
    expect(parsed.education[0].degree).toContain("Economics");
    expect(parsed.education[0].institution).toContain("Wharton");
    expect(parsed.education[0].year).toContain("2017 - 2021");

    // Experience: Morgan Stanley & Goldman Sachs
    expect(parsed.experience).toHaveLength(2);
    expect(parsed.experience[0].company).toContain("Morgan Stanley");
    expect(parsed.experience[0].role).toContain("Investment Banking");
    expect(parsed.experience[1].company).toContain("Goldman Sachs");

    // Skills: Finance & DCF Modeling
    const allSkills = parsed.skills.flatMap((s) => s.items).join(" ");
    expect(allSkills).toContain("LBO Modeling");
    expect(allSkills).toContain("Bloomberg");
  });

  // Test 4: Healthcare / Clinical Nurse (Dr. Amara Patel)
  it("Person 4 (Dr. Amara Patel - Healthcare): extracts DNP & BSN degrees and clinical ICU competencies", () => {
    const parsed = parseRawCvTextToCvData(cvPerson4_Amara, {}, "Amara_Patel_DNP.pdf");

    expect(parsed.fullName).toContain("Amara Patel");
    expect(parsed.title).toContain("Clinical Nurse Specialist");
    expect(parsed.email).toBe("amara.patel@hopkins-health.org");

    // Education: Johns Hopkins DNP & UMD BSN
    expect(parsed.education).toHaveLength(2);
    expect(parsed.education[0].degree).toContain("Doctor of Nursing Practice");
    expect(parsed.education[0].institution).toContain("Johns Hopkins");
    expect(parsed.education[1].degree).toContain("Bachelor of Science in Nursing");

    // Experience: Johns Hopkins Hospital ICU Lead
    expect(parsed.experience[0].company).toContain("Johns Hopkins Hospital");
    expect(parsed.experience[0].role).toContain("Intensive Care");
    expect(parsed.experience[0].bullets.length).toBe(3);

    // Skills: Clinical nursing & EMR (Epic)
    const allSkills = parsed.skills.flatMap((s) => s.items).join(" ");
    expect(allSkills).toContain("Critical Care");
    expect(allSkills).toContain("Epic Systems");
  });

  // Test 5: Growth Marketing Director (Sarah Jenkins)
  it("Person 5 (Sarah Jenkins - Marketing): extracts NYU degree, demand gen leadership, and CRO analytics", () => {
    const parsed = parseRawCvTextToCvData(cvPerson5_Sarah, {}, "Sarah_Jenkins_Director.pdf");

    expect(parsed.fullName).toBe("Sarah Jenkins");
    expect(parsed.title).toContain("Growth Marketing");
    expect(parsed.email).toBe("sarah.jenkins@growthlab.io");
    expect(parsed.location).toContain("San Francisco");

    // Education: NYU
    expect(parsed.education).toHaveLength(1);
    expect(parsed.education[0].degree).toContain("Communications");
    expect(parsed.education[0].institution).toContain("New York University");

    // Experience: Director of Growth
    expect(parsed.experience[0].company).toContain("CloudScale");
    expect(parsed.experience[0].role).toContain("Director of Growth");
    expect(parsed.experience[0].bullets.length).toBe(3);

    // Skills: Demand Gen & HubSpot
    const allSkills = parsed.skills.flatMap((s) => s.items).join(" ");
    expect(allSkills).toContain("Demand Generation");
    expect(allSkills).toContain("HubSpot");
  });
});
