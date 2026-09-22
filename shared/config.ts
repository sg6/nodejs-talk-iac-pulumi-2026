import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sharedDirectory: string = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot: string = resolve(sharedDirectory, "..");

// The demos load the user's private environment at runtime. Agents must not inspect it.
loadDotenv({ path: resolve(repositoryRoot, ".env") });

export function requiredEnv(name: string): string {
  const value: string | undefined = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function awsRegion(): string {
  return requiredEnv("AWS_REGION");
}

export function demoBucketName(suffix: string): string {
  const base: string = requiredEnv("BASE_BUCKET_NAME");
  const name: string = `${base}-${suffix}`;

  if (
    name.length < 3 ||
    name.length > 63 ||
    !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name) ||
    name.includes("..") ||
    name.includes(".-") ||
    name.includes("-.")
  ) {
    throw new Error(
      `BASE_BUCKET_NAME produces an invalid S3 bucket name: ${name}. ` +
        "Use lowercase letters, numbers, dots, and hyphens."
    );
  }

  return name;
}
