# Data Extractor Pro - Version History

This document serves as a README and changelog for the application, outlining features introduced in each version.

---

### **Version 1.0.0**

*Release Date: September 2024*

This is the initial public release of the Data Extractor Pro tool, establishing the core functionality and user interface.

#### Key Features:

**1. Dual-Mode Functionality**
-   A unified interface houses two powerful, distinct tools accessible via a clean tabbed navigation:
    -   JSON Key Extractor
    -   URL Extractor

**2. JSON Key Extractor**
-   **Flexible Input**: Accepts JSON data via direct text area input or `.json` file upload.
-   **Real-time Validation**: Instantly parses and validates JSON as you type, providing clear error feedback for invalid syntax.
-   **Comprehensive Key Discovery**: Recursively scans the entire JSON object, including nested objects and arrays, to find and list every unique key.
-   **Dynamic Key Filtering**: A search bar allows for instant filtering of the discovered keys, making it easy to find the desired key in large JSON files.
-   **Value Extraction**: Extracts all values corresponding to the selected key from anywhere in the structure.
-   **Formatted Output**: Displays the extracted values in a clean, formatted, and scrollable preview area.
-   **Multiple Export Options**:
    -   Copy results to clipboard.
    -   Download as a `.txt` file.
    -   Download as a `.csv` file.
    -   Download as a `.pdf` document.
    -   Send to a printer-friendly view.

**3. URL Extractor**
-   **Versatile Input**: Accepts any block of text from a text area or file upload, not restricted to any specific file type.
-   **Robust URL Detection**: Uses a fine-tuned regular expression to accurately find and extract URLs from unstructured text.
-   **Advanced Filtering Suite**:
    -   **Uniqueness Toggle**: Easily switch between viewing all found URLs or only unique entries.
    -   **File Type Filter**: A categorized, multi-select dropdown allows filtering URLs by common file extensions (Images, Documents, Audio, etc.).
    -   **Custom Regex Filter**: An input for advanced users to filter the results using their own regular expression patterns, complete with an in-app cheatsheet.
-   **Advanced Sorting Options**:
    -   Sort URLs alphabetically (Ascending/Descending).
    -   Sort by domain name.
    -   Sort by protocol (http, https).
    -   Sort by file extension.
-   **Multiple Export Options**:
    -   Copy the list of URLs to the clipboard.
    -   Download as a `.txt` file.
    -   Download as a `.csv` file.
    -   Download as a `.pdf` document with a clean table layout.
    -   Send to a printer-friendly view.

**4. User Interface & Experience (UI/UX)**
-   **Modern Design**: A sleek, dark-themed UI built with TailwindCSS.
-   **Fully Responsive**: The layout adapts seamlessly from large desktop monitors to mobile devices.
-   **Intuitive Layout**: A clear two-column design separates input controls from output results.
-   **User Feedback**: Provides instant feedback for actions like copying to the clipboard, invalid inputs, and empty states.
