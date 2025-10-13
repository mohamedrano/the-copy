# Design Guidelines: تطبيق تحليل النصوص الدرامية

## Design Approach
**Selected System**: Material Design 3 with Arabic RTL adaptation
**Justification**: The application is utility-focused, data-intensive, and requires robust support for complex visualizations, multi-step workflows, and RTL layouts for Arabic content.

## Core Design Principles
1. **Progressive Disclosure**: Guide users through 7 stations sequentially without overwhelming
2. **Data Clarity**: Prioritize readability of analysis outputs and metrics
3. **Process Visibility**: Always show users where they are in the pipeline
4. **Bilingual Excellence**: Seamless RTL/LTR support with Arabic-first design

## Color Palette

**Light Mode:**
- Primary: 220 90% 45% (Deep Blue - للعناوين والأزرار الأساسية)
- Secondary: 280 70% 50% (Purple - للمحطات والتقدم)
- Success: 140 60% 45% (Green - للتحليلات الإيجابية)
- Warning: 35 90% 55% (Amber - للتحذيرات)
- Error: 0 75% 50% (Red - للأخطاء والمشاكل)
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%

**Dark Mode:**
- Primary: 220 85% 65%
- Secondary: 280 65% 65%
- Success: 140 55% 60%
- Warning: 35 85% 65%
- Error: 0 70% 60%
- Background: 220 15% 10%
- Surface: 220 12% 15%
- Text Primary: 220 10% 95%
- Text Secondary: 220 8% 70%

## Typography
**Font Families:**
- Arabic: 'Tajawal', 'Cairo', sans-serif (via Google Fonts)
- English/Numbers: 'Inter', sans-serif (via Google Fonts)

**Hierarchy:**
- H1: text-4xl md:text-5xl font-bold (العناوين الرئيسية)
- H2: text-3xl md:text-4xl font-semibold (عناوين المحطات)
- H3: text-2xl font-semibold (عناوين الأقسام)
- Body: text-base leading-relaxed (النصوص العامة)
- Small: text-sm (التفاصيل والملاحظات)
- Code/Data: font-mono text-sm (البيانات التقنية)

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing: p-2, gap-2
- Component spacing: p-4, gap-4, mb-6
- Section spacing: py-8, my-12
- Major sections: py-16

**Grid System:**
- Container: max-w-7xl mx-auto px-4
- Two-column: grid-cols-1 lg:grid-cols-2 gap-6
- Three-column cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

## Component Library

**Navigation:**
- Top app bar with logo, language toggle (AR/EN), theme switcher, user menu
- Stepper component showing 7 stations with progress indicators
- Breadcrumbs for nested navigation within stations

**Input Components:**
- Large text area for narrative input (min-h-96, RTL-aware)
- File upload dropzone with drag-and-drop
- Form fields with floating labels (Material style)
- Multi-select dropdowns for filters

**Data Display:**
- Cards with elevation shadows (shadow-md, shadow-lg)
- Accordion panels for expandable analysis sections
- Data tables with sorting, filtering, pagination
- Stat cards showing key metrics (grid layout)
- Progress bars and circular progress indicators
- Tags/chips for concepts and themes

**Visualizations:**
- Network graphs for conflict mapping (Station 3) using D3.js or vis-network
- Bar charts for efficiency metrics (Station 4)
- Timeline views for dynamic analysis (Station 5)
- Radar charts for diagnostic overview (Station 6)
- Mind maps for conceptual relationships (Station 2)

**Actions:**
- Elevated buttons (primary actions): rounded-lg px-6 py-3
- Outlined buttons (secondary): border-2
- Text buttons (tertiary): no background
- Floating action button: fixed bottom-6 right-6 (or left-6 for RTL)
- Icon buttons: rounded-full p-2

**Feedback:**
- Toast notifications (top-right for LTR, top-left for RTL)
- Loading skeletons with shimmer animation
- Modal dialogs for confirmations and detailed views
- Inline validation messages

## Station-Specific Layouts

**Station 1 (Text Analysis):**
- Split view: Text input (right) | Analysis results (left) in RTL
- Highlighted text segments showing character mentions
- Collapsible character cards with avatars and descriptions

**Station 2 (Conceptual Analysis):**
- Concept cloud visualization (tag sizes based on importance)
- Hierarchical tree view of themes and sub-themes

**Station 3 (Conflict Network):**
- Full-width interactive network diagram
- Side panel showing selected node/edge details
- Zoom controls and layout options

**Station 4 (Efficiency Metrics):**
- Dashboard grid of metric cards (4 columns on desktop)
- Comparison charts with benchmarks
- Score gauges with color-coded ranges

**Station 5 (Dynamic & Symbolic):**
- Timeline slider for temporal analysis
- Symbol library with explanations
- Parallel coordinates for multi-dimensional view

**Station 6 (Diagnosis):**
- Problem severity matrix (2D grid)
- Recommended actions list with priority badges
- Before/after comparison views

**Station 7 (Final Visualization):**
- Executive summary dashboard
- Exportable PDF report preview
- Share and download options

## Animations
Use sparingly and purposefully:
- Page transitions: 200ms ease-in-out
- Accordion expand/collapse: 300ms
- Loading states: subtle pulse
- Chart animations: 500ms on initial render only
- NO continuous animations or distracting effects

## Images
**Hero Section (Landing Page):**
- Large hero image showing Arabic calligraphy or manuscript pages with dramatic lighting
- Overlay with gradient (from primary color at 60% opacity to transparent)
- Height: min-h-[70vh]

**Station Illustrations:**
- Small decorative icons for each station (32x32px, line art style)
- Use heroicons or Material Icons library
- No large images within analysis interfaces (focus on data)

## RTL Implementation
- dir="rtl" on root element when Arabic is selected
- Mirror all asymmetric layouts and positioning
- Icons remain same orientation (don't mirror)
- Charts and graphs use RTL-aware labeling
- Form inputs aligned right with labels on right side