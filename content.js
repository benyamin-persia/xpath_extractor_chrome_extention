// document.addEventListener("DOMContentLoaded", function () {
//     // Create tooltip container
//     let tooltip = document.createElement("div");
//     tooltip.id = "xpath-tooltip";
//     tooltip.style.position = "absolute";
//     tooltip.style.background = "rgba(0, 0, 0, 0.9)";
//     tooltip.style.color = "#fff";
//     tooltip.style.padding = "8px";
//     tooltip.style.borderRadius = "5px";
//     tooltip.style.fontSize = "12px";
//     tooltip.style.fontFamily = "Arial, sans-serif";
//     tooltip.style.zIndex = "9999";
//     // Enable pointer events so the copy button is clickable
//     tooltip.style.pointerEvents = "auto";
//     tooltip.style.display = "none";
//     tooltip.style.maxWidth = "400px";
//     tooltip.style.wordWrap = "break-word";
//     // Flex layout for horizontal alignment
//     tooltip.style.display = "flex";
//     tooltip.style.alignItems = "center";
//     tooltip.style.gap = "8px";
//     document.body.appendChild(tooltip);
  
//     // Create span to show the XPath text
//     let xpathText = document.createElement("span");
//     xpathText.id = "xpath-text";
//     xpathText.style.maxWidth = "350px";
//     xpathText.style.overflow = "hidden";
//     xpathText.style.whiteSpace = "nowrap";
//     xpathText.style.textOverflow = "ellipsis";
//     tooltip.appendChild(xpathText);
  
//     // Create the copy button
//     let copyButton = document.createElement("button");
//     copyButton.id = "copy-xpath-button";
//     copyButton.innerText = "📋";
//     copyButton.style.background = "#007bff";
//     copyButton.style.color = "white";
//     copyButton.style.border = "none";
//     copyButton.style.padding = "3px 6px";
//     copyButton.style.borderRadius = "3px";
//     copyButton.style.cursor = "pointer";
//     copyButton.style.pointerEvents = "all"; // make clickable
//     copyButton.style.fontSize = "14px";
//     copyButton.onmouseover = () => (copyButton.style.background = "#0056b3");
//     tooltip.appendChild(copyButton);
  
//     // Flag to indicate if we should freeze the tooltip (when Control is held)
//     let freezeTooltip = false;
//     let currentXPath = "";
  
//     // When the Control key is pressed, freeze the tooltip
//     document.addEventListener("keydown", function (e) {
//       if (e.key === "Control") {
//         freezeTooltip = true;
//       }
//     });
//     // When Control is released, unfreeze and hide the tooltip
//     document.addEventListener("keyup", function (e) {
//       if (e.key === "Control") {
//         freezeTooltip = false;
//         tooltip.style.display = "none";
//       }
//     });
  
//     // On mouseover, update and show the tooltip if not frozen
//     document.addEventListener("mouseover", function (event) {
//       if (freezeTooltip) return; // do not update if frozen
//       let target = event.target;
//       let className = target.className ? target.className.trim() : "";
//       let text = target.textContent ? target.textContent.trim() : "";
//       if (className || text) {
//         let xpath = `//${target.tagName.toLowerCase()}[contains(@class, '${className}') and contains(text(), '${text}')]`;
//         currentXPath = xpath;
//         xpathText.innerText = xpath;
//         tooltip.style.display = "block";
//         tooltip.style.top = event.pageY + 10 + "px";
//         tooltip.style.left = event.pageX + 10 + "px";
//         // Set the copy button handler
//         copyButton.onclick = function () {
//           navigator.clipboard.writeText(currentXPath).then(() => {
//             copyButton.innerText = "✅";
//             setTimeout(() => {
//               copyButton.innerText = "📋";
//             }, 1500);
//           });
//         };
//       }
//     });
  
//     // Also update the tooltip's position on mousemove if not frozen
//     document.addEventListener("mousemove", function (event) {
//       if (!freezeTooltip && tooltip.style.display === "block") {
//         tooltip.style.top = event.pageY + 10 + "px";
//         tooltip.style.left = event.pageX + 10 + "px";
//       }
//     });
  
//     // Hide the tooltip on mouseout if not frozen
//     document.addEventListener("mouseout", function () {
//       if (!freezeTooltip) {
//         tooltip.style.display = "none";
//       }
//     });
  
