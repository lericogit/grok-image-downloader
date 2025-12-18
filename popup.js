const FORMAT_KEY = 'dl_format';
const QUALITY_KEY = 'dl_quality';
const DEFAULT_QUALITY = 0.95; // Default to 95% (Grok Default)

document.addEventListener('DOMContentLoaded', () => {
    const formatSelect = document.getElementById('format-select');
    const qualitySettings = document.getElementById('quality-settings');
    const presetSelect = document.getElementById('quality-preset-select');
    const rangeInput = document.getElementById('quality-range');
    const valueSpan = document.getElementById('quality-value');
    const qualityWarning = document.getElementById('quality-warning');
    const saveStatus = document.getElementById('save-status');

    // 1. Load Saved Settings
    chrome.storage.local.get([FORMAT_KEY, QUALITY_KEY], (data) => {
        const format = data[FORMAT_KEY] || 'jpeg'; 
        const quality = data[QUALITY_KEY] || DEFAULT_QUALITY;

        formatSelect.value = format;
        
        const qualityPercent = Math.round(quality * 100);
        rangeInput.value = qualityPercent;
        
        updateQualityDisplay(qualityPercent);
        toggleQualitySettings(format);
        checkQualityWarning(qualityPercent);
        
        // Select preset if the loaded quality matches one, otherwise set to 'custom'
        syncPresetToSlider(quality);
    });

    // 2. Event Listeners

    // A. Format Selector (PNG/JPEG)
    formatSelect.addEventListener('change', (e) => {
        const newFormat = e.target.value;
        toggleQualitySettings(newFormat);
        saveSetting(FORMAT_KEY, newFormat);
    });

    // B. Preset Selector
    presetSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value === 'custom') return; // Do nothing if 'Custom' is selected
        
        const newQuality = parseFloat(value);
        const newQualityPercent = Math.round(newQuality * 100);

        // Update slider visually
        rangeInput.value = newQualityPercent;
        
        updateQualityDisplay(newQualityPercent);
        checkQualityWarning(newQualityPercent);
        saveSetting(QUALITY_KEY, newQuality);
    });

    // C. Custom Slider (Input = fires continuously while dragging)
    rangeInput.addEventListener('input', (e) => {
        const percentage = parseInt(e.target.value);
        updateQualityDisplay(percentage);
        checkQualityWarning(percentage);
        
        // --- KEY SYNCHRONIZATION FIX ---
        // Change the dropdown to "Custom" as soon as the slider is touched
        presetSelect.value = 'custom'; 
    });
    
    // D. Custom Slider (Change = fires when mouse button is released)
    rangeInput.addEventListener('change', (e) => {
        const newQuality = parseInt(e.target.value) / 100.0;
        saveSetting(QUALITY_KEY, newQuality);
    });


    // 3. Helper Functions
    
    function toggleQualitySettings(format) {
        if (format === 'jpeg') {
            qualitySettings.classList.remove('hidden');
        } else {
            qualitySettings.classList.add('hidden');
        }
    }

    function updateQualityDisplay(percentage) {
        valueSpan.textContent = percentage;
    }
    
    function checkQualityWarning(percentage) {
        // Show warning if quality is 75% or lower
        if (percentage < 75) {
            qualityWarning.classList.remove('hidden');
        } else {
            qualityWarning.classList.add('hidden');
        }
    }

    function syncPresetToSlider(quality) {
        // Format the quality to two decimal places for comparison with preset values
        const formattedQuality = quality.toFixed(2);
        
        // Find if any preset matches the loaded quality value
        let presetFound = false;
        Array.from(presetSelect.options).forEach(option => {
            if (option.value === formattedQuality) {
                presetSelect.value = option.value;
                presetFound = true;
            }
        });
        
        // If no preset matches (it's a custom value), select the 'Custom' option
        if (!presetFound) {
             presetSelect.value = 'custom'; 
        }
    }

    function saveSetting(key, value) {
        chrome.storage.local.set({ [key]: value }, () => {
            saveStatus.textContent = 'Settings Saved!';
            saveStatus.style.visibility = 'visible';
            setTimeout(() => {
                saveStatus.style.visibility = 'hidden';
            }, 3000);
        });
    }
});