# 🛠️ FormForge Step-by-Step Setup & Troubleshooting Guide

Welcome! This guide is designed to help anyone set up FormForge from scratch, troubleshoot common build issues, and manage database connections easily.

---

## 📋 Phase 1: First-Time Setup Checklist (Pehli Baar Setup Kaise Karein)

Follow these steps when you clone this project to a new environment or account:

### Step 1: Install Dependencies
Run this command in the project root folder to install all packages:
```bash
npm install
# OR if you use Bun:
bun install
```

### Step 2: Configure Project Files
Ensure your configurations are set up exactly like this to avoid errors:

1. **`package.json`** (Build & deploy commands):
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint",
     "typecheck": "tsc --noEmit",
     "deploy": "opennextjs-cloudflare build && wrangler deploy"
   }
   ```

2. **`wrangler.jsonc`** (Cloudflare JSON Configuration):
   ```json
   {
     "$schema": "./node_modules/wrangler/config-schema.json",
     "name": "your-worker-name",
     "main": ".open-next/worker.js",
     "compatibility_date": "2026-07-06",
     "compatibility_flags": ["nodejs_compat"],
     "assets": {
       "directory": ".open-next/assets",
       "binding": "ASSETS"
     },
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "your-database-name",
         "database_id": "", 
         "migrations_dir": "migrations"
       }
     ],
     "build": {
       "command": "npm run build"
     }
   }
   ```
   > 💡 **Tip:** Keep `"database_id": ""` (empty) if you want Cloudflare's one-click deploy tool to automatically create and link a database for you.

3. **`wrangler.toml`** (Cloudflare TOML Configuration):
   ```toml
   name = "your-worker-name"
   main = ".open-next/worker.js"
   compatibility_date = "2026-07-06"
   compatibility_flags = ["nodejs_compat"]

   [assets]
   directory = ".open-next/assets"
   binding = "ASSETS"

   [[d1_databases]]
   binding = "DB"
   database_name = "your-database-name"
   database_id = "" 
   migrations_dir = "migrations"

   [build]
   command = "npm run build"
   ```

### Step 3: Deploy to Cloudflare
Deploy your Worker by running:
```bash
npm run deploy
```

---

## 🗄️ Phase 2: Database Separation Guide (Dono Apps ka Data Alag Rakhna)

If you deploy two separate workers (e.g., `staging-app` and `prod-app`) but they display the **exact same submissions and users**, they are sharing the same database. To separate them:

### Step 1: Create a New D1 Database
Create a fresh database in your Cloudflare account using Wrangler CLI:
```bash
npx wrangler d1 create <new-db-name>
```

### Step 2: Copy the New Database ID
Wrangler will generate a unique Database ID (UUID). Copy this ID:
```text
Example: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 3: Update Config Files
In your second project directory, open your configurations and change the **Worker name** and **Database ID**:

* **`wrangler.toml`**:
  ```toml
  name = "your-new-app-name" # Enter your new worker name here

  [[d1_databases]]
  binding = "DB"
  database_name = "your-database-name"
  database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # Paste new Database ID here
  migrations_dir = "migrations"
  ```
* **`wrangler.jsonc`**:
  ```json
  "name": "your-new-app-name",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "your-database-name",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // Paste new Database ID here
      "migrations_dir": "migrations"
    }
  ]
  ```

---

## 🛠️ Phase 3: Common Deployment Errors & Quick Fixes

### ❌ Issue 1: Build Infinite Loop (Baar-baar build deploy loop chalna)
* **Symptoms**: The build logs repeat the command `$ opennextjs-cloudflare build` infinitely.
* **Why it happens**: Both `package.json` `"build"` script and Wrangler's build `"command"` are set to `"opennextjs-cloudflare build"`. This creates a loop.
* **How to Fix**:
  1. Open **`package.json`** and verify `"build"` script is set to `"next build"`.
  2. Open **`wrangler.jsonc`** / **`wrangler.toml`** and verify build command is set to `"npm run build"`.

### ❌ Issue 2: `Could not find compiled Open Next config`
* **Symptoms**: Deployment fails with the message `ERROR Could not find compiled Open Next config, did you run the build command?`.
* **Why it happens**: Wrangler cannot find NextJS build files. The standard `next build` command ran but did not output the Cloudflare compatibility folder `.open-next`.
* **How to Fix**: Ensure that when building for deployment, `@opennextjs/cloudflare` is triggered. The deploy command in `package.json` should always be:
  ```json
  "deploy": "opennextjs-cloudflare build && wrangler deploy"
  ```

### ❌ Issue 3: `Network error. Is the Worker deployed and D1 bound?`
* **Symptoms**: The frontend dashboard opens but throws database errors.
* **Why it happens**: Your D1 database is linked but does not contain any tables yet.
* **How to Fix**: Visit your deployed dashboard URL at `https://<your-worker>.workers.dev/dashboard`. On the first load, FormForge will automatically run migrations and auto-create the necessary tables.
