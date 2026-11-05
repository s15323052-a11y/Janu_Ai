import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSecurityEvent, buildAuthorizedTestPlan } from "../backend/src/index.js";

test("security triage flags repeated login failures as high severity", () => {
  const result = analyzeSecurityEvent({ description: "multiple failed login attempts" });
  assert.equal(result.severity, "high");
  assert.equal(result.findings[0].title, "Repeated authentication failures");
});

test("security triage flags malware indicators as critical", () => {
  const result = analyzeSecurityEvent({ description: "possible ransomware on workstation" });
  assert.equal(result.severity, "critical");
});

test("security triage does not claim that no match means safe", () => {
  const result = analyzeSecurityEvent({ description: "routine maintenance completed" });
  assert.match(result.findings[0].detail, /does not prove/i);
});

test("planner requires explicit authorization", () => {
  const result = buildAuthorizedTestPlan({ asset: "staging.example.test", authorization: false, scope: ["web-app"] });
  assert.match(result.error, /written permission/i);
});

test("planner rejects empty scope", () => {
  const result = buildAuthorizedTestPlan({ asset: "staging.example.test", authorization: true, scope: [] });
  assert.match(result.error, /at least one/i);
});

test("planner creates only selected defensive checklist items", () => {
  const result = buildAuthorizedTestPlan({ asset: "staging.example.test", authorization: true, scope: ["headers"] });
  assert.equal(result.authorized, true);
  assert.equal(result.plan.length, 2);
  assert.ok(result.plan.every(item => item.area === "headers"));
  assert.match(result.safety, /does not connect to, scan, exploit, or modify/i);
});
