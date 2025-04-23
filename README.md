# Simple Tab Manager

[![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-blue?logo=google-chrome&logoColor=white)](https://www.google.com/chrome/)
[![JS](https://img.shields.io/badge/Code-JavaScript-yellow?logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML](https://img.shields.io/badge/Markup-HTML5-orange?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/Style-CSS3-blue?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A minimal, customizable Chrome extension for managing and saving browser tabs in categorized collections.
> Authors: Yelle

## Features

- **Save Current Tab** to categorized collections
- **Create Custom Categories** (with icons & colors)
- **Star Important Tabs** for pinning them to the top
- **Collapse / Expand Categories** to focus on relevant groups
- **Import Bookmarks** from Chrome's default bookmarks
- **Export / Import Tabs as JSON** for backup and restore
- **Dark Mode** support
- **Multi-language** (English and Chinese toggle)
- **Set Default Category** for quick saves

---

## Installation

1. Clone the repository:

```bash
git clone git@github.com:AAAAAAABYSSS/Simple-Tab-Manager.git
```

2. Open Chrome and navigate to:

```
chrome://extensions/
```

3. Enable **Developer Mode**

4. Click **"Load unpacked"** and select the `Simple-Tab-Manager` directory

---

## Usage

- Click the extension icon to open the popup interface.
- Create a new category using **New Category**.
- Click **Save Tab** to store the current page into the selected category.
- Click **Style** to choose a color and icon for the category.
- Click the star button to **pin** important tabs to the top.
- Use the **collapse/expand arrow** to toggle category visibility.
- Use **Import Bookmarks** or **Import JSON** to load saved content.
- Export all saved tabs with **Export All Tabs**.

---

## Technologies

- Plain JavaScript (no frameworks)
- Chrome Extension APIs:
  - `chrome.storage.local`
  - `chrome.bookmarks`
  - `chrome.tabs`
- CSS for dark mode and layout

---

## Roadmap

- [x] Style editor (icon & color)
- [x] JSON import/export
- [x] Bookmark import
- [x] Multilingual support
- [x] Dark mode toggle
- [ ] Sync with `chrome.storage.sync`
- [ ] Keyboard shortcuts
- [ ] Search highlighting

---

## Contributing

Feel free to open issues or submit PRs. For major changes, open a discussion first.

---

## License

MIT License.
