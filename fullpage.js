chrome.storage.local.get("atsData", ({ atsData }) => {
  if (!atsData) {
    document.getElementById("atsContainer").innerHTML = "<h2>No ATS data found.</h2>";
    return;
  }

  document.getElementById("atsContainer").innerHTML = `
    <h1>ATS Analysis</h1>

    <h2>Scores</h2>
    <p><strong>ATS Score:</strong> ${atsData.ats_score}%</p>
    <p><strong>Job Match:</strong> ${atsData.job_match}%</p>

    <h2>Keywords</h2>
    <ul>
      ${atsData.keywords.map(k => `<li>${k.keyword}: ${k.count} (${k.percentage})</li>`).join("")}
    </ul>

    <h2>Missing Skills</h2>
    <ul>${atsData.missing_skills.map(s => `<li>${s}</li>`).join("")}</ul>

    <h2>Suggestions</h2>
    <ul>${atsData.suggestions.map(s => `<li>${s}</li>`).join("")}</ul>

    <h2>Red Flags</h2>
    <ul>${atsData.red_flags.map(s => `<li>${s}</li>`).join("")}</ul>
  `;
});
