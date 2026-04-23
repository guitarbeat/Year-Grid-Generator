## 2024-05-15 - [Screen Reader Visibility of Icon Spans]
**Learning:** [Raw icon elements (e.g. `<span className="material-symbols-outlined">`) can be confusingly read by screen readers if not hidden. Custom `Button` components must accept `aria-label` to provide context for icon-only buttons.]
**Action:** [Always ensure that raw icons get `aria-hidden="true"` and explicitly pass `aria-label` and `title` to custom button abstractions.]
