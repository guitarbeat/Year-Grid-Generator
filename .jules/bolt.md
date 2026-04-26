## 2024-05-15 - React.memo for Panning State in PreviewArea
**Learning:** The `PreviewArea` parent component locally manages high-frequency interaction state like mouse panning and zooming, which continuously updates the React state on every pixel movement. Because `YearGrid` renders 365+ individual DOM elements, passing this un-memoized component down caused severe re-render lag.
**Action:** When a parent container controls interaction transforms (like pan/zoom) via state, always ensure the inner heavy child components (like `YearGrid`) are wrapped in `React.memo()`. This isolates the frequent state changes to just the wrapper's CSS transform, preserving 60fps interactions.

## 2025-03-05 - Avoid new Date() in render loops
**Learning:** `YearGrid` was calling `new Date()` multiple times per day (365+ allocations per render cycle) to get the day of the week. This caused massive garbage collection overhead and jank during high-frequency renders (e.g., when a user drags a settings slider).
**Action:** Replaced repetitive `Date` instantiations with a cached `firstDayOfMonth` calculation and simple modulo math: `(firstDay + day - 1) % 7`. This entirely removed object allocation from the tight inner rendering loops.
## 2025-03-05 - Avoid using useMemo for trivial arithmetic
**Learning:** Using `useMemo` for simple arithmetic calculations (like multiplying and adding a few integers: `currentYear * 10000 + currentMonth * 100 + currentDay`) actually degrades performance because the overhead of setting up the hook, checking dependencies, and closure allocation far exceeds the CPU cost of the math itself.
**Action:** Do not use `useMemo` for simple inline math calculations; instead, compute them as regular inline variables or hoist them out of expensive loops as standard variables in the component render block.

## 2025-03-05 - Never nest hooks in helper functions
**Learning:** React rules dictate that hooks (like `useMemo`) must be called at the top-level of a function component or custom hook. Calling `useMemo` inside a nested helper function (like `renderTimeline` within `YearGrid`) will trigger fatal ESLint `react-hooks/rules-of-hooks` errors and result in a build failure or runtime crash.
**Action:** When memoizing values created inside helper functions, hoist the logic and the `useMemo` call up to the main component's top level, ensuring they appear before the helper function that consumes them.
