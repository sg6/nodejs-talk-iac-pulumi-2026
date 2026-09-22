import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  CreateBucketCommand,
  S3Client,
  type BucketLocationConstraint,
  type CreateBucketCommandInput,
} from "@aws-sdk/client-s3";
import {
  awsRegion,
  demoBucketName,
  repositoryRoot,
} from "../shared/config.js";

interface DemoState {
  bucketName: string;
  region: string;
  createdAt: string;
}

const region: string = awsRegion();
const bucket: string = demoBucketName("state");
const statePath: string = resolve(repositoryRoot, "demo-2", "state.json");

function isDemoState(value: unknown): value is DemoState {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const state: Record<string, unknown> = value as Record<string, unknown>;
  return (
    typeof state.bucketName === "string" &&
    typeof state.region === "string" &&
    typeof state.createdAt === "string"
  );
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

async function readState(): Promise<DemoState | undefined> {
  try {
    const rawState: string = await readFile(statePath, "utf8");
    const parsedState: unknown = JSON.parse(rawState);
    if (!isDemoState(parsedState)) {
      throw new Error(`Invalid state file: ${statePath}`);
    }
    return parsedState;
  } catch (error: unknown) {
    if (hasErrorCode(error, "ENOENT")) {
      return undefined;
    }
    throw error;
  }
}

const state: DemoState | undefined = await readState();
if (state?.bucketName === bucket) {
  console.log(`Local state says that ${bucket} already exists.`);
  console.log("Skipping CreateBucket. No remote drift check is performed.");
} else {
  const client: S3Client = new S3Client({ region });
  const input: CreateBucketCommandInput = { Bucket: bucket };
  if (region !== "us-east-1") {
    input.CreateBucketConfiguration = {
      LocationConstraint: region as BucketLocationConstraint,
    };
  }

  await client.send(new CreateBucketCommand(input));

  await mkdir(resolve(repositoryRoot, "demo-2"), { recursive: true });
  await writeFile(
    statePath,
    `${JSON.stringify(
      {
        bucketName: bucket,
        region,
        createdAt: new Date().toISOString(),
      } satisfies DemoState,
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Created S3 bucket: ${bucket}`);
  console.log(`Wrote deliberately small local state: ${statePath}`);
}
