# Editor Vercel Minimal Dark Redesign Design

## Goal

Redesign the current slide editor into a calmer, more polished dark-mode interface inspired by Vercel and shadcn/ui, while keeping the editor workflow intact. The result should feel simpler and more premium than the current UI, without becoming decorative or hiding core editing controls.

## User-Approved Direction

- Visual style: Vercel-inspired minimal dark UI
- Overall feel: polished, beautiful, simpler
- Inspector: always-open right inspector stays
- Modes: explicit `BBox` and `Select` tabs stay
- Palette: almost entirely neutral grayscale with blue used only for active/focus states
- Typography: `Pretendard` only
- Product framing: keep the UI clearly recognizable as an editor, not a viewer

## Scope

In scope:
- restyle the editor shell, navigation, canvas stage, inspector, buttons, inputs, badges, and overlays
- preserve all existing editor features and keyboard shortcuts
- keep the current persistent right inspector layout
- keep explicit `BBox` and `Select` modes in the inspector
- improve spacing, hierarchy, and visual rhythm across the editor
- reduce visual noise from borders, chips, and stacked control boxes

Out of scope:
- adding new editing capabilities
- changing the draw/select behavior model
- removing the right inspector
- introducing a viewer mode or viewer button in this change
- converting the UI into a different component framework

## Problems With The Current UI

- The current dark UI already leans toward shadcn styling, but it still feels visually busy.
- Too many visible borders and boxed controls make the shell feel heavier than necessary.
- `Geist Sans` and `Geist Mono` push the editor toward a Vercel clone rather than a cleaner Korean-first product UI.
- The canvas does not feel elevated enough relative to the surrounding chrome.
- The right inspector reads as a set of stacked control groups rather than one coherent editing surface.
- Status and badge elements compete for attention with the actual slide content.

## Recommended Approach

Use a restrained dark editor shell that preserves the current layout but simplifies the visual language:

1. Keep the top navigation, central stage, right inspector, and bottom status bar.
2. Keep the inspector permanently visible and preserve explicit `BBox` and `Select` mode tabs.
3. Replace the current high-contrast boxy styling with lower-contrast neutral surfaces and thinner borders.
4. Use `Pretendard` as the only UI font.
5. Reserve blue for focus rings, active controls, and selected state emphasis.
6. Keep overlays and tool affordances functional, but visually quieter and more precise.

This keeps the application clearly editor-shaped while making it feel closer to a polished Vercel-style tool rather than a dense internal dashboard.

## Visual System

### Typography

- Use `Pretendard` for all UI text, labels, counters, and utility text.
- Remove `Geist Sans` and `Geist Mono` from the editor.
- Create hierarchy through size, weight, and spacing rather than through mixed font families.
- Keep labels small and quiet, but avoid over-stylized mono chips.

### Color

- Use a near-black neutral app background with subtle tonal separation between shell surfaces.
- Keep borders in graphite/charcoal tones with lower contrast than the current implementation.
- Use blue only for:
  - active segmented tabs
  - focused inputs
  - active icon toggles
  - object selection emphasis
- Avoid decorative accent colors in the general chrome.

### Surface Language

- Prefer flat or lightly elevated surfaces over stacked outlined cards.
- Use subtle shadows only where they help the stage or inspector read as separate planes.
- Remove gratuitous “boxed widget” styling from repeated controls.

## Layout

### Top Navigation

- Keep previous/next navigation and slide count.
- Preserve the current slide status indicator and branding.
- Make the bar slimmer, quieter, and more integrated with the app shell.
- Use compact ghost-like navigation buttons instead of prominent boxed buttons.

### Canvas Stage

- Keep the slide centered as the main focus.
- Increase surrounding breathing room so the canvas feels premium and deliberate.
- Place the slide inside a restrained dark stage surface so the white iframe reads intentionally framed.
- Keep the clear-bboxes action inside the slide wrapper, but restyle it to match the calmer shell.

### Right Inspector

