const regex = /^[a-zA-Z0-9_]*$/;

// Validation logic from the Roblox sign up page.
/**
 * Returns true for valid username, false for invalid.
 * @param username - The Roblox username to test.
 */
function validRobloxUsername (username: string): boolean {
  const trimmed = username.trim();
  // Starts or ends from underscore
  if (trimmed[0] === "_" || trimmed[trimmed.length - 1] === "_") {
    return false;
  }
  // More than two underscores
  if (username.split("_").length > 2) {
    return false;
  }
  if (username.length < 3 || username.length > 20) {
    return false;
  }
  return regex.test(username);
}
export default validRobloxUsername;
