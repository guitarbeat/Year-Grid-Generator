## 2024-05-24 - Avoid Date Allocations in Render Loops
**Learning:** Frequent React re-renders combined with `new Date()` allocations inside loops (e.g., rendering thousands of grid cells) cause massive garbage collection pauses and frame drops.
**Action:** Pre-calculate `Date` requirements (like first day of the month) in a `useMemo` block, and use basic arithmetic (e.g., `(firstDay + day - 1) % 7`) for deriving date properties like `dayOfWeek` within render loops.

## 2024-05-24 - Pre-calculate Expensive Flat Structures
**Learning:** Array manipulation methods like `flatMap` to produce un-nested versions of prop arrays cause object recreation on every render, defeating React.memo downstream.
**Action:** Use `useMemo` specifically on flat arrays based on data source updates, protecting against re-evaluation on pure style updates (like gap or font size).
