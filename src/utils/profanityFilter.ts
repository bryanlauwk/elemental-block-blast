// Profanity filter for player names
// This list contains common profane words and variations

const PROFANITY_LIST = [
  // Common explicit words (keeping list family-friendly in comments)
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'piss', 'dick', 'cock',
  'pussy', 'cunt', 'bastard', 'slut', 'whore', 'fag', 'faggot', 'nigger',
  'nigga', 'retard', 'homo', 'gay', 'lesbian', 'penis', 'vagina', 'anus',
  'porn', 'sex', 'sexy', 'nude', 'naked', 'boob', 'tits', 'titty',
  'dildo', 'vibrator', 'blowjob', 'handjob', 'cumshot', 'orgasm',
  'masturbat', 'wank', 'jerk', 'sperm', 'semen',
  // Hate speech
  'nazi', 'hitler', 'kkk', 'racist',
  // Common leetspeak variations
  'f4ck', 'fck', 'fuk', 'fuq', 'phuck', 'phuk', 'sh1t', 'sht',
  'b1tch', 'btch', 'a55', 'd1ck', 'dck', 'c0ck', 'p0rn',
  // Abbreviated versions
  'stfu', 'gtfo', 'wtf', 'lmfao',
];

// Build a regex pattern for each word that accounts for common substitutions
function buildPattern(word: string): RegExp {
  // Common character substitutions for bypassing filters
  const substitutions: Record<string, string> = {
    'a': '[a@4àáâãäå]',
    'e': '[e3èéêë]',
    'i': '[i1!|ìíîï]',
    'o': '[o0òóôõö]',
    'u': '[uùúûü]',
    's': '[s$5]',
    't': '[t7+]',
    'l': '[l1|]',
    'b': '[b8]',
    'g': '[g9]',
  };

  let pattern = '';
  for (const char of word.toLowerCase()) {
    pattern += substitutions[char] || char;
    // Allow optional separators between characters (for bypasses like "f.u.c.k")
    pattern += '[\\s._-]*';
  }
  
  return new RegExp(pattern, 'i');
}

// Pre-compile patterns for performance
const PROFANITY_PATTERNS = PROFANITY_LIST.map(word => buildPattern(word));

/**
 * Check if a string contains profanity
 * @param text The text to check
 * @returns true if profanity is detected, false otherwise
 */
export function containsProfanity(text: string): boolean {
  if (!text) return false;
  
  // Remove spaces and special characters to catch attempts like "f u c k"
  const normalized = text.toLowerCase().replace(/[\s._-]/g, '');
  
  // Check against simple word list first (faster)
  for (const word of PROFANITY_LIST) {
    if (normalized.includes(word)) {
      return true;
    }
  }
  
  // Check against patterns (catches leetspeak and separators)
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(text)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validate a player name for profanity
 * @param name The player name to validate
 * @returns An object with isValid boolean and optional error message
 */
export function validatePlayerName(name: string): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }
  
  if (name.trim().length > 20) {
    return { isValid: false, error: 'Name must be 20 characters or less' };
  }
  
  // Check for valid characters
  const validNamePattern = /^[a-zA-Z0-9\s_\-!?.]+$/;
  if (!validNamePattern.test(name.trim())) {
    return { isValid: false, error: 'Name can only contain letters, numbers, spaces, and basic punctuation' };
  }
  
  if (containsProfanity(name)) {
    return { isValid: false, error: 'Please choose an appropriate name' };
  }
  
  return { isValid: true };
}
