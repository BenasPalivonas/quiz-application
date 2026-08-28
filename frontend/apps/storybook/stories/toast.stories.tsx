import type { Meta, StoryObj } from "@storybook/react-vite";

import { Toast } from "@repo/ui/toast";

const meta = {
  title: "Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    message:
      "Some questions or choices are missing information. Please review every question before creating the quiz.",
    onDismiss: () => {},
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
