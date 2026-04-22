## 2024-04-22 - Icon Button Accessibility

**Learning:** Raw icon elements (like `<span className="material-symbols-outlined">`) are read aloud by screen readers as literal strings (e.g. "add" or "menu") unless explicitly hidden. Additionally, icon-only buttons lack accessible names without `aria-label` or `title` props. The dark theme of this app also causes default browser outlines to be less visible.

**Action:** Custom button components (`Button`, `IconButton`) must explicitly accept and pass down `aria-label` and `title` attributes. Raw icon elements inside these buttons require `aria-hidden="true"` to prevent screen readers from reading raw icon names. Interactive elements must also have `focus-visible` styles (`focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none`).
