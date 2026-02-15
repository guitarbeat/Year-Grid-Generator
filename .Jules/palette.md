## 2024-02-14 - Broken Entry Point and A11y
**Learning:** React applications using Vite may fail to render if index.html lacks the entry script tag, causing a blank screen. This is a critical first check before debugging logic.
**Action:** Always verify index.html includes <script type='module' src='/index.tsx'> (or similar) before verifying functionality.

## 2024-02-15 - Limited Color Input Control
**Learning:** Native `input type="color"` does not allow users to paste or type specific hex codes (e.g., brand colors) easily in all browsers. This limits precision.
**Action:** Always pair `input type="color"` with a synchronized text input for better accessibility and usability.
