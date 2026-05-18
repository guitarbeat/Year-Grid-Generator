## 2025-03-04 - State Sync Thrashing
**Learning:** Rapid, frequent URL state and LocalStorage synchronization via `window.history.replaceState` (e.g. from UI sliders) severely blocks the main thread and causes UI lag because these are synchronous, heavy operations.
**Action:** Always wrap `replaceState` and `localStorage.setItem` in a debounced `setTimeout` (e.g. 300ms delay) when listening to rapid user input to prevent history rate limits and UI freezing.

## 2026-05-18 - React.memo Component Wrapping & Props Stability
**Learning:** When using `React.memo()` to optimize high-volume rendering components (like the grid rendering hundreds of child cells), it is critical to also memoize any callback props passed down to it from parent components. Without wrapping props like `handleCellClick` in `React.useCallback`, the parent passing down a new function reference on every re-render will completely defeat the `React.memo` wrapper on the child, causing it to unnecessarily re-render.
**Action:** When applying `React.memo()` to optimize a component, always verify the stability of the props being passed into it, particularly functions/callbacks and complex objects. Use `React.useCallback` or `React.useMemo` in the parent component to guarantee prop stability across re-renders unless the props inherently depend on rapidly changing state.
