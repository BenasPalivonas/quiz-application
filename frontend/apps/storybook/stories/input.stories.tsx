import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from '@repo/ui/input'

const meta = {
  title: 'Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
  },
  args: {
    label: 'Email',
    name: 'email',
    type: 'email',
    placeholder: 'you@example.com',
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Password: Story = {
  args: {
    label: 'Password',
    name: 'password',
    type: 'password',
    placeholder: undefined,
  },
}

export const WithErrors: Story = {
  args: {
    errors: ['Email is required', 'Email must be a valid address'],
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'you@example.com',
  },
}
