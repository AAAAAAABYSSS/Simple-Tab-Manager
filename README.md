# Simple Tab Manager

[![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-blue?logo=google-chrome&logoColor=white)](https://www.google.com/chrome/)
[![JS](https://img.shields.io/badge/Code-JavaScript-yellow?logo=javascript&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML](https://img.shields.io/badge/Markup-HTML5-orange?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/Style-CSS3-blue?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A lightweight and customizable Chrome extension for organizing, saving, and restoring your tabs through category-based management.

## Table of Contents

- [Simple Tab Manager](#simple-tab-manager)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Technologies Used](#technologies-used)
  - [Roadmap](#roadmap)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- Save current tab into categorized groups
- Create custom categories with icons and colors
- Star (pin) important tabs for priority display
- Collapse or expand categories for focused viewing
- Import tabs from Chrome Bookmarks
- Import/Export tab data in JSON format
- Dark mode toggle
- English and Chinese language toggle
- Set default category for one-click saving

## Getting Started

### Prerequisites

- Google Chrome browser

### Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:AAAAAAABYSSS/Simple-Tab-Manager.git
   ```

2. Navigate to `chrome://extensions/` in Chrome.

3. Enable **Developer Mode** (top right).

4. Click **"Load unpacked"** and select the `Simple-Tab-Manager` directory.

## Usage

- Open the extension from the toolbar.
- Add categories via **New Category**.
- Save the current tab using **Save Tab**.
- Customize a category with **Style** (choose icon and color).
- Star tabs to pin them at the top.
- Use the arrow icon next to category name to expand/collapse.
- Click **Import Bookmarks** to load from Chrome’s bookmarks.
- Import/Export JSON for backup and sharing.

## Technologies Used

- **JavaScript** – Vanilla JS, no frameworks
- **HTML5 / CSS3** – Structured UI with dark/light themes
- **Chrome Extension APIs**:
  - `chrome.storage.local`
  - `chrome.bookmarks`
  - `chrome.tabs`

## Roadmap

- [x] Style editor (icon and color)
- [x] Import/Export as JSON
- [x] Bookmark importer
- [x] Dark/light theme toggle
- [x] Multilingual support
- [x] Collapsible categories
- [x] Default category setting
- [ ] Sync via `chrome.storage.sync`
- [ ] Search keyword highlighting
- [ ] Keyboard shortcuts


## Contributing

Contributions are welcome! Please fork the repository and submit a pull request. For major changes, consider opening an issue first to discuss the proposed changes.


## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

