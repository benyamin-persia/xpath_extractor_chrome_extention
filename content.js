document.addEventListener("DOMContentLoaded", function () {
  // Global flag for enabling/disabling the extension (toggled via popup)
  let extensionEnabled = true;
  // Flag to "freeze" the tooltip when the Control key is held down
  let freezeTooltip = false;

  // Create the tooltip container
  let tooltip = document.createElement("div");
  tooltip.id = "xpath-tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.background = "rgba(0, 0, 0, 0.9)";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "8px";
  tooltip.style.borderRadius = "5px";
  tooltip.style.fontSize = "12px";
  tooltip.style.fontFamily = "Arial, sans-serif";
  tooltip.style.zIndex = "9999";
  tooltip.style.pointerEvents = "auto"; // Make it clickable
  tooltip.style.display = "none";
  tooltip.style.maxWidth = "600px"; // Wider for list display
  tooltip.style.wordWrap = "break-word";
  document.body.appendChild(tooltip);

  // Helper functions to safely get an element's class and text
  function getSafeClassName(target) {
    let className = "";
    if (target.className) {
      if (typeof target.className === "string") {
        className = target.className.trim();
      } else if (target.className.baseVal) {
        className = target.className.baseVal.trim();
      }
    }
    return className;
  }
  function getSafeText(target) {
    let text = "";
    if (target.textContent && typeof target.textContent === "string") {
      text = target.textContent.trim();
    }
    return text;
  }

  // Helper to escape a string for use as an XPath literal.
  function escapeXPathLiteral(str) {
    if (str.indexOf("'") === -1) {
      return "'" + str + "'";
    } else if (str.indexOf('"') === -1) {
      return '"' + str + '"';
    } else {
      const parts = str.split("'");
      const result = parts
        .map((part, i) => (i > 0 ? ',"\'",' : "") + "'" + part + "'")
        .join("");
      return "concat(" + result + ")";
    }
  }

  // Helper function: generate an absolute XPath for an element
  function getAbsoluteXPath(element) {
    if (element.nodeType !== Node.ELEMENT_NODE) return "";
    let xpath = "";
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = element.previousSibling;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === element.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      let tagName = element.tagName.toLowerCase();
      xpath = "/" + tagName + "[" + index + "]" + xpath;
      element = element.parentNode;
    }
    return xpath;
  }

  // Helper function: generate a CSS selector for an element
  function getCssSelector(element) {
    if (element.id) {
      return "#" + element.id;
    }
    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.className) {
        let classes = element.className.toString().trim().split(/\s+/);
        if (classes.length) {
          selector += "." + classes.join(".");
        }
      }
      let sibling = element;
      let nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() === element.nodeName.toLowerCase()) {
          nth++;
        }
      }
      if (nth !== 1) {
        selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(" > ");
  }

  // Generate candidate selectors for the given element.
  // Returns an array of objects: { selector, type, label }
  function generateCandidates(target) {
    let candidates = [];
    let tag = target.tagName.toLowerCase();
    let className = getSafeClassName(target);
    let text = getSafeText(target);

    // Limit text length to 50 characters
    if (text.length > 50) {
      text = text.substring(0, 50);
    }
    let safeClass = className.length > 0 ? escapeXPathLiteral(className) : "";
    let safeText = text.length > 0 ? escapeXPathLiteral(text) : "";

    // Relative XPath variations (if text and class exist)
    if (text.length > 0 && className.length > 0) {
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass}) and contains(text(), ${safeText})]`,
        type: "xpath",
        label: "Relative XPath (contains text)"
      });
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass}) and contains(normalize-space(text()), ${safeText})]`,
        type: "xpath",
        label: "Relative XPath (normalize-space)"
      });
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass}) and starts-with(text(), ${safeText})]`,
        type: "xpath",
        label: "Relative XPath (starts-with text)"
      });
      let first10 = escapeXPathLiteral(text.substring(0, 10));
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass}) and substring(text(), 1, 10) = ${first10}]`,
        type: "xpath",
        label: "Relative XPath (substring text)"
      });
      if (text.indexOf(" ") !== -1) {
        let firstWord = text.split(" ")[0];
        let safeFirstWord = escapeXPathLiteral(firstWord);
        candidates.push({ 
          selector: `//${tag}[contains(@class, ${safeClass}) and substring-before(text(), ' ') = ${safeFirstWord}]`,
          type: "xpath",
          label: "Relative XPath (substring-before)"
        });
        let afterFirst = text.substring(text.indexOf(" ") + 1);
        let safeAfter = escapeXPathLiteral(afterFirst);
        candidates.push({ 
          selector: `//${tag}[contains(@class, ${safeClass}) and substring-after(text(), ' ') = ${safeAfter}]`,
          type: "xpath",
          label: "Relative XPath (substring-after)"
        });
      }
      candidates.push({ 
        selector: `(//${tag}[contains(@class, ${safeClass}) and contains(text(), ${safeText})])[last()]`,
        type: "xpath",
        label: "Relative XPath (last)"
      });
    }

    // Additional XPath candidates based on attributes
    if (className.length > 0) {
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass})]`,
        type: "xpath",
        label: "XPath (class only)"
      });
    }
    if (target.hasAttribute("id")) {
      let id = target.getAttribute("id").trim();
      if (id.length > 0) {
        candidates.push({ 
          selector: `//${tag}[@id=${escapeXPathLiteral(id)}]`,
          type: "xpath",
          label: "XPath (id)"
        });
      }
    }
    if (target.hasAttribute("title")) {
      let title = target.getAttribute("title").trim();
      if (title.length > 0) {
        candidates.push({ 
          selector: `//${tag}[@title=${escapeXPathLiteral(title)}]`,
          type: "xpath",
          label: "XPath (title)"
        });
      }
    }
    if (target.hasAttribute("aria-label")) {
      let aria = target.getAttribute("aria-label").trim();
      if (aria.length > 0) {
        candidates.push({ 
          selector: `//${tag}[@aria-label=${escapeXPathLiteral(aria)}]`,
          type: "xpath",
          label: "XPath (aria-label)"
        });
      }
    }
    if (target.hasAttribute("href")) {
      let href = target.getAttribute("href").trim();
      if (href.length > 0) {
        candidates.push({ 
          selector: `//${tag}[@href=${escapeXPathLiteral(href)}]`,
          type: "xpath",
          label: "XPath (href)"
        });
      }
    }
    if (target.hasAttribute("jsname")) {
      let jsname = target.getAttribute("jsname").trim();
      if (jsname.length > 0) {
        candidates.push({ 
          selector: `//${tag}[@jsname=${escapeXPathLiteral(jsname)}]`,
          type: "xpath",
          label: "XPath (jsname)"
        });
      }
    }

    // Absolute XPath candidate
    let absXPath = getAbsoluteXPath(target);
    if (absXPath) {
      candidates.push({ 
        selector: absXPath,
        type: "xpath",
        label: "Absolute XPath"
      });
    }

    // CSS Selector candidate
    let cssSel = getCssSelector(target);
    if (cssSel) {
      candidates.push({ 
        selector: cssSel,
        type: "css",
        label: "CSS Selector"
      });
    }
    return [...new Set(candidates)];
  }

  // Count how many nodes match a given selector.
  // For XPath candidates, use document.evaluate.
  // For CSS candidates, use document.querySelectorAll.
  function getSelectorCount(candidate) {
    try {
      if (candidate.type === "xpath") {
        let result = document.evaluate(candidate.selector, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return result.snapshotLength;
      } else if (candidate.type === "css") {
        return document.querySelectorAll(candidate.selector).length;
      }
    } catch (e) {
      return 0;
    }
  }

  // When the mouse is over an element, generate candidate selectors and display them
  document.addEventListener("mouseover", function (event) {
    if (!extensionEnabled || freezeTooltip) return;
    let target = event.target;
    let candidates = generateCandidates(target);
    if (candidates.length === 0) return;

    let listHTML = "<ol style='padding-left:20px; margin:0;'>";
    candidates.forEach((cand, index) => {
      let count = getSelectorCount(cand);
      // Candidate number in blue, label in red.
      listHTML += `<li style="cursor:pointer; margin:2px 0;" data-index="${index}">
        <span style="color: #3498db; font-weight: bold;">${index + 1} - </span>
        <span style="color: #e74c3c;">[${cand.label}]</span> ${cand.selector} - count: ${count}
      </li>`;
    });
    listHTML += "</ol>";
    tooltip.innerHTML = listHTML;
    tooltip.style.display = "block";
    tooltip.style.top = event.pageY + 10 + "px";
    tooltip.style.left = event.pageX + 10 + "px";

    // Make each candidate clickable to copy its selector to the clipboard
    let listItems = tooltip.querySelectorAll("li");
    listItems.forEach((item, index) => {
      item.onclick = function (e) {
        e.stopPropagation();
        let cand = candidates[index];
        navigator.clipboard.writeText(cand.selector).then(() => {
          item.innerHTML += " ✅";
          setTimeout(() => {
            item.innerHTML = item.innerHTML.replace(" ✅", "");
          }, 1500);
        });
      };
    });
  });

  // Update tooltip position on mousemove (if not frozen)
  document.addEventListener("mousemove", function (event) {
    if (!extensionEnabled) return;
    if (!freezeTooltip && tooltip.style.display !== "none") {
      tooltip.style.top = event.pageY + 10 + "px";
      tooltip.style.left = event.pageX + 10 + "px";
    }
  });

  // Hide tooltip on mouseout (if not frozen)
  document.addEventListener("mouseout", function () {
    if (!extensionEnabled) return;
    if (!freezeTooltip) {
      tooltip.style.display = "none";
    }
  });

  // Freeze tooltip when Control is pressed; unfreeze and hide when released
  document.addEventListener("keydown", function (e) {
    if (e.key === "Control") {
      freezeTooltip = true;
    }
  });
  document.addEventListener("keyup", function (e) {
    if (e.key === "Control") {
      freezeTooltip = false;
      tooltip.style.display = "none";
    }
  });

  // Listen for messages from the popup to toggle extension functionality (if implemented)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleExtension") {
      extensionEnabled = !extensionEnabled;
      if (!extensionEnabled) {
        tooltip.style.display = "none";
      }
      sendResponse({ enabled: extensionEnabled });
    }
  });

  console.log("XPath Hover Helper Loaded");
});
