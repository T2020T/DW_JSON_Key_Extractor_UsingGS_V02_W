# Data Extractor Pro - Application Architecture

## 1. Introduction

Data Extractor Pro is a versatile, client-side web application designed to perform two primary data extraction tasks:
1.  **JSON Key Extractor**: Parses JSON data and extracts all values associated with a specific key, even from deeply nested structures.
2.  **URL Extractor**: Scans any given text and extracts all contained URLs, providing advanced filtering and sorting capabilities.

The application is built as a Single Page Application (SPA) using React and TypeScript, with a focus on a clean user interface, responsiveness, and robust client-side logic.

## 2. Core Technologies

-   **Frontend Framework**: React 19 (using `useState`, `useEffect`, `useRef`, `useCallback` hooks for state and lifecycle management).
-   **Language**: TypeScript for type safety and improved developer experience.
-   **Styling**: TailwindCSS for a utility-first, responsive, and modern dark-themed UI.
-   **PDF Generation**: jsPDF & jsPDF-AutoTable libraries (loaded via CDN) for client-side PDF creation.
-   **Build/Setup**: The app runs in an environment that supports ES modules directly in the browser, using an `importmap` to manage React dependencies.

## 3. File Structure

```
.
├── components/
│   └── Icons.tsx         # Contains all reusable SVG icon components.
├── docs/
│   ├── APP_ARCHITECTURE.md # This document.
│   └── VERSION_HISTORY.md  # Changelog and feature list per version.
├── App.tsx               # The main application component, containing all logic and UI.
├── index.html            # The entry point of the application. Loads scripts and styles.
├── index.tsx             # Mounts the React application to the DOM.
└── metadata.json         # Application metadata.
```

## 4. Component Breakdown

The application's UI is primarily encapsulated within a few key components:

-   **`App.tsx`**: This is the root and most critical component. It manages:
    -   **Global State**: All application state is managed here using React hooks. This includes the current mode (`json` or `url`), user inputs, extracted data, filter settings, and UI states (e.g., dropdown visibility).
    -   **Business Logic**: Contains all functions for parsing, extracting, filtering, and sorting data for both modes.
    -   **Layout**: Defines the main structure, including the header, tab navigation, and the two-column input/output layout.
    -   **Event Handling**: Manages all user interactions, from typing in text areas to clicking buttons.

-   **`TabButton` (sub-component in `App.tsx`)**: A simple button component for switching between the 'JSON' and 'URL' extractor modes.

-   **`ActionButton` (sub-component in `App.tsx`)**: A reusable button component for the export/action bar (Copy, TXT, CSV, etc.), ensuring a consistent look and feel.

-   **`RegexCheatsheet` (sub-component in `App.tsx`)**: A static informational component that displays a helpful guide for users writing custom regular expressions.

-   **`components/Icons.tsx`**: A library of stateless functional components, each exporting a single SVG icon. This keeps the main `App.tsx` file cleaner and makes icons easy to manage.

## 5. State Management

State is managed entirely within the `App` component using React hooks. There is no external state management library (like Redux or Zustand), as the application's complexity does not necessitate it.

### Key State Variables:

-   `mode: 'json' | 'url'`: Controls which of the two tools is currently active.

#### JSON Extractor State:
-   `jsonInput: string`: The raw JSON string from the user.
-   `parsedJson: any`: The JavaScript object resulting from a successful parse of `jsonInput`.
-   `allKeys: string[]`: A sorted list of all unique keys found in `parsedJson`.
-   `selectedKey: string`: The key the user has chosen from the dropdown.
-   `extractedValues: any[]`: The list of values found for the `selectedKey`.
-   `jsonError: string | null`: Stores any JSON parsing error messages.

#### URL Extractor State:
-   `textInput: string`: The raw text string from the user.
-   `rawUrls: string[]`: The initial list of URLs extracted via regex.
-   `extractedUrls: string[]`: A processed list of URLs after applying uniqueness, file type, and regex filters.
-   `sortedUrls: string[]`: The final, sorted list of URLs displayed to the user.
-   `sortOption: string`: The current sorting method (e.g., 'asc', 'domain').
-   `selectedFileTypes: string[]`: An array of file extensions to filter by.
-   `regexFilter: string`: The custom regex pattern provided by the user.

## 6. Core Logic & Data Flow

### JSON Extractor
1.  **Input**: User pastes JSON or uploads a `.json` file. The `jsonInput` state is updated.
2.  **Parsing (`useEffect` on `jsonInput`)**:
    -   The app attempts `JSON.parse(jsonInput)`.
    -   On success, `parsedJson` is set, `jsonError` is cleared, and the recursive `getAllKeys` function is called to populate `allKeys`.
    -   On failure, `jsonError` is set, and all related states are cleared.
3.  **Key Selection**: User selects a key from the dropdown, updating `selectedKey`.
4.  **Value Extraction (`useEffect` on `selectedKey`)**: The recursive `getValuesForKey` function traverses `parsedJson` to find all values for the `selectedKey`, updating the `extractedValues` state.
5.  **Output**: `extractedValues` are stringified and displayed. The user can then use the action buttons to export this data.

### URL Extractor
The URL extractor uses a reactive data processing pipeline, where changes in one step trigger recalculations in the next.

1.  **Input**: User pastes text or uploads a file, updating `textInput`.
2.  **URL Discovery (`useEffect` on `textInput`)**: A robust regex (`/(?:https?|ftp):\/\/[^\s<>()"]*[^\s<>()".,;:?!']/gi`) runs on `textInput` to find all potential URLs. The result populates the `rawUrls` state.
3.  **Filtering (`useEffect` on `rawUrls`, `showUniqueUrls`, `selectedFileTypes`, `regexFilter`)**:
    -   A new array is created from `rawUrls`.
    -   If `showUniqueUrls` is true, the array is converted to a `Set` and back to an array to remove duplicates.
    -   If `selectedFileTypes` has items, the array is filtered to include only URLs ending in those extensions.
    -   If a valid `regexFilter` exists, the array is filtered against the custom regex.
    -   The result updates the `extractedUrls` state.
4.  **Sorting (`useEffect` on `extractedUrls`, `sortOption`)**:
    -   A copy of `extractedUrls` is sorted based on the current `sortOption`. For complex sorts like 'domain', the `URL` constructor is used to parse the URL parts.
    -   The result updates the `sortedUrls` state.
5.  **Output**: `sortedUrls` are displayed in a list. The user can then use the action buttons to export this data.
