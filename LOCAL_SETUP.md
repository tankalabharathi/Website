# Running the Project

Interior design studio website built with **Next.js 16 (App Router)**,
**Payload CMS 4 (beta)**, **PostgreSQL** and **Tailwind CSS v4**.

| Part | Location | URL (local) |
|---|---|---|
| Public website | `src/app/(frontend)/` | `http://localhost:3000` |
| CMS admin panel | `src/app/(payload)/` (managed by Payload) | `http://localhost:3000/admin` |
| REST / GraphQL API | `src/app/(payload)/api/` | `http://localhost:3000/api/...` |
| Health check | `src/app/(frontend)/healthz/route.ts` | `http://localhost:3000/healthz` |
| Collections / globals | `src/collections/`, `src/globals/` | — |
| Database migrations | `src/migrations/` | — |

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | `24.22.1` or newer | Required by `package.json` `engines`. Node 22 will not work. |
| pnpm | `10.34.3` | Use only pnpm. **Never run `npm install`** — it corrupts the pnpm `node_modules` layout. |
| PostgreSQL | `17` (16+ works) | Local instance listening on `localhost:5432`. |

### Node.js

Either use a version manager:

```powershell
fnm install 24.22.1
fnm use 24.22.1
```

or, without admin rights, a portable Node for the current terminal only:

```powershell
$v = 'v24.22.1'
$dest = "$env:LOCALAPPDATA\node-portable"
New-Item -ItemType Directory -Force $dest | Out-Null
Invoke-WebRequest "https://nodejs.org/dist/$v/node-$v-win-x64.zip" -OutFile "$dest\node.zip" -UseBasicParsing
Expand-Archive "$dest\node.zip" -DestinationPath $dest -Force

# Run this line in every new terminal:
$env:Path = "$env:LOCALAPPDATA\node-portable\node-v24.22.1-win-x64;$env:Path"
node --version   # v24.22.1
```

### pnpm

```powershell
$env:COREPACK_ENABLE_DOWNLOAD_PROMPT = '0'
corepack enable
pnpm --version   # 10.34.3
```

If `corepack enable` fails with a permission error, run
`corepack pnpm <command>` instead of `pnpm <command>`.

## 2. First-time setup

Run all commands from the project root.

### Step 1 — Create the database

Create a dedicated database (do not use the default `postgres` database):

```powershell
psql -h localhost -U postgres -c "CREATE DATABASE interior_design ENCODING 'UTF8';"
```

Or create it in pgAdmin: *Databases → Create → Database → `interior_design`*.

### Step 2 — Create `.env.local`

```powershell
Copy-Item .env.local.example .env.local
```

Edit `.env.local`:

```dotenv
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/interior_design
PAYLOAD_SECRET=<random string, 32+ characters>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PAYLOAD_STORAGE=local
```

Generate a secret:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Keep `PAYLOAD_SECRET` the same after first use; changing it logs everyone out.
`.env*` files are ignored by Git. URL-encode special characters in the
database password (`|` → `%7C`, `$` → `%24`, `@` → `%40`, `#` → `%23`).

### Step 3 — Install dependencies

```powershell
pnpm install --frozen-lockfile
```

### Step 4 — Create the tables (run migrations)

```powershell
pnpm payload migrate
pnpm payload migrate:status   # every migration should show "Yes"
```

### Step 5 — Start the development server

```powershell
pnpm dev
```

Open `http://localhost:3000`. Pages show empty states until content is added.

### Step 6 — Create the first admin and add content

1. Open `http://localhost:3000/admin`.
2. Fill in the one-time **Create first user** form. This account is a CMS
   administrator; later anonymous sign-ups are denied.
3. Add content in this order: **Website Settings** (global) → **Media** →
   **Services** → **Projects** → **Journal Articles** → **Testimonials**.
   Publish drafts so they appear on the public site.
4. Submit the form on `/contact` to test enquiries; they appear under
   **Operations → Enquiries** in the admin.

Uploaded files are stored in the Git-ignored `uploads/` folder when
`PAYLOAD_STORAGE=local`.

## 3. Daily workflow

```powershell
# New terminal (only if using portable Node):
$env:Path = "$env:LOCALAPPDATA\node-portable\node-v24.22.1-win-x64;$env:Path"

pnpm payload migrate   # apply any migrations pulled from Git
pnpm dev
```

Source changes hot-reload. Stop the server with `Ctrl+C`.

## 4. Running a production build locally

Public pages are generated at build time from the database, so the database
must be reachable and migrated before building.

```powershell
pnpm build
pnpm start
```

`pnpm start` serves on `http://127.0.0.1:3000` (set `APP_HOST=0.0.0.0` to
listen on all interfaces). Content published after the build is not shown on
static pages until you rebuild. `Could not find a production build` means
`pnpm build` has not been run.

