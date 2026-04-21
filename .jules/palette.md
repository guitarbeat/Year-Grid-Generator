## 2024-04-18 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found a widespread pattern across components (`PreviewArea.tsx`, `Sidebar.tsx`, `Controls.tsx`) where icon-only buttons (using Material Symbols) lack accessible names. Screen readers would read the raw icon name (e.g., "menu", "close", "today") instead of the button's action, or have no meaningful label at all.
**Action:** Always ensure custom button components (`Button`, `IconButton`) accept and pass down `aria-label` props, and add `aria-hidden="true"` to raw icon elements.
