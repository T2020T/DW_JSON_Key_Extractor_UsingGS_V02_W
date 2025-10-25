# Data Extractor Pro - Development Roadmap

This document outlines the planned trajectory for the Data Extractor Pro application. It is a living document that will evolve based on user feedback and technological advancements. The roadmap is divided into thematic versions, each focusing on a specific set of enhancements.

---

### **v1.1: Quality of Life & UI Enhancements**

*Focus: Improving the existing user experience with smarter UI features, better feedback, and session convenience.*

#### General UI/UX
-   **Settings Persistence**: Use `localStorage` to remember user preferences across sessions, such as the active tab, sorting options, filter settings (e.g., "Show unique URLs only"), and the state of the regex cheatsheet.
-   **Loading Indicators**: Implement subtle loading indicators or spinners for processing large files to provide feedback and prevent the UI from appearing frozen.
-   **Enhanced Accessibility**: Conduct an accessibility audit (WCAG compliance) to improve ARIA attributes, keyboard navigation, and screen reader support.
-   **Toast Notifications**: Replace simple "Copied!" text changes with more visible toast notifications for actions like copying to the clipboard.

#### JSON Extractor
-   **Input Tree View**: Add an optional, collapsible tree view for the input JSON, allowing users to visually inspect and navigate the data structure more easily.
-   **Value Path Display**: For each extracted value, show its JSON path (e.g., `results[0].user.name`) as a tooltip or an optional column in the output. This provides crucial context, especially when keys are repeated at different nesting levels.
-   **Clearer Key Count**: Differentiate between the total number of unique keys and the number of keys matching the current search filter in the dropdown.

#### URL Extractor
-   **Domain Grouping**: Add an option to group the extracted URLs by their hostname, presenting them in a collapsible/expandable list for better organization.
-   **Exclusion Filtering**: Add an input field for a regex pattern to *exclude* URLs, complementing the existing inclusion filter.

---

### **v2.0: Advanced Extraction & Power-User Features**

*Focus: Expanding the application's capabilities with a new extractor mode and significantly more powerful tools for existing extractors.*

#### New Feature: Generic Regex Extractor
-   **New "Regex Extractor" Tab**: Introduce a third mode dedicated to generic text extraction.
-   **Functionality**: Users will provide input text and a custom regular expression. The tool will extract and list all matches or specific capture groups.
-   **Use Cases**: Ideal for extracting email addresses, phone numbers, specific log patterns, or any custom-defined data format.

#### JSON Extractor Enhancements
-   **JSONPath Support**: Evolve beyond simple key selection by allowing users to query their data using the JSONPath syntax (e.g., `$.store.book[*].author`). This will enable far more complex and targeted data extraction.
-   **Advanced JSON-to-CSV Conversion**: Create a modal or dedicated view for CSV export that allows users to select which nested properties to "flatten" into columns, giving them full control over the output format.

#### URL Extractor Enhancements
-   **URL Status Check (Optional)**: Implement a feature that allows users to (optionally) send a `HEAD` request to each extracted URL to check its HTTP status code (200, 404, etc.) and display a visual indicator next to each link. This will be implemented carefully to manage network requests.
-   **QR Code Generation**: Allow the user to select a single URL from the results list and generate a QR code for it on the fly.

---

### **v2.1: Performance & Data Manipulation**

*Focus: Optimizing the application for very large datasets and introducing on-the-fly data transformation capabilities.*

#### Performance
-   **Web Worker Integration**: Offload heavy, blocking tasks (parsing multi-megabyte JSON files, running complex regex on large text bodies) to a Web Worker. This will ensure the main UI thread remains responsive at all times.
-   **Virtualization for Output**: For results with thousands of entries (e.g., a huge list of URLs), render the output list using virtualization ("windowing") to improve rendering performance and reduce memory usage.

#### Data Tools
-   **New "JSON Diff" Tool**: Add a new utility tab to compare two different JSON objects and visually highlight their differences (added, removed, or changed key/value pairs).
-   **Simple Data Transformation**: Allow users to apply simple, predefined transformations to the extracted values (e.g., `Trim Whitespace`, `To Uppercase`, `To Lowercase`) before export.

---

### **Future Vision: Beyond v2.1**

*Long-term goals that represent the next evolution of the application.*

-   **Plugin Architecture**: Refactor the core logic to support a plugin system where new "extractors" or "formatters" can be added more easily.
-   **Batch Processing**: Support uploading and processing multiple files in a single batch operation, with results either combined or presented separately.
-   **Themes**: Introduce a light theme to complement the existing dark theme.
-   **Internationalization (i18n)**: Add support for multiple languages in the UI.
