import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        asana: {
          "bg-app": "#1E1E2A",
          "bg-sidebar": "#1A1A24",
          "bg-content": "#252530",
          "bg-card": "#2E2E3E",
          "bg-card-hover": "#333345",
          "text-primary": "#E8E8F0",
          "text-secondary": "#9090A8",
          "text-placeholder": "#606078",
          "border": "#3A3A50",
          "border-subtle": "#2E2E42",
          blue: "#4986FF",
          "blue-dark": "#3070EE",
          coral: "#F06A6A",
          "coral-dark": "#E05555",
          green: "#4EC9A0",
          red: "#F06A6A"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"]
      },
      borderRadius: {
        card: "8px",
        panel: "6px"
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        cardHover: "0 4px 12px rgba(0,0,0,0.4)",
        buttonPrimary: "0 1px 4px rgba(73,134,255,0.3)"
      },
      spacing: {
        "sidebar": "240px"
      }
    }
  },
  plugins: []
};

export default config;
