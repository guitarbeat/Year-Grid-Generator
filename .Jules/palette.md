## 2024-02-14 - Broken Entry Point and A11y
**Learning:** React applications using Vite may fail to render if index.html lacks the entry script tag, causing a blank screen. This is a critical first check before debugging logic.
**Action:** Always verify index.html includes <script type='module' src='/index.tsx'> (or similar) before verifying functionality.

## 2024-02-15 - Limited Color Input Control
**Learning:** Native `input type="color"` does not allow users to paste or type specific hex codes (e.g., brand colors) easily in all browsers. This limits precision.
**Action:** Always pair `input type="color"` with a synchronized text input for better accessibility and usability.

## 2024-02-19 - Zoom Control Discoverability
**Learning:** Adding keyboard shortcuts (`+`, `-`, `0`) for zooming significantly improves the user experience for power users, especially in canvas-based applications. Pairing these with visible buttons that have `title` attributes explaining the shortcuts makes them discoverable.
**Action:** When implementing zoom controls, always include standard keyboard shortcuts and expose them via tooltips or aria-labels.
