import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                'poppins': ['Poppins', 'sans-serif'],
                'roboto': ['Roboto', 'sans-serif'],
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                    glow: 'hsl(var(--primary-glow))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                'gulf-blue': {
                    50: 'hsl(var(--gulf-blue-50))',
                    100: 'hsl(var(--gulf-blue-100))',
                    300: 'hsl(var(--gulf-blue-300))',
                    700: 'hsl(var(--gulf-blue-700))',
                    950: 'hsl(var(--gulf-blue-950))'
                },
                'turquoise-blue': {
                    50: 'hsl(var(--turquoise-blue-50))',
                    200: 'hsl(var(--turquoise-blue-200))',
                    400: 'hsl(var(--turquoise-blue-400))'
                },
                lilac: {
                    50: 'hsl(var(--lilac-50))',
                    100: 'hsl(var(--lilac-100))',
                    DEFAULT: 'hsl(var(--lilac))'
                },
                sky: {
                    100: 'hsl(var(--sky-100))',
                    200: 'hsl(var(--sky-200))',
                    DEFAULT: 'hsl(var(--sky))'
                },
                emerald: {
                    50: 'hsl(var(--emerald-50))',
                    200: 'hsl(var(--emerald-200))',
                    500: 'hsl(var(--emerald-500))'
                },
                neutral: {
                    50: 'hsl(var(--neutral-50))',
                    100: 'hsl(var(--neutral-100))',
                    200: 'hsl(var(--neutral-200))'
                },
                'woodsmoke': {
                    950: 'hsl(var(--woodsmoke-950))'
                },
                'slate-600': 'hsl(var(--slate-600))',
                'lines': 'hsl(var(--lines))',
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-20px) rotate(10deg)' }
                },
                'slideRight': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' }
                },
                'slideLeft': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' }
                },
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'float': 'float 6s ease-in-out infinite',
                'slideRight': 'slideRight 15s linear infinite',
                'slideLeft': 'slideLeft 12s linear infinite',
                'fade-in': 'fade-in 0.3s ease-out'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
