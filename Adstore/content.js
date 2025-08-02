const observer = new MutationObserver(() => {
  const ad = document.querySelector('.ad-showing');

  if (ad && !window.__adDetected) {
    window.__adDetected = true;

    chrome.runtime.sendMessage({ type: "AD_DETECTED" });

    // Reset flag after 10 seconds (or when ad ends)
    setTimeout(() => {
      window.__adDetected = false;
    }, 10000);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
