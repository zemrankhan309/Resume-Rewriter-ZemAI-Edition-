console.log("popup.js loaded");

// ------------------------------
// Clean Markdown / Asterisks
// ------------------------------
function cleanMarkdown(text) {
    return text
        .replace(/\*\*\*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#/g, "")
        .replace(/_/g, "")
        .replace(/`/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

// ------------------------------
// Gemini Rewrite Function
// ------------------------------
async function rewriteWithGemini(resume, jd, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const prompt = `
Rewrite the following resume summary so it aligns strongly with the job description.
Make it professional, ATS-friendly, achievement-focused, and tailored.
Do not invent experience. Improve clarity, structure, and impact.

Resume:
${resume}

Job Description:
${jd}

Rewritten Resume:
`;

    const body = {
        contents: [
            {
                parts: [{ text: prompt }]
            }
        ]
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
}

// ------------------------------
// Rewrite Button
// ------------------------------
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
        document.getElementById("outputResume").value = cleanMarkdown(rewritten);
    } catch (err) {
        console.error(err);
        document.getElementById("outputResume").value =
            "AI rewriting failed. Check your API key or internet connection.";
    }
});

// ------------------------------
// Copy Button
// ------------------------------
document.getElementById("copyBtn").addEventListener("click", () => {
    const text = document.getElementById("outputResume").value;
    navigator.clipboard.writeText(text);
    alert("Rewritten resume copied.");
});

// ------------------------------
// DOCX Export
// ------------------------------
document.getElementById("downloadDocxBtn").addEventListener("click", async () => {
    const text = document.getElementById("outputResume").value.trim();
    if (!text) return alert("No rewritten resume to export.");

    const paragraphs = text.split("\n").map((line) => new docx.Paragraph(line));

    const doc = new docx.Document({
        sections: [
            {
                properties: {},
                children: paragraphs
            }
        ]
    });

    const blob = await docx.Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.docx";
    a.click();

    URL.revokeObjectURL(url);
});

// ------------------------------
// Open Full Page
// ------------------------------
document.getElementById("openFullPageBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});
