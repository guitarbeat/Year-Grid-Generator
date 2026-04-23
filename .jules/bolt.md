## 2024-05-15 - React.memo for Panning State in PreviewArea
**Learning:** The `PreviewArea` parent component locally manages high-frequency interaction state like mouse panning and zooming, which continuously updates the React state on every pixel movement. Because `YearGrid` renders 365+ individual DOM elements, passing this un-memoized component down caused severe re-render lag.
**Action:** When a parent container controls interaction transforms (like pan/zoom) via state, always ensure the inner heavy child components (like `YearGrid`) are wrapped in `React.memo()`. This isolates the frequent state changes to just the wrapper's CSS transform, preserving 60fps interactions.

## 2024-05-16 - O(N) Date allocations in render loop
**Learning:** Instantiating `new Date(year, month, day)` inside tight rendering loops (like generating 365 day cells) to simply calculate the day of the week causes noticeable garbage collection overhead and drops frames, particularly when parents trigger re-renders. Modulo arithmetic `(firstDayOfMonth + day - 1) % 7` is O(1) and orders of magnitude faster.
**Action:** When calculating derived calendar values (like day of the week) inside loops, calculate the `firstDayOfMonth` once outside the loop and use basic modulo arithmetic instead of allocating new `Date` objects per iteration.
