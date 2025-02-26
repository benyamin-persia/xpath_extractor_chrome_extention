document.addEventListener("DOMContentLoaded", function () {
  let extensionEnabled = true;
  let freezeTooltip = false;
  let highlightedElement = null;

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
  tooltip.style.pointerEvents = "auto";
  tooltip.style.display = "none";
  tooltip.style.maxWidth = "600px";
  tooltip.style.wordWrap = "break-word";
  document.body.appendChild(tooltip);

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

  function generateCandidates(target) {
    let candidates = [];
    let absXPath = getAbsoluteXPath(target);
    if (absXPath) {
      candidates.push({ selector: absXPath, type: "xpath", label: "Absolute XPath" });
    }
    let cssSel = getCssSelector(target);
    if (cssSel) {
      candidates.push({ selector: cssSel, type: "css", label: "CSS Selector" });
    }
    return [...new Set(candidates)];
  }

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
    } catch (error) {
      console.error("Error highlighting element:", error);
    }
  }

  function removeHighlight() {
    if (highlightedElement) {
      highlightedElement.classList.remove("xpath-blink");
      highlightedElement = null;
    }
  }

  // Inject blinking CSS animations
  let style = document.createElement("style");
  style.innerHTML = `
    @keyframes blink {
      0%, 100% { outline: 3px solid rgba(255, 0, 0, 1); }
      50% { outline: 3px solid rgba(255, 0, 0, 0); }
    }
    .xpath-blink {
      animation: blink 0.8s infinite;
    }
    @keyframes textBlink {
      0%, 100% { color: #f1c40f; text-shadow: 0 0 5px #f1c40f; }
      50% { color: white; text-shadow: none; }
    }
    .tooltip-blink {
      animation: textBlink 0.8s infinite;
    }
  `;
  document.head.appendChild(style);

  document.addEventListener("mouseover", function (event) {
    if (!extensionEnabled || freezeTooltip) return;
    let target = event.target;
    let candidates = generateCandidates(target);
    if (candidates.length === 0) return;

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

    let listItems = tooltip.querySelectorAll(".xpath-item");
    listItems.forEach((item, index) => {
      item.addEventListener("mouseover", () => {
        let selector = item.getAttribute("data-selector");
        let type = item.getAttribute("data-type");

        highlightElement(selector, type);
        item.classList.add("tooltip-blink");
      });

      item.addEventListener("mouseout", () => {
        removeHighlight();
        item.classList.remove("tooltip-blink");
      });

      item.addEventListener("click", function () {
        let selector = item.getAttribute("data-selector");
        navigator.clipboard.writeText(selector).then(() => {
          let parentLi = item.closest("li");
          let tickMark = parentLi.querySelector(".copy-confirmation");
          tickMark.style.display = "inline";
          setTimeout(() => {
            tickMark.style.display = "none";
          }, 1500);
        });
      });
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Control") {
      freezeTooltip = true;
    }
  });

  document.addEventListener("keyup", function (e) {
    if (e.key === "Control") {
      freezeTooltip = false;
      tooltip.style.display = "none";
      removeHighlight();
    }
  });

  document.addEventListener("mousemove", function (event) {
    if (!extensionEnabled) return;
    if (!freezeTooltip && tooltip.style.display !== "none") {
      tooltip.style.top = event.pageY + 10 + "px";
      tooltip.style.left = event.pageX + 10 + "px";
    }
  });

  console.log("XPath Hover Helper Loaded (✅ Fixed Copying)");
});
