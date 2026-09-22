import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { awsRegion, demoBucketName } from "../shared/config.js";
import { handler } from "./function.js";

const region: aws.Region = awsRegion() as aws.Region;
const provider: aws.Provider = new aws.Provider("aws-provider", {
  region,
});

const bucket: aws.s3.Bucket = new aws.s3.Bucket(
  "applicationBucket",
  {
    bucket: demoBucketName("-demo-5"),
    // This is convenient for a disposable talk demo because the Lambda writes objects.
    forceDestroy: true,
    tags: {
      Demo: "demo-5",
      ManagedBy: "Pulumi",
      Language: "Node.js",
    },
  },
  { provider }
);

const lambdaRole: aws.iam.Role = new aws.iam.Role(
  "lambdaRole",
  {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { Service: "lambda.amazonaws.com" },
          Action: "sts:AssumeRole",
        },
      ],
    }),
    tags: {
      Demo: "demo-5",
      ManagedBy: "Pulumi",
    },
  },
  { provider }
);

const lambdaPolicy: pulumi.Output<string> = pulumi
  .all([bucket.arn])
  .apply(([bucketArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "WriteObjects",
          Effect: "Allow",
          Action: ["s3:PutObject"],
          Resource: `${bucketArn}/*`,
        },
        {
          Sid: "WriteLogs",
          Effect: "Allow",
          Action: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
          Resource: "*",
        },
      ],
    })
  );

const lambdaPolicyResource: aws.iam.RolePolicy = new aws.iam.RolePolicy(
  "lambdaPolicy",
  {
    role: lambdaRole.id,
    policy: lambdaPolicy,
  },
  { provider }
);

const writer: aws.lambda.CallbackFunction<
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
> = new aws.lambda.CallbackFunction(
  "writerFunction",
  {
    runtime: "nodejs20.x",
    role: lambdaRole.arn,
    timeout: 30,
    environment: {
      variables: {
        BUCKET_NAME: bucket.bucket,
      },
    },
    codePathOptions: {
      extraIncludePackages: ["@aws-sdk/client-s3"],
    },
    callback: handler,
  },
  { provider, dependsOn: [lambdaPolicyResource] }
);

const api: aws.apigatewayv2.Api = new aws.apigatewayv2.Api(
  "httpApi",
  {
    protocolType: "HTTP",
    name: "demo-5-http-api",
    description: "Invokes the demo Lambda that writes to S3.",
    tags: {
      Demo: "demo-5",
      ManagedBy: "Pulumi",
    },
  },
  { provider }
);

const integration: aws.apigatewayv2.Integration =
  new aws.apigatewayv2.Integration(
    "lambdaIntegration",
    {
      apiId: api.id,
      integrationType: "AWS_PROXY",
      integrationUri: writer.arn,
      payloadFormatVersion: "2.0",
    },
    { provider }
  );

new aws.apigatewayv2.Route(
  "defaultRoute",
  {
    apiId: api.id,
    routeKey: "$default",
    target: pulumi.interpolate`integrations/${integration.id}`,
  },
  { provider }
);

new aws.apigatewayv2.Stage(
  "defaultStage",
  {
    apiId: api.id,
    name: "$default",
    autoDeploy: true,
  },
  { provider }
);

new aws.lambda.Permission(
  "apiPermission",
  {
    action: "lambda:InvokeFunction",
    function: writer.name,
    principal: "apigateway.amazonaws.com",
    sourceArn: pulumi.interpolate`${api.executionArn}/*/*`,
  },
  { provider }
);

export const bucketName = bucket.bucket;
export const functionName = writer.name;
export const apiUrl = api.apiEndpoint;
