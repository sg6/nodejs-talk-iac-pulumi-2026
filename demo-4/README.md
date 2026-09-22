# Demo 4: Pulumi with Node.js

This is the preferred solution for the simple bucket example. Pulumi manages the infrastructure and its state, while the program remains JavaScript/Node.js. The bucket name ends in `-nodejs`.

You do not need Pulumi or the Node.js dependencies installed on the host. `run.sh` uses the official `pulumi/pulumi-nodejs:3.263.0` Docker image, installs the project dependencies inside a persistent Docker volume, and stores the local Pulumi backend in another persistent Docker volume. Docker downloads the image automatically on the first run.

The launcher maps `login --local` to an explicit filesystem backend in the persistent state volume. This keeps the stack available across separate Docker invocations and skips Pulumi's first-run project wizard.

Use the local Pulumi backend through Docker:

```sh
bash demo-4/run.sh login --local
bash demo-4/run.sh stack init dev
bash demo-4/run.sh up
bash demo-4/run.sh stack output
bash demo-4/run.sh destroy
```

## Using a locally installed Pulumi CLI

If Pulumi is installed on the host, the same workflow can be run without `run.sh`:

```sh
cd demo-4

# The Pulumi CLI does not load .env automatically.
export PULUMI_CONFIG_PASSPHRASE="<your local passphrase>"

pulumi login --local
pulumi stack init dev
pulumi up
pulumi stack output
```

Clean up the local stack with:

```sh
pulumi destroy
pulumi stack rm dev
```

The TypeScript program loads `AWS_REGION` and `BASE_BUCKET_NAME` from the repository `.env` at runtime. The `PULUMI_CONFIG_PASSPHRASE` export above is needed because the Pulumi CLI itself does not read that file.

After the stack has been initialized, an update can also be started with:

```sh
cd demo-4
npm run start
```

The image tag can be overridden when needed:

```sh
PULUMI_IMAGE=pulumi/pulumi-nodejs:3.263.0 bash demo-4/run.sh up
```
