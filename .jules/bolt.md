## 2024-05-15 - React.memo for Panning State in PreviewArea
**Learning:** The `PreviewArea` parent component locally manages high-frequency interaction state like mouse panning and zooming, which continuously updates the React state on every pixel movement. Because `YearGrid` renders 365+ individual DOM elements, passing this un-memoized component down caused severe re-render lag.
**Action:** When a parent container controls interaction transforms (like pan/zoom) via state, always ensure the inner heavy child components (like `YearGrid`) are wrapped in `React.memo()`. This isolates the frequent state changes to just the wrapper's CSS transform, preserving 60fps interactions.

## 2025-03-05 - Avoid new Date() in render loops
**Learning:** `YearGrid` was calling `new Date()` multiple times per day (365+ allocations per render cycle) to get the day of the week. This caused massive garbage collection overhead and jank during high-frequency renders (e.g., when a user drags a settings slider).
**Action:** Replaced repetitive `Date` instantiations with a cached `firstDayOfMonth` calculation and simple modulo math: `(firstDay + day - 1) % 7`. This entirely removed object allocation from the tight inner rendering loops.

## 2024-05-18 - Caching Tight-Loop Opacity Hex Conversions
**Learning:** `YearGrid` was calling `.toString(16).padStart(2, "0")` inside a helper (`getDimmedColor`) used for hundreds of elements per layout frame, causing unnecessary overhead when dragging UI sliders.
**Action:** When a computed layout color value (like opacity hex) is dependent on a single setting and applied across hundreds of DOM nodes, compute it once using `useMemo` and append the static cached string inside the loop.

## 2024-05-18 - Array Mapping Hoisting for Layout Renders
**Learning:** `renderTimeline` in `YearGrid.tsx` created an array of 365 objects via `flatMap` / `Array.from` *inside* the render method, which ran on every style/zoom/setting tweak, leading to pointless garbage generation.
**Action:** Move static data mappings outside the main layout render body using `useMemo` mapped to fundamental dependencies (e.g., `months`).
