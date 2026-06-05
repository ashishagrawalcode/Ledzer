import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Ledzer brand
        teal: {
          DEFAULT: '#14F195',
          dark: '#0F9F6E',
          hover: '#1FFFB0',
          50: 'rgba(20,241,149,0.05)',
          100: 'rgba(20,241,149,0.1)',
          200: 'rgba(20,241,149,0.2)',
          500: '#14F195',
          600: '#0F9F6E',
        },
        navy: {
          DEFAULT: '#050816',
          50: '#0B1020',
          100: '#0F172A',
          200: '#131D34',
          300: '#1E293B',
        },
        // Status
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 40px rgba(20,241,149,0.12)',
        'glow-md': '0 0 60px rgba(20,241,149,0.18)',
        'glow-sm': '0 0 20px rgba(20,241,149,0.08)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
        card: '0 8px 24px rgba(0,0,0,0.18)',
        'card-hover': '0 16px 40px rgba(0,0,0,0.25)',
        nav: '0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.2)',
      },
      backgroundImage: {
        'teal-gradient': 'linear-gradient(135deg, #14F195 0%, #0F9F6E 100%)',
        'navy-gradient': 'linear-gradient(180deg, #050816 0%, #0B1020 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(20,241,149,0.03) 0%, transparent 50%)',
        'hero-radial': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(20,241,149,0.15) 0%, transparent 70%)',
        'hero-mesh': `
          radial-gradient(at 20% 20%, rgba(20,241,149,0.08) 0%, transparent 50%),
          radial-gradient(at 80% 80%, rgba(59,130,246,0.06) 0%, transparent 50%),
          radial-gradient(at 50% 50%, rgba(20,241,149,0.03) 0%, transparent 70%)
        `,
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease forwards',
        'fade-up': 'fadeUp 0.3s ease forwards',
        'scale-in': 'scaleIn 0.2s ease forwards',
        'slide-down': 'slideDown 0.2s ease forwards',
        'slide-up': 'slideUp 0.2s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'counter': 'counter 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(20,241,149,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(20,241,149,0.25)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      height: {
        nav: '64px',
      },
      spacing: {
        nav: '64px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config