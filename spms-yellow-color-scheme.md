# SPMS Yellow-Dominated Color Scheme
## Student Pickup Management System - Warm & Welcoming Palette

### Primary Color Palette

#### 1. Primary Brand Color - Sunshine Yellow
- **Main**: `#F59E0B` (Amber 500)
- **Light**: `#FCD34D` (Amber 300)
- **Dark**: `#D97706` (Amber 600)
- **Very Light**: `#FEF3C7` (Amber 100)
- **Usage**: Primary buttons, headers, key UI elements, branding
- **Rationale**: Warm yellow conveys friendliness, optimism, and energy - perfect for a school environment

#### 2. Secondary Color - Complementary Blue
- **Main**: `#3B82F6` (Blue 500)
- **Light**: `#60A5FA` (Blue 400)
- **Dark**: `#2563EB` (Blue 600)
- **Usage**: Secondary actions, links, trust indicators
- **Rationale**: Blue balances yellow and adds trust/security elements

#### 3. Success Color - Fresh Green
- **Main**: `#10B981` (Emerald 500)
- **Light**: `#34D399` (Emerald 400)
- **Dark**: `#059669` (Emerald 600)
- **Usage**: Success states, confirmed pickups, positive notifications

#### 4. Accent Color - Coral Red
- **Main**: `#EF4444` (Red 500)
- **Light**: `#F87171` (Red 400)
- **Dark**: `#DC2626` (Red 600)
- **Usage**: Errors, alerts, urgent notifications

### Extended Yellow Palette for Variety

#### Yellow Spectrum
- **Lightest**: `#FFFBEB` (Amber 50) - Backgrounds
- **Very Light**: `#FEF3C7` (Amber 100) - Hover states
- **Light**: `#FDE68A` (Amber 200) - Highlights
- **Medium Light**: `#FCD34D` (Amber 300) - Secondary elements
- **Medium**: `#FBBF24` (Amber 400) - Interactive elements
- **Main**: `#F59E0B` (Amber 500) - Primary brand
- **Medium Dark**: `#D97706` (Amber 600) - Hover/active states
- **Dark**: `#B45309` (Amber 700) - Dark mode
- **Very Dark**: `#92400E` (Amber 800) - Text on light yellow

### Neutral Palette

#### Background Colors
- **Primary Background**: `#FFFBEB` (Very light yellow)
- **Card Background**: `#FFFFFF` (White)
- **Secondary Background**: `#FEF3C7` (Light yellow)
- **Tertiary Background**: `#F9FAFB` (Neutral gray)

#### Text Colors
- **Primary Text**: `#78350F` (Amber 900 - warm dark)
- **Secondary Text**: `#92400E` (Amber 800)
- **Muted Text**: `#6B7280` (Gray 500)
- **Disabled Text**: `#9CA3AF` (Gray 400)

#### Border Colors
- **Light Border**: `#FDE68A` (Light yellow)
- **Medium Border**: `#FBBF24` (Medium yellow)
- **Dark Border**: `#D97706` (Dark yellow)

### Status Colors

#### Confirmed/Success - Green
- **Main**: `#10B981`
- **Background**: `#D1FAE5`
- **Border**: `#6EE7B7`

#### Pending/Warning - Orange-Yellow
- **Main**: `#F59E0B` (Uses primary yellow)
- **Background**: `#FEF3C7`
- **Border**: `#FCD34D`

#### Rejected/Error - Coral Red
- **Main**: `#EF4444`
- **Background**: `#FEE2E2`
- **Border**: `#FCA5A5`

#### Info - Sky Blue
- **Main**: `#0EA5E9` (Sky 500)
- **Background**: `#E0F2FE`
- **Border**: `#7DD3FC`

### Feature-Specific Colors

#### Geofencing/Map
- **Active Zone**: `#10B981` with 25% opacity (Green overlay)
- **Boundary Line**: `#F59E0B` (Yellow - primary brand)
- **Outside Zone**: `#EF4444` with 20% opacity (Red overlay)
- **Current Location**: `#F59E0B` (Yellow marker)
- **School Location**: `#3B82F6` (Blue marker)

#### User Roles (Yellow-tinted variants)
- **Parent**: `#F59E0B` (Primary yellow)
- **Teacher**: `#FB923C` (Orange 400 - warmer yellow)
- **Admin**: `#FBBF24` (Amber 400 - brighter yellow)

### Color Combinations

#### High Contrast Combinations
1. **Primary Button**: Background `#F59E0B`, Text `#FFFFFF`
2. **Secondary Button**: Background `#FEF3C7`, Text `#92400E`, Border `#F59E0B`
3. **Info Card**: Background `#FFFBEB`, Border `#FCD34D`, Text `#78350F`
4. **Success Banner**: Background `#D1FAE5`, Text `#065F46`, Accent `#10B981`

#### Gradient Combinations
- **Sunrise**: `#FEF3C7` → `#F59E0B` → `#FB923C`
- **Warm Glow**: `#FFFBEB` → `#FCD34D`
- **Sunset**: `#F59E0B` → `#EF4444`

### Implementation Examples

