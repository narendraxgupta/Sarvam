import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./Switch";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultChecked: false },
};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const LabelledRow: Story = {
  render: () => {
    const Inner = () => {
      const [on, setOn] = useState(true);
      return (
        <label className="flex items-center gap-3 text-sm text-ink">
          <Switch checked={on} onCheckedChange={setOn} />
          <span>{on ? "Diagnostics streaming" : "Diagnostics paused"}</span>
        </label>
      );
    };
    return <Inner />;
  },
};
