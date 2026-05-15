// ===============================
// Load ATS Data from chrome.storage
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["atsData"], (result) => {
    if (!result.atsData) {
      console.error("No ATS data found in storage.");
      document.getElementById("atsLoadingOverlay").style.display = "none";
      return;
    }

    const data = result.atsData;
    console.log("Loaded ATS Data:", data);

    renderATSScore(data.ats_score);
    renderJobMatch(data.job_match);
    renderKeywords(data.keywords);
    renderMissingSkills(data.missing_skills);
    renderSuggestions(data.suggestions);
    renderRedFlags(data.red_flags);

    // Remove loading overlay
    setTimeout(() => {
      document.getElementById("atsLoadingOverlay").style.opacity = "0";
      setTimeout(() => {
        document.getElementById("atsLoadingOverlay").style.display = "none";
      }, 400);
    }, 600);
  });
});

// ===============================
// Render ATS Score (Animated Ring)
// ===============================
function renderATSScore(score) {
  const scoreValue = document.getElementById("atsScoreValue");
  const ring = document.querySelector(".ats-score-ring");

  if (!score && score !== 0) score = 0;

  scoreValue.textContent = score;

  // Animate ring fill
  const percent = Math.min(Math.max(score, 0), 100);
  ring.style.background = `conic-gradient(
    var(--gradient-start) ${percent * 3.6}deg,
    #e2e8f0 ${percent * 3.6}deg
  )`;
}

// ===============================
// Render Job Match Bar
// ===============================
function renderJobMatch(match) {
  const bar = document.getElementById("jobMatchBar");
  const value = document.getElementById("jobMatchValue");

  if (!match && match !== 0) match = 0;

  value.textContent = match + "%";

  setTimeout(() => {
    bar.style.width = match + "%";
  }, 200);
}

// ===============================
// Render Keyword Density Table
// ===============================
function renderKeywords(keywords) {
  const tbody = document.getElementById("keywordTableBody");
  tbody.innerHTML = "";

  if (!keywords || keywords.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="ats-table-empty">No keywords detected.</td></tr>`;
    return;
  }

  keywords.forEach((k) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${k.keyword}</td>
      <td>${k.count}</td>
      <td>${k.percentage}</td>
    `;
    tbody.appendChild(row);
  });
}

// ===============================
// Render Missing Skills
// ===============================
function renderMissingSkills(skills) {
  const list = document.getElementById("missingSkillsList");
  list.innerHTML = "";

  if (!skills || skills.length === 0) {
    list.innerHTML = `<li class="ats-list-empty">No missing skills detected.</li>`;
    return;
  }

  skills.forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    list.appendChild(li);
  });
}

// ===============================
// Render Suggestions
// ===============================
function renderSuggestions(suggestions) {
  const list = document.getElementById("suggestionsList");
  list.innerHTML = "";

  if (!suggestions || suggestions.length === 0) {
    list.innerHTML = `<li class="ats-list-empty">No suggestions available.</li>`;
    return;
  }

  suggestions.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });
}

// ===============================
// Render Red Flags
// ===============================
function renderRedFlags(flags) {
  const list = document.getElementById("redFlagsList");
  list.innerHTML = "";

  if (!flags || flags.length === 0) {
    list.innerHTML = `<li class="ats-list-empty">No red flags detected.</li>`;
    return;
  }

  flags.forEach((f) => {
    const li = document.createElement("li");
    li.textContent = f;
    list.appendChild(li);
  });
}
