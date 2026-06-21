
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
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        foreground: "hsl(var(--foreground))",
        // Two-color theme: dark navy + white
        primary: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
        accent: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        highlight: "#0F172A",
        bright: "#0F172A",
        background: "#FFFFFF",
        "text-primary": "#0F172A",
        "text-secondary": "#0F172A",
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "vibrate-1": {
          "0%,100%": {
            transform: "translate(0)",
          },
          "10%": {
            transform: "translate(-2px, -2px)",
          },
          "20%": {
            transform: "translate(2px, -2px)",
          },
          "30%": {
            transform: "translate(-2px, 2px)",
          },
          "40%": {
            transform: "translate(2px, 2px)",
          },
          "50%": {
            transform: "translate(-2px, -2px)",
          },
          "60%": {
            transform: "translate(2px, -2px)",
          },
          "70%": {
            transform: "translate(-2px, 2px)",
          },
          "80%": {
            transform: "translate(-2px, -2px)",
          },
          "90%": {
            transform: "translate(2px, -2px)",
          },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "rotate-scale-up-diag-2": {
          "0%": {
            transform: "scale(1) rotateX(0deg) rotateY(0deg)",
          },
          "50%": {
            transform: "scale(1.5) rotateX(-180deg) rotateY(0deg)",
          },
          "100%": {
            transform: "scale(1) rotateX(-360deg) rotateY(-360deg)",
          },
        },
        "flip-scale-up-hor": {
          "0%": {
            transform: "scale(1) rotateX(0deg)",
          },
          "50%": {
            transform: "scale(2.5) rotateX(-90deg)",
          },
          "100%": {
            transform: "scale(1) rotateX(0deg)",
          },
        },
        "swirl-in-fwd": {
          "0%": {
            transform: "rotate(-540deg) scale(0)",
            opacity: "0",
          },
          "100%": {
            transform: "rotate(0deg) scale(1)",
            opacity: "1",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) rotate(-15deg)" },
          "50%": { transform: "translateY(-15px) rotate(-15deg)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(15deg)" },
          "50%": { transform: "translateY(-10px) rotate(15deg)" }
        },
        "tracking-in-expand": {
          "0%": {
            letterSpacing: "-0.5em",
            opacity: "0"
          },
          "40%": {
            opacity: "0.6"
          },
          "100%": {
            opacity: "1",
            letterSpacing: "0em"
          }
        },
        "shooting-star": {
          "0%": {
            transform: "translateX(-100px) translateY(-100px)",
            opacity: "0"
          },
          "10%": {
            opacity: "1"
          },
          "90%": {
            opacity: "1"
          },
          "100%": {
            transform: "translateX(100vw) translateY(100vh)",
            opacity: "0"
          }
        },
        "slide-in-left": {
          "0%": { 
            transform: "translateX(-100%)", 
            opacity: "0" 
          },
          "100%": { 
            transform: "translateX(0)", 
            opacity: "1" 
          }
        },
        "slide-in-right": {
          "0%": { 
            transform: "translateX(100%)", 
            opacity: "0" 
          },
          "100%": { 
            transform: "translateX(0)", 
            opacity: "1" 
          }
        },
        "firework": {
          "0%": {
            transform: "scale(0.1)",
            opacity: "1"
          },
          "25%": {
            transform: "scale(0.5)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(1)",
            opacity: "0"
          }
        },
        "firework-particle": {
          "0%": {
            transform: "translateY(0) scale(1)",
            opacity: "1"
          },
          "100%": {
            transform: "translateY(-200px) scale(0)",
            opacity: "0"
          }
        },
        "sparkle": {
          "0%, 100%": {
            opacity: "0",
            transform: "scale(0)"
          },
          "50%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "parallax-float": {
          "0%, 100%": { 
            transform: "translateY(0px) translateZ(0) rotateX(0deg)",
          },
          "50%": { 
            transform: "translateY(-30px) translateZ(50px) rotateX(2deg)",
          }
        },
        "parallax-drift": {
          "0%": { 
            transform: "translateX(0px) translateY(0px) scale(1)",
          },
          "25%": { 
            transform: "translateX(10px) translateY(-5px) scale(1.02)",
          },
          "50%": { 
            transform: "translateX(0px) translateY(-10px) scale(1.01)",
          },
          "75%": { 
            transform: "translateX(-10px) translateY(-5px) scale(1.02)",
          },
          "100%": { 
            transform: "translateX(0px) translateY(0px) scale(1)",
          }
        },
        "genz-bounce": {
          "0%, 20%, 50%, 80%, 100%": {
            transform: "translateY(0) scale(1)"
          },
          "40%": {
            transform: "translateY(-30px) scale(1.05)"
          },
          "60%": {
            transform: "translateY(-15px) scale(1.02)"
          }
        },
        "smooth-reveal": {
          "0%": {
            opacity: "0",
            transform: "translateY(40px) scale(0.95) rotateX(10deg)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0px) scale(1) rotateX(0deg)"
          }
        },
        "neon-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.3)"
          },
          "50%": {
            boxShadow: "0 0 40px hsl(var(--primary) / 0.8), 0 0 60px hsl(var(--primary) / 0.4)"
          }
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "vibrate-1": "vibrate-1 0.3s linear infinite both",
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "rotate-scale-up-diag-2": "rotate-scale-up-diag-2 0.7s linear both",
        "flip-scale-up-hor": "flip-scale-up-hor 0.5s linear both",
        "swirl-in-fwd": "swirl-in-fwd 0.6s ease-out both",
        "float": "float 3s ease-in-out infinite",
        "float-delayed": "float-delayed 4s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "tracking-in-expand": "tracking-in-expand 0.7s cubic-bezier(0.215, 0.61, 0.355, 1.000) both",
        "shooting-star": "shooting-star 3s linear infinite",
        "slide-in-left": "slide-in-left 0.8s ease-out both",
        "slide-in-right": "slide-in-right 0.8s ease-out both",
        "firework": "firework 2s ease-out infinite",
        "firework-particle": "firework-particle 1s ease-out infinite",
        "sparkle": "sparkle 1.5s ease-in-out infinite",
        "parallax-float": "parallax-float 6s ease-in-out infinite",
        "parallax-drift": "parallax-drift 8s ease-in-out infinite",
        "genz-bounce": "genz-bounce 2s ease-in-out",
        "smooth-reveal": "smooth-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        "neon-pulse": "neon-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: ("tailwindcss-animate"),
} satisfies Config;
