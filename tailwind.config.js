/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/web/src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/shared/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: "420px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1920px"
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem"
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
        "3xl": "1800px"
      }
    },
    extend: {
      colors: {
        canvas: {
          950: "#08090b",
          900: "#0d0f14",
          850: "#12151c",
          800: "#191d27"
        },
        stream: {
          red: "#e50914",
          amber: "#f6b445",
          mint: "#4fd1a5",
          cyan: "#38bdf8"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      aspectRatio: {
        poster: "2 / 3",
        backdrop: "16 / 9",
        cinematic: "21 / 9",
        thumbnail: "16 / 10"
      },
      gridTemplateColumns: {
        "video-xs": "repeat(2, minmax(0, 1fr))",
        "video-sm": "repeat(3, minmax(0, 1fr))",
        "video-md": "repeat(4, minmax(0, 1fr))",
        "video-lg": "repeat(5, minmax(0, 1fr))",
        "video-xl": "repeat(6, minmax(0, 1fr))",
        "video-2xl": "repeat(8, minmax(0, 1fr))",
        "video-fluid": "repeat(auto-fill, minmax(min(11rem, 100%), 1fr))"
      },
      spacing: {
        "safe-x": "max(1rem, env(safe-area-inset-left))",
        "safe-y": "max(1rem, env(safe-area-inset-top))"
      },
      maxWidth: {
        "screen-3xl": "1800px",
        content: "1440px",
        player: "1600px"
      },
      minHeight: {
        viewport: "100svh"
      },
      boxShadow: {
        player: "0 24px 80px rgba(0, 0, 0, 0.45)",
        rail: "0 12px 40px rgba(0, 0, 0, 0.28)"
      },
      transitionTimingFunction: {
        "stream-out": "cubic-bezier(0.16, 1, 0.3, 1)"
      },
      zIndex: {
        header: "40",
        player: "50",
        overlay: "60",
        modal: "70"
      }
    }
  },
  plugins: []
};
