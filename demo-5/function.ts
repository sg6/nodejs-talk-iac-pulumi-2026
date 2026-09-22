import type { S3Client as S3ClientType } from "@aws-sdk/client-s3";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

declare const require: NodeRequire;

export async function handler(
  _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3") as typeof import("@aws-sdk/client-s3");
  const { randomUUID } = require("node:crypto") as typeof import("node:crypto");
  const bucketName: string | undefined = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error("BUCKET_NAME is not configured");
  }

  const s3: S3ClientType = new S3Client({});
  const now: Date = new Date();
  const timestamp: string = now.toISOString().replace(/[:.]/g, "-");
  const randomString: string = randomUUID();
  const key: string = `requests/${timestamp}-${randomString.slice(0, 8)}.txt`;
  const body: string = [
    `Created at: ${now.toISOString()}`,
    `Random string: ${randomString}`,
  ].join("\n");

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: `${body}\n`,
      ContentType: "text/plain",
    })
  );

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message: "Created an S3 object.",
      key,
      randomString,
    }),
  };
}
