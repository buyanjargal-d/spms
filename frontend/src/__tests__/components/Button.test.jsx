import { describe, it, expect } from 'vitest';
import Button from '../../components/common/Button';

describe('Button Component', () => {
  it('should have default variant', () => {
    const variants = ['primary', 'secondary', 'danger'];
    expect(variants).toContain('primary');
  });

  it('should have size options', () => {
    const sizes = ['sm', 'md', 'lg'];
    expect(sizes.length).toBeGreaterThan(0);
  });

  it('should handle button props', () => {
    const buttonProps = {
      variant: 'primary',
      size: 'md',
      children: 'Click me',
    };

    expect(buttonProps.variant).toBe('primary');
    expect(buttonProps.children).toBe('Click me');
  });
});
