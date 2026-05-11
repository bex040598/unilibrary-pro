import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08172e",
        panel: "#0f2240",
        border: "#dbe2ee",
        mist: "#f4f7fb",
        emerald: "#0f9f6e",
        cyan: "#15b7d6",
        gold: "#c79b2d",
        danger: "#c2410c"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(8, 23, 46, 0.08)"
      },
      backgroundImage: {
        "mesh-academic":
          "radial-gradient(circle at top left, rgba(21,183,214,0.18), transparent 32%), radial-gradient(circle at right, rgba(199,155,45,0.14), transparent 28%), linear-gradient(180deg, rgba(8,23,46,1) 0%, rgba(12,31,61,1) 100%)"
      },
      animation: {
        pulseline: "pulseline 2.1s linear infinite",
        float: "float 6s ease-in-out infinite"
      },
      keyframes: {
        pulseline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(250%)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
