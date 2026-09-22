# Demo 2: deliberately small local state

This example adds only enough state to avoid sending `CreateBucket` again. After the first successful creation, it writes `state.json` and treats that local record as authoritative.

The approach is intentionally incomplete. It has no locking, sharing, encryption, version history, access control, drift detection, import workflow, or recovery strategy. If the bucket is deleted out of band, the program still reports success. If the state file is lost, a later create call can fail again because the bucket still exists.

Start it with:

```sh
npm run start
```
