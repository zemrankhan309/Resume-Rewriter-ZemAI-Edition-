// ===============================
// GEMINI API CONFIG
// ===============================
function getApiKey() {
  const key = document.getElementById("apiKeyInput")?.value.trim();
  return key || "";
}

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

// ===============================
// DOM ELEMENTS
// ===============================
const resumeInput = document.getElementById("resumeInput");
const jdInput = document.getElementById("jdInput");
const outputBox = document.getElementById("outputBox");
const rewriteBtn = document.getElementById("rewriteBtn");
const analyzeBtn = document.getElementById("analyzeBtn");

// ===============================
// REWRITE RESUME
// ===============================
async function rewriteResume(resume, jd, apiKey) {
  const prompt = `
Rewrite the following resume to be ATS‑optimized, quantified, and aligned with the job description.

RULES:
- Use clean ATS‑friendly formatting.
- Use ALL CAPS for section headers.
- Use "-" for bullet points.
- No markdown.
- No commentary.
- No JSON.
- Output ONLY the rewritten resume.

Resume:
${resume}

Job Description:
${jd}
`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ===============================
// ATS SCORING
// ===============================
async function scoreResume(rewrittenResume, jd, apiKey) {
  const prompt = `
Analyze the rewritten resume against the job description.

Return ONLY valid JSON in this exact structure:

{
  "ats_score": 0,
  "job_match": 0,
  "keywords": [
    { "keyword": "Azure", "count": 0, "percentage": "0%" }
  ],
  "missing_skills": [],
  "suggestions": [],
  "red_flags": []
}

NO commentary.
NO markdown.
NO extra text.

Resume:
${rewrittenResume}

Job Description:
${jd}
`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse error:", raw);
    return null;
  }
}

// ===============================
// BUTTON: REWRITE
// ===============================
rewriteBtn.addEventListener("click", async () => {
  const apiKey = getApiKey();
  const resume = resumeInput.value.trim();
  const jd = jdInput.value.trim();

  if (!apiKey) return alert("Please enter your Gemini API key.");
  if (!resume || !jd) return alert("Please paste both resume and job description.");

  rewriteBtn.disabled = true;
  rewriteBtn.textContent = "Rewriting…";

  const rewritten = await rewriteResume(resume, jd, apiKey);
  outputBox.value = rewritten;

  rewriteBtn.disabled = false;
  rewriteBtn.textContent = "Rewrite Resume";
});

// ===============================
// BUTTON: ANALYZE
// ===============================
analyzeBtn.addEventListener("click", async () => {
  const apiKey = getApiKey();
  const rewritten = outputBox.value.trim();
  const jd = jdInput.value.trim();

  if (!apiKey) return alert("Please enter your Gemini API key.");
  if (!rewritten || !jd) return alert("Please rewrite the resume first.");

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing…";

  const atsData = await scoreResume(rewritten, jd, apiKey);

  if (atsData) {
    chrome.storage.local.set({ atsData }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL("fullpage.html")
      });
    });
  } else {
    alert("Failed to generate ATS analysis.");
  }

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze with ATS";
});

// ===============================
// BUTTON: COPY
// ===============================
document.getElementById("copyBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(outputBox.value);
  alert("Copied!");
});

// ===============================
// BUTTON: DOWNLOAD DOCX
// ===============================
document.getElementById("downloadDocxBtn").addEventListener("click", () => {
  const text = outputBox.value.trim();
  if (!text) return alert("Please rewrite the resume first.");

  const blob = new Blob([text], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "rewritten_resume.docx";
  a.click();
  URL.revokeObjectURL(url);
});
