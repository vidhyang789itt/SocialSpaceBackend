export function validateInput(
  username: string,
  email: string,
  password: string,
  isRegister: boolean,
): string | null {
  if (isRegister && !username) {
    return "Username is required";
  }

  if (!email) {
    return "Email is required";
  }

  if (!password) {
    return "Password is required";
  }

  return null;
}
