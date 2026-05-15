document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("atsData", ({ atsData }) => {

    const container = document.getElementById("atsContainer");

    if (!container) {
      console.error("ATS container not found in DOM.");
      return;
    }

    // No data found
    if (!atsData) {
      container.innerHTML = `
        <h2>No ATS data found</h2>
        <p>Please run "Analyze with ATS" from the Editor page.</p>
      `;
      return;
    }

    // Render ATS Dashboard
    container.innerHTML = `
      <h1>ZemAI ATS Report</h1>

      <section class="ats-section">
        <h2>ATS Score</h2>
        <p class="ats-score">${atsData.ats_score}%</p>
      </section>

      <section class="ats-section">
        <h2>Job Match</h2>
        <p class="job-match">${atsData.job_match}%</p>
      </section>

      <section class="ats-section">
        <h2>Keyword Density</h2>
        <ul>
          ${atsData.keywords
            .map(k => `<li>${k.keyword}: ${k.count} (${k.percentage})</li>`)
            .join("")}
        </ul>
      </section>

      <section class="ats-section">
        <h2>Missing / Weak Skills</h2>
        <ul>
          ${atsData.missing_skills.map(s => `<li>${s}</li>`).join("")}
        </ul>
      </section>

      <section class="ats-section">
        <h2>Suggestions</h2>
        <ul>
          ${atsData.suggestions.map(s => `<li>${s}</li>`).join("")}
        </ul>
      </section>

      <section class="ats-section">
        <h2>Potential Red Flags</h2>
        <ul>
          ${atsData.red_flags.map(s => `<li>${s}</li>`).join("")}
        </ul>
      </section>
    `;
  });
});
