import {
  CreateBucketCommand,
  S3Client,
  type BucketLocationConstraint,
  type CreateBucketCommandInput,
} from "@aws-sdk/client-s3";
import { awsRegion, demoBucketName } from "../shared/config.js";

const region: string = awsRegion();
const bucket: string = demoBucketName("manual");
const client: S3Client = new S3Client({ region });

const input: CreateBucketCommandInput = { Bucket: bucket };
if (region !== "us-east-1") {
  input.CreateBucketConfiguration = {
    LocationConstraint: region as BucketLocationConstraint,
  };
}

function getErrorName(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    typeof error.name === "string"
  ) {
    return error.name;
  }
  return undefined;
}

try {
  await client.send(new CreateBucketCommand(input));
  console.log(`Created S3 bucket: ${bucket}`);
  console.log("No state was written. The AWS API is the only source of truth.");
} catch (error: unknown) {
  console.error(`AWS rejected creation of S3 bucket: ${bucket}`);

  const errorName: string | undefined = getErrorName(error);
  if (
    errorName === "BucketAlreadyOwnedByYou" ||
    errorName === "BucketAlreadyExists"
  ) {
    console.error(
      "This is expected when demo-1 is run again: it has no state and always sends CreateBucket."
    );
  }

  throw error;
}
