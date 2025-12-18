# Grok Live Image Downloader

A specialized Chrome Extension designed to capture and download dynamically generated AI images. It solves the problem of "blurry" intermediate generation steps by allowing users to download the final high-resolution state of an image with one click.

## ✨ Features

- **Smart Capture:** Always grabs the latest, highest-resolution version of an image, even if the source updates during generation.
- **Dual Handling:** - Converts **Base64 data** to your preferred quality.
  - Detects **Direct URLs** (CDN links) for instant, lossless saving.
- **Quality Control:** Choose between PNG (Lossless) or JPEG with 4 industry-standard presets:
  - **Maximum (100%)**
  - **Highest (95%)**
  - **Very High (90%)**
  - **High (80%)**
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