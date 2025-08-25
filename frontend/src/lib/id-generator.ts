// Utility for generating consistent IDs to avoid hydration issues
let idCounter = 0;

export function generateId(prefix: string = 'id'): string {
  idCounter++;
  // Use a static timestamp during development to avoid hydration issues
  const timestamp = typeof window !== 'undefined' ? Date.now().toString(36) : 'static';
  return `${prefix}-${idCounter}-${timestamp}`;
}

// For mock data, use a deterministic ID generator
let mockIdCounter = 1000;

export function generateMockId(prefix: string = 'mock'): string {
  mockIdCounter++;
  return `${prefix}-${mockIdCounter}`;
}

// Reset counters (useful for testing)
export function resetIdCounters(): void {
  idCounter = 0;
  mockIdCounter = 1000;
}
