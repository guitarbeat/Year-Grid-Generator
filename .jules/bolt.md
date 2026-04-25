## 2024-05-15 - React.memo for Panning State in PreviewArea
**Learning:** The `PreviewArea` parent component locally manages high-frequency interaction state like mouse panning and zooming, which continuously updates the React state on every pixel movement. Because `YearGrid` renders 365+ individual DOM elements, passing this un-memoized component down caused severe re-render lag.
**Action:** When a parent container controls interaction transforms (like pan/zoom) via state, always ensure the inner heavy child components (like `YearGrid`) are wrapped in `React.memo()`. This isolates the frequent state changes to just the wrapper's CSS transform, preserving 60fps interactions.

## 2026-04-25 - CSS Transitions on High-Frequency State
**Learning:** Applying CSS transitions (e.g., `transition-transform`) to elements whose transform properties are updated continuously (like mouse panning mapped to state) causes the browser to incorrectly try interpolating between frames, leading to severe visual lag and "floaty" controls.
**Action:** Always conditionally disable CSS transitions on interaction layers while the interaction (like dragging/panning) is active to ensure 1:1 hardware tracking.
