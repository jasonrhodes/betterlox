export function getErrorAsString(error: unknown) {
  return error instanceof Error ? error.message :
    typeof error === "string" ? error :
    "Unknown error occurred";
}