## 2025-03-04 - State Sync Thrashing
**Learning:** Rapid, frequent URL state and LocalStorage synchronization via `window.history.replaceState` (e.g. from UI sliders) severely blocks the main thread and causes UI lag because these are synchronous, heavy operations.
**Action:** Always wrap `replaceState` and `localStorage.setItem` in a debounced `setTimeout` (e.g. 300ms delay) when listening to rapid user input to prevent history rate limits and UI freezing.
## 2026-05-19 - Framer Motion Layout Bottleneck
**Learning:** Using the `layout` prop on hundreds of individual `motion.div` elements (like in a Year Grid with 365+ cells) causes massive rendering bottlenecks because Framer Motion recalculates the layout for every single element on re-render.
**Action:** Remove the `layout` prop from static child elements in large grids to drastically improve rendering and interaction performance.
## 2026-05-19 - React.memo on Grid Components
**Learning:** Large grid components (like `YearGrid`) must be explicitly memoized with `React.memo`, and callback props (like `handleCellClick`) must be wrapped in `React.useCallback` in the parent component. Otherwise, any state change in the parent (e.g. toggling a sidebar, zooming) will force all 365+ grid cells to re-render.
**Action:** Always verify memoization boundaries for complex grid/list components to prevent cascading re-renders.
