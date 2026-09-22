# Infrastructure as Code with Node.js

This repository supports an English-language talk that moves from an imperative AWS API call to a stateful IaC workflow with Terraform and finally to Pulumi with Node.js.

The examples deliberately increase in capability:

| Demo | Approach | Resource | Main lesson |
| --- | --- | --- | --- |
| `demo-1` | AWS SDK for JavaScript | S3 bucket | No state means a second create call fails |
| `demo-2` | AWS SDK for JavaScript + local JSON | S3 bucket | A tiny state file avoids the repeat error, but has serious limitations |
| `demo-3` | Terraform | S3 bucket | A different language, state model, and project structure |
| `demo-4` | Pulumi with Node.js | S3 bucket | IaC while keeping the application language |
| `demo-5` | Pulumi with Node.js | Lambda, S3, HTTP API Gateway | A complete serverless workflow |

## Requirements

- Node.js 20 or newer and npm
- AWS credentials with permission to create and delete the demo resources
- Terraform 1.6 or newer for `demo-3`
- Docker Desktop or Docker Engine for the default `demo-4` launcher
- Pulumi CLI for `demo-5` and the optional local `demo-4` workflow

All source code, comments, and documentation in this repository are in English.

## Configuration

The agent must not open or read `.env`. Create it yourself from the blank template and fill in the values locally:

```sh
cp env.example .env
```

`BASE_BUCKET_NAME` must be globally unique, lowercase, and valid for S3. Each demo adds its own suffix:

- `-manual` for `demo-1`
- `-state` for `demo-2`
- `-tf` for `demo-3`
- `-nodejs` for `demo-4`
- `-complex` for `demo-5`

The Pulumi launcher uses `PULUMI_CONFIG_PASSPHRASE` for the local Pulumi backend. Do not commit `.env` or any credential values.

## Install JavaScript dependencies

From the repository root:

```sh
npm install
```

## Run the demos

### Demo 1: imperative AWS API call

```sh
npm run demo:1
# Equivalent when you are inside demo-1:
cd demo-1 && npm run start
```

Run it a second time. The AWS API returns an `BucketAlreadyOwnedByYou` or `BucketAlreadyExists` error. That failure is intentional: the program has no state and does not try to reconcile anything.

### Demo 2: deliberately small local state

```sh
npm run demo:2
# Equivalent when you are inside demo-2:
cd demo-2 && npm run start
```

The first run creates `demo-2/state.json`. A second run sees that local record and skips the create call. This is only a teaching example, not a production state backend. The state is local, unprotected, unlocked, incomplete, and easy to make stale.

### Demo 3: Terraform

The helper loads the local environment and passes `BASE_BUCKET_NAME` to Terraform as `TF_VAR_base_bucket_name`:

```sh
bash demo-3/run.sh init
bash demo-3/run.sh plan
bash demo-3/run.sh apply
```

The bucket name ends in `-tf`. Clean up with:

```sh
bash demo-3/run.sh destroy
```

### Demo 4: Pulumi with Node.js

The launcher runs Pulumi inside the official Node.js Docker image. You do not need Pulumi installed on the host. The local backend is stored in a persistent Docker volume:

```sh
bash demo-4/run.sh login --local
bash demo-4/run.sh stack init dev
bash demo-4/run.sh up
bash demo-4/run.sh stack output
```

The bucket name ends in `-nodejs`. Clean up with:

```sh
bash demo-4/run.sh destroy
bash demo-4/run.sh stack rm dev
```

If Pulumi is installed locally, run the equivalent commands directly from the demo directory:

```sh
cd demo-4

# The Pulumi CLI does not load .env automatically.
export PULUMI_CONFIG_PASSPHRASE="<your local passphrase>"

pulumi login --local
pulumi stack init dev
pulumi up
pulumi stack output
```

Clean up the locally managed stack with:

```sh
pulumi destroy
pulumi stack rm dev
```

After the stack has been initialized, the update command can also be started through npm:

```sh
cd demo-4
npm run start
```

### Demo 5: Lambda, S3, and HTTP API Gateway

```sh
bash demo-5/run.sh login --local
bash demo-5/run.sh stack init dev
bash demo-5/run.sh up
bash demo-5/run.sh stack output
```

After the stack has been initialized, the update command can also be started through npm:

```sh
cd demo-5
npm run start
```

Call the API after deployment:

```sh
API_URL="$(bash demo-5/run.sh stack output apiUrl)"
curl -X POST "$API_URL"
```

The Lambda creates a text object in the S3 bucket. The object key contains the current UTC time, and the response contains a random string. `demo-5` enables `forceDestroy` on its demo bucket so that an explicit Pulumi destroy can remove the objects created during the talk:

```sh
bash demo-5/run.sh destroy
bash demo-5/run.sh stack rm dev
```

## Safety notes

These examples create real AWS resources. Review the plan before applying it, use a dedicated demo account or least-privilege credentials, and destroy the resources after the talk. The local state files and Pulumi metadata are ignored by Git, but they are not a substitute for a shared, locked, encrypted state backend.
