# Grok Image Downloader

A Chromium Extension that adds instant download buttons to the Grok image grid. Skip the tedious process of opening every image individually just to save it—download your generations directly from the main view.

## ✨ Features

- **Smart Capture:** Always grabs the latest, highest-resolution version of an image, even if the source updates during generation.
- **Dual Handling:** - Converts **Base64 data** to your preferred quality.
  - Detects **Direct URLs** (CDN links) for instant, lossless saving.
- **Quality Control:** Choose between PNG (Lossless) or JPEG with 4 industry-standard presets:
  - **Lossless Approximation (100%)**
  - **Highest (95%)**
  - **Very High (90%)**
  - **High (80%)**
  - **Medium (75%)**
- **Custom Slider:** Fine-tune JPEG quality from 0-100% with a built-in artifact warning system.
- **OS Integration:** Elegant UI with native Dark/Light mode support.

## 🚀 Installation

1. Download or clone this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. Navigate to `grok.com` and start generating!

## 🛠 How It Works

The extension injects a discreet download button into the Grok image interface. 
- If the image is a **Data URL**, it uses the Canvas API to re-encode the image at your selected quality.
- If the image is a **Blob/External URL**, it fetches the binary data directly to ensure the original file integrity is preserved.

## ⚖️ License
MIT