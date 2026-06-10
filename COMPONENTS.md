# Design System Style Guide & Reusable Components Reference

This document serves as the master guide, design manual, and documentation library for creating, styling, and integrating reusable React UI components across our application.

It is structured into two parts:
1. **The Component Documentation Template**: A structured markdown pattern that all developers must copy and utilize when introducing new controls to the codebase.
2. **Interactive Component Catalog**: Comprehensive, production-grade documentation for the core interactive controls active in `/components/ui/Controls.tsx` (`Button`, `Modal / Dialog Panel`, `Combobox`, `ControlGroup`, `TactileSlider`, `DualMonthRangeSlider`, `SegmentedControl`, and `Toggle`).

---

## Part 1: Component Documentation Guide

All reusable components introduced to `/components/ui/` must have a corresponding entry or dedicated documentation outline matching the structure below. Ensure no sections are left blank or filled with generic placeholders.

```markdown
# [Component Name]

A brief, single-sentence summary of what the component is and the core problem it solves.

## 1. Purpose & Design Intent
Describe *why* the component exists and *when* to use it versus layout alternatives.
- **When to use**: Action triggers, modular overlays, or complex searchable selections.
- **When to avoid**: Alternatives to consider for denser tabular layout structures.
- **Visual Personality**: Details on theme consistency, padding ratios, border-radius relationships (`outerRadius = innerRadius + padding`), interactive tap scaling, and display typography rules.

## 2. API Signature & Props Reference
Provide a concrete TypeScript interface definition followed by a clean, scannable Markdown table of all properties.

### TypeScript Definition
\`\`\`typescript
interface [ComponentName]Props {
  // Definition here...
}
\`\`\`

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `className` | `string` | Optional / `""` | Custom Tailwind classes to inject into the outermost component element. |

## 3. Usage Examples
Provide copy-pasteable, production-ready TSX codebase examples.

### A. Minimal / Standard Implementation
A simple layout matching default props or typical layout constraints.
\`\`\`tsx
// Minimal snippet here...
\`\`\`

### B. Advanced / Customized State Handler
A rich custom scenario showcasing state tracking, callback triggers, or animated wrappers.
\`\`\`tsx
// Advanced snippet here...
\`\`\`

## 4. Accessibility & Interactive Feel (a11y)
Guidelines explaining how the component conforms to design engineering details and accessible behaviors.
- **Feedback & Tactility**: Explicit active press-scale settings (e.g., scale-on-press to exactly `0.96` with `transition-transform`).
- **Touch Targets**: Guaranteeing safe boundaries (minimum `44x44px` cursor / finger area).
- **Keyboard Navigation**: Focus indicators (`focus-visible:ring-2`), escape keys (`Esc`), and ARIA assertions (`role="..."`).
- **Typography & Font Treatment**: Use of `-webkit-font-smoothing: antialiased` and `tabular-nums` for timers and numbers.

## 5. Edge Cases & Error States
Descriptions of how the component fails elegantly or behaves under stress.
- **Layout Overflows**: Grid constraints, viewport clipping, truncation, and viewport safety.
- **Null / Undefined States**: Handlers for empty arrays or loading states.
- **Input Spams / Debouncing**: Throttling clicks, drags, or sliding changes.
```

---

## Part 2: Live Component Catalog

This section documents the live design tokens and interactive React components built in static files like `/components/ui/Controls.tsx`.

---

# Button

An exquisitely crafted, high-performance button control supporting full tactile interaction feedback, diverse display variants, and integrated typography guidelines.

