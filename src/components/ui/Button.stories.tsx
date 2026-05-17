import type { Meta, StoryObj } from "@storybook/react";
import { Play, Sparkles, Trash2 } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Run inference",
  },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "accent",
        "ghost",
        "outline",
        "subtle",
        "secondary",
        "danger",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon", "icon-sm"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accent: Story = {
  args: { variant: "accent" },
};

export const Primary: Story = {
  args: { variant: "primary" },
};

export const Outline: Story = {
  args: { variant: "outline" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost action" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Rollback" },
};

export const WithIcon: Story = {
  args: {
    variant: "accent",
    children: (
      <>
        <Play className="h-3.5 w-3.5 fill-current" />
        <span>Run</span>
      </>
    ),
  },
};

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3 p-6">
      <Button variant="accent">
        <Sparkles className="h-3.5 w-3.5" /> Accent
      </Button>
      <Button variant="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="danger">
        <Trash2 className="h-3.5 w-3.5" /> Danger
      </Button>
    </div>
  ),
};
