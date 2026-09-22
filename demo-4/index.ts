import * as aws from "@pulumi/aws";
import { awsRegion, demoBucketName } from "../shared/config.js";

const region: aws.Region = awsRegion() as aws.Region;
const provider: aws.Provider = new aws.Provider("aws-provider", {
  region,
});

const bucket: aws.s3.Bucket = new aws.s3.Bucket(
  "nodejsBucket",
  {
    bucket: demoBucketName("nodejs"),
    tags: {
      Demo: "demo-4",
      ManagedBy: "Pulumi",
      Language: "Node.js",
    },
  },
  { provider }
);

export const bucketName = bucket.bucket;
export const bucketArn = bucket.arn;
