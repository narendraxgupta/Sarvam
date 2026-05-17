import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./Slider";

const meta = {
  title: "Primitives/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Temperature: Story = {
  render: () => {
    const Inner = () => {
      const [v, setV] = useState([0.4]);
      return (
        <div className="w-[320px] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-ink-muted">Temperature</span>
            <span className="font-mono tabular-nums text-ink">
              {v[0].toFixed(2)}
            </span>
          </div>
          <Slider value={v} onValueChange={setV} min={0} max={1} step={0.05} />
        </div>
      );
    };
    return <Inner />;
  },
};

export const MaxTokens: Story = {
  render: () => {
    const Inner = () => {
      const [v, setV] = useState([1024]);
      return (
        <div className="w-[320px] space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-ink-muted">Max tokens</span>
            <span className="font-mono tabular-nums text-ink">{v[0]}</span>
          </div>
          <Slider value={v} onValueChange={setV} min={128} max={4096} step={128} />
        </div>
      );
    };
    return <Inner />;
  },
};
