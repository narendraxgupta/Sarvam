import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "./Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="accent">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Confirm rollout</DialogTitle>
        <DialogDescription className="mt-2">
          Promote the canary fleet from 25% to 100% across us-east-1?
          This action is reversible for the next 60 seconds.
        </DialogDescription>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost">Cancel</Button>
          <Button variant="accent">Promote</Button>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const Controlled: Story = {
  render: () => {
    const Inner = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)} variant="outline">
            Controlled open
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogTitle>Controlled state</DialogTitle>
              <DialogDescription className="mt-2">
                External React state owns the open/close lifecycle.
              </DialogDescription>
              <div className="mt-5 flex justify-end">
                <Button onClick={() => setOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    };
    return <Inner />;
  },
};
