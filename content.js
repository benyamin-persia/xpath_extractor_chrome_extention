document.addEventListener("DOMContentLoaded", function () {
  let extensionEnabled = true;
  let freezeTooltip = false;
  let highlightedElement = null;
  let lastHoveredElement = null;
  let tooltipUpdateScheduled = false;

  // Create tooltip container
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
  
  function escapeXPathLiteral(str) {
    if (str.indexOf("'") === -1) return "'" + str + "'";
    else if (str.indexOf('"') === -1) return '"' + str + '"';
    else {
      const parts = str.split("'");
      return "concat(" + parts.map((part, i) => i > 0 ? `"'${part}'"` : `'${part}'`).join(", \"'\", ") + ")";
    }
  }

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

    // ✅ ADDED: Generate a relative XPath if the element has an `href` attribute
    if (target.hasAttribute("href")) {
      let href = target.getAttribute("href").trim();
      if (href) {
        let safeHref = escapeXPathLiteral(href);
        candidates.push({
          selector: `//${tag}[@href=${safeHref}]`,
          type: "xpath",
          label: "Relative XPath (@href)"
        });
      }
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

  document.addEventListener("mouseover", function (event) {
    if (!extensionEnabled || freezeTooltip) return;
    if (lastHoveredElement === event.target) return;
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
      </li>`;
    });
    listHTML += "</ol>";
    tooltip.innerHTML = listHTML;
    tooltip.style.display = "block";
    tooltip.style.top = event.pageY + 10 + "px";
    tooltip.style.left = event.pageX + 10 + "px";
  });

  document.addEventListener("mousemove", function (event) {
    if (!extensionEnabled) return;
    if (!tooltipUpdateScheduled) {
      tooltipUpdateScheduled = true;
      requestAnimationFrame(() => {
        tooltip.style.top = event.pageY + 10 + "px";
        tooltip.style.left = event.pageX + 10 + "px";
        tooltipUpdateScheduled = false;
      });
    }
  });

  document.addEventListener("mouseout", function () {
    if (!extensionEnabled || freezeTooltip) return;
    tooltip.style.display = "none";
    lastHoveredElement = null;
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
    }
  });

  console.log("XPath Hover Helper Loaded");
});
