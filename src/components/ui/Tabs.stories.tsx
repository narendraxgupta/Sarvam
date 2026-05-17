import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./Tabs";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreePanes: Story = {
  render: () => (
    <Tabs defaultValue="prompt" className="w-[480px]">
      <TabsList>
        <TabsTrigger value="prompt">Prompt</TabsTrigger>
        <TabsTrigger value="stream">Stream</TabsTrigger>
        <TabsTrigger value="diag">Diagnostics</TabsTrigger>
      </TabsList>
      <TabsContent value="prompt">
        <div className="hx-surface p-4 text-sm text-ink-muted">
          Editorial composition · prompt input lives here.
        </div>
      </TabsContent>
      <TabsContent value="stream">
        <div className="hx-surface p-4 text-sm text-ink-muted">
          Token-by-token SSE stream output.
        </div>
      </TabsContent>
      <TabsContent value="diag">
        <div className="hx-surface p-4 text-sm text-ink-muted">
          TTFT, tokens/sec, byte counter, retry chain.
        </div>
      </TabsContent>
    </Tabs>
  ),
};
