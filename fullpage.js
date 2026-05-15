document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("atsData", ({ atsData }) => {

    const overlay = document.getElementById("atsLoadingOverlay");

    if (!atsData) {
      overlay.innerHTML = `
        <div class="ats-loading-card">
          <p>No ATS data found. Please run "Analyze with ATS" from the editor.</p>
        </div>
      `;
      return;
    }

    // ===============================
    // 1. ATS SCORE
    // ===============================
    const atsScoreValue = document.getElementById("atsScoreValue");
    if (atsScoreValue) atsScoreValue.textContent = `${atsData.ats_score}%`;

    // ===============================
    // 2. JOB MATCH BAR
    // ===============================
    const jobMatchBar = document.getElementById("jobMatchBar");
    const jobMatchValue = document.getElementById("jobMatchValue");

    if (jobMatchBar) jobMatchBar.style.width = `${atsData.job_match}%`;
    if (jobMatchValue) jobMatchValue.textContent = `${atsData.job_match}%`;

    // ===============================
    // 3. KEYWORD TABLE
    // ===============================
    const keywordTableBody = document.getElementById("keywordTableBody");
    if (keywordTableBody) {
      keywordTableBody.innerHTML = atsData.keywords
        .map(
          (k) => `
        <tr>
          <td>${k.keyword}</td>
          <td>${k.count}</td>
          <td>${k.percentage}</td>
        </tr>
      `
        )
        .join("");
    }

    // ===============================
    // 4. MISSING SKILLS
    // ===============================
    const missingSkillsList = document.getElementById("missingSkillsList");
    if (missingSkillsList) {
      missingSkillsList.innerHTML = atsData.missing_skills.length
        ? atsData.missing_skills.map((s) => `<li>${s}</li>`).join("")
        : `<li class="ats-list-empty">No missing skills detected.</li>`;
    }

    // ===============================
    // 5. SUGGESTIONS
    // ===============================
    const suggestionsList = document.getElementById("suggestionsList");
    if (suggestionsList) {
      suggestionsList.innerHTML = atsData.suggestions.length
        ? atsData.suggestions.map((s) => `<li>${s}</li>`).join("")
        : `<li class="ats-list-empty">No suggestions available.</li>`;
    }

    // ===============================
    // 6. RED FLAGS
    // ===============================
    const redFlagsList = document.getElementById("redFlagsList");
    if (redFlagsList) {
      redFlagsList.innerHTML = atsData.red_flags.length
        ? atsData.red_flags.map((s) => `<li>${s}</li>`).join("")
        : `<li class="ats-list-empty">No red flags detected.</li>`;
    }

    // ===============================
    // 7. REMOVE LOADING OVERLAY
    // ===============================
    if (overlay) overlay.style.display = "none";
  });
});
