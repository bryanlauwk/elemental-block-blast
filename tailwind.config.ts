import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Block Blast Game Colors
        game: {
          "bg-start": "hsl(var(--game-bg-start))",
          "bg-end": "hsl(var(--game-bg-end))",
          "bg-center": "hsl(var(--game-bg-center))",
          "grid-dark": "hsl(var(--game-grid-dark))",
          "grid-darker": "hsl(var(--game-grid-darker))",
          "grid-border": "hsl(var(--game-grid-border))",
          "grid-line": "hsl(var(--game-grid-line))",
          "cell": "hsl(var(--game-cell))",
          "cell-hover": "hsl(var(--game-cell-hover))",
          "tray": "hsl(var(--game-tray))",
          "tray-dark": "hsl(var(--game-tray-dark))",
          "accent": "hsl(var(--game-accent))",
          "score-start": "hsl(var(--game-score-start))",
          "score-mid": "hsl(var(--game-score-mid))",
          "score-end": "hsl(var(--game-score-end))",
          "text-muted": "hsl(var(--game-text-muted))",
          "glow": "hsl(var(--game-glow))",
          "icon-bg": "hsl(var(--game-icon-bg))",
          "icon-border": "hsl(var(--game-icon-border))",
        },
        // Neon Arcade palette
        neon: {
          "bg-deep": "hsl(var(--neon-bg-deep))",
          "bg-mid": "hsl(var(--neon-bg-mid))",
          "bg-glow": "hsl(var(--neon-bg-glow))",
          mint: "hsl(var(--neon-mint))",
          magenta: "hsl(var(--neon-magenta))",
          cyan: "hsl(var(--neon-cyan))",
          violet: "hsl(var(--neon-violet))",
          amber: "hsl(var(--neon-amber))",
        },
        // Pixar Toy Box landing palette
        pixar: {
          navy: "hsl(var(--pixar-navy))",
          "navy-deep": "hsl(var(--pixar-navy-deep))",
          red: "hsl(var(--pixar-red))",
          "red-deep": "hsl(var(--pixar-red-deep))",
          yellow: "hsl(var(--pixar-yellow))",
          "yellow-deep": "hsl(var(--pixar-yellow-deep))",
          blue: "hsl(var(--pixar-blue))",
          "blue-deep": "hsl(var(--pixar-blue-deep))",
          mint: "hsl(var(--pixar-mint))",
        },
      },
      backgroundImage: {
        "gradient-neon": "var(--gradient-neon)",
        "gradient-stage": "var(--gradient-stage)",
        "gradient-pixar-stage": "var(--gradient-pixar-stage)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "-apple-system", "sans-serif"],
        sans: ["'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        "neon-mint": "var(--shadow-neon-mint)",
        "neon-magenta": "var(--shadow-neon-magenta)",
        "hud-glass": "var(--shadow-hud-glass)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
