import { describe, it, expect } from "vitest";
import {
  verifyOpportunityUrl,
  searchAndVerifyOpportunities,
  VERIFIED_OPPORTUNITY_REGISTRY,
} from "@/lib/opportunity-search";
import { UserProfile } from "@/types";

describe("Opportunity Search & Live Verification Pipeline", () => {
  it("rejects dummy, example, or non-job domains immediately", async () => {
    const res1 = await verifyOpportunityUrl("https://example.com/jobs/123");
    expect(res1.ok).toBe(false);
    expect(res1.status).toBe(404);

    const res2 = await verifyOpportunityUrl("https://fake-internship.com");
    expect(res2.ok).toBe(false);

    const res3 = await verifyOpportunityUrl("https://en.wikipedia.org/wiki/Software_engineering");
    expect(res3.ok).toBe(false);
    expect(res3.status).toBe(400);

    const res4 = await verifyOpportunityUrl("https://www.geeksforgeeks.org/jobs");
    expect(res4.ok).toBe(false);
    expect(res4.status).toBe(400);
  });

  it("handles empty or malformed URLs safely without throwing", async () => {
    const emptyRes = await verifyOpportunityUrl("");
    expect(emptyRes.ok).toBe(false);
    expect(emptyRes.status).toBe(0);

    const nullRes = await verifyOpportunityUrl(null as any);
    expect(nullRes.ok).toBe(false);
  });

  it("VERIFIED_OPPORTUNITY_REGISTRY contains rich authentic corporate & student programs", () => {
    expect(VERIFIED_OPPORTUNITY_REGISTRY.length).toBeGreaterThanOrEqual(15);

    const orgs = VERIFIED_OPPORTUNITY_REGISTRY.map((o) => o.organization);
    expect(orgs).toContain("Google");
    expect(orgs).toContain("Systems Limited");
    expect(orgs).toContain("Microsoft");
    expect(orgs).toContain("Amazon");
    expect(orgs).toContain("Apple");
    expect(orgs).toContain("NVIDIA");
    expect(orgs).toContain("Arbisoft");
    expect(orgs).toContain("10Pearls");

    // All registry items must have legitimate application URLs
    for (const opp of VERIFIED_OPPORTUNITY_REGISTRY) {
      expect(opp.applicationUrl).toMatch(/^https?:\/\//);
      expect(opp.title.length).toBeGreaterThan(5);
      expect(opp.requirements.length).toBeGreaterThan(0);
      expect(opp.description.length).toBeGreaterThan(20);
    }
  });

  it("searchAndVerifyOpportunities returns verified opportunities matching student profile", async () => {
    const mockStudent: UserProfile = {
      id: "student-1",
      name: "Bilal Khan",
      email: "bilal@fast.edu.pk",
      role: "student",
      department: "Computer Science",
      degree: "B.S. in Computer Science (PEC Accredited)",
      semester: "6th Semester",
      cgpa: "3.88",
      interests: ["TypeScript", "Next.js", "Python", "Cloud Systems"],
      themePreference: "light",
      emailNotifications: true,
      learningPace: "intensive",
      createdAt: "2026-01-15",
    };

    const result = await searchAndVerifyOpportunities(
      "Systems Limited Pakistan Cloud",
      mockStudent,
      [{ title: "CampusOS Distributed Core" }]
    );

    expect(result.opportunities.length).toBeGreaterThan(0);
    expect(result.verifiedCount).toBeGreaterThan(0);
    expect(result.totalChecked).toBeGreaterThan(0);

    // Verify properties of the matched opportunities
    for (const opp of result.opportunities) {
      expect(opp.verified).toBe(true);
      expect(opp.httpStatus).toBe(200);
      expect(opp.matchScore).toBeGreaterThanOrEqual(80);
      expect(opp.tailoredPitch).toContain("Bilal Khan");
      expect(opp.applicationUrl).toMatch(/^https?:\/\//);
    }
  });

  it("searchAndVerifyOpportunities handles empty query by returning default registry", async () => {
    const result = await searchAndVerifyOpportunities("");
    expect(result.opportunities.length).toBeGreaterThanOrEqual(4);
    for (const opp of result.opportunities) {
      expect(opp.verified).toBe(true);
      expect(opp.httpStatus).toBe(200);
    }
  });
});
