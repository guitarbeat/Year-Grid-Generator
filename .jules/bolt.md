## 2024-05-15 - React.memo for Panning State in PreviewArea
**Learning:** The `PreviewArea` parent component locally manages high-frequency interaction state like mouse panning and zooming, which continuously updates the React state on every pixel movement. Because `YearGrid` renders 365+ individual DOM elements, passing this un-memoized component down caused severe re-render lag.
**Action:** When a parent container controls interaction transforms (like pan/zoom) via state, always ensure the inner heavy child components (like `YearGrid`) are wrapped in `React.memo()`. This isolates the frequent state changes to just the wrapper's CSS transform, preserving 60fps interactions.

## 2025-03-05 - Avoid new Date() in render loops
**Learning:** `YearGrid` was calling `new Date()` multiple times per day (365+ allocations per render cycle) to get the day of the week. This caused massive garbage collection overhead and jank during high-frequency renders (e.g., when a user drags a settings slider).
**Action:** Replaced repetitive `Date` instantiations with a cached `firstDayOfMonth` calculation and simple modulo math: `(firstDay + day - 1) % 7`. This entirely removed object allocation from the tight inner rendering loops.

## 2025-03-05 - Avoid expensive flat maps in component render methods
**Learning:** `YearGrid` was dynamically computing flattened lists (`allDays` mapping out 365+ items and `allWeeks` reducing 52+ items via `months.flatMap` / `.forEach`) directly inside render helper functions (`renderTimeline` and `renderFlatWeeks`). Even when wrapped in `React.memo`, these heavy array manipulations trigger every time props changed.
**Action:** Always extract static data transformations that derive from other memoized data into their own `useMemo` hooks. This ensures array mappings are only recalculated when their specific dependencies actually change.
