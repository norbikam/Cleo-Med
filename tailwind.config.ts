import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:      ["var(--font-jost)", "system-ui", "sans-serif"],
        serif:     ["var(--font-cormorant)", "Georgia", "serif"],
        display:   ["var(--font-cinzel)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        sm:   "2px",
        DEFAULT: "4px",
        md:   "6px",
        lg:   "8px",
        xl:   "10px",
        "2xl": "12px",
        full: "9999px",
      },
      colors: {
        navy:    "var(--navy)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        border:  "var(--border)",
        ink:     "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        gold:    "var(--gold)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
    },
  },
  plugins: [],
};

export default config;
