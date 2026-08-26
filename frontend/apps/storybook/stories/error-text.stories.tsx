import type { Meta, StoryObj } from '@storybook/react-vite'

import { ErrorText } from '@repo/ui/error-text'

const meta = {
  title: 'ErrorText',
  component: ErrorText,
  tags: ['autodocs'],
  args: {
    children: 'This field is required',
  },
} satisfies Meta<typeof ErrorText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
