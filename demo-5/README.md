# Demo 5: Lambda, S3, and HTTP API Gateway

This is the larger Pulumi/Node.js example:

- an S3 bucket named with the `-complex` suffix;
- an IAM role with permission to write objects and publish Lambda logs;
- a Node.js 20 Lambda function;
- an API Gateway v2 HTTP API with a `$default` route and stage.

The Lambda creates a text object on every request. Its key contains the current UTC timestamp, and the response returns the key plus a random string. The Lambda uses the AWS SDK for JavaScript v3 available in the Node.js Lambda runtime.

The Lambda handler is kept separately in `function.ts`; `index.ts` contains only the infrastructure definition.

Deploy it with:

```sh
bash demo-5/run.sh login --local
bash demo-5/run.sh stack init dev
bash demo-5/run.sh up
```

After the stack has been initialized, the update can also be started with:

```sh
cd demo-5
npm run start
```

Then invoke the API:

```sh
API_URL="$(bash demo-5/run.sh stack output apiUrl)"
curl -X POST "$API_URL"
```

The bucket uses `forceDestroy: true` because this disposable demo writes objects. Use it only for the presentation environment, then clean up with `bash demo-5/run.sh destroy`.
