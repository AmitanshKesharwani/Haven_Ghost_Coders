# Mobile Overlay Options

## Current Setting (Very Light)
```tsx
className="fixed inset-0 bg-gray-900 bg-opacity-10 z-40 md:hidden"
```
- **Effect**: Very subtle gray overlay (10% opacity)
- **Purpose**: Indicates sidebar is open, clickable to close

## Alternative Options

### 1. **No Overlay** (Completely Transparent)
```tsx
className="fixed inset-0 bg-transparent z-40 md:hidden"
```
- **Effect**: No visual overlay, just clickable area
- **Pros**: No visual interference
- **Cons**: Less obvious that sidebar is open

### 2. **Ultra Light** (5% opacity)
```tsx
className="fixed inset-0 bg-gray-900 bg-opacity-5 z-40 md:hidden"
```
- **Effect**: Barely visible overlay
- **Good for**: Minimal visual indication

### 3. **Light Blur** (No color, just blur)
```tsx
className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
```
- **Effect**: Subtle blur effect without darkening
- **Modern**: iOS-style overlay

### 4. **White Overlay** (Alternative to dark)
```tsx
className="fixed inset-0 bg-white bg-opacity-20 z-40 md:hidden"
```
- **Effect**: Light white overlay instead of dark
- **Good for**: Light themes

## Quick Fix Options

If you want to change it right now, replace the overlay className in `AppRouter.tsx` with any of the above options.

**Current location**: Line ~95 in `src/components/AppRouter.tsx`

## Recommendation

The current setting (10% gray) should be very subtle. If it's still too dark, try option #2 (5% opacity) or #3 (blur only).