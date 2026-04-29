## 2024-05-15 - Icon Button Accessibility
**Learning:** Raw icon elements (like `<span className="material-symbols-outlined">`) placed inside `<button>` elements must have `aria-hidden="true"` so screen readers don't read out the raw ligature text (e.g. "close" or "menu"), and the button itself must accept and explicitly pass an `aria-label` attribute. Also, because the CDN Tailwind resets browser outlines, `focus-visible` classes must explicitly be added (`focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none`) to ensure keyboard navigability on dark backgrounds.
**Action:** When adding or updating custom button components that accept icons, ensure they have explicit properties for `aria-label` or `title` that pass through to the button element, wrap the icon in `aria-hidden`, and provide visible focus rings.

## 2026-04-29 - Focus States for Custom Inputs
**Learning:** When styling custom representations of hidden native inputs (like sr-only checkboxes), you must use the Tailwind `peer` class on the native input and `peer-focus-visible` on the custom visual elements to ensure keyboard focus states are preserved and visually distinct.
**Action:** Use the `peer` pattern whenever creating custom UI controls that hide the native input element.
