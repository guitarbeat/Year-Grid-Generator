## 2025-03-04 - State Sync Thrashing
**Learning:** Rapid, frequent URL state and LocalStorage synchronization via `window.history.replaceState` (e.g. from UI sliders) severely blocks the main thread and causes UI lag because these are synchronous, heavy operations.
**Action:** Always wrap `replaceState` and `localStorage.setItem` in a debounced `setTimeout` (e.g. 300ms delay) when listening to rapid user input to prevent history rate limits and UI freezing.
