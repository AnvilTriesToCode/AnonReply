import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        ct: {
          dark: '#1e1e2f',
          card: '#27293d',
          cardHover: '#2e3048',
          border: 'rgba(255, 255, 255, 0.08)',
          pink: '#e14eca',
          purple: '#ba54f5',
          blue: '#1d8cf8',
          cyan: '#11cdef',
          green: '#00f2c3',
          orange: '#ff8d72',
          red: '#fd5d93',
          yellow: '#ffb236',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'ct-purple': '0 10px 25px -5px rgba(186, 84, 245, 0.35)',
        'ct-pink': '0 10px 25px -5px rgba(225, 78, 202, 0.35)',
        'ct-green': '0 10px 25px -5px rgba(0, 242, 195, 0.35)',
        'ct-orange': '0 10px 25px -5px rgba(255, 141, 114, 0.35)',
        'ct-blue': '0 10px 25px -5px rgba(29, 140, 248, 0.35)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