## 1. Purpose & Design Intent
The `Button` acts as the primary vehicle for trigger actions, downloads, and layout adjustments throughout the application. Designed with:
- **Tactile Feedback**: Animates with a custom CSS/motion tap scale down to exactly `0.96`, delivering an immediate tactile response upon clicking.
- **Concentric Layout Rhyme**: Employs corner profiles (`rounded-xl`) to scale concentrically with our custom container card wrappers.
- **Variant Typometry**: Uses tracking-wider uppercase letters (`tracking-wider text-[10px] md:text-[11px] font-mono font-bold`) to reinforce hierarchical dashboard elements.

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'action';
  icon?: string; // Material symbols identifier string
  label?: string; // Display text inside button
  className?: string; // Tailored Tailwind utility overrides
  disabled?: boolean; // Interaction blocker flag
  title?: string; // Native browser hover tooltip text
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `onClick` | `(e) => void` | **Required** | The action callback fired when the user selects or taps the button. |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'action'` | Optional / `'primary'` | Defines the visual look, state density, and surrounding accent borders. |
| `icon` | `string` | Optional / `undefined` | String identifier representing the Material icon to display alongside text labels. |
| `label` | `string` | Optional / `undefined` | Simple text layout string encapsulated inside the button. |
| `className` | `string` | Optional / `""` | Tailored Tailwind utility classes to override margins, borders, or sizing. |
| `disabled` | `boolean` | Optional / `false` | When true, renders an opacity-faded, non-interactive visual state disabling clicks. |
| `title` | `string` | Optional / `undefined` | Metadata hover string shown as a native browser tooltip. |

---

## 3. Usage Examples

### A. Minimal Primary Action Trigger
A basic download or layout trigger button utilizing standard styles:

```tsx
import React from 'react';
import { Button } from '../../components/ui/Controls';

export const SyncTrigger = () => {
  const handleSync = () => {
    console.log("Synchronizing year-grid coordinates...");
  };

  return (
    <Button
      variant="primary"
      label="Sync Calendar"
      onClick={handleSync}
    />
  );
};
```

### B. Action Grid with Tooltips and Custom Icons
Using multiple variants and styling overrides for advanced panels:

```tsx
import React from 'react';
import { Button } from '../../components/ui/Controls';

