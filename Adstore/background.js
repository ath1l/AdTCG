chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "AD_DETECTED") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      const now = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `yt-ad-${now}.png`;

      chrome.downloads.download({
        url: dataUrl,
        filename: `adStore/${filename}`, 
        saveAs: false
      });
    });
  }
});
