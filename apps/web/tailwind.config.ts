import type { Config } from "tailwindcss";

const config: Config = {
  // Class-based dark variants: components like the theme toggle scope
  // `dark:` to their own `.dark` class instead of following the OS setting.
  // (App theming itself stays on `html[data-theme]` — see globals.css.)
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