export const LayoutToolbar = () => {
  return (
    <div className="flex gap-3 bg-zinc-950 p-4 border border-white/5 rounded-2xl items-center">
      {/* Ghost Variant with Left Icon */}
      <Button
        variant="ghost"
        icon="settings"
        label="Preferences"
        onClick={() => console.log("Open options")}
      />

      {/* Compact Action Variant (Square Icon Layout) */}
      <Button
        variant="action"
        icon="download"
        title="Download Layout as PNG"
        onClick={() => console.log("Init render exporter")}
      />

      {/* Accent Filled Primary Button */}
      <Button
        variant="primary"
        label="Accept Overwrite"
        onClick={() => console.log("Save complete")}
        className="ml-auto bg-accent hover:bg-accent/90"
      />
    </div>
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Scale-on-Press Interaction**: When clicked or tapped, the button responds with an active scaling transition `active:scale-[0.96]`. This provides tactile confirmation while staying within safe limits (never drops below `0.95` to avoid cartoonish distortion).
- **Touch Target Density**: Standard heights match comfortable human digits. Primary buttons use deep vertical pad values ensuring a touch bounds of `≥ 44px` vertically. Action variant squares run at precisely `w-11 h-11` (exactly `44 × 44` pixels) for mobile ease.
- **Color Contrast Guidelines**: Variant states enforce high-contrast values (white text overlying custom saturation, or neon orange offsets on black backgrounds). Hover transitions dynamically raise borders from `border-white/5` to `border-accent/30` or opacity shifts to avoid visual numbness.
- **Focus Outlines**: Styled focus state ensures outline indicators match layout containers whenever tab controls target interactive DOM coordinates.

---

## 5. Edge Cases & Error States

- **Label Over-length / Truncation**: When text values exceed boundary containers, internal elements enforce a clean truncation pattern: `truncate z-10`.
- **Spam Action Debouncing**: Fast user double-taps are managed at the trigger callback layer or handled of the `disabled` property. When disabled, standard click events are prevented instantly using native button rules to prevent duplicative submission logs.

---

# Modal / Dialog Panel

A modular, overlay-ready layout system designed for settings, details overview, or interactive milestone generation. Supports full-screen screen dimming (scrim) and smooth spring layouts.

## 1. Purpose & Design Intent
The `Modal` encapsulates high-importance actions that require immediate, focused user input, blocking main timeline scrolls. Features:
- **Atmospheric Isolation**: Employs deep translucent scrim layers (`rgba(0,0,0,0.85)`) paired with real-time backdrop blur highlights (`backdrop-blur-xl`) to elevate foreground readability.
- **Micro-Spring Entrances**: When toggled, the element slides upwards or expands relative to coordinates using custom structural spring configurations via `motion` (`bounce: 0` for elegant, professional motion).

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | **Required** | Controls visible mounting states inside the active render context. |
| `onClose` | `() => void` | **Required** | Triggers dismissal and coordinates state cleanup. |
| `title` | `string` | **Required** | Text headline positioned at the header boundary. |
| `children` | `React.ReactNode` | **Required** | Layout contents injected into the modal container. |
| `className` | `string` | Optional / `""` | Override coordinates or sizes. |

---

## 3. Usage Examples

### A. Modular Settings Overlay (Motion React)
An advanced standard setup containing modal wrappers and spring elements:

```tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl z-10"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-sans font-semibold text-white tracking-wide">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                title="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contents */}
            <div className="text-xs font-sans text-zinc-300 leading-relaxed">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Keyboard Escape Handling**: Captures the standard `Esc` key on the window event listener to trigger instant modal shutdowns, providing an easy escape route for power-users.
- **Outside Area Tap Scrim**: Clicking on any coordinate outside the primary dialog panel fires the parent `onClose(e)` handler, preventing navigation traps.
- **Concentric Radius Rhyme**: Outer borders of the dialog card employ a smooth `rounded-2xl` profile. Nested elements (such as inner form options) use a scale-adjusted `rounded-xl` or `rounded-lg` profile based on outer concentric spacing rules (`outerRadius = innerRadius + padding`).
- **Tab Focus Trapping**: Keyboards are encouraged to focus inside dialogue contents, and interactive controls provide high-contrast text rendering.

---

## 5. Edge Cases & Error States

- **Scroll Lock Execution**: When active, standard body parent wrappers are locked from secondary background scroll triggers using overflow modifiers: `document.body.style.overflow = 'hidden'`.
- **Excess Content Heights**: In scenarios where dialog contents exceed viewport boundaries, specify scrolling limits inside body frames: `max-h-[70vh] overflow-y-auto custom-scrollbar`.

---

# Combobox

A searchable dropdown select menu styled with elegant animations and customized blur filters.

## 1. Purpose & Design Intent
Replaces standard `<select>` tags whenever selection candidate arrays run larger than 5, offering:
- **Instant Search Filters**: Prompts characters dynamically on keystrokes, sorting large lists instantly.
- **Depth and Shading**: The dropdown layout applies layered shadows (`shadow-[0_20px_40px_rgba(0,0,0,0.8)]`) paired with glassmorphic transparency highlights to isolate option lists.

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | `ComboboxOption[]` | **Required** | The array of objects containing the complete collection of key-value choices. |
| `value` | `string` | **Required** | The active selected key currently set in parent states. |
| `onChange` | `(val: string) => void` | **Required** | Fire callback returning newly selected value strings. |
| `placeholder` | `string` | Optional / `"Select..."` | Muted display text visible in field when value is empty (`""`). |
| `className` | `string` | Optional / `""` | Customize alignment, spacing margins, or surrounding sizes. |

---

## 3. Usage Examples

### A. Selecting standard timezone targets
```tsx
import React, { useState } from 'react';
import { Combobox } from '../../components/ui/Controls';

export const SettingsTz = () => {
  const [tz, setTz] = useState("UTC");
  const options = [
    { value: "UTC", label: "UTC (Greenwich Mean Time)" },
    { value: "EST", label: "EST (Eastern Standard Time)" },
    { value: "PST", label: "PST (Pacific Standard Time)" },
  ];

  return (
    <div className="w-64">
      <Combobox
        options={options}
        value={tz}
        onChange={(v) => setTz(v)}
        placeholder="Choose active timezone..."
      />
    </div>
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Click-Out Dismissal Safety**: Implements a dedicated window event listener inside a clean React hook to capture `mousedown` events on external coordinates, executing a soft dropdown dismissal when clicking outside.
- **Search Auto-Focus**: Direct toggling clicks instantly execute `autoFocus` on option inputs, prompting standard mobile keyboards without secondary delay obstacles.
- **Micro-Transitions**: Dropdown overlays slide, fade, and blur using standard spring configurations (`duration: 0.3`, `bounce: 0`).
- **Interactive Sizing Requirements**: Tap triggers conform directly to safe bounds: `h-11` or minimum `44px` height grids protect inputs from mobile finger overlaps.

---

## 5. Edge Cases & Error States

- **No Matching Elements Found**: If searches filter out the complete option selection array, a friendly, legible `"No results found"` notice is generated inline. This protects users from feeling locked inside dead, silent menus.
- **Y-Axis Overflows**: Max heights are set precisely (`max-h-56`) with active scroll structures (`overflow-y-auto`) to safely contain larger sets without warping bottom layout panels.

---

# ControlGroup

An interactive layout wrapper ensuring visual symmetry, label metrics, and real-time debounced feedback.

## 1. Purpose & Design Intent
Providing real-time updates inside grids or graphs runs the risk of feeling visually silent or overly jarring to a user. `ControlGroup` resolves this by:
- **Save Status Highlights**: Displays an ambient, micro-animated indicator on the header row to signal when changes initiate local or cloud updates (`SAVING`), and subsequently settle (`SAVED`).
- **Structural Rhythm**: Guarantees regular padding margins to preserve form balances.

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface ControlGroupProps {
  label: string;
  value?: string | number;
  watchValue?: any;
  children: React.ReactNode;
  className?: string;
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | **Required** | The main display title positioned at the top left of the group. |
| `value` | `string \| number` | Optional / `undefined` | Interactive standard number or text display output tracking set states. |
| `watchValue` | `any` | Optional / `undefined` | Monitors state alterations on inputs to trigger debounced SAVED/SAVING status states. |
| `children` | `React.ReactNode` | **Required** | Nestable custom React component inputs (e.g., `<Switch />`, `<TactileSlider />`). |
| `className` | `string` | Optional / `""` | Adjust margins or sizes. |

---

## 3. Usage Examples

### A. Wrapping custom sliders
```tsx
import React, { useState } from 'react';
import { ControlGroup, TactileSlider } from '../../components/ui/Controls';

export const GapAdjuster = () => {
  const [size, setSize] = useState(4);

  return (
    <ControlGroup label="Inner grid spacing" value={`${size}px`} watchValue={size}>
      <TactileSlider
        min={0}
        max={16}
        value={size}
        onChange={(v) => setSize(v)}
      />
    </ControlGroup>
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Layout Stability / Cumulative Layout Shift (CLS)**: Instantly updating status text often results in shifting layouts. `ControlGroup` addresses this by locking headers to a stable minimum height requirements (`min-h-[22px]`). This prevents vertical parent jumps as indicators appear or disappear.
- **Tabular Numbers Formatting**: Auxiliary number text containers use Tailwind's `tabular-nums` configuration. This stops spacing adjustments of characters from modifying label coordinates or shifting widths.
- **Font Smoothing**: Enforces consistent macOS font smoothings (`-webkit-font-smoothing: antialiased`) for highly legible subtitle elements.

---

## 5. Edge Cases & Debouncing States

- **Continuous Input Control**: Rapid user activities (dragging a slider or repeatedly clicking quick buttons) would bottleneck standard systems. `ControlGroup` buffers status calls elegantly. It delays state progression using explicit React timeouts (stays in `SAVING` for **350ms** post-input, shifts to `SAVED` for **900ms**, then resets to `IDLE`) to keep database queues clean.
- **Undefined Values**: When value keys are omitted, the indicator layout hides beautifully, letting the main title utilize the entire row width.

---

# TactileSlider

A sensory-rich analog slider featuring real-time liquid tracking gradients, contextual hover tooltips, and a physical grid tick layout designed for continuous adjustments like spacing or styling opacity.

## 1. Purpose & Design Intent
Traditional sliders can feel visually detached and lacks physical texture. `TactileSlider` remedies this by:
- **Interactive Thumb Scaling**: The grab thumb expands on hover (`scale: 1.15`), and responds to Pointer Capture events to track drags smoothly across layouts.
- **Continuous Visual Feedback**: Provides a floating, spring-attached value tooltip that tracks the thumb’s relative width coordinates, fading in only when active pointer triggers occur.
- **Micro-Metric Texture**: Displays a base rhythm of 9 static bottom ticks to give the component a distinct premium geometric feel.

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface TactileSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  id?: string;
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `min` | `number` | **Required** | The lower boundary limit value. |
| `max` | `number` | **Required** | The upper boundary limit value. |
| `value` | `number` | **Required** | The active slider index or setting value. |
| `onChange` | `(val: number) => void`| **Required** | Fired during active dragging maneuvers on the slider strip. |
| `className` | `string` | Optional / `""` | Spacing overrides passed down to the wrapper frame. |
| `id` | `string` | Optional / `undefined` | DOM identifier. |

---

## 3. Usage Examples

### A. Implementing custom sizing sliders
```tsx
import React, { useState } from 'react';
import { TactileSlider } from '../../components/ui/Controls';

export const OpacityAdjuster = () => {
  const [val, setVal] = useState(60);

  return (
    <div className="w-80 p-4 bg-zinc-900 border border-white/5 rounded-xl">
      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400 mb-2">
        <span>OPACITY LEVEL</span>
        <span>{val}%</span>
      </div>
      <TactileSlider
        min={0}
        max={100}
        value={val}
        onChange={setVal}
      />
    </div>
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Liquid Track Spring Animation**: The underlying fill indicator tracks width percentages using a high-tension spring config: `stiffness: 600, damping: 40`.
- **Pointer Capture Safety**: Utilizes `e.target.setPointerCapture` on PointerDown triggers, ensuring mouse coordinates continue driving value alterations even when the user pulls their cursor outside of the bounding slider element context.
- **Contrast Ramping**: The track slides on an ultra-dark backplate (`bg-black/60`), highlighting the active progress with a vibrant, glowing accent sweep (`from-accent/80 to-accent`).

---

## 5. Edge Cases & Performance Constraints

- **Mathematical Clamping**: Internally clamps computed percentage offsets within `[0, 100]` limits to prevent browser layout blow-outs when cursor dimensions drift outside viewport bounds.
- **Unmounting Capture Cleans**: Handles active cancellation sequences (`onPointerCancel`) gracefully to prevent pointer locking stuck states when page refreshes or route changes take place.

---

# DualMonthRangeSlider

A continuous, multi-anchor dual-handle slider strip engineered to filter year grid data boundaries across a range from months 1 to 60.

## 1. Purpose & Design Intent
Perfectly suited for zoom operations and display filters, this component allows users to resize a sliding window range by:
- **Sub-Anchor Custom Drags**: Supports separate left-bar, right-bar, and central track drag-states.
- **Track Shifting**: Dragging the highlighted middle track moves the entire range box left or right, preserving the span gap dimension.
- **Complex Metrification**: Integrates 61 distinct tick points beneath the line, delineating 5 custom year segments (12 monthly marks per segment).

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface DualMonthRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  className?: string;
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `min` | `number` | **Required** | Base month ceiling (standardized to `1`). |
| `max` | `number` | **Required** | Max month ceiling (standardized to `60`). |
| `value` | `[number, number]` | **Required** | Standard index tuple enclosing `[activeStart, activeEnd]` integer months. |
| `onChange` | `(val: [number, number]) => void` | **Required** | Returns shifted boundary ranges. |
| `className` | `string` | Optional / `""` | Customize outer spacing layouts. |

---

## 3. Usage Examples

### A. Zoom Range Integration
```tsx
import React, { useState } from 'react';
import { DualMonthRangeSlider } from '../../components/ui/Controls';

export const GridZoomPanel = () => {
  const [months, setMonths] = useState<[number, number]>([12, 36]);

  return (
    <div className="w-96 bg-[#0c0c0e] border border-white/5 p-5 rounded-2xl">
      <span className="text-[11px] font-mono text-zinc-500 tracking-wider block mb-3">
        ACTIVE RAMP RANGE: {months[0]} to {months[1]} MONTHS
      </span>
      <DualMonthRangeSlider
        min={1}
        max={60}
        value={months}
        onChange={setMonths}
      />
    </div>
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Visual Feed Indicators**: Middle range block renders dynamic width readouts: `{activeEnd - activeStart}MO`, centered on top of subtle spring-loaded backdrop shadows.
- **Active State Shifting (Grip Shapes)**: Drag highlights adapt state highlights from standard grabs to active grabbing configurations (`cursor-grabbing`) across three targeted hit zones.
- **Pointer Isolation**: Explicitly isolates tick lines (`pointer-events-none`) so clicks on background details fall back safely to nearest-handle slide operations.

---

## 5. Edge Cases & Boundary Constraints

- **Cross-Over Prevention**: Internally prevents left handles from shifting past or overlapping right anchors; enforces structural constraints (`value[1] - 1` for left; `value[0] + 1` for right) ensuring a minimum width span of 1 unit.
- **Central Shift Clamping**: Central window drags lock shifts securely to boundary edges, clipping offsets instantly when start months reach lower margins (`min`) or end limits (`max`).

---

# SegmentedControl

An hardware-accelerated, slide-selected options group with custom Framer Motion spring backdrops for rapid switches.

## 1. Purpose & Design Intent
Replaces tab lists or basic button loops whenever toggling active display preferences (e.g., Grid Mode selections). Provides:
- **Continuous Sliding Highlights**: High-performance layout animations transition the glowing orange box seamlessly towards the active option on pointer click.
- **Layout Alignment Stability**: The segmented buttons divide space symmetrically inside a single row.

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface SegmentOption<T> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  layoutId: string; // Animation namespace key
  className?: string;
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `options` | `SegmentOption<T>[]` | **Required** | Array of type-generic configuration candidates. |
| `value` | `T` | **Required** | The active selected cell value matching type `T`. |
| `onChange` | `(val: T) => void` | **Required** | Fired on option tap triggers. |
| `layoutId` | `string` | **Required** | Globally unique identifier namespace block for tracking slide vectors. |
| `className` | `string` | Optional / `""` | Width or style customization classes. |

---

## 3. Usage Examples

### A. Display Selection Switcher
```tsx
import React, { useState } from 'react';
import { SegmentedControl } from '../../components/ui/Controls';

type ViewMode = 'days' | 'weeks' | 'months';

export const DisplayPreference = () => {
  const [pref, setPref] = useState<ViewMode>('weeks');

  const options = [
    { value: 'days' as ViewMode, label: "Days View" },
    { value: 'weeks' as ViewMode, label: "Weeks View" },
    { value: 'months' as ViewMode, label: "Months View" },
  ];

  return (
    <SegmentedControl
      options={options}
      value={pref}
      onChange={setPref}
      layoutId="view-preferences"
    />
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Polished Spring Animations**: Active backplates travel using high-precision physical spring vectors: `{ type: "spring", stiffness: 380, damping: 28, bounce: 0 }`.
- **Active Press Scale Feedback**: Button labels expand slightly and apply active micro-compressions (`active:scale-[0.96]`) on user pointer downs to reinforce sensory tactility.
- **ARIA Switch Roles**: Enforces accessibility criteria through `role="radiogroup"` on base containers, and `role="radio" / aria-checked={isActive}` assignments on buttons ensuring accessible layouts on screen readers.

---

## 5. Edge Cases & Error States

- **Polymorphic Type Safety**: Supports full key-type configurations (`string`, `number`, or `boolean`) using generic extensions to avoid layout build failures.
- **Identifier Protection**: Layout identifiers (`layoutId`) must be unique per layout view. Using identical string names, handles transitions incorrectly across panels; always pass localized IDs.

---

# Toggle

A beautiful, high-fidelity tactile switch designed to toggle boolean features, styled with premium material dynamics.

## 1. Purpose & Design Intent
Designed for high-frequency settings adjustments, the `Toggle` implements:
- **Material Spring Dynamics**: A slide toggle knob that stretches on tap to signify movement tension.
- **State Highlights**: Offplate states utilize deep low-contrast elements while active states apply subtle vibrant glows (`bg-accent/20 border-accent/40`) to make active configurations look distinct.

## 2. API Signature & Props Reference

### TypeScript Definition
```typescript
interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
```

### Props Table
| Prop Name | Type | Required / Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | DOM reference string assigned to labels. |
| `label` | `string` | **Required** | Plaintext indicator shown adjacent to the switch. |
| `checked` | `boolean` | **Required** | State representing active status toggles. |
| `onChange` | `(checked: boolean) => void` | **Required** | Fires state callbacks when clicked. |

---

## 3. Usage Examples

### A. Grid Highlight Switch
```tsx
import React, { useState } from 'react';
import { Toggle } from '../../components/ui/Controls';

export const InteractiveGlowSetting = () => {
  const [glow, setGlow] = useState(true);

  return (
    <Toggle
      id="neon-grid-glow"
      label="Enable Neon Grid Glow Paths"
      checked={glow}
      onChange={setGlow}
    />
  );
};
```

---

## 4. Accessibility & Interactive Feel (a11y)

- **Keyboard Triggers**: Integrates key listeners standard (`Enter` or `Space` key actions inside elements executing toggles), preserving screen reader pathways.
- **Focus Indicators**: Includes high-visibility outline alignments to highlight active coordinates for screen reader nodes.
- **Knob Compression Physic**: Tapping the switch executes a temporary compression effect on the knob element (`width: 20` with a `0.90` scale down transition), capturing tension dynamically.
- **AAS Contrast**: The active orange background features highly saturated border paths guaranteeing maximum contrast against background canvas blocks.
