import type { Meta, StoryObj } from "@storybook/react-vite";

import { Skeleton } from "@repo/ui/skeleton";

const meta = {
  title: "Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  args: {
    style: { height: 20, width: 200, backgroundColor: "black" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
