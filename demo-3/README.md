# Demo 3: Terraform

This is the same basic S3 outcome implemented in Terraform. The bucket name ends in `-tf`.

Unlike the Node.js demos, the desired infrastructure is declared in `.tf` files and Terraform owns the state lifecycle. `run.sh` is only a convenience launcher: it loads the user's private environment and maps `BASE_BUCKET_NAME` to Terraform's `TF_VAR_base_bucket_name` input.

```sh
bash demo-3/run.sh init
bash demo-3/run.sh plan
bash demo-3/run.sh apply
bash demo-3/run.sh destroy
```
