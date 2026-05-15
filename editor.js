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
// UNIVERSAL GEMINI ERROR HANDLER
// ===============================
function handleGeminiError(status, err) {
  if (status === 429) {
    alert("Gemini API quota reached. Please wait or use a new API key.");
    return;
  }

  console.error("Gemini API error:", status, err);
  alert("Gemini API error occurred. Check console for details.");
}

// ===============================
// SAFE FETCH WRAPPER
// ===============================
async function safeGeminiFetch(url, payload) {
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (networkError) {
    alert("Network error: Unable to reach Gemini API.");
    console.error(networkError);
    return null;
  }

  if (!response.ok) {
    let err = {};
    try {
      err = await response.json();
    } catch (_) {}

    handleGeminiError(response.status, err);
    return null;
  }

  return response.json();
}

// ===============================
// GEMINI CALL #1 — REWRITE RESUME
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

  const data = await safeGeminiFetch(
    `${GEMINI_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  if (!data) return "";

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ===============================
// GEMINI CALL #2 — SCORE RESUME
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

  const data = await safeGeminiFetch(
    `${GEMINI_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  if (!data) return null;

  let raw =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    data.candidates?.[0]?.content?.parts?.[0]?.functionCall?.args?.json ||
    "";

  raw = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("JSON parse error:", raw);
    return null;
  }
}

// ===============================
// REWRITE BUTTON HANDLER
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

  if (!rewritten) {
    rewriteBtn.disabled = false;
    rewriteBtn.textContent = "Rewrite Resume";
    return;
  }

  outputBox.value = rewritten;

  rewriteBtn.disabled = false;
  rewriteBtn.textContent = "Rewrite Resume";
});

// ===============================
// ANALYZE BUTTON HANDLER
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

  if (!atsData) {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze with ATS";
    return;
  }

  chrome.storage.local.set({ atsData }, () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL("fullpage.html")
    });
  });

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze with ATS";
});

// ===============================
// COPY BUTTON HANDLER
// ===============================
document.getElementById("copyBtn").addEventListener("click", () => {
  const text = outputBox.value.trim();
  if (!text) return alert("Nothing to copy. Rewrite the resume first.");

  navigator.clipboard.writeText(text)
    .then(() => alert("Rewritten resume copied to clipboard!"))
    .catch(() => alert("Clipboard copy failed. Try again."));
});

// ===============================
// DOWNLOAD DOCX BUTTON HANDLER
// ===============================
document.getElementById("downloadDocxBtn").addEventListener("click", async () => {
  const text = outputBox.value.trim();
  if (!text) return alert("Nothing to download. Rewrite the resume first.");

  const doc = new docx.Document({
    sections: [
      {
        properties: {},
        children: [
          new docx.Paragraph({
            children: [new docx.TextRun(text)],
          }),
        ],
      },
    ],
  });

  const blob = await docx.Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Rewritten_Resume.docx";
  a.click();

  URL.revokeObjectURL(url);
});