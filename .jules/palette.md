## 2024-04-20 - Adding ARIA attributes to generic reusable icon buttons
**Learning:** Found that custom wrapper button components (e.g. `Button`, `IconButton`) were dropping ARIA attributes completely and `material-symbols-outlined` spans were readable by screen readers as plain text ligature names.
**Action:** Updated wrapper components to explicitly accept and forward `aria-label` down to the native HTML button, and added `aria-hidden="true"` to raw icon spans to maintain clean accessibility trees.
