// ===============================
// GEMINI API CONFIG
// ===============================
const API_KEY = "YOUR_API_KEY_HERE";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// ===============================
// DOM ELEMENTS
// ===============================
const resumeInput = document.getElementById("resumeInput");
const jdInput = document.getElementById("jdInput");
const rewriteBtn = document.getElementById("rewriteBtn");
const outputBox = document.getElementById("outputBox");
const copyBtn = document.getElementById("copyBtn");
const downloadDocxBtn = document.getElementById("downloadDocxBtn");
const openFullPageBtn = document.getElementById("openFullPageBtn");
const openEditorBtn = document.getElementById("openEditorBtn"); // NEW BUTTON

// ===============================
// GEMINI CALL #1 — REWRITE RESUME
// ===============================
async function rewriteResume(resume, jd) {
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

  const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
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
// GEMINI CALL #2 — SCORE RESUME (JSON ONLY)
// ===============================
async function scoreResume(rewrittenResume, jd) {
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

  const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
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
// MAIN WORKFLOW — REWRITE + SCORE
// ===============================
rewriteBtn.addEventListener("click", async () => {
  const resume = resumeInput.value.trim();
  const jd = jdInput.value.trim();

  if (!resume || !jd) {
    alert("Please paste both resume and job description.");
    return;
  }

  rewriteBtn.disabled = true;
  rewriteBtn.textContent = "Rewriting…";

  // 1️⃣ Rewrite Resume
  const rewritten = await rewriteResume(resume, jd);
  outputBox.value = rewritten;

  // 2️⃣ Score Resume
  const atsData = await scoreResume(rewritten, jd);

  if (atsData) {
    chrome.storage.local.set({ atsData });
  }

  rewriteBtn.disabled = false;
  rewriteBtn.textContent = "Rewrite Resume";
});

// ===============================
// COPY BUTTON
// ===============================
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(outputBox.value);
  copyBtn.textContent = "Copied!";
  setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
});

// ===============================
// DOWNLOAD DOCX
// ===============================
downloadDocxBtn.addEventListener("click", () => {
  const content = outputBox.value;
  const blob = new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Rewritten_Resume.docx";
  a.click();

  URL.revokeObjectURL(url);
});

// ===============================
// OPEN ATS DASHBOARD
// ===============================
openFullPageBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("fullpage.html") });
});

// ===============================
// OPEN FULL PAGE EDITOR (NEW)
// ===============================
openEditorBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("editor.html") });
});
