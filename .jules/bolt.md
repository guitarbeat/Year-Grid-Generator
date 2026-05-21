## 2025-03-01 - Missing Memoization during rapid updates
**Learning:** `YearGrid` was not wrapped in `React.memo()`, causing expensive re-renders across hundreds of day cells during rapid `PreviewArea` pan/zoom updates. Also `handleCellClick` in `App.tsx` lacked `useCallback`, breaking potential memoization down the tree.
**Action:** Always wrap heavy data-viz components like `YearGrid` in `React.memo()` when their parent handles rapid state updates (like dragging/panning), and ensure callback props like `onCellClick` passed down to them use `useCallback` to maintain stable references.
