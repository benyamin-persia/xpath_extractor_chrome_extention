document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("toggle");
    
    // When the toggle button is clicked, send a message to the active tab's content script
    toggleButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleExtension" }, (response) => {
          if (response && typeof response.enabled !== "undefined") {
            toggleButton.textContent = response.enabled ? "Disable" : "Enable";
          }
        });
      });
    });
  });
  