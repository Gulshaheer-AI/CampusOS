import { callGeminiWithAutoFallback } from "@/lib/gemini";
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  verifyOpportunityUrl,
  resolveOpportunityUrl,
  searchAndVerifyOpportunities,
  VERIFIED_OPPORTUNITY_REGISTRY,
} from "@/lib/opportunity-search";
vi.mock("@/lib/gemini", () => ({ callGeminiWithAutoFallback: vi.fn() }));
vi.mock("node:dns/promises", () => ({
  default: { lookup: vi.fn(async () => [{ address: "8.8.8.8", family: 4 }]) },
  lookup: vi.fn(async () => [{ address: "8.8.8.8", family: 4 }]),
}));
const page = (job: Record<string, unknown> = {}) =>
  `<html><script type="application/ld+json">${JSON.stringify({ "@type": "JobPosting", title: "Python Intern", hiringOrganization: { name: "Acme" }, description: "Build Python data pipelines", ...job })}</script><a href="/application/123">Apply now</a></html>`;
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("Opportunity destination verification", () => {
  it("rejects dummy and unsafe URLs", async () => {
    expect(
      (await verifyOpportunityUrl("https://example.com/jobs/123")).ok,
    ).toBe(false);
    expect((await verifyOpportunityUrl("http://127.0.0.1/jobs/1")).ok).toBe(
      false,
    );
    expect(
      (await verifyOpportunityUrl("https://en.wikipedia.org/jobs/1")).ok,
    ).toBe(false);
    expect((await verifyOpportunityUrl("")).ok).toBe(false);
    expect((await verifyOpportunityUrl(null as any)).ok).toBe(false);
  });
  it("decodes Bing redirects to a direct posting", () => {
    const target = "https://careers.acme.com/jobs/123";
    expect(
      resolveOpportunityUrl(
        "https://www.bing.com/ck/a?u=a1" +
          Buffer.from(target).toString("base64url"),
      ),
    ).toBe(target);
    expect(() =>
      resolveOpportunityUrl("https://www.bing.com/ck/a?x=abc"),
    ).toThrow();
  });
  it("does not manufacture availability on a network failure, even during tests", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await verifyOpportunityUrl(
      "https://careers.acme.com/jobs/1",
    );
    expect(result).toMatchObject({ ok: false, status: 0 });
  });
  it("requires a specific posting rather than HTTP 200 or a homepage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<h1>Careers</h1>")),
    );
    expect((await verifyOpportunityUrl("https://careers.acme.com/")).ok).toBe(
      false,
    );
    expect(
      (await verifyOpportunityUrl("https://careers.acme.com/jobs/1")).ok,
    ).toBe(false);
  });
  it("reads the complete destination and detects closed text after 5000 characters", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("x".repeat(6000) + "This position has been filled"),
      ),
    );
    expect(
      await verifyOpportunityUrl("https://careers.acme.com/jobs/1"),
    ).toMatchObject({ ok: false, isClosed: true });
  });
  it("rejects expired structured postings and missing application controls", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(new Response(page({ validThrough: "2020-01-01" })))
      .mockResolvedValueOnce(new Response(page().replace(/<a.*<\/a>/, "")));
    vi.stubGlobal("fetch", fetcher);
    expect(
      (await verifyOpportunityUrl("https://careers.acme.com/jobs/1")).isClosed,
    ).toBe(true);
    expect(
      (await verifyOpportunityUrl("https://careers.acme.com/jobs/2")).ok,
    ).toBe(false);
  });
  it("extracts title and employer from an active destination without inventing a deadline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(page())),
    );
    const result = await verifyOpportunityUrl(
      "https://careers.acme.com/jobs/123",
    );
    expect(result).toMatchObject({
      ok: true,
      title: "Python Intern",
      organization: "Acme",
    });
    expect(result.deadline).toBeUndefined();
  });
  it("follows safe redirects but rejects private destinations", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(null, { status: 302, headers: { location: "/jobs/2" } }),
        )
        .mockResolvedValueOnce(new Response(page())),
    );
    expect(
      (await verifyOpportunityUrl("https://careers.acme.com/jobs/1")).finalUrl,
    ).toBe("https://careers.acme.com/jobs/2");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(null, {
            status: 302,
            headers: { location: "http://169.254.169.254/latest" },
          }),
      ),
    );
    expect(
      (await verifyOpportunityUrl("https://careers.acme.com/jobs/1")).ok,
    ).toBe(false);
  });
  it("inspects destination text with Gemini when structured job data is absent", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            "<h1>Python Intern</h1><h2>Acme</h2><p>Applications are open for this internship.</p><button>Apply now</button>",
          ),
      ),
    );
    vi.mocked(callGeminiWithAutoFallback).mockResolvedValue({
      text: JSON.stringify({
        isActive: true,
        isSpecificPosting: true,
        title: "Python Intern",
        organization: "Acme",
        deadline: null,
        evidence: "Applications are open for this internship.",
      }),
      modelUsed: "test",
      fallbackTriggered: false,
    });
    expect(
      await verifyOpportunityUrl("https://careers.acme.com/jobs/123"),
    ).toMatchObject({ ok: true, title: "Python Intern", organization: "Acme" });
    vi.mocked(callGeminiWithAutoFallback).mockResolvedValue({
      text: JSON.stringify({
        isActive: true,
        isSpecificPosting: true,
        title: "Invented Engineer",
        organization: "Acme",
        deadline: null,
        evidence: "Applications are open for this internship.",
      }),
      modelUsed: "test",
      fallbackTriggered: false,
    });
    expect(
      (await verifyOpportunityUrl("https://careers.acme.com/jobs/123")).ok,
    ).toBe(false);
  });
  it("keeps the old discovery catalog unverified, with no invented application dates", () => {
    expect(VERIFIED_OPPORTUNITY_REGISTRY.length).toBeGreaterThan(0);
    expect(
      VERIFIED_OPPORTUNITY_REGISTRY.every((p) => p.deadline === "Not verified"),
    ).toBe(true);
  });
  it("returns an honest empty result when no live pages can be verified", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const result = await searchAndVerifyOpportunities("");
    expect(result.opportunities).toEqual([]);
    expect(result.verifiedCount).toBe(0);
  });
  it("builds cards using the actual posting and a matching direct URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("bing.com/search")
          ? new Response(
              '<li class="b_algo"><h2><a href="https://careers.acme.com/jobs/123">Different search title</a></h2><p>Internship in Python</p></li>',
            )
          : new Response(page()),
      ),
    );
    const result = await searchAndVerifyOpportunities("Python");
    expect(result.opportunities).toHaveLength(1);
    expect(result.opportunities[0]).toMatchObject({
      title: "Python Intern",
      organization: "Acme",
      applicationUrl: "https://careers.acme.com/jobs/123",
      verified: true,
      deadline: "Not stated by employer",
    });
    expect(result.totalChecked).toBe(
      result.verifiedCount + result.rejectedCount,
    );
  });
});
