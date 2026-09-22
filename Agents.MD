# Agent instructions

## Project purpose

This repository is the companion code for an English-language talk about Infrastructure as Code with Node.js. Preserve the progression from an imperative AWS API call to a stateful IaC workflow and then to Pulumi with Node.js.

## Environment and secrets

- Never open, read, print, parse, search, or commit `.env`.
- Use `env.example` only as the configuration schema. Keep every value in that file blank.
- Do not place AWS credentials, Pulumi passphrases, bucket names, or other secrets in source files, tests, documentation examples, or Git.
- Runtime launchers may load the user's private `.env`; that is different from an agent inspecting the file.
- Keep generated state, dependency directories, Terraform state, and Pulumi metadata ignored by Git.

## Language and documentation

- Keep source code, comments, command output explanations, and documentation in English.
- Use TypeScript for all Node.js and Pulumi source files. Keep infrastructure entrypoints in typed `index.ts` files and keep Lambda handlers in typed support files.
- Every Node.js/Pulumi demo must expose an `npm run start` command.
- Prefer clear, presentation-friendly code over production-scale abstractions.
- Explain intentional shortcomings in the demos instead of hiding them.

## Demo contracts

1. `demo-1` must create an S3 bucket through the AWS SDK for JavaScript, with no IaC and no state. Running it again must surface the AWS bucket-already-exists error.
2. `demo-2` must use a deliberately small local JSON state file so a repeat run skips the create call. It must remain obviously incomplete: no locking, sharing, encryption, drift detection, or recovery.
3. `demo-3` must create the equivalent bucket with Terraform and use the `-tf` suffix. It should clearly show a different language and structure from the Node.js examples.
4. `demo-4` must create the equivalent bucket with Pulumi and Node.js using the `-nodejs` suffix. Its launcher must run Pulumi in the official Node.js Docker image so the host does not need Pulumi installed.
5. `demo-5` must use Pulumi with Node.js to create an S3 bucket, a Node.js Lambda, and an HTTP API Gateway. A request to the API must make the Lambda write a text object whose key contains the current time and return a random string.

## Naming

All bucket names must be derived from `BASE_BUCKET_NAME` and include the suffix assigned to their demo. Never hard-code a globally unique bucket name.

## Verification

- Run syntax and configuration checks that do not require deploying AWS resources.
- Do not run `apply`, `up`, `destroy`, or other cloud-mutating commands unless the user explicitly requests that deployment action.
- If dependencies are unavailable, report the exact verification that was possible and the remaining prerequisite.
