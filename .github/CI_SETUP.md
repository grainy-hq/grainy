# CI/CD Setup and Operator Runbook

This document covers setup, maintenance, and troubleshooting for the GitHub Actions workflows in `.github/workflows/`. Read this before modifying CI configuration, rotating secrets, or onboarding a new clone of the repository.

## Required GitHub Secrets

Both secrets below are consumed only by the `deploy` job in `.github/workflows/deploy.yml`, and they are scoped to the single "Deploy via OpenNext + Wrangler" step via the `env:` block. They are never exposed to the CI workflow.

### `CLOUDFLARE_API_TOKEN`

Authenticates Wrangler when it publishes the Worker. Without it, `pnpm run deploy` fails with `error: not authenticated`.

1. Open https://dash.cloudflare.com/profile/api-tokens and click "Create Token".
2. Pick the "Edit Cloudflare Workers" template.
3. Under "Account Resources", scope the token to the account that owns the `grainy` Worker.
4. Confirm the permissions include `Account.Workers Scripts:Edit`. Add `Account.Account Settings:Read` if the template prompts for it.
5. Set an expiration date that fits your rotation policy, then create the token and copy it once (it is not shown again).
6. In the repository on GitHub, go to Settings, Secrets and variables, Actions, New repository secret. Name it `CLOUDFLARE_API_TOKEN` and paste the token value.

### `CLOUDFLARE_ACCOUNT_ID`

Identifies which Cloudflare account Wrangler should target. The account ID is not secret, but storing it as a secret keeps it out of the repository and avoids drift between forks.

1. Sign in to https://dash.cloudflare.com.
2. Pick the account that owns the `grainy` Worker.
3. Copy the "Account ID" shown in the right sidebar of the account home page.
4. In the repository, go to Settings, Secrets and variables, Actions, New repository secret. Name it `CLOUDFLARE_ACCOUNT_ID` and paste the value.

If either secret is missing, the `deploy` job fails at the Wrangler step. The CI workflow (`format`, `lint`, `typecheck`) does not read these secrets and keeps running regardless.

## Workflow Overview

Two workflows live under `.github/workflows/`. CI gates every change, deploy ships validated code to production.

### `ci.yml`

Triggered on push to any branch and on pull_request targeting `main`. Runs three jobs in parallel. Each job installs dependencies via `pnpm install --frozen-lockfile` and pins Node to `26.3.0`.

- `format`: runs `pnpm format:check` to verify Prettier formatting. Fails if any tracked file would be rewritten.
- `lint`: runs `pnpm lint`, which executes `eslint . --no-cache` against the eslint-config-next flat config. The legacy `next lint` command was removed in Next 16, so the workflow calls ESLint directly.
- `typecheck`: runs `pnpm cf-typegen` to regenerate Cloudflare bindings, then `pnpm exec opennextjs-cloudflare build` to produce the `.open-next/` output, then `tsc --noEmit`. The build step is required because `cloudflare-env.d.ts` imports types from `.open-next/worker`, which only exists after a successful OpenNext build. Skipping the build causes `tsc` to fail with "Cannot find module './.open-next/worker'".

The workflow caches `.next/cache` and `.open-next` between runs, keyed on `pnpm-lock.yaml` and on hashes of source and config files, to keep the typecheck job under its 15 minute timeout.

### `deploy.yml`

Triggered by `workflow_run` when the `CI` workflow completes on the `main` branch. The single `deploy` job runs only if `github.event.workflow_run.conclusion == 'success'` and `github.event.workflow_run.head_branch == 'main'`. It checks out the exact commit that CI validated (`github.event.workflow_run.head_sha`) so the deployed code matches the commit that passed gates.

The job runs `pnpm install --frozen-lockfile`, `pnpm cf-typegen`, then `pnpm run deploy`, which expands to `opennextjs-cloudflare build && opennextjs-cloudflare deploy`. Wrangler reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the step's `env:` block and publishes the `grainy` Worker.

The deploy job uses the `production` environment, so any environment protection rules configured in GitHub (manual approval, wait timer, required reviewers) apply on top of the CI gate.

## Recommended Branch Protection

Configure these rules in the repository on GitHub under Settings, Branches, Add branch protection rule, with branch name pattern `main`.

1. Check "Require a pull request before merging" and set "Required approvals" to at least 1.
2. Check "Require status checks to pass before merging".
3. Check "Require branches to be up to date before merging".
4. In the status checks search box, add each of the following names exactly. They map to the job IDs in `ci.yml`:
   - `format`
   - `lint`
   - `typecheck`
5. Check "Do not allow bypassing the above settings" so that admins are held to the same gates.
6. Under "Rules applied to everyone including administrators", check "Block force pushes" and leave deletions disallowed.

After saving, push a throwaway commit to a branch and open a pull request to verify all three checks appear on the PR. If a check is missing, the name in branch protection does not match the job ID and the rule will silently allow merges.

