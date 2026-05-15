document.getElementById("openEditorBtn").addEventListener("click", () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("editor.html")
  });
});

document.getElementById("openATSBtn").addEventListener("click", () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("fullpage.html")
  });
});
