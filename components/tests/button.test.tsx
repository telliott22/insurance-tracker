import React from 'react'
import { render, screen } from '../../__tests__/utils/test-utils'
import { Button } from '../ui/button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined()
  })

  it('should apply variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('bg-destructive')
  })

  it('should apply size classes', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button')
    expect(button.className).toContain('h-10')
    expect(button.className).toContain('px-8')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
  })

  it('should match snapshot for default variant', () => {
    const { container } = render(<Button>Default Button</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('should match snapshot for secondary variant', () => {
    const { container } = render(<Button variant="secondary">Secondary Button</Button>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