Smoke test:

```powershell
foreach ($u in '/healthz','/','/projects','/journal','/services','/about','/contact','/admin') {
  "$u " + (Invoke-WebRequest "http://127.0.0.1:3000$u" -UseBasicParsing).StatusCode
}
```

All should return `200`. `GET /api/enquiries` without logging in must return
`403`.

## 5. Changing the database schema

Payload owns the schema; never hand-edit tables.

1. Edit the collection/global in `src/collections/` or `src/globals/`.
2. Generate a migration **with S3 mode enabled** so production media columns
   are kept (no AWS credentials or network access are used):

   ```powershell
   $env:PAYLOAD_STORAGE='s3'; $env:S3_BUCKET='placeholder'; $env:AWS_REGION='us-east-2'
   pnpm payload migrate:create <short_description>
   Remove-Item Env:PAYLOAD_STORAGE, Env:S3_BUCKET, Env:AWS_REGION
   ```

3. Review the new file in `src/migrations/`. It must not drop the `media`
   `prefix` / `_objectkey` columns or anything else you did not intend.
4. Apply it: `pnpm payload migrate`.
5. Commit the `.ts`, `.json` and updated `index.ts` together.

`src/payload-types.ts` is regenerated by `pnpm generate:types` or
automatically by the dev server. Never run `pnpm payload migrate:fresh` on a
database with data you need — it drops everything.

### Soft delete

Enquiries, Projects, Services, Journal Articles and Testimonials use soft
delete. **Delete** in the admin moves a record to the collection's **Trash**
view (restorable); records are only removed when deleted again from Trash.

| Column | Meaning |
|---|---|
| `deleted_at` | Timestamp set when trashed, `NULL` when active (Payload-managed) |
| `is_deleted` | `'Y'` when trashed, `'N'` when active; kept in sync automatically and read-only in the admin |

Payload queries and all public pages hide trashed records automatically. For
SQL or reporting, filter with `WHERE is_deleted = 'N'`. Trashed records keep
their `slug`, so a new record cannot reuse it until the old one is permanently
deleted.

## 6. Command reference

