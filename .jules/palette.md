
## 2024-05-18 - Icon Button Accessibility
**Learning:** Raw material-symbols-outlined icons inside interactive elements without explicit hidden attributes are sometimes announced by screen readers as literal text (e.g., "close"), which causes double-reading when a properly structured `aria-label` is also present. Additionally, purely visual icons can cause confusing behavior if they lack `aria-hidden="true"`.
**Action:** When creating custom `<button>` wrappers or using generic `IconButton` components, always ensure the parent `<button>` provides an explicit `aria-label` AND the nested `<span className="material-symbols-outlined">` contains `aria-hidden="true"`. Also include `title` attributes for discoverability on hover for sighted users.
