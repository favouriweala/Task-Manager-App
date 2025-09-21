/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Zyra Design System Colors
        zyra: {
          primary: '#4F46E5',      // Indigo Blue
          secondary: '#9333EA',     // Purple
          accent: '#06B6D4',        // Cyan
          background: '#F8FAFC',    // Soft off-white
          surface: '#FFFFFF',       // White
          card: '#FFFFFF',          // White
          border: '#E2E8F0',        // Light gray border
          text: {
            primary: '#1E293B',     // Dark gray
            secondary: '#64748B',   // Medium gray
          },
          success: '#10B981',       // Green
          warning: '#F59E0B',       // Yellow
          danger: '#EF4444',        // Red
          // Dark mode colors
          dark: {
            background: '#0F172A',   // Dark slate
            surface: '#1E293B',      // Slate
            card: '#334155',         // Slate gray
            border: '#475569',       // Dark border
            text: {
              primary: '#F1F5F9',   // White
              secondary: '#CBD5E1', // Light gray
            }
          }
        },
        // Keep existing shadcn/ui color system for compatibility
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Poppins', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)'],
        poppins: ['Poppins', 'sans-serif'],
      },
      fontWeight: {
        'normal': '400',
        'semibold': '600',
      },
      backgroundImage: {
        'zyra-gradient': 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
        'zyra-gradient-hover': 'linear-gradient(135deg, #3730A3 0%, #7C2D92 100%)',
      },
      boxShadow: {
        'zyra-card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'zyra-card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}