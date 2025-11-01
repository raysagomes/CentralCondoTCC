import { describe, it, expect } from '@jest/globals';

describe('Example Test', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string operations', () => {
    const message = 'Hello World';
    expect(message).toContain('World');
  });
});