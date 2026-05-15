# 📄 Resume Rewriter (ZemAI Edition)
### AI‑powered resume optimization using Google Gemini

Resume Rewriter is a lightweight Chrome extension that rewrites your resume to match any job description using the Gemini API.  
It produces clean, ATS‑friendly, professional results — all processed locally in your browser.

---

## 🚀 Features

- ✨ Rewrite your resume to match any job description  
- 🤖 Powered by **Gemini Flash / Gemini Pro**  
- 🔒 Your API key stays **local** (never uploaded anywhere)  
- ⚡ Fast, optimized rewriting  
- 🎨 Modern ZemAI‑themed UI  
- 📋 One‑click copy of the rewritten resume  
- 🧩 Works on Chrome, Edge, Brave, and all Chromium browsers  

---

## 📸 Screenshot

<img width="1860" height="577" alt="Screenshot 2026-05-15 141534" src="https://github.com/user-attachments/assets/8b155a03-c423-4a97-8691-195ec4caff93" />


<img width="1087" height="680" alt="Screenshot 2026-05-15 141608" src="https://github.com/user-attachments/assets/e79693c2-2a4a-4b1b-8783-62760bba6fca" />

<img width="1912" height="900" alt="Screenshot 2026-05-15 144254" src="https://github.com/user-attachments/assets/818fb979-81b6-49e5-8240-7a6f79fa9296" />




```
/screenshots/popup.png
```

---

## 🛠 Installation (Developer Mode)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/yourusername/resume-rewriter.git
   ```

2. Open Chrome and go to:
   ```
   chrome://extensions/
   ```

3. Enable **Developer Mode** (top right)

4. Click **Load unpacked**

5. Select the project folder:
   ```
   resume-rewriter/
   ```

6. The extension will appear in your toolbar.

---

## 🔧 How to Use

1. Click the **Resume Rewriter** extension icon  
2. Paste your **resume**  
3. Paste the **job description**  
4. Enter your **Gemini API key**  
5. Click **Rewrite Resume**  
6. Copy the optimized resume and use it in your job application  

---

## 🔑 Getting a Gemini API Key

1. Visit:  
   https://aistudio.google.com/app/apikey

2. Create an API key  
3. Paste it into the extension  
4. Done — your key is stored **only in your browser**

---

## 📂 Project Structure

```
resume-rewriter/
│── manifest.json
│── popup.html
│── popup.js
│── styles.css
│── icon16.png
│── icon48.png
│── icon128.png
└── README.md
```

---

## 🧠 How It Works

The extension sends your resume + job description to the Gemini API using:

- `models/gemini-flash-latest` (fast + efficient)  
- or any model you configure

Gemini returns a rewritten, ATS‑friendly version tailored to the job description.  
No data is stored or logged.

---

## 🛡 Privacy

- Your API key is stored **locally** using Chrome storage  
- No data is sent anywhere except directly to Gemini  
- Nothing is uploaded to any server  
- 100% client‑side and secure  

---

## 🤝 Contributing

Pull requests are welcome.  
Ideas for future enhancements:

- Dark/Light mode toggle  
- Multiple rewrite styles (Concise, Recruiter, Senior‑Level, etc.)  
- Resume scoring  
- PDF export  

---

## ⭐ Support

If this project helped you, consider giving it a **star** on GitHub.

---

## 🧩 Author

**Zemran (ZemAI)**  
AI‑powered tools for real‑world productivity.