## Local Validation

Run these commands locally before pushing to reproduce what CI runs. The sequence mirrors the typecheck job, which is the slowest part of CI.

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm cf-typegen && pnpm exec opennextjs-cloudflare build && pnpm typecheck
```

If `pnpm format:check` reports diffs, run `pnpm format` to apply them. If `pnpm lint` reports issues, run `pnpm lint --fix` for autofixable rules, then resolve the rest by hand. The OpenNext build is required for typecheck to succeed; do not skip it.

## Manual Database Migrations

Schema migrations are deliberately kept out of every workflow. Neither `ci.yml` nor `deploy.yml` runs `drizzle-kit` against the database. This is by design: automated migrations make it easy to drop a column on production by merging a pull request. Manual control gives the operator a chance to inspect the generated SQL, run it against the right environment, and roll back if needed.

The migration toolchain is `drizzle-kit` against PostgreSQL.

### Authoring a migration

After editing the schema, generate the SQL locally:

```bash
pnpm db:migration:generate
```

Review the generated file in your migrations directory, commit it alongside the schema change, and open a pull request.

### Applying a migration

Apply the migration directly against the target database from a trusted environment, never from CI:

```bash
pnpm db:migration:apply
```

Run this against production only after the migration has been validated against staging or a local copy of production data.

### Safe ordering

Sequence schema and code changes so the database is always compatible with both the old and the new code during the rollout window.

- For additive migrations (new tables, new nullable columns, new indexes), apply the migration first, then deploy the code that reads or writes the new shape.
- For breaking schema changes (renames, dropped columns, narrowed types), split the work across releases: apply an additive migration, verify, deploy code that uses the new shape, then deploy a cleanup migration to remove the old shape.

If a migration fails partway through, do not retry blindly. Inspect the database state, fix the migration or the data, then re-run.

## Troubleshooting

### `typecheck failed: Cannot find module './.open-next/worker'`

The `opennextjs-cloudflare build` step did not run or did not finish. The `cloudflare-env.d.ts` file imports types from `.open-next/worker`, so `tsc` cannot resolve them until the build has produced that output. Check the typecheck job log: the build step runs before `pnpm typecheck` and its failure is the upstream cause. Fix the build error first, then typecheck will pass.

### Deploy job skipped or did not run

The deploy workflow runs only when the `CI` workflow concludes with `success` on `main`. If CI failed, was cancelled, or ran on a different branch, the deploy job is skipped by its `if:` condition. Open the CI run for the merge commit and confirm `conclusion == 'success'`. If CI did not run at all, check that the push to `main` actually triggered it (workflow files on the default branch are the source of truth).

### `error: not authenticated` from Wrangler

`CLOUDFLARE_API_TOKEN` is missing, expired, revoked, or scoped without `Account.Workers Scripts:Edit`. Recreate the token using the "Edit Cloudflare Workers" template, confirm it targets the right account, and update the GitHub secret. Then re-run the deploy job from the Actions tab.

### `cancel-in-progress: the expression...` warning

GitHub Actions evaluates the `cancel-in-progress` expression at queue time. The CI workflow uses `cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}` so that feature branches deduplicate runs while `main` does not. The warning is informational and no action is needed.

### `Workflow not found` in deploy.yml

The deploy workflow references the CI workflow by name (`workflows: [CI]`). This match is case-sensitive and reads the `name:` field at the top of `ci.yml`. If you rename CI, update the array in `deploy.yml` to the same string in the same commit, otherwise the deploy trigger silently stops firing.

### Cache misses on the typecheck job

The cache key includes hashes of `pnpm-lock.yaml`, source files, and OpenNext config. Any change to those invalidates the cache, which is expected. If you see persistent misses across unrelated commits, check that the cache action is not being skipped due to a forked PR (GitHub does not share caches across forks).

## Workflow Modification Policy

Workflow changes need extra care because GitHub Actions has security rules that affect when a change takes effect.

- A pull request that edits a file under `.github/workflows/` runs the version of the workflow that is already on the base branch, not the version proposed in the PR. This protects secrets from untrusted forks. The new workflow only takes effect on the next push or pull_request after merge.
- Test workflow changes on a long-lived feature branch first. Push the change, watch the CI runs on that branch, iterate until green, then open the PR.
- Keep `ci.yml` and `deploy.yml` consistent. The Node version is pinned in three places: `node-version: "26.3.0"` in `ci.yml`, the same line in `deploy.yml`, and `nodeVersion` in `pnpm-workspace.yaml`. When you bump Node, update all three in the same commit, or local installs will drift from CI.
- Do not add new secrets to the CI workflow. Secrets belong to the deploy job, scoped to the step that needs them. Adding them to CI widens the blast radius if a pull request introduces a malicious build step.
- If you rename a job ID in `ci.yml`, update branch protection in GitHub Settings to match. A status check that no longer exists silently stops blocking merges.
