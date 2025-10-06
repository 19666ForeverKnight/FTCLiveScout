# FTC Live Scout Design System

## Color Scheme
The app now features a unified **Blue and Golden** color scheme across all pages and components.

### Primary Colors
- **Blue**: `#2563eb` (blue-600) - Primary brand color
- **Golden/Amber**: `#f59e0b` (amber-500/600) - Secondary accent color

### Color Usage

#### Gradients
```tsx
// Primary gradients (logos, headers, buttons)
from-blue-600 to-amber-500
from-blue-600 to-amber-600
from-blue-500 to-amber-600

// Background gradients
from-blue-50 via-amber-50/30 to-yellow-50/30
from-gray-50 via-blue-50/30 to-amber-50/30

// Dark mode
dark:from-blue-950/20 dark:via-blue-950/20 dark:to-amber-950/20
```

#### Focus States
```tsx
focus:ring-2 focus:ring-blue-500 focus:border-blue-500
dark:focus:ring-blue-400
```

#### Active States
```tsx
bg-blue-50 dark:bg-blue-900/20
text-blue-700 dark:text-blue-300
```

#### Hover States
```tsx
hover:border-blue-300 dark:hover:border-blue-700
hover:from-blue-700 hover:to-amber-700
```

## Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Font Weights**: 
  - `font-bold` (700) - Headers, important text
  - `font-semibold` (600) - Buttons, labels
  - `font-medium` (500) - Body text emphasis

### Text Sizes
- **Page Headers**: `text-4xl` (36px)
- **Section Headers**: `text-2xl` (24px)
- **Card Headers**: `text-lg` (18px)
- **Body Text**: `text-base` (16px)
- **Small Text**: `text-sm` (14px)

## Spacing
- **Container Padding**: `py-6 px-4 sm:px-6 lg:px-8`
- **Card Padding**: `p-6` or `p-8`
- **Input Padding**: `py-3.5 px-8` or `px-4 py-3`
- **Gap Values**: `gap-2`, `gap-3`, `gap-4`, `gap-6`
- **Vertical Spacing**: `space-y-5`, `space-y-6`, `space-y-8`

## Border Radius
- **Extra Large**: `rounded-3xl` (24px) - Logos, hero containers
- **Large**: `rounded-2xl` (16px) - Cards, major sections
- **Medium**: `rounded-xl` (12px) - Inputs, buttons, smaller cards
- **Small**: `rounded-lg` (8px) - Icons, small elements

## Shadows
- **Extra Large**: `shadow-2xl` - Hero elements, modals
- **Large**: `shadow-xl` - Major cards, buttons on hover
- **Medium**: `shadow-lg` - Default cards, elevated elements
- **Small**: `shadow-md` - Subtle elevation
- **Ring Shadows**: `ring-4 ring-blue-500/30` - Selected states

## Effects
- **Backdrop Blur**: `backdrop-blur-xl` - Glass morphism effect
- **Transitions**: `transition-all duration-200` - Universal smooth transitions
- **Hover Scale**: `hover:scale-110` - Interactive icon animations
- **Transform**: `hover:-translate-x-1` - Directional hover effects

## Component Patterns

### Glass Morphism Cards
```tsx
className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 p-8"
```

### Icon-Enhanced Inputs
```tsx
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
    <svg className="w-5 h-5 text-gray-400">...</svg>
  </div>
  <input className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
</div>
```

### Primary Buttons
```tsx
className="bg-gradient-to-r from-blue-600 to-amber-500 hover:from-blue-700 hover:to-amber-600 text-white font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
```

### Gradient Text
```tsx
className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 dark:from-blue-400 dark:to-amber-400 bg-clip-text text-transparent"
```

### Gradient Icon Containers
```tsx
className="w-16 h-16 bg-gradient-to-br from-blue-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg"
```

### Alert/Info Boxes
```tsx
// Warning/Info
className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-l-4 border-amber-500 rounded-xl p-5"

// Error
className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-l-4 border-red-500 rounded-xl p-4"
```

### Loading Spinner
```tsx
className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
```

## Page-Specific Elements

### Login/Signup Pages
- Background: Subtle blue-to-amber gradient
- Logo: Blue-to-amber gradient circle with shadow
- Form: Glass morphism container
- Inputs: Icon-enhanced with blue focus rings
- Button: Blue-to-amber gradient

### Dashboard
- Stats cards: Blue-to-amber gradients
- Event header: Blue-to-amber gradient icon
- Activity feed: Consistent blue accents

### Pit Scouts
- Page header: Blue-to-amber gradient
- Team cards: Blue-to-amber gradient boxes showing pit numbers
- Form inputs: Blue focus rings
- Submit button: Blue-to-amber gradient

### Events Page
- Background: Blue-to-amber gradient
- Event cards: Blue-to-amber gradient icons
- Create button: Blue-to-amber gradient

### Navigation
- Active state: Blue background with blue text
- Icons: Blue on active state
- Logo: Blue text

## Dark Mode Support
All components include comprehensive dark mode variants:
- Backgrounds: `dark:bg-gray-900`, `dark:bg-gray-950`
- Borders: `dark:border-gray-800`, `dark:border-gray-700`
- Text: `dark:text-white`, `dark:text-gray-400`
- Gradients: Adjusted opacity for dark mode (`dark:from-blue-950/20`)

## Accessibility
- All interactive elements have `hover:` and `focus:` states
- Buttons include `disabled:` states with reduced opacity
- Form inputs have proper labels and placeholders
- Color contrast meets WCAG 2.1 AA standards
- Touch targets are minimum 44x44px (`touch-manipulation`)

## Migration Complete ✅
All pages and components have been migrated from the previous purple/pink color scheme to the new blue/golden theme:
- ✅ Login & Signup pages
- ✅ Navigation component
- ✅ Dashboard
- ✅ Events page
- ✅ Pit Scout form & list
- ✅ Match Scout pages
- ✅ Profile page
- ✅ All modal components
- ✅ Floating action buttons
- ✅ Loading spinners

## Notes
- All color classes now use `blue-*` instead of `purple-*`
- All secondary colors now use `amber-*` instead of `pink-*`
- Indigo and violet colors have been replaced with amber
- Design system maintains consistency across all 36 .tsx files
