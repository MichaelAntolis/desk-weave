# Design System Strategy: The Curated Workspace

## 1. Overview & Creative North Star: "The Digital Architect"
This design system is not a template; it is a structural philosophy. For a marketplace like ours, the UI must act as a high-end concierge—quiet, authoritative, and impeccably organized. Our Creative North Star is **"The Digital Architect."** 

We move away from the "boxy" look of traditional SaaS. Instead, we embrace **Intentional Asymmetry** and **Editorial Breathing Room**. By utilizing staggered layouts, overlapping imagery, and a sophisticated tonal palette, we create an experience that feels custom-built. The system prioritizes "Negative Space" as a functional element, directing the user’s eye toward premium workspace inventory without the clutter of traditional borders.

## 2. Colors & Tonal Depth
We utilize a Material-inspired tonal system to move beyond flat design. The primary deep indigo (`primary: #00236f`) provides the "Professional Anchor," while the teal accents (`secondary: #006a61`) introduce a sense of modern vitality.

### The "No-Line" Rule
**Borders are a failure of hierarchy.** Within this system, 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through:
- **Background Shifts:** Placing a `surface-container-low` section against a `surface` background.
- **Tonal Transitions:** Using color blocking to separate the "Search" experience from "Browse."

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper. 
- **Base Layer:** `surface` (#f7f9fb) for global backgrounds.
- **Sectioning:** Use `surface-container` tiers to create "pockets" of information. 
- **The Nested Card:** A card (`surface-container-lowest`) should sit atop a `surface-container-low` section. This subtle contrast (white on off-white) creates a "soft lift" that feels significantly more premium than a grey border.

### The Glass & Gradient Rule
To inject "soul" into the tech-heavy marketplace:
- **CTAs:** Use a subtle linear gradient from `primary` (#00236f) to `primary_container` (#1e3a8a).
- **Floating Elements:** Modals and navigation bars should utilize **Glassmorphism**. Apply `surface` with 80% opacity and a `backdrop-blur` of 12px.

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headline) with **Inter** (Body/Label) to strike a balance between architectural character and technical precision.

*   **Display (Manrope):** Use for hero sections and large price points. The tight tracking and heavy weight convey confidence.
*   **Body (Inter):** High legibility at `body-md` (0.875rem) for property descriptions.
*   **The "Hierarchy Gap":** Create drama by pairing a `display-lg` headline with a `label-md` uppercase subheader. This high-contrast scale is what separates an "app" from an "experience."

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to hide poor layout; we use them to mimic natural light.

*   **The Layering Principle:** Depth is achieved by stacking `surface-container` tiers. 
    *   *Example:* Sidebar (`surface_container_low`) > Main Canvas (`surface`) > Workspace Card (`surface_container_lowest`).
*   **Ambient Shadows:** If a card requires a floating state (e.g., hover), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 35, 111, 0.05)`. Notice the 5% opacity and the blue tint—never use pure black for shadows.
*   **The "Ghost Border" Fallback:** For accessibility in form fields, use a "Ghost Border": `outline_variant` at 15% opacity. It should be felt, not seen.

## 5. Components: Precision Primitive

### Buttons
*   **Primary:** Indigo-to-Teal gradient, `rounded-md` (0.75rem), white text.
*   **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
*   **Tertiary:** Pure text with an underline that appears only on hover, using `secondary` teal.

### Input Fields & Search
*   **Style:** `surface_container_lowest` (pure white) with a soft `lg` shadow on focus.
*   **Labeling:** Use `label-sm` in `on_surface_variant` (#444651), positioned strictly above the field, never as a placeholder.

### Cards (The Workspace Gallery)
*   **Forbid Dividers:** Do not use lines to separate the price from the title. Use a `2.5` (0.85rem) vertical spacing gap instead.
*   **Media:** Images must use `rounded-lg` (1rem).
*   **Illustrations:** Empty states (e.g., "No spaces found") should use high-quality, custom isometric illustrations rather than Lucide icons. Icons are for utility; illustrations are for emotion.

### Additional Signature Components
*   **Availability Ribbon:** A small, `secondary` (teal) pill used to indicate "Live Now" status, using `label-sm` bold.
*   **The "Breadcrumb Trail":** A horizontal scroll of `chips` using `surface_container_high` to filter by "Quiet Zone," "High-Speed WiFi," or "Coffee Bar."

## 6. Do’s and Don’ts

### Do:
*   **DO** use whitespace as a separator. If in doubt, double the margin.
*   **DO** use Lucide icons sparingly (Sidebars and Status indicators only).
*   **DO** ensure all "Interactive" surfaces have a `transition-all duration-300` ease-in-out for a fluid feel.

### Don’t:
*   **DON'T** use 1px solid borders to define the edges of a container.
*   **DON'T** use pure black (#000000) for text. Use `on_surface` (#191c1e) for better readability.
*   **DON'T** crowd the Hero section. Let the illustration and the `display-lg` typography own the "fold."