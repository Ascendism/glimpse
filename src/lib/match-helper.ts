/**
 * Normalize string for comparison (lowercase, remove punctuation, collapse whitespace)
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Simple "Close Enough" scoring hint: check if normalized guess contains or is contained by normalized answer
 * Returns a hint string for the host to help with scoring
 */
export function getMatchHint(guess: string, answer: string): string {
  const normGuess = normalize(guess);
  const normAnswer = normalize(answer);

  if (normGuess === normAnswer) {
    return "✓ Exact";
  }

  if (normAnswer.includes(normGuess) || normGuess.includes(normAnswer)) {
    return "~ Close";
  }

  // Check for substantial word overlap
  const guessWords = new Set(normGuess.split(" "));
  const answerWords = normAnswer.split(" ");
  const overlap = answerWords.filter((w) => guessWords.has(w)).length;

  if (overlap > 0 && overlap >= answerWords.length * 0.5) {
    return "≈ Partial";
  }

  return "";
}
