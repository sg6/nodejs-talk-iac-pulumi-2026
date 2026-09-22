# Demo 1: imperative AWS API call

This is the smallest possible example. The Node.js program sends one `CreateBucket` request through the AWS SDK for JavaScript.

There is no IaC engine and no state file. Run it once to create the `-manual` bucket. Run it again to see the AWS `BucketAlreadyOwnedByYou` or `BucketAlreadyExists` error.

Start it with:

```sh
npm run start
```
