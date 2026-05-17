## 2025-03-04 - State Sync Thrashing
**Learning:** Rapid, frequent URL state and LocalStorage synchronization via `window.history.replaceState` (e.g. from UI sliders) severely blocks the main thread and causes UI lag because these are synchronous, heavy operations.
**Action:** Always wrap `replaceState` and `localStorage.setItem` in a debounced `setTimeout` (e.g. 300ms delay) when listening to rapid user input to prevent history rate limits and UI freezing.
## 2026-05-17 - Callback Reference Stability
**Learning:** Passing unstable function references (like inline functions or unmemoized arrow functions) to deeply nested child components breaks `React.memo` optimizations, causing expensive re-renders across the component tree.
**Action:** When passing functions (like `handleCellClick` or `onToggleSidebar`) from top-level components to memoized child components, ensure they are wrapped in `React.useCallback` to maintain referential stability.
