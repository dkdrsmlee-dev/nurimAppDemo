export function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message) {
      return `${fallback} (${message})`;
    }
  }

  return fallback;
}