- Keep the inspector permanently visible as the editor control column.
- Maintain explicit `BBox` and `Select` tabs at the top as a segmented control.
- Structure the inspector as one coherent column with clear vertical rhythm.
- Separate sections primarily with spacing, using only occasional hairline dividers.
- Preserve all current controls, but simplify how they are visually grouped.

### Bottom Status Bar

- Keep the connection indicator and status message.
- Compress the visual weight so the bar supports the editor without reading as a second toolbar.

## Component Styling

### Buttons and Tabs

- Mode tabs should read as a clean segmented control rather than two large standalone buttons.
- Standard buttons should use:
  - neutral dark fill
  - thin low-contrast border
  - modest radius
  - blue only on focus/active states
- Icon buttons should become more uniform in size and less bulky.
- Disabled states should remain clearly visible but understated.

### Inputs

- Text inputs, textarea, number fields, and select controls should share one visual language.
- Use a consistent dark fill, restrained border, and subtle inset contrast.
- Focus should be expressed with a tighter blue ring and slightly brighter border.
- Avoid bright placeholder text and oversized chrome.

### Status Chips and Meta UI

- Slide status should remain visible, but the chip should become softer and less badge-like.
- BBox counts and hints should feel informational, not decorative.
- Meta text should be de-emphasized through contrast rather than separate font families.

### Object Editing Controls

- Keep text, color, size, style, and alignment controls in the `Select` tab.
- Maintain current control availability rules and disabled behavior.
- Simplify section labeling and spacing so controls read as part of one editor surface.
- Keep object summary/empty-state feedback, but reduce visual heaviness.

## Overlay Styling

### Object Selection

- Keep hover and selected outlines in select mode.
- Use cleaner, more precise blue tones with slightly lighter visual weight.
- Preserve strong enough contrast for usability without the current heavier highlight feel.

### BBoxes

- Keep pending and review states and existing per-box actions.
- Soften the red pending presentation slightly so it feels like an editing overlay rather than an alert.
- Keep review green distinct, but tone both states to match the calmer product shell.

## Behavior and Feature Parity

This redesign should preserve current functionality:

- bbox drawing
- bbox clearing
- bbox rerun/review actions
- prompt entry
- model selection
- Codex run submission
- slide navigation
- current slide status updates
- object selection
- direct text editing
- text/background color changes
- font size changes
- bold/italic/underline/strikethrough toggles
- left/center/right alignment controls
- keyboard shortcuts such as `Cmd/Ctrl+Enter`, `Cmd/Ctrl+B`, `Cmd/Ctrl+I`, and `Cmd/Ctrl+U`
- bottom connection and status reporting

The redesign changes presentation, hierarchy, and spacing, not the editor’s workflow model.

## Implementation Notes

- The current UI is largely defined in `src/editor/editor.html`, with interaction state distributed across `src/editor/js/editor-dom.js`, `src/editor/js/editor-init.js`, and `src/editor/js/editor-select.js`.
- The redesign should reuse the existing DOM structure where practical to reduce regression risk.
- Where markup changes are necessary, they should preserve current element IDs used by the editor logic and test suite unless there is a clear benefit to updating both together.
- If a future `Viewer` button is added, the top navigation should have a natural slot for it without forcing another structural redesign.

## Testing Strategy

Verify that the redesign preserves behavior through the existing editor tests, updating selectors only where DOM structure changes require it.

Critical checks:
- draw and select tabs still switch correctly
- bbox creation, selection, delete, rerun, review, and clear still work
- prompt and model state still behave correctly per slide
- direct object edit controls still enable and disable correctly
- text and style edits still persist
- keyboard shortcuts still work
- navigation and status updates still render correctly
- inspector remains permanently visible

## Risks

- A visual-only redesign can still break tests if it changes markup too aggressively.
- Over-minimizing contrast can harm discoverability in an editor context.
- Replacing mixed font stacks with `Pretendard` may require spacing and line-height tuning throughout the shell.
- Simplifying borders and surfaces too far can make control groups feel ambiguous, so spacing discipline matters.
