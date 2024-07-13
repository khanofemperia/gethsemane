import type { Config } from "tailwindcss";

const customColors = {
  gold: "#af8100",
  amber: {
    DEFAULT: "#e89300",
    dimmed: "#d38600",
  },
  red: {
    DEFAULT: "#ee3b3b",
    dimmed: "#ec2323",
  },
  green: {
    DEFAULT: "#009e00",
  },
  blue: {
    DEFAULT: "#0a5ddc",
    dimmed: "#084db5",
  },
  gray: "#6c6c6c",
  black: "#262626",
  lightgray: {
    DEFAULT: "#f0f0f0",
    dimmed: "#e5e5e5",
  },
  "glass-black": "#00000033",
};

const config: Config = {
  content: [
    "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: customColors,
      stroke: {
        gray: customColors.gray,
      },
      fill: {
        gray: customColors.gray,
      },
      textColor: {
        gray: customColors.gray,
      },
      borderColor: {
        DEFAULT: "#dcdfe4",
      },
      boxShadow: {
        DEFAULT: "0px 1.8px 4px rgba(0,0,0,0.2), 0px 0px 3px rgba(0,0,0,0.1)",
        "thick-bottom": "#21212140 0px 3px 2px 0px, #E5E5E5 0px 0px 1px 1px",
        dropdown: "#00000040 0px 4px 8px -2px, #00000014 0px 0px 0px 1px",
      },
    },
  },
  plugins: [],
};

export default config;
