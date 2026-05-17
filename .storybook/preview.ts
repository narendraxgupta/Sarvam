import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "helix-dark",
      values: [
        { name: "helix-dark", value: "#0a0e14" },
        { name: "helix-light", value: "#f5f8ff" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story, ctx) => {
      const bg = ctx.globals.backgrounds?.value ?? "#0a0e14";
      const isDark = bg === "#0a0e14";
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      return Story();
    },
  ],
};

export default preview;
