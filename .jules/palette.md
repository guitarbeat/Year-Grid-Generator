## 2024-11-20 - Ensure Raw Material Icons Are Hidden From Screen Readers
**Learning:** Using raw text elements to display Material Icons (e.g., `<span className="material-symbols-outlined">menu</span>`) can cause screen readers to read the literal string (e.g., "menu") aloud to users instead of identifying it as a UI icon.
**Action:** Always add `aria-hidden="true"` to icon display elements to ensure they are ignored by assistive technologies, relying on `aria-label` or `title` on parent interactive elements instead for accessible naming.
