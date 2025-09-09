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
    return { password: jsonData.password };
  } catch (error) {
    return { error: "Invalid JSON format. Please check your file syntax." };
  }
}