//     console.log("XPath Hover Helper Loaded");
//   });
  



// document.addEventListener("DOMContentLoaded", function () {
//     // Global flag for enabling/disabling the extension
//     let extensionEnabled = true;
  
//     // Create tooltip container
//     let tooltip = document.createElement("div");
//     tooltip.id = "xpath-tooltip";
//     tooltip.style.position = "absolute";
//     tooltip.style.background = "rgba(0, 0, 0, 0.9)";
//     tooltip.style.color = "#fff";
//     tooltip.style.padding = "8px";
//     tooltip.style.borderRadius = "5px";
//     tooltip.style.fontSize = "12px";
//     tooltip.style.fontFamily = "Arial, sans-serif";
//     tooltip.style.zIndex = "9999";
//     // Enable pointer events so buttons are clickable
//     tooltip.style.pointerEvents = "auto";
//     tooltip.style.display = "none";
//     tooltip.style.maxWidth = "400px";
//     tooltip.style.wordWrap = "break-word";
//     // Flex layout for horizontal alignment
//     tooltip.style.display = "flex";
//     tooltip.style.alignItems = "center";
//     tooltip.style.gap = "8px";
//     document.body.appendChild(tooltip);
  
//     // Create span to display the XPath text
//     let xpathText = document.createElement("span");
//     xpathText.id = "xpath-text";
//     xpathText.style.maxWidth = "350px";
//     xpathText.style.overflow = "hidden";
//     xpathText.style.whiteSpace = "nowrap";
//     xpathText.style.textOverflow = "ellipsis";
//     tooltip.appendChild(xpathText);
  
//     // Create a button to copy the raw XPath
//     let copyButton = document.createElement("button");
//     copyButton.id = "copy-xpath-button";
//     copyButton.innerText = "📋";
//     copyButton.style.background = "#007bff";
//     copyButton.style.color = "white";
//     copyButton.style.border = "none";
//     copyButton.style.padding = "3px 6px";
//     copyButton.style.borderRadius = "3px";
//     copyButton.style.cursor = "pointer";
//     copyButton.style.pointerEvents = "all";
//     copyButton.style.fontSize = "14px";
//     copyButton.onmouseover = () => (copyButton.style.background = "#0056b3");
//     tooltip.appendChild(copyButton);
  
//     // Create a button to copy the Python snippet
//     let copyPythonButton = document.createElement("button");
//     copyPythonButton.id = "copy-python-button";
//     copyPythonButton.innerText = "Py";
//     copyPythonButton.style.background = "#28a745";
//     copyPythonButton.style.color = "white";
//     copyPythonButton.style.border = "none";
//     copyPythonButton.style.padding = "3px 6px";
//     copyPythonButton.style.borderRadius = "3px";
//     copyPythonButton.style.cursor = "pointer";
//     copyPythonButton.style.pointerEvents = "all";
//     copyPythonButton.style.fontSize = "14px";
//     copyPythonButton.onmouseover = () => (copyPythonButton.style.background = "#218838");
//     tooltip.appendChild(copyPythonButton);
  
//     // Function to generate a Python Selenium snippet based on the element type
//     function generatePythonSnippet(xpath, tagName) {
//       if (tagName.toUpperCase() === "TD") {
//         return `xpath_expr = "${xpath}"\nelement = driver.find_element(By.XPATH, xpath_expr)\nprint(element.text)`;
//       } else {
//         return `xpath_expr = "${xpath}"\nelement = driver.find_element(By.XPATH, xpath_expr)\nelement.click()`;
//       }
//     }
  
//     let currentXPath = "";
//     let currentTagName = "";
//     let freezeTooltip = false; // Freeze tooltip when Control is held
  
//     // Listen for messages from the popup to toggle extension functionality
//     chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//       if (message.action === "toggleExtension") {
//         extensionEnabled = !extensionEnabled;
//         if (!extensionEnabled) {
//           tooltip.style.display = "none";
//         }
//         sendResponse({ enabled: extensionEnabled });
//       }
//     });
  
//     // Freeze tooltip on Control keydown; unfreeze on keyup
//     document.addEventListener("keydown", function (e) {
//       if (e.key === "Control") {
//         freezeTooltip = true;
//       }
//     });
//     document.addEventListener("keyup", function (e) {
//       if (e.key === "Control") {
//         freezeTooltip = false;
//         tooltip.style.display = "none";
//       }
//     });
  
