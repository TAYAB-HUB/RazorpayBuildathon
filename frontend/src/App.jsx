import React, { useState } from "react";
import { runReconciliation } from "./api.js";

const TIER_LABEL = {
  tier1_deterministic: "Tier 1 · Code",
  tier2_agent: "Tier 2 · Agent",
  unclassified: "Unresolved",
};

function StatCard({ className, value, label, stamp }) {
  return (
    <div className={`stat-card ${className}`}>
      {stamp && <div className="stamp">{stamp}</div>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ResolvedTable({ records }) {
  if (records.length === 0) {
    return <p className="state-panel">No records resolved to a match yet.</p>;
  }
  return (
    <table className="ledger-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Settlement Ref</th>
          <th>Resolved By</th>
          <th>Confidence</th>
          <th>Basis</th>
        </tr>
      </thead>
      <tbody>
        {records.map((r) => (
          <tr key={r.order_id}>
            <td className="mono">{r.order_id}</td>
            <td className="mono">{r.settlement_ref || "—"}</td>
            <td>
              <span className={`pill ${r.resolution_tier === "tier1_deterministic" ? "tier1" : "tier2"}`}>
                {TIER_LABEL[r.resolution_tier] || r.resolution_tier}
              </span>
            </td>
            <td className="confidence-cell">
              {r.confidence != null ? r.confidence.toFixed(2) : "—"}
            </td>
            <td className="explanation-cell">{r.explanation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ExceptionsTable({ exceptions }) {
  if (exceptions.length === 0) {
    return <p className="state-panel">No open exceptions — every record resolved.</p>;
  }
  return (
    <table className="ledger-table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Reason Code</th>
          <th>Confidence</th>
          <th>Explanation</th>
        </tr>
      </thead>
      <tbody>
        {exceptions.map((e) => (
          <tr key={e.order_id}>
            <td className="mono">{e.order_id}</td>
            <td>
              <span className="pill exception">{e.reason_code}</span>
            </td>
            <td className="confidence-cell">{e.confidence != null ? e.confidence.toFixed(2) : "—"}</td>
            <td className="explanation-cell">{e.explanation}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("resolved");

  const handleRun = async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const data = await runReconciliation({ regenerateData: true, useMock: null });
      setResult(data);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(err.message || "Could not reach the reconciliation service.");
      setStatus("error");
    }
  };

  const report = result?.report;
  const scoring = report?.ground_truth_scoring;

  return (
    <div className="app">
      <div className="masthead">
        <div>
          <h1 className="masthead-title">AI Finance Controller</h1>
          <div className="masthead-subtitle">Reconciliation Ledger — Synthetic Batch Run</div>
        </div>
        <div>
          <button className="run-button" onClick={handleRun} disabled={status === "loading"}>
            {status === "loading" ? "Reconciling…" : "Run Reconciliation"}
          </button>
          {report && (
            <div className="run-meta">
              {report.total_ledger_records} records · {report.resolution_breakdown_by_tier.tier1_deterministic || 0} tier-1 ·{" "}
              {report.resolution_breakdown_by_tier.tier2_agent || 0} tier-2
            </div>
          )}
        </div>
      </div>

      {status === "idle" && (
        <div className="state-panel">
          Press "Run Reconciliation" to generate a fresh 50+ record synthetic batch and
          close the reconciliation loop end to end.
        </div>
      )}

      {status === "error" && (
        <div className="state-panel error">
          Couldn't complete the run: <code>{errorMessage}</code>. Check that the backend
          is reachable at the configured API URL and try again.
        </div>
      )}

      {report && (
        <>
          <div className="summary-strip">
            <StatCard
              className="match"
              value={`${(report.match_rate * 100).toFixed(1)}%`}
              label="Match Rate"
              stamp={
                <>
                  RECONCILED
                  <br />
                  {(report.match_rate * 100).toFixed(0)}%
                </>
              }
            />
            <StatCard
              className="tier1"
              value={report.resolution_breakdown_by_tier.tier1_deterministic || 0}
              label="Resolved by code (tier 1)"
            />
            <StatCard
              className="tier2"
              value={report.resolution_breakdown_by_tier.tier2_agent || 0}
              label="Resolved by agent (tier 2)"
            />
            <StatCard
              className="accuracy"
              value={scoring?.overall_accuracy != null ? `${(scoring.overall_accuracy * 100).toFixed(1)}%` : "—"}
              label="Measured accuracy vs. ground truth"
            />
          </div>

          <div className="tabs">
            <button className={`tab ${tab === "resolved" ? "active" : ""}`} onClick={() => setTab("resolved")}>
              Resolved
            </button>
            <button className={`tab ${tab === "exceptions" ? "active" : ""}`} onClick={() => setTab("exceptions")}>
              Exceptions ({report.exception_count})
            </button>
          </div>

          {tab === "resolved" && <ResolvedTable records={report.resolved_records} />}
          {tab === "exceptions" && <ExceptionsTable exceptions={report.exceptions} />}
        </>
      )}

      <div className="footer-note">
        Tier 1 = deterministic code, no model call. Tier 2 = OpenAI structured-output
        agent, used only where amount/ID ambiguity needs reasoning. Every unresolved
        record above is an honest exception, not a hidden failure.
      </div>
    </div>
  );
}