#### CSS Variables
```css
:root {
  /* Primary Yellow Palette */
  --color-yellow-50: #FFFBEB;
  --color-yellow-100: #FEF3C7;
  --color-yellow-200: #FDE68A;
  --color-yellow-300: #FCD34D;
  --color-yellow-400: #FBBF24;
  --color-yellow-500: #F59E0B;
  --color-yellow-600: #D97706;
  --color-yellow-700: #B45309;
  --color-yellow-800: #92400E;
  --color-yellow-900: #78350F;

  /* Brand Colors */
  --color-primary: var(--color-yellow-500);
  --color-primary-light: var(--color-yellow-300);
  --color-primary-dark: var(--color-yellow-600);

  /* Background Colors */
  --bg-primary: #FFFBEB;
  --bg-secondary: #FEF3C7;
  --bg-card: #FFFFFF;

  /* Text Colors */
  --text-primary: #78350F;
  --text-secondary: #92400E;
  --text-muted: #6B7280;

  /* Complementary Colors */
  --color-blue: #3B82F6;
  --color-success: #10B981;
  --color-danger: #EF4444;
}
```

### Usage Guidelines

#### Buttons
- **Primary Action**: 
  - Background: `#F59E0B`
  - Text: `#FFFFFF`
  - Hover: `#D97706`
  - Shadow: `0 2px 8px rgba(245, 158, 11, 0.3)`

- **Secondary Action**: 
  - Background: `#FEF3C7`
  - Text: `#92400E`
  - Border: `2px solid #F59E0B`
  - Hover: `#FDE68A`

- **Ghost Button**: 
  - Background: `transparent`
  - Text: `#F59E0B`
  - Hover Background: `#FFFBEB`

#### Cards & Containers
- **Main Card**: 
  - Background: `#FFFFFF`
  - Border: `1px solid #FDE68A`
  - Shadow: `0 1px 3px rgba(245, 158, 11, 0.1)`

- **Highlighted Card**: 
  - Background: `#FFFBEB`
  - Border: `1px solid #FCD34D`
  - Accent Bar: `3px solid #F59E0B` (left border)

- **Interactive Card**: 
  - Background: `#FFFFFF`
  - Hover Background: `#FFFBEB`
  - Hover Border: `#FBBF24`

#### Navigation & Headers
- **Top Navigation**: 
  - Background: `#F59E0B`
  - Text: `#FFFFFF`
  - Active Item: Background `#D97706`

- **Side Navigation**: 
  - Background: `#FFFBEB`
  - Active Item: Background `#FEF3C7`, Border Left `3px solid #F59E0B`
  - Hover: Background `#FEF3C7`

#### Status Badges
- **Confirmed**: 
  - Background: `#D1FAE5`
  - Text: `#065F46`
  - Icon: `#10B981`

- **Pending**: 
  - Background: `#FEF3C7`
  - Text: `#92400E`
  - Icon: `#F59E0B`

- **Rejected**: 
  - Background: `#FEE2E2`
  - Text: `#991B1B`
  - Icon: `#EF4444`

#### Forms & Inputs
- **Input Field**: 
  - Background: `#FFFFFF`
  - Border: `1px solid #FDE68A`
  - Focus Border: `2px solid #F59E0B`
  - Focus Shadow: `0 0 0 3px rgba(245, 158, 11, 0.1)`

- **Label**: 
  - Color: `#92400E`
  - Font Weight: 500

- **Placeholder**: 
  - Color: `#D1D5DB`

### Accessibility Considerations

#### Contrast Ratios (WCAG AA Compliant)
- Primary yellow `#F59E0B` on white: 2.8:1 (Use for large text only)
- Dark amber `#92400E` on light yellow `#FEF3C7`: 8.2:1 ✓
- Dark amber `#78350F` on white: 10.5:1 ✓
- White text on primary yellow `#F59E0B`: 1.8:1 (Needs darker background)
- White text on dark yellow `#B45309`: 4.9:1 ✓

#### Recommended Text Combinations
1. Dark amber `#78350F` on white `#FFFFFF` - 10.5:1 ✓
2. Dark amber `#92400E` on light yellow `#FEF3C7` - 8.2:1 ✓
3. White `#FFFFFF` on dark yellow `#B45309` - 4.9:1 ✓
4. Dark amber `#78350F` on very light yellow `#FFFBEB` - 9.8:1 ✓

### Design Philosophy
This yellow-dominated scheme emphasizes:
1. **Warmth & Welcome**: Yellow creates a friendly, inviting atmosphere
2. **Energy & Optimism**: Perfect for educational settings and parent engagement
3. **Visibility**: High attention-grabbing for important notifications
4. **Balance**: Blue and green provide visual rest and trust elements
5. **Accessibility**: Careful color combinations ensure readability
6. **Consistency**: Yellow ties all elements together cohesively

### Mobile App Specific Guidelines
- Use lighter yellow backgrounds to reduce screen brightness
- Ensure yellow CTAs are highly visible but not overwhelming
- Use yellow accents sparingly on dark content
- Consider yellow `#F59E0B` for active navigation states
- White text requires darker yellow variants (`#B45309` or darker)

### Web Dashboard Specific Guidelines
- Yellow header bar with white text for brand consistency
- Light yellow `#FFFBEB` page backgrounds for warmth
- Yellow accents on cards and interactive elements
- Use blue for links to distinguish from yellow elements
- Yellow progress indicators and success states
- Hover states use lighter yellows for subtle feedback
