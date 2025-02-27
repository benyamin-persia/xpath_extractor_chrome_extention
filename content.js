document.addEventListener("DOMContentLoaded", function () {
  // Initialization variables exactly as you had them
  let extensionEnabled = true;
  let freezeTooltip = false;
  let highlightedElement = null;
  let lastHoveredElement = null;
  let tooltipUpdateScheduled = false; // To throttle mousemove updates

  // Create tooltip container (exact block you provided)
  const tooltip = document.createElement("div");
  tooltip.id = "xpath-tooltip";
  tooltip.style.position = "absolute";
  tooltip.style.background = "rgba(0, 0, 0, 0.9)";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "8px";
  tooltip.style.borderRadius = "5px";
  tooltip.style.fontSize = "12px";
  tooltip.style.fontFamily = "Arial, sans-serif";
  tooltip.style.zIndex = "9999";
  tooltip.style.pointerEvents = "auto";
  tooltip.style.display = "none";
  tooltip.style.maxWidth = "600px";
  tooltip.style.wordWrap = "break-word";
  document.body.appendChild(tooltip);

  // --- Helper Functions ---

  // Escape string for XPath literal
  function escapeXPathLiteral(str) {
    if (str.indexOf("'") === -1) return "'" + str + "'";
    else if (str.indexOf('"') === -1) return '"' + str + '"';
    else {
      const parts = str.split("'");
      return "concat(" + parts.map((part, i) => i > 0 ? `"'${part}'"` : `'${part}'`).join(", \"'\", ") + ")";
    }
  }

  // Get absolute XPath for an element
  function getAbsoluteXPath(element) {
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

  // Get a CSS selector for an element
  function getCssSelector(element) {
    if (element.id) return `#${element.id}`;
    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.className) {
        let classes = element.className.toString().trim().split(/\s+/);
        if (classes.length) selector += "." + classes.join(".");
      }
      let sibling = element;
      let nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() === element.nodeName.toLowerCase()) nth++;
      }
      if (nth !== 1) selector += `:nth-of-type(${nth})`;
      path.unshift(selector);
      element = element.parentNode;
    }
    return path.join(" > ");
  }

  // Generate candidate selectors (Relative XPath variations, Absolute XPath, CSS Selector)
  function generateCandidates(target) {
    let candidates = [];
    let tag = target.tagName.toLowerCase();
    let className = target.className ? target.className.trim() : "";
    let text = target.textContent ? target.textContent.trim() : "";
    if (className && text) {
      let safeClass = escapeXPathLiteral(className);
      let safeText = escapeXPathLiteral(text);
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass}) and contains(text(), ${safeText})]`, 
        type: "xpath", 
        label: "Relative XPath (contains)" 
      });
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass}) and normalize-space(text())=${safeText}]`, 
        type: "xpath", 
        label: "Relative XPath (normalize-space)" 
      });
      candidates.push({ 
        selector: `//${tag}[contains(@class, ${safeClass}) and starts-with(text(), ${safeText})]`, 
        type: "xpath", 
        label: "Relative XPath (starts-with)" 
      });
    }
    let absXPath = getAbsoluteXPath(target);
    if (absXPath) {
      candidates.push({ selector: absXPath, type: "xpath", label: "Absolute XPath" });
    }
    let cssSel = getCssSelector(target);
    if (cssSel) {
      candidates.push({ selector: cssSel, type: "css", label: "CSS Selector" });
    }
    return candidates;
  }

  // Get count of matching elements for a candidate selector
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

  // Highlight the element on the page corresponding to a candidate selector
  function highlightElement(selector, type) {
    removeHighlight();
    try {
      let element;
      if (type === "xpath") {
        let result = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        element = result.singleNodeValue;
      } else if (type === "css") {
        element = document.querySelector(selector);
      }
      if (element) {
        highlightedElement = element;
        element.classList.add("xpath-blink");
      }
    } catch (err) {
      console.error("highlightElement error:", err);
    }
  }

  // Remove highlighting from the element
  function removeHighlight() {
    if (highlightedElement) {
      highlightedElement.classList.remove("xpath-blink");
      highlightedElement = null;
    }
  }

  // Insert CSS for blinking effects (both for the element and tooltip text)
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes blink { 
      0%, 100% { outline: 3px solid rgba(255,0,0,1); } 
      50% { outline: 3px solid rgba(255,0,0,0); } 
    }
    .xpath-blink { animation: blink 0.8s infinite; }
    @keyframes textBlink { 
      0%, 100% { color: #f1c40f; text-shadow: 0 0 5px #f1c40f; } 
      50% { color: white; text-shadow: none; } 
    }
    .tooltip-blink { animation: textBlink 0.8s infinite; }
  `;
  document.head.appendChild(style);

  // Handle mouseover to show the tooltip with candidate selectors
  document.addEventListener("mouseover", function (event) {
    if (!extensionEnabled || freezeTooltip) return;
    if (lastHoveredElement === event.target) return; // avoid duplicate processing
    lastHoveredElement = event.target;
    const target = event.target;
    const candidates = generateCandidates(target);
    if (!candidates.length) return;
    let listHTML = "<ol style='padding-left:20px; margin:0;'>";
    candidates.forEach((cand, index) => {
      let count = getSelectorCount(cand);
      listHTML += `<li style="cursor:pointer; margin:2px 0;" data-index="${index}">
        <span style="color: #3498db; font-weight: bold;">${index + 1} - </span>
        <span style="color: #e74c3c;">[${cand.label}]</span> 
        <span class="xpath-item" data-selector="${cand.selector}" data-type="${cand.type}">
          ${cand.selector}
        </span> - 
        <span style="color: #2ecc71; font-weight: bold;">count: ${count}</span>
        <span class="copy-confirmation" style="display:none; color:#2ecc71;"> ✅</span>
      </li>`;
    });
    listHTML += "</ol>";
    tooltip.innerHTML = listHTML;
    tooltip.style.display = "block";
    tooltip.style.top = event.pageY + 10 + "px";
    tooltip.style.left = event.pageX + 10 + "px";

    // Attach event listeners to each tooltip item
    const listItems = tooltip.querySelectorAll(".xpath-item");
    listItems.forEach((item) => {
      item.addEventListener("mouseover", () => {
        const selector = item.getAttribute("data-selector");
        const type = item.getAttribute("data-type");
        highlightElement(selector, type);
        item.classList.add("tooltip-blink");
      });
      item.addEventListener("mouseout", () => {
        removeHighlight();
        item.classList.remove("tooltip-blink");
      });
      item.addEventListener("click", function () {
        navigator.clipboard.writeText(item.getAttribute("data-selector")).then(() => {
          let parentLi = item.closest("li");
          let confirmMark = parentLi.querySelector(".copy-confirmation");
          if (confirmMark) {
            confirmMark.style.display = "inline";
            setTimeout(() => {
              confirmMark.style.display = "none";
            }, 1500);
          }
        });
      });
    });
  });

  // Throttle tooltip position updates using requestAnimationFrame
  document.addEventListener("mousemove", function (event) {
    if (!extensionEnabled) return;
    if (freezeTooltip || tooltip.style.display === "none") return;
    if (!tooltipUpdateScheduled) {
      tooltipUpdateScheduled = true;
      requestAnimationFrame(() => {
        tooltip.style.top = event.pageY + 10 + "px";
        tooltip.style.left = event.pageX + 10 + "px";
        tooltipUpdateScheduled = false;
      });
    }
  });

  // Hide tooltip on mouseout (if not frozen)
  document.addEventListener("mouseout", function () {
    if (!extensionEnabled || freezeTooltip) return;
    tooltip.style.display = "none";
    removeHighlight();
    lastHoveredElement = null;
  });

  // Control key handling: freeze/unfreeze tooltip
  document.addEventListener("keydown", function (e) {
    if (e.key === "Control") {
      freezeTooltip = true;
      console.log("Control key pressed, freezing tooltip.");
    }
  });
  document.addEventListener("keyup", function (e) {
    if (e.key === "Control") {
      freezeTooltip = false;
      tooltip.style.display = "none";
      removeHighlight();
      console.log("Control key released, unfreezing tooltip.");
    }
  });

  console.log("XPath Hover Helper Loaded");
});
