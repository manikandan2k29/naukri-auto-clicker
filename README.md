# 🚀 Naukri Auto Share Interest Clicker

A modern, light-weight Chrome Extension (Manifest V3) that automatically clicks the **"Share Interest"** buttons on Naukri job postings with human-like timing, realistic cursor positioning, and dynamic scrolling to bypass automated bot detection.

---

## ✨ Features

- **🛡️ Human-like Click Simulation**: Dispatches full synthetic pointer & mouse event lifecycles (`pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click`) with randomized pixel offsets (`x ± 4px`, `y ± 4px`).
- **⏱️ Variable Speed Profiles**:
  - **Safe (Recommended)**: `1.5s – 3.0s` delay for maximum stealth.
  - **Medium**: `0.8s – 1.5s` delay for standard speed.
  - **Fast**: `0.4s – 0.8s` delay for rapid clicking.
- **📜 Infinite Scroll & Auto-Load**: Automatically scrolls the page down when no visible unclicked buttons remain to trigger Naukri's lazy-loading for new job tuples.
- **🚫 Duplicate Click Prevention**: Tracks and marks processed job cards via custom DOM attributes so no button is ever clicked twice.
- **📊 Live Statistics**: Displays live counter of total interests shared during the active session.
- **💾 State Persistence**: Remembers running state, speed preferences, and click stats across popup sessions using Chrome's `storage.local` API.
- **🛑 Safeguard Auto-Stop**: Automatically pauses execution if no new roles are discovered after 5 consecutive scroll attempts.

---

## 📁 Project Structure

```text
naukri-auto-clicker/
├── manifest.json      # Extension manifest (MV3)
├── content.js         # Main DOM interaction & human-like automation engine
├── popup.html         # Modern dark-theme popup dashboard
├── popup.js           # UI state management & message listener logic
└── README.md          # Documentation
```

---

## 📦 Installation Instructions

Since this is an unpacked extension, you can install it on Chrome, Brave, Edge, or any Chromium-based browser:

1. **Clone or Download** this repository to your local machine:
   ```bash
   git clone https://github.com/manikandan2k29/naukri-auto-clicker.git
   ```
2. Open your browser and navigate to the Extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Brave**: `brave://extensions/`
   - **Edge**: `edge://extensions/`
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select the `naukri-auto-clicker` directory.

---

## 🎮 How to Use

1. Open [Naukri.com](https://www.naukri.com) and navigate to a job search or "Similar Early Access Roles" section.
2. Click the **Naukri Auto Clicker** extension icon in your browser toolbar.
3. Select your desired speed profile: **Fast**, **Med**, or **Safe**.
4. Click **▶ Start Auto Clicker**.
5. To pause or end the automation, click **■ Stop**.
6. Use **Reset count** to clear your session count anytime.

---

## 🛠️ Technology Stack

- **Manifest V3** standard
- **Vanilla JavaScript (ES6+)**
- **Chrome Extension Storage & Messaging APIs**
- Modern CSS variables with dark glassmorphism styling

---

## ⚖️ Disclaimer

This tool is created strictly for educational purposes and productivity automation. Please use responsibly and adhere to the platform's terms of service.
