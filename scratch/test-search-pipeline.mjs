import { searchAndVerifyOpportunities, verifyOpportunityUrl } from "../src/lib/opportunity-search.ts";

async function run() {
  console.log("Testing verifyOpportunityUrl...");
  const v1 = await verifyOpportunityUrl("https://summerofcode.withgoogle.com");
  console.log("GSoC URL ok:", v1.ok, "status:", v1.status);

  const v2 = await verifyOpportunityUrl("https://google.com/this-path-is-a-404-broken-link");
  console.log("Broken URL ok:", v2.ok, "status:", v2.status);

  console.log("\nTesting searchAndVerifyOpportunities...");
  const profile = {
    name: "Amina Tariq",
    degree: "B.S. Software Engineering (3rd Year)",
    interests: ["TypeScript", "Next.js", "Python", "Algorithms", "AI"],
  };

  const results = await searchAndVerifyOpportunities("Pakistan Systems Limited AI", profile, [{ title: "MedRAG" }]);
  console.log("Total checked:", results.totalChecked);
  console.log("Verified count:", results.verifiedCount);
  console.log("Rejected count:", results.rejectedCount);
  console.log("Top 3 verified opportunities:");
  for (const o of results.opportunities.slice(0, 3)) {
    console.log(`- [${o.organization}] ${o.title}`);
    console.log(`  URL: ${o.applicationUrl} (HTTP ${o.httpStatus})`);
    console.log(`  Match: ${o.matchScore}% | Pitch: ${o.tailoredPitch}`);
  }
}
run();
