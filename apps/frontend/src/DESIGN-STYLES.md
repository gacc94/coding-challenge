---
name: Gallery Aesthetic
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#414753'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#727784'
  outline-variant: '#c1c6d5'
  surface-tint: '#005cba'
  primary: '#004e9f'
  on-primary: '#ffffff'
  primary-container: '#0066cc'
  on-primary-container: '#dfe8ff'
  inverse-primary: '#aac7ff'
  secondary: '#5d5e60'
  on-secondary: '#ffffff'
  secondary-container: '#dfdfe1'
  on-secondary-container: '#616365'
  tertiary: '#515052'
  on-tertiary: '#ffffff'
  tertiary-container: '#69686a'
  on-tertiary-container: '#ebe8ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00458e'
  secondary-fixed: '#e2e2e4'
  secondary-fixed-dim: '#c6c6c8'
  on-secondary-fixed: '#1a1c1d'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#e4e2e4'
  tertiary-fixed-dim: '#c8c6c8'
  on-tertiary-fixed: '#1b1b1d'
  on-tertiary-fixed-variant: '#474649'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  body-main:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: '1.47'
    letterSpacing: -0.022em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  global-nav-height: 44px
  sub-nav-height: 52px
  section-padding-vertical: 80px
  tile-gutter: 0px
  container-margin: 24px
---

## Brand & Style

This design system centers on a "photography-first" philosophy, treating the interface as a silent, premium canvas for high-resolution imagery. Drawing heavy inspiration from modern museum galleries and Apple’s editorial layouts, the brand personality is sophisticated, precise, and unobtrusive. 

The target audience consists of connoisseurs and professionals who value clarity and minimalism. The emotional response should be one of calm focus, where the UI recedes to allow the product photography to occupy the center of attention. The aesthetic utilizes high-contrast shifts between light and dark surfaces to create rhythm without the need for decorative flourishes.

## Colors

The palette is strictly functional, utilizing neutral tones to define structural zones. 
- **Pure White (#ffffff):** Used for primary content sections and high-brightness product tiles.
- **Parchment (#f5f5f7):** Acts as a subtle tonal break for secondary content sections, providing a softer backdrop than pure white.
- **Near-Black (#272729):** Reserved for high-impact photography sections and footer elements to provide depth.
- **Action Blue (#0066cc):** The sole interactive accent. This color is used exclusively for links, active states, and primary call-to-action buttons.
- **Global Black (#000000):** Dedicated to the ultra-thin global navigation bar to anchor the top of the viewport.

## Typography

The typography system uses Inter as a highly legible substitute for SF Pro, maintaining the sleek, neo-grotesque character of the design. 

Headlines use tight tracking (negative letter spacing) and a semi-bold weight (600) to create a dense, authoritative visual block. The body text is set to 17px, optimized for readability with a slightly wider line height. For mobile displays, headlines scale down proportionally while maintaining the tight tracking to preserve the "Apple-inspired" editorial tension. All text on Near-Black tiles should be inverted to Pure White or high-opacity silver.

## Layout & Spacing

This design system employs a fixed-fluid hybrid approach. While text content lives within a centered container (max-width 1200px), product tiles are "edge-to-edge," spanning the full width of the viewport with zero gutters between them.

The layout rhythm is defined by a strict vertical hierarchy:
1. **Global Nav:** 44px, absolute black, pinned to the top.
2. **Sub-Nav:** 52px, frosted glass (blur: 20px, 80% opacity white), following immediately below the global nav.
3. **Product Tiles:** Large-scale blocks that alternate background colors (#ffffff, #f5f5f7, #272729) to create a "scrolling gallery" effect.

Whitespace is intentionally generous, particularly between headlines and body copy, to reinforce the museum feel.

## Elevation & Depth

In keeping with the flat, photography-centric aesthetic, this design system avoids decorative UI shadows.
- **UI Elements:** Buttons, inputs, and cards have no shadows or gradients. They rely on color contrast and clear boundaries for definition.
- **Sub-Nav:** Depth is achieved via a backdrop-filter (blur) rather than a shadow, allowing the colors of the scrolling content to bleed through subtly.
- **Imagery:** Shadows are reserved exclusively for product photography (e.g., a "floating" phone or laptop image). These shadows must be soft, long, and naturalistic, providing the only sense of 3D space in the interface.

## Shapes

The shape language is a study in contrast. The layout containers and product tiles are perfectly square-edged (0px radius) to maintain the structural grid. However, all interactive elements—including primary buttons and selection chips—are fully pill-shaped (roundedness level 3). This distinction ensures that the user can instantly identify "action" vs "content" through geometry alone.

## Components

### Buttons
Primary buttons are pill-shaped, filled with Action Blue (#0066cc), featuring white text. Secondary buttons are ghost-style with an Action Blue outline and text. There are no shadows or gradients.

### Product Tiles
The core component of the design. These are full-width or half-width containers with no border-radius. They must alternate background colors to distinguish between different product features or stories.

### Navigation
- **Global Nav:** Ultra-thin (44px) black bar with high-contrast white links (12px, semi-bold).
- **Sub-Nav:** A 52px bar with a frosted glass effect. It contains secondary category links in Action Blue or Neutral Black.

### Inputs & Selection
Input fields are minimal, defined by a 1px border in a light neutral shade (#d2d2d7), becoming Action Blue on focus. Checkboxes and radio buttons use Action Blue when active.

### Product Imagery
Imagery within tiles should be high-resolution with "hero" placement. Product shots can feature soft, ambient shadows to create a sense of premium quality and physical presence against the flat UI.
