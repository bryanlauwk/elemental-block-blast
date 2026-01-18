// Seeded random number generator using mulberry32 algorithm
// This ensures the same seed produces the same sequence of random numbers
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  // Mulberry32 PRNG - fast and has good statistical properties
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Get a random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Get a random element from an array
  nextElement<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  // Shuffle an array in place using Fisher-Yates
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Generate a seed from a date string (YYYY-MM-DD format)
export function getDateSeed(date: Date = new Date()): number {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Get today's date string in YYYY-MM-DD format
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get a display-friendly date string
export function getDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const inputDate = new Date(dateStr + 'T00:00:00');
  inputDate.setHours(0, 0, 0, 0);
  
  if (inputDate.getTime() === today.getTime()) {
    return 'Today';
  }
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (inputDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}