| Command | Purpose |
|---|---|
| `pnpm install --frozen-lockfile` | Install exact dependency versions |
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Production build (needs DB access) |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | TypeScript check (run after one `pnpm build` so Next's generated `PageProps` types exist) |
| `pnpm format` / `pnpm format:check` | Format / check formatting |
| `pnpm payload migrate` | Apply pending migrations |
| `pnpm payload migrate:status` | List applied/pending migrations |
| `pnpm payload migrate:create <name>` | Generate a migration from schema changes |
| `pnpm payload migrate:down` | Roll back the last migration batch |
| `pnpm generate:types` | Regenerate `src/payload-types.ts` |
| `pnpm generate:importmap` | Rebuild the admin import map if the admin shows missing components |

## 7. Environment variables

| Variable | Required | Example / default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/interior_design` | PostgreSQL connection |
| `PAYLOAD_SECRET` | Yes | 32+ random chars | Signs admin sessions/tokens |
| `NEXT_PUBLIC_SITE_URL` | Prod | `https://example.com` | Public site origin (browser-visible) |
| `PAYLOAD_STORAGE` | No | `local` | `local` (disk) or `s3` |
| `DB_POOL_MAX` | No | `10` | Max DB connections per app process |
| `APP_HOST` | No | `127.0.0.1` | Bind host for `pnpm start` |
| `AWS_REGION`, `S3_BUCKET` | If S3 | `us-east-2`, `my-bucket` | Media bucket |
| `S3_PREFIX`, `S3_ENDPOINT`, `ASSET_CDN_URL` | No | `media`, —, `https://cdn...` | Media key prefix, custom endpoint, CloudFront origin |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` | No | — | Only outside AWS; on ECS use the task role |

The database pool also enforces a 30 s statement timeout and a 60 s
idle-in-transaction timeout (see `src/payload.config.ts`).

## 8. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Missing DATABASE_URL` / `Missing PAYLOAD_SECRET` | `.env.local` missing or not in the project root. |
| `ERR_MODULE_NOT_FOUND ... node_modules\.pnpm\...` | `npm install` was run. Delete `node_modules` and `package-lock.json`, then `pnpm install --frozen-lockfile`. |
| `pnpm` not recognized | New terminal: re-add portable Node to `PATH` and run `corepack enable`. |
| Engine / syntax errors on install or start | Node older than 24.22.1 is active (`node --version`). |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running, or wrong host/port. |
| `password authentication failed` | Wrong credentials, or special characters in the password not URL-encoded. |
| `database "interior_design" does not exist` | Run Step 1. |
| `relation "..." does not exist` | Migrations not applied: `pnpm payload migrate`. |
| Dev server asks to push schema changes / warns about data loss | Should not happen: `push: false` is set in `src/payload.config.ts`. Schema is managed only by migrations (section 5). |
| `Could not find a production build` | Run `pnpm build` before `pnpm start`. |
| `Cannot find name 'PageProps'` in `pnpm typecheck` | Run `pnpm build` once; Next generates these types. |
| Port 3000 in use | Stop the other process or run `pnpm dev --port 3001`. |
| Admin shows blank/missing components | `pnpm generate:importmap`, then restart. |
| New content not visible after `pnpm start` | Static pages are a build-time snapshot; rebuild. |

## Data and credentials

- `.env.local` and uploaded files are ignored by Git.
- `PAYLOAD_SECRET` and the database password are local-only secrets. Never put
  them in `NEXT_PUBLIC_*`, source code, or committed files.
- This local database is separate from any prior hosted CMS and starts without
  imported documents or media. Plan and verify a separate export/import before
  transferring existing content.

## AWS / managed secrets configuration

The same runtime variables can be set directly in `.env.local` for development,
or injected by AWS ECS/Secrets Manager, HashiCorp Vault, or another secret
manager at deploy time. The app does not fetch secrets from a vault itself and
never needs secrets added to source code or `next.config.ts`.

- `DATABASE_URL`: PostgreSQL connection URI; in AWS, point it at private RDS.
- `DB_POOL_MAX`: optional max database connections per process; defaults to `10`.
- `PAYLOAD_SECRET`: long random Payload signing/encryption secret.
- `NEXT_PUBLIC_SITE_URL`: deployed public HTTPS origin.
- `APP_HOST`: optional process/container environment variable for the Next.js
  bind host; defaults to `127.0.0.1`. Set it to `0.0.0.0` in a container behind
  an AWS load balancer.
- `PAYLOAD_STORAGE=s3`: opt in to S3 uploads; defaults to `local`.
- `AWS_REGION` and `S3_BUCKET`: required when S3 storage is enabled.
- `S3_PREFIX`: optional prefix for uploaded media objects.
- `S3_ENDPOINT`: optional S3 API endpoint; defaults to the regional AWS S3
  endpoint.
- `ASSET_CDN_URL`: optional HTTPS CloudFront origin for public website media.
  Configure CloudFront with the private S3 bucket as an OAC-protected origin
  and no origin path. This is separate from the S3 API endpoint.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: optional, but must be set as
  a pair. `AWS_SESSION_TOKEN` can be used with temporary credentials. On ECS,
  prefer a task role and leave all three unset.

Keep `PAYLOAD_STORAGE`, `AWS_REGION`, and `S3_BUCKET` consistent when running
Payload migrations, building, and starting the production app. The production
build also needs access to `DATABASE_URL` and `PAYLOAD_SECRET`, because static
site generation reads Payload content from the database.

When using S3, configure the task role for Payload to upload, read, and delete
objects under the selected prefix. Keep the bucket private and use CloudFront
Origin Access Control for public website image delivery. Keep the database,
Payload secret, and AWS credentials private and server-side.

Switching storage to S3 does not copy files already present in `uploads/`.
Before production cutover, transfer existing media objects to the configured
bucket/prefix and verify the corresponding Payload media records and public
image URLs. Do not switch a populated production database to S3 until that
transfer plan is complete.

For the production ECS deployment, use the container, migration, CloudFront,
and Secrets Manager checklist in [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md).

### RDS database setup (one time)

Run [scripts/rds-bootstrap.sql](./scripts/rds-bootstrap.sql) as the RDS master
user from a host inside the VPC. It creates the `interior_design` database and
two roles:

| Role | Used by | Rights |
|---|---|---|
| `interior_migrator` | ECS migration task | Owns the schema; runs `pnpm payload migrate` |
| `interior_app` | App tasks and the image build | Read/insert/update/delete only; 30 s statement timeout |

```sh
psql "host=<rds-endpoint> dbname=postgres user=postgres sslmode=require" \
  -v migrator_password="'<strong-password-1>'" \
  -v app_password="'<strong-password-2>'" \
  -f scripts/rds-bootstrap.sql
```

Store one Secrets Manager secret per role. `DATABASE_URL` format for RDS:

```text
postgresql://<role>:<url-encoded-password>@<rds-endpoint>:5432/interior_design?sslmode=require&uselibpqcompat=true
```

`uselibpqcompat=true` encrypts without CA verification. For full verification,
ship the RDS `global-bundle.pem` in the image and use
`sslmode=verify-full&sslrootcert=/app/certs/global-bundle.pem` instead.

Set `DB_POOL_MAX` so `(number of ECS tasks) × DB_POOL_MAX` stays well below the
RDS `max_connections`. Release order for every deploy: run the migration task
→ build the app image → deploy the app service. After the first deploy, open
`/admin` to create the first administrator.
