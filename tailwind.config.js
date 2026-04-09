/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Custom primary colors
        primary: {
          50: '#f0fdf4',  // Lightest Green
          100: '#dcfce7', // Lighter Green
          200: '#bbf7d0', // Light Green
          300: '#86efac', // Medium-Light Green
          400: '#4ade80', // Bright Green
          500: '#22c55e', // Your Core Green Accent <-- Main Accent
          600: '#16a34a', // Darker Green
          700: '#15803d', // Dark Green
          800: '#166534', // Very Dark Green
          900: '#14532d', // Darkest Green
          950: '#052e16', // Near Black Green
        },
        // --- Ensure green matches primary ---
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Your Core Green Accent
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // --- Neutrals remain the same (secondary, accent, calm) ---
        secondary: { /* ...keep existing grays... */ },
        accent: { /* ...keep existing blue-grays... */ },
        calm: { /* ...keep existing warm grays... */ },

        // --- Add shadcn/ui theme colors directly ---
        // (Ensure these align with your index.css variables)
        border: 'hsl(var(--border))', // Example: Use CSS vars
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))', // Should map to --mm-bg-primary
        foreground: 'hsl(var(--foreground))', // Should map to --mm-text-primary
        // ... (add other shadcn color variables if needed) ...
        // Example shadcn primary mapping (adjust based on index.css)
        // primary: {
        //   DEFAULT: "hsl(var(--primary))", // Maps to --mm-accent
        //   foreground: "hsl(var(--primary-foreground))", // Text on primary bg
        // },
        // ... (etc for secondary, destructive, muted, accent, popover, card)
      },
      borderRadius: { // Optional: Adjust roundness for shadcn/ui
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      //
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