//     // Helper function to safely retrieve an element's class string
//     function getSafeClassName(target) {
//       let className = "";
//       if (target.className) {
//         if (typeof target.className === "string") {
//           className = target.className.trim();
//         } else if (target.className.baseVal && typeof target.className.baseVal === "string") {
//           // For SVG elements
//           className = target.className.baseVal.trim();
//         }
//       }
//       return className;
//     }
  
//     // Helper function to safely retrieve an element's text content
//     function getSafeText(target) {
//       let text = "";
//       if (target.textContent && typeof target.textContent === "string") {
//         text = target.textContent.trim();
//       }
//       return text;
//     }
  
//     // Update tooltip on mouseover (if enabled)
//     document.addEventListener("mouseover", function (event) {
//       if (!extensionEnabled) return;
//       if (freezeTooltip) return;
//       let target = event.target;
//       currentTagName = target.tagName;
//       let className = getSafeClassName(target);
//       let text = getSafeText(target);
  
//       // Only generate XPath if there is at least class or text
//       if (className || text) {
//         let xpath = `//${target.tagName.toLowerCase()}[contains(@class, '${className}') and contains(text(), '${text}')]`;
//         currentXPath = xpath;
//         xpathText.innerText = xpath;
//         tooltip.style.display = "flex";
//         tooltip.style.top = event.pageY + 10 + "px";
//         tooltip.style.left = event.pageX + 10 + "px";
  
//         copyButton.onclick = function () {
//           navigator.clipboard.writeText(currentXPath).then(() => {
//             copyButton.innerText = "✅";
//             setTimeout(() => {
//               copyButton.innerText = "📋";
//             }, 1500);
//           });
//         };
  
//         copyPythonButton.onclick = function () {
//           let snippet = generatePythonSnippet(currentXPath, currentTagName);
//           navigator.clipboard.writeText(snippet).then(() => {
//             copyPythonButton.innerText = "✅";
//             setTimeout(() => {
//               copyPythonButton.innerText = "Py";
//             }, 1500);
//           });
//         };
//       }
//     });
  
//     // Update tooltip position on mousemove (if not frozen)
//     document.addEventListener("mousemove", function (event) {
//       if (!extensionEnabled) return;
//       if (!freezeTooltip && tooltip.style.display === "flex") {
//         tooltip.style.top = event.pageY + 10 + "px";
//         tooltip.style.left = event.pageX + 10 + "px";
//       }
//     });
  
//     // Hide tooltip on mouseout (if not frozen)
//     document.addEventListener("mouseout", function () {
//       if (!extensionEnabled) return;
//       if (!freezeTooltip) {
//         tooltip.style.display = "none";
//       }
//     });
  
//     console.log("XPath Hover Helper Loaded");
//   });
  












// document.addEventListener("DOMContentLoaded", function () {
//     // Global flag for enabling/disabling the extension (toggled via popup)
//     let extensionEnabled = true;
//     // Flag to "freeze" the tooltip when the Control key is held down
//     let freezeTooltip = false;
  
//     // Create the tooltip container
//     let tooltip = document.createElement("div");
//     tooltip.id = "xpath-tooltip";
//     tooltip.style.position = "absolute";
//     tooltip.style.background = "rgba(0, 0, 0, 0.9)";
//     tooltip.style.color = "#fff";
//     tooltip.style.padding = "8px";
//     tooltip.style.borderRadius = "5px";
//     tooltip.style.fontSize = "12px";
//     tooltip.style.fontFamily = "Arial, sans-serif";
//     tooltip.style.zIndex = "9999";
//     tooltip.style.pointerEvents = "auto"; // Make sure it's clickable
//     tooltip.style.display = "none";
//     tooltip.style.maxWidth = "600px"; // Wider for list display
//     tooltip.style.wordWrap = "break-word";
//     document.body.appendChild(tooltip);
  
//     // Helper functions to safely get class and text
//     function getSafeClassName(target) {
//       let className = "";
//       if (target.className) {
//         if (typeof target.className === "string") {
//           className = target.className.trim();
//         } else if (target.className.baseVal) {
//           // For SVG elements
//           className = target.className.baseVal.trim();
//         }
//       }
//       return className;
//     }
//     function getSafeText(target) {
//       let text = "";
//       if (target.textContent && typeof target.textContent === "string") {
//         text = target.textContent.trim();
//       }
//       return text;
//     }
  
