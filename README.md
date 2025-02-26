# XPath Hover Helper

XPath Hover Helper is a Chrome extension designed for QA testers and developers. It dynamically generates multiple candidate selectors (both XPath and CSS) for any visible element on a webpage. The extension displays these candidates in an interactive tooltip along with the count of matching elements for each selector. This makes it easy to identify a unique locator for your automated tests or debugging needs.

---

## Features

- **Dynamic Selector Generation:**  
  Generates multiple candidate selectors based on the element's tag, class, text, and common attributes such as id, title, aria-label, href, and jsname.

- **Multiple XPath Variations:**  
  Provides relative XPath variations using functions like:
  - `contains(text(), ...)`
  - `normalize-space(text())`
  - `starts-with(text(), ...)`
  - `substring()`
  - `substring-before()`
  - `substring-after()`
  - `[last()]`

- **Absolute XPath & CSS Selector:**  
  In addition to relative XPath expressions, it also generates an absolute XPath and a CSS selector.

- **Match Count Display:**  
  For each candidate selector, the extension displays the number of elements on the page that match that selector.

- **Interactive Tooltip:**  
  When you hover over any visible element, an ordered list of candidate selectors appears near your mouse pointer. Each candidate is numbered and labeled (e.g., "Relative XPath (contains text)", "Absolute XPath", "CSS Selector").

- **Clipboard Copy:**  
  Click on any candidate in the tooltip to copy its selector to the clipboard.

- **Freeze Functionality:**  
  Hold the **Control** key to freeze the tooltip, allowing you time to click on a candidate without it disappearing.

---

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/xpath-hover-helper.git
   ```

2. **Load the Extension in Chrome:**
   - Open Chrome and go to: `chrome://extensions/`
   - Enable **Developer mode** (toggle in the top right corner).
   - Click **Load unpacked** and select the repository folder.

3. The extension will now be installed and active.

---

## Usage

1. **Hover** over any visible element on a webpage.
2. An interactive tooltip will appear near your mouse pointer, showing an ordered list of candidate selectors along with the count of matching elements.
3. Each candidate is prefixed with its number and a label describing its type (e.g., Relative XPath, Absolute XPath, CSS Selector).
4. **Click** on any candidate to copy its selector to your clipboard.
5. To freeze the tooltip for easier interaction, **hold down the Control key** while moving your mouse.

---

## Files

- **manifest.json:**  
  The manifest file for Chrome Extension (Manifest V3).

- **content.js:**  
  The main content script that generates and displays candidate selectors.

- **popup.html & popup.js:**  
  Files for the extension's popup (optional toggle functionality).

- **styles.css:**  
  Optional CSS styling for the extension.

---

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any enhancements, bug fixes, or additional features.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Disclaimer

This extension is provided "as-is" without any warranty. Use it at your own risk.

---

Happy testing!
