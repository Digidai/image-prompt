# CI audit — 2026-10-22

Repository: https://github.com/Digidai/image-prompt. The audit inspected all 15 recorded workflow runs at baseline `c1411febbb5f5afece5a5e7c5dc274e1e7836e3b`: 12 successful runs and 3 failed Deploy Cloudflare runs. Validate had no failures. The last two source releases had successful Validate and Deploy runs before this maintenance change.

## Historical failures

| Failed run | Actual failure | Existing correction |
| --- | --- | --- |
| [39286461619](https://github.com/Digidai/image-prompt/actions/runs/39286461619) | Cloudflare rejected access to the `image-prompt` deployments resource. Build, output checks and all six then-current tests passed. | The repository deployment credential was replaced with an existing credential that can access this Worker. |
| [39286797468](https://github.com/Digidai/image-prompt/actions/runs/39286797468) | Cloudflare returned `No access to the specified service` for `image-prompt`. | [39287863370](https://github.com/Digidai/image-prompt/actions/runs/39287863370) successfully deployed the same source SHA after the credential correction, establishing that this was an authorization failure. |
| [39402428598](https://github.com/Digidai/image-prompt/actions/runs/39402428598) | Deployment completed, but live verification failed because the English 404 response lacked `<html lang="en">`. HTML asset canonicalization caused the fallback to return an empty body. | Source `aa426b9092f99cc1278a1a9ad6595e7915568295` changed the fallback to `/en/404/` backed by `en/404/index.html`; [39402915459](https://github.com/Digidai/image-prompt/actions/runs/39402915459) passed all live checks. |

The older Node.js deprecation messages were warnings, not the failure cause. Historical run results remain useful records of the source and credentials used at the time.

## Provider migration

At the maintainer's request, GitHub Actions was disabled at repository level before any new commit was pushed. Neither historical runs nor new GitHub CI were rerun. The two workflow files are removed; GitHub retains source and historical evidence. Cloudflare Workers Builds executes the build, tests and deployment for production `main`.

- `ci:build` runs build/output checks, all unit/API tests, 13 real local Workers/Static Assets routing checks and D1/R2 release readiness. This catches empty localized 404 bodies before publication.
- `ci:deploy` publishes through Wrangler and runs production checks. The live source commit must match Cloudflare's `WORKERS_CI_COMMIT_SHA`.
- Node.js 22.23.2 is selected by `.node-version`. Preview builds are disabled. An existing Cloudflare-managed build credential is reused; local OAuth is never copied into the build environment.
- Build watch paths include `*`, excluding `docs/*`, `*.md` and `.github/*`, to avoid publishing documentation/evidence-only updates.

## Verification

Local build/output validation, all 18 tests and 13 hosting checks passed. A negative regression check temporarily emptied only the generated English 404 asset: the hosting gate rejected it before deployment, and the exact original bytes were restored.

Cloudflare native build [0426d031](https://dash.cloudflare.com/48d9ccaf5ee7914c803b5d0656462848/workers/services/view/image-prompt/production/builds/0426d031-b4c0-4dd2-90d9-b107cc066126) succeeded in 64 seconds on source `e019b63561651cc2c6240b40d02f59c0e674c435`. Its logs confirm 18 tests, 13 hosting checks, release readiness and 52 live checks passed, including exact source equality. A separate local read-only production verification also passed. Cloudflare's deployment API confirms Worker version `d3dd496c-ce28-4141-a782-a80b1a65d9f5` at 100% traffic. The GitHub Actions enabled flag remains false and its latest recorded run is still the pre-migration `39406682431`.

The machine-readable receipt is `docs/evidence/cloudflare-builds-migration.json`. Dashboard captures and log excerpts remain local under ignored `output/cloudflare-builds/`; no credentials are stored in the receipt. This migration performed no search submissions.
