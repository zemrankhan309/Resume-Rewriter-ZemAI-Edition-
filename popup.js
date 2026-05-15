console.log("popup.js loaded");

/* ============================================================
   CLEAN MARKDOWN / REMOVE SYMBOLS
============================================================ */
function cleanMarkdown(text) {
    return text
        .replace(/\*\*\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#/g, "")
        .replace(/_/g, "")
        .replace(/`/g, "")
        .replace(/\•/g, "-")
        .replace(/\·/g, "-")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/* ============================================================
   GEMINI REWRITE FUNCTION (STRICT JSON PROMPT)
============================================================ */
async function rewriteWithGemini(resume, jd, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const prompt = `
You are an ATS optimization engine.

Your output MUST contain TWO sections in this exact order:

========================
SECTION 1 — REWRITTEN RESUME
========================
Return ONLY the rewritten resume in clean ATS‑friendly formatting.

RULES:
- Use section headers in ALL CAPS (SUMMARY, SKILLS, EXPERIENCE, EDUCATION).
- Use clean bullet points using "-" only.
- Use UPPERCASE for job titles and company names.
- Do NOT use markdown (**bold**, #, *, etc.).
- Do NOT invent experience.
- Make the rewrite achievement‑focused and quantified.

========================
SECTION 2 — ATS_DATA JSON
========================
After the resume, output EXACTLY the following JSON block.
No commentary. No explanation. No extra text before or after.
The JSON MUST be valid and MUST follow this structure:

ATS_DATA: {
  "ats_score": 85,
  "job_match": 92,
  "keywords": [
      {"keyword": "Azure", "count": 5, "percentage": "3.2%"}
  ]
}
If you do NOT output this JSON block, the task is considered incomplete.
Resume:
${resume}

Job Description:
${jd}

Begin now.
`;

    const body = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/* ============================================================
   REWRITE BUTTON HANDLER
============================================================ */
document.getElementById("rewriteBtn").addEventListener("click", async () => {
    const resume = document.getElementById("resumeInput").value.trim();
    const jd = document.getElementById("jdInput").value.trim();
    const apiKey = document.getElementById("apiKey").value.trim();

    if (!resume || !jd) {
        alert("Please paste both your resume and the job description.");
        return;
    }
    if (!apiKey) {
        alert("Please enter your Gemini API key.");
        return;
    }

    document.getElementById("outputResume").value = "Rewriting… please wait.";

    try {
        const rewritten = await rewriteWithGemini(resume, jd, apiKey);

        /* Extract JSON */
        let atsData = null;
        const jsonMatch = rewritten.match(/ATS_DATA[\s:]*({[\s\S]*?})/);

        if (jsonMatch) {
            try {
                let jsonText = jsonMatch[1]
                    .replace(/,\s*}/g, "}")
                    .replace(/,\s*]/g, "]");
                atsData = JSON.parse(jsonText);
            } catch (e) {
                console.error("JSON Parse Error:", e);
            }
        }

        /* Clean resume */
        const cleanedResume = rewritten.replace(/ATS_DATA[\s\S]*$/, "").trim();
        document.getElementById("outputResume").value = cleanMarkdown(cleanedResume);

        /* Show ATS summary in alert (simple fallback) */
        if (atsData) {
            alert(
                "ATS Score: " + atsData.ats_score +
                "\nJob Match: " + atsData.job_match + "%" +
                "\n\nTop Keyword: " + atsData.keywords[0].keyword
            );
        }

    } catch (err) {
        console.error(err);
        document.getElementById("outputResume").value =
            "AI rewriting failed. Check your API key or internet connection.";
    }
});

/* ============================================================
   COPY BUTTON
============================================================ */
document.getElementById("copyBtn").addEventListener("click", () => {
    const text = document.getElementById("outputResume").value;
    navigator.clipboard.writeText(text);
    alert("Rewritten resume copied.");
});

/* ============================================================
   DOCX EXPORT
============================================================ */
document.getElementById("downloadDocxBtn").addEventListener("click", async () => {
    const text = document.getElementById("outputResume").value.trim();
    if (!text) return alert("No rewritten resume to export.");

    const paragraphs = text.split("\n").map(line => new docx.Paragraph(line));

    const doc = new docx.Document({
        sections: [{ properties: {}, children: paragraphs }]
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.docx";
    a.click();

    URL.revokeObjectURL(url);
});

/* ============================================================
   OPEN FULL PAGE — FIXED
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("openFullPageBtn");
    if (btn) {
        btn.addEventListener("click", () => {
            chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
        });
    }
});
