import { dangerousPatterns } from "./constants.js";

export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6 || password.length > 20) {
    return {
      valid: false,
      error: "Password must be between 6 and 20 characters",
    };
  }

  const safePasswordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
  if (!safePasswordRegex.test(password)) {
    return {
      valid: false,
      error:
        "Password contains invalid characters. Use only letters, numbers, and safe symbols",
    };
  }

  for (const pattern of dangerousPatterns) {
    if (pattern.test(password)) {
      return {
        valid: false,
        error: "Password contains potentially unsafe content",
      };
    }
  }

  return { valid: true };
}

export function extractPasswordFromFile(fileContent: string): {
  password?: string;
  error?: string;
} {
  try {
    const jsonData = JSON.parse(fileContent);

    if (typeof jsonData !== "object" || jsonData === null) {
      return { error: "Invalid JSON format. Must be an object." };
    }

    if (!jsonData.password) {
      return {
        error:
          'Password field not found in JSON. Expected format: {"password": "yourpassword"}',
      };
    }

    if (typeof jsonData.password !== "string") {
      return { error: "Password must be a string value" };
    }

    const validation = validatePassword(jsonData.password);
    if (!validation.valid) {
      return { error: `Invalid password: ${validation.error}` };
    }

    return { password: jsonData.password };
  } catch (error) {
    return { error: "Invalid JSON format. Please check your file syntax." };
  }
}
