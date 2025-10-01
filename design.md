# Legal Deadline Calculator - Design Style Guide

## Design Philosophy

### Visual Language
**Professional Legal Aesthetic:** Clean, authoritative design that conveys trust and precision - essential qualities for legal professionals. The interface should feel like a premium legal tool that attorneys would be proud to use in their practice.

**Clarity and Focus:** Every element serves a purpose. No decorative elements that could distract from the critical task of accurate deadline calculation. The design prioritizes functionality while maintaining visual sophistication.

### Color Palette
**Primary Colors:**
- Deep Navy (#1a365d) - Authority, trust, professionalism
- Warm Gray (#4a5568) - Neutral, sophisticated, readable
- Pure White (#ffffff) - Clean, clear, professional

**Accent Colors:**
- Amber (#d69e2e) - Urgency warnings, important deadlines
- Sage Green (#38a169) - Success states, completed calculations
- Light Blue (#3182ce) - Interactive elements, links

**Background:**
- Subtle warm gray (#f7fafc) - Soft, non-distracting background
- No gradients or complex patterns that could interfere with readability

### Typography
**Primary Font:** "Inter" - Modern, highly legible sans-serif designed for professional interfaces
**Secondary Font:** "Source Serif Pro" - For legal citations and formal text when needed
**Monospace Font:** "JetBrains Mono" - For date displays and numerical calculations

**Hierarchy:**
- Large headings (32px) for main calculator interface
- Medium headings (24px) for section titles
- Body text (16px) for descriptions and labels
- Small text (14px) for fine print and disclaimers

## Visual Effects and Styling

### Used Libraries and Effects
**Background Effects:**
- Shader-park for subtle animated background pattern
- Soft geometric shapes that suggest legal documents and precision
- Slow, gentle movement that doesn't distract from calculations

**Text Effects:**
- Typed.js for dynamic calculation explanations
- Splitting.js for elegant text reveals on results
- Color cycling emphasis for urgent deadline warnings

**Interactive Elements:**
- Anime.js for smooth transitions and micro-interactions
- Hover effects on buttons with subtle lift and glow
- Real-time calculation feedback with gentle pulsing

**Data Visualization:**
- ECharts.js for deadline timeline visualizations
- Clean, minimal charts showing calculation breakdowns
- Color-coded calendar views for holiday exclusions

### Animation and Motion
**Scroll Motion:**
- Gentle fade-in animations for content sections (opacity 0.9 to 1.0)
- Subtle upward movement (16px) for cards and important elements
- Staggered reveals for calculation steps

**Hover Effects:**
- Buttons: 3D tilt effect with depth shadow
- Cards: Gentle lift with expanded shadow
- Input fields: Soft glow border on focus

**Loading States:**
- Elegant skeleton screens for calculation results
- Smooth transitions between different calculation modes
- Progress indicators for batch processing

### Layout and Spacing
**Grid System:**
- 12-column responsive grid
- Consistent 24px spacing between major sections
- 16px spacing for related elements
- 8px spacing for tight groupings

**Component Design:**
- Rounded corners (8px) for modern feel
- Subtle shadows (0 4px 12px rgba(0,0,0,0.1)) for depth
- Clean borders (1px solid #e2e8f0) for definition

**Mobile Considerations:**
- Touch-friendly button sizes (minimum 44px)
- Collapsible sections for complex calculations
- Simplified navigation for small screens

### Professional Touches
**Legal Iconography:**
- Scales of justice (subtle, not cliché)
- Calendar and clock symbols
- Document and filing imagery
- Clean line art style, no cartoon elements

**Status Indicators:**
- Color-coded deadline urgency (green > 30 days, amber 7-30 days, red < 7 days)
- Visual progress bars for multi-step calculations
- Checkmarks and validation icons for completed actions

**Accessibility:**
- High contrast ratios (minimum 4.5:1)
- Clear focus indicators for keyboard navigation
- Screen reader friendly labels and descriptions
- Alternative text for all visual elements