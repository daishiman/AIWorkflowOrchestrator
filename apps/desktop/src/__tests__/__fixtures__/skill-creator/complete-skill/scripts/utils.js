/**
 * Common utilities for fixture-complete-skill
 * Follows skill-creator script patterns
 */

export const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
  ARGS_ERROR: 2,
  FILE_NOT_FOUND: 3,
  VALIDATION_FAILED: 4,
};

/**
 * Get CLI argument value
 * @param {string} name - Argument name (e.g., '--target')
 * @returns {string|null}
 */
export function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

/**
 * Resolve path relative to current working directory
 * @param {string} relativePath
 * @returns {string}
 */
export function resolvePath(relativePath) {
  const path = await import('path');
  return path.resolve(process.cwd(), relativePath);
}