//     // Generate candidate XPath expressions for the given element
//     function generateCandidates(target) {
//       let candidates = [];
//       let tag = target.tagName.toLowerCase();
//       let className = getSafeClassName(target);
//       let text = getSafeText(target);
  
//       // Candidate 1: tag, class and text (if text exists)
//       if (text.length > 0 && className.length > 0) {
//         candidates.push(`//${tag}[contains(@class, '${className}') and contains(text(), '${text}')]`);
//       }
//       // Candidate 2: tag and class only
//       if (className.length > 0) {
//         candidates.push(`//${tag}[contains(@class, '${className}')]`);
//       }
//       // Candidate 3: if element has an href attribute
//       if (target.hasAttribute("href")) {
//         let href = target.getAttribute("href").trim();
//         if (href.length > 0) {
//           candidates.push(`//${tag}[@href='${href}']`);
//         }
//       }
//       // Candidate 4: if element has a jsname attribute
//       if (target.hasAttribute("jsname")) {
//         let jsname = target.getAttribute("jsname").trim();
//         if (jsname.length > 0) {
//           candidates.push(`//${tag}[@jsname='${jsname}']`);
//         }
//       }
//       return [...new Set(candidates)];
//     }
  
//     // Count how many nodes match a given XPath in the document
//     function getXPathCount(xpath) {
//       let result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
//       return result.snapshotLength;
//     }
  
//     // Freeze tooltip when Control is pressed; unfreeze and hide on release
//     document.addEventListener("keydown", function (e) {
//       if (e.key === "Control") {
//         freezeTooltip = true;
//       }
//     });
//     document.addEventListener("keyup", function (e) {
//       if (e.key === "Control") {
//         freezeTooltip = false;
//         tooltip.style.display = "none";
//       }
//     });
  
//     // Listen for messages from the popup to toggle the extension (if implemented)
//     chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//       if (message.action === "toggleExtension") {
//         extensionEnabled = !extensionEnabled;
//         if (!extensionEnabled) {
//           tooltip.style.display = "none";
//         }
//         sendResponse({ enabled: extensionEnabled });
//       }
//     });
  
//     // On mouseover, generate candidate XPath options and display them
//     document.addEventListener("mouseover", function (event) {
//       if (!extensionEnabled || freezeTooltip) return;
//       let target = event.target;
//       let candidates = generateCandidates(target);
//       if (candidates.length === 0) return;
  
//       // Build an ordered list of candidate XPaths with counts
//       let listHTML = "<ol style='padding-left:20px; margin:0;'>";
//       candidates.forEach((candidate, index) => {
//         let count = getXPathCount(candidate);
//         listHTML += `<li style="cursor:pointer; margin:2px 0;" data-index="${index}">${candidate} - count: ${count}</li>`;
//       });
//       listHTML += "</ol>";
//       tooltip.innerHTML = listHTML;
//       tooltip.style.display = "block";
//       tooltip.style.top = event.pageY + 10 + "px";
//       tooltip.style.left = event.pageX + 10 + "px";
  
//       // Add click event to each list item: clicking copies the candidate XPath
//       let listItems = tooltip.querySelectorAll("li");
//       listItems.forEach((item, index) => {
//         item.onclick = function (e) {
//           e.stopPropagation();
//           let candidate = candidates[index];
//           navigator.clipboard.writeText(candidate).then(() => {
//             item.innerHTML += " ✅";
//             setTimeout(() => {
//               item.innerHTML = item.innerHTML.replace(" ✅", "");
//             }, 1500);
//           });
//         };
//       });
//     });
  
//     // Update tooltip position on mousemove (if not frozen)
//     document.addEventListener("mousemove", function (event) {
//       if (!extensionEnabled) return;
//       if (!freezeTooltip && tooltip.style.display !== "none") {
//         tooltip.style.top = event.pageY + 10 + "px";
//         tooltip.style.left = event.pageX + 10 + "px";
//       }
//     });
  
//     // Hide tooltip on mouseout (if not frozen)
//     document.addEventListener("mouseout", function () {
//       if (!extensionEnabled) return;
//       if (!freezeTooltip) {
//         tooltip.style.display = "none";
//       }
//     });
  
