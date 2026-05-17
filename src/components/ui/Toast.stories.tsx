import type { Meta, StoryObj } from "@storybook/react";
import { Toast, ToastProvider, ToastViewport } from "./Toast";

const meta = {
  title: "Primitives/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <ToastProvider swipeDirection="right" duration={Infinity}>
        <div className="min-h-[240px] min-w-[420px]">
          <Story />
        </div>
        <ToastViewport />
      </ToastProvider>
    ),
  ],
  args: {
    open: true,
    variant: "info",
    title: "Inference complete",
    description: "Stream finished cleanly · 412 tokens in 1.84s.",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warn", "danger"],
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { variant: "info" } };

export const Success: Story = {
  args: {
    variant: "success",
    title: "Deployment promoted",
    description: "Canary at 25% on us-east-1.",
  },
};

export const Warn: Story = {
  args: {
    variant: "warn",
    title: "Degraded throughput",
    description: "Tokens/sec dropped below 12 — investigate.",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    title: "Rollout failed",
    description: "p99 spiked 4× over baseline. Auto-rollback initiated.",
  },
};