//     console.log("XPath Hover Helper Loaded");
//   });
  



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
    tooltip.style.pointerEvents = "auto"; // Make sure it's clickable
    tooltip.style.display = "none";
    tooltip.style.maxWidth = "600px"; // Wider for list display
    tooltip.style.wordWrap = "break-word";
    document.body.appendChild(tooltip);
  
    // Helper functions to safely get class and text
    function getSafeClassName(target) {
      let className = "";
      if (target.className) {
        if (typeof target.className === "string") {
          className = target.className.trim();
        } else if (target.className.baseVal) {
          // For SVG elements ...
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
    // If the string contains only one type of quote, it wraps it.
    // If it contains both, it uses concat() to combine parts.
    function escapeXPathLiteral(str) {
      if (str.indexOf("'") === -1) {
        return "'" + str + "'";
      } else if (str.indexOf('"') === -1) {
        return '"' + str + '"';
      } else {
        // Split the string at every occurrence of a single quote
        const parts = str.split("'");
        const result = parts
          .map((part, i) => {
            // For parts after the first, add the literal single quote
            return (i > 0 ? ',"\'",' : "") + "'" + part + "'";
          })
          .join("");
        return "concat(" + result + ")";
      }
    }
  
    // Generate candidate XPath expressions for the given element.
    // We'll limit the text part to 50 characters to avoid overly long strings.
    function generateCandidates(target) {
      let candidates = [];
      let tag = target.tagName.toLowerCase();
      let className = getSafeClassName(target);
      let text = getSafeText(target);
      // Limit text length to 50 characters to keep the XPath reasonable
      if (text.length > 50) {
        text = text.substring(0, 50);
      }
      // Escape text and class values
      let safeClass = className.length > 0 ? escapeXPathLiteral(className) : "";
      let safeText = text.length > 0 ? escapeXPathLiteral(text) : "";
  
      // Candidate 1: tag, class and text (if text exists and class exists)
      if (text.length > 0 && className.length > 0) {
        candidates.push(`//${tag}[contains(@class, ${safeClass}) and contains(text(), ${safeText})]`);
      }
      // Candidate 2: tag and class only
      if (className.length > 0) {
        candidates.push(`//${tag}[contains(@class, ${safeClass})]`);
      }
      // Candidate 3: if element has an href attribute
      if (target.hasAttribute("href")) {
        let href = target.getAttribute("href").trim();
        if (href.length > 0) {
          candidates.push(`//${tag}[@href=${escapeXPathLiteral(href)}]`);
        }
      }
      // Candidate 4: if element has a jsname attribute
      if (target.hasAttribute("jsname")) {
        let jsname = target.getAttribute("jsname").trim();
        if (jsname.length > 0) {
          candidates.push(`//${tag}[@jsname=${escapeXPathLiteral(jsname)}]`);
        }
      }
      return [...new Set(candidates)]; // Remove duplicates
    }
  
    // Count how many nodes match a given XPath in the document
    function getXPathCount(xpath) {
      try {
        let result = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        return result.snapshotLength;
      } catch (e) {
        return 0;
      }
    }
  
    // On mouseover, generate candidate XPath options and display them in an ordered list
    document.addEventListener("mouseover", function (event) {
      if (!extensionEnabled || freezeTooltip) return;
      let target = event.target;
      let candidates = generateCandidates(target);
      if (candidates.length === 0) return;
  
      // Build an ordered list of candidate XPaths with counts
      let listHTML = "<ol style='padding-left:20px; margin:0;'>";
      candidates.forEach((candidate, index) => {
        let count = getXPathCount(candidate);
        listHTML += `<li style="cursor:pointer; margin:2px 0;" data-index="${index}">${candidate} - count: ${count}</li>`;
      });
      listHTML += "</ol>";
      tooltip.innerHTML = listHTML;
      tooltip.style.display = "block";
      tooltip.style.top = event.pageY + 10 + "px";
      tooltip.style.left = event.pageX + 10 + "px";
  
      // Add click event to each list item to copy the candidate XPath to the clipboard
      let listItems = tooltip.querySelectorAll("li");
      listItems.forEach((item, index) => {
        item.onclick = function (e) {
          e.stopPropagation();
          let candidate = candidates[index];
          navigator.clipboard.writeText(candidate).then(() => {
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
  
    // Freeze tooltip on Control keydown; unfreeze on keyup
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
  
    // Listen for messages from the popup to toggle extension functionality (if needed)
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
  