#!/usr/bin/env node

/**
 * Project Setup Script
 * --------------------
 * Creates a new Sanity project (or links an existing one) and writes
 * the matching .env files for both /studio and /web.
 *
 * Usage:
 *   npx ./setup.mjs            – interactive prompts
 *   node setup.mjs              – same thing
 */

import { spawnSync } from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as readline from "readline";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const STUDIO_DIR = path.join(ROOT, "studio");
const WEB_DIR = path.join(ROOT, "web");

// ── helpers ──────────────────────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, fallback = "") {
  return new Promise((resolve) => {
    const suffix = fallback ? ` (${fallback})` : "";
    rl.question(`${question}${suffix}: `, (answer) => {
      resolve(answer.trim() || fallback);
    });
  });
}

function heading(text) {
  console.log(`\n\x1b[1m\x1b[36m── ${text} ──\x1b[0m\n`);
}

function success(text) {
  console.log(`\x1b[32m✓\x1b[0m ${text}`);
}

// ── sanity token creation ─────────────────────────────────────────

function getSanityAuthToken() {
  const candidates = [
    path.join(os.homedir(), ".config", "sanity", "config.json"),
    path.join(os.homedir(), ".sanity", "config.json"),
  ];
  for (const p of candidates) {
    try {
      const cfg = JSON.parse(fs.readFileSync(p, "utf-8"));
      if (cfg.authToken) return cfg.authToken;
    } catch {}
  }
  return null;
}

async function createReadToken(projectId) {
  const authToken = getSanityAuthToken();
  if (!authToken) {
    console.log(
      "  Could not find Sanity CLI auth token. Skipping automatic token creation.",
    );
    return "";
  }

  const label = `Read token (setup ${new Date().toISOString().slice(0, 10)})`;

  try {
    const res = await fetch(
      `https://api.sanity.io/v2021-06-07/projects/${projectId}/tokens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ label, roleName: "viewer" }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.log(`  API error ${res.status}: ${text}`);
      return "";
    }

    const data = await res.json();
    return data.key || "";
  } catch (err) {
    console.log(`  Failed to create token: ${err.message}`);
    return "";
  }
}

function writeEnv(dir, vars) {
  const envPath = path.join(dir, ".env");
  const examplePath = path.join(dir, ".env.example");

  let content;

  // Use .env.example as template to preserve comments and structure
  try {
    const template = fs.readFileSync(examplePath, "utf-8");
    content = template.replace(/^([A-Z_]+)=.*$/gm, (match, key) =>
      key in vars ? `${key}="${vars[key]}"` : match,
    );
  } catch {
    // Fallback: plain key=value if no .env.example exists
    content =
      Object.entries(vars)
        .map(([key, value]) => `${key}="${value}"`)
        .join("\n") + "\n";
  }

  fs.writeFileSync(envPath, content, "utf-8");
  success(`Written ${path.relative(ROOT, envPath)}`);
}

// ── sanity project creation ──────────────────────────────────────────

async function createSanityProject() {
  heading("Sanity Project Setup");

  let projectId, dataset, projectTitle, studioHost;

  console.log(
    "Launching the Sanity CLI — follow its prompts to create or select a project.\n",
  );

  const tmpFile = path.join(os.tmpdir(), `sanity-init-${Date.now()}.log`);

  // Use macOS `script` to keep full TTY interactivity while recording output
  const child = spawnSync(
    "script",
    [
      "-q",
      tmpFile,
      "/bin/sh",
      "-c",
      `cd "${STUDIO_DIR}" && npx sanity@latest init --bare`,
    ],
    { stdio: "inherit" },
  );

  // Try to extract project ID and dataset from the captured output
  try {
    const raw = fs.readFileSync(tmpFile, "utf-8");
    fs.unlinkSync(tmpFile);

    // Strip ANSI escape sequences and carriage returns
    const output = raw
      .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
      .replace(/\r/g, "");

    const idMatch = output.match(/project\s*id[:\s]+([a-z0-9]{6,})/i);
    if (idMatch) projectId = idMatch[1];

    // Match "dataset: production" or "Dataset name: production" but not prompts like "Dataset to use"
    const dsMatch = output.match(
      /dataset(?:\s+name)?[:\s]+['"]?([a-z][a-z0-9_-]*)/i,
    );
    if (dsMatch && dsMatch[1] !== "to") dataset = dsMatch[1];
    // Match existing project selection: "Project Title (xxxxxxxx)"
    const titleMatch = output.match(/([A-Za-z][^(\n]+?)\s+\(([a-z0-9]{6,})\)/);
    if (titleMatch) {
      projectTitle = titleMatch[1].trim();
      if (!projectId) projectId = titleMatch[2];
    }
  } catch {
    // Capture failed — we'll ask manually
  }

  if (child.status !== 0) {
    console.log(
      "\nSanity CLI exited with an error. Enter the values manually below.\n",
    );
  } else {
    console.log("\nSanity project ready!\n");
    if (projectId) success(`Detected project ID: ${projectId}`);
    if (dataset) success(`Detected dataset: ${dataset}`);
  }

  // Ask for (or confirm) project ID and dataset
  projectId = await ask("Sanity Project ID", projectId || "");
  dataset = await ask("Dataset", dataset || "production");

  projectTitle = await ask(
    "Project title (displayed in the Studio UI)",
    projectTitle || "",
  );
  const slugifiedTitle = (projectTitle || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  studioHost = await ask(
    'Studio hostname (e.g. "my-project" → my-project.sanity.studio)',
    slugifiedTitle,
  );

  const productionUrl = await ask(
    'Production website URL (for "View on Site" in Studio)',
    `https://${studioHost}.netlify.app`,
  );

  const previewOrigin = await ask(
    "Preview origin (URL for Studio live preview)",
    "http://localhost:5173",
  );

  const siteUrl = await ask(
    "Site URL (used for canonical URLs and sitemap)",
    productionUrl,
  );

  const videoProvider = await ask("Video provider (mux/vimeo)", "mux");

  let vimeoFolderId = "";
  if (videoProvider === "vimeo") {
    vimeoFolderId = await ask("Vimeo folder ID");
  }

  // Optionally create a Sanity API read token via the Management API
  let apiReadToken = "";
  const createToken = await ask(
    "Create a Sanity API read token automatically? (yes/no)",
    "yes",
  );

  if (createToken === "yes") {
    console.log("\nCreating a Sanity API read token…");
    apiReadToken = await createReadToken(projectId);
    if (apiReadToken) {
      success("API read token created");
    } else {
      console.log("  Automatic creation failed. You can enter one manually.");
      apiReadToken = await ask(
        "Sanity API read token (leave blank to add later)",
        "",
      );
    }
  } else {
    apiReadToken = await ask(
      "Sanity API read token (leave blank to add later)",
      "",
    );
  }

  // Generate a webhook secret for the Sanity → Netlify revalidate endpoint
  const webhookSecret = crypto.randomBytes(24).toString("hex");

  return {
    projectId,
    dataset,
    projectTitle,
    studioHost,
    productionUrl,
    previewOrigin,
    siteUrl,
    videoProvider,
    vimeoFolderId,
    apiReadToken,
    webhookSecret,
  };
}

// ── write env files ──────────────────────────────────────────────────

function writeStudioEnv(config) {
  heading("Writing studio/.env");

  const vars = {
    SANITY_STUDIO_PROJECT_TITLE: config.projectTitle,
    SANITY_STUDIO_PROJECT_ID: config.projectId,
    SANITY_STUDIO_DATASET: config.dataset,
    SANITY_STUDIO_HOST: config.studioHost,
    SANITY_STUDIO_VIDEO_PROVIDER: config.videoProvider,
    SANITY_STUDIO_PREVIEW_ORIGIN: config.previewOrigin,
    SANITY_STUDIO_PRODUCTION_URL: config.productionUrl,
    SANITY_STUDIO_APP_ID: "",
  };

  if (config.videoProvider === "vimeo" && config.vimeoFolderId) {
    vars.SANITY_STUDIO_VIMEO_FOLDER_ID = config.vimeoFolderId;
  }

  writeEnv(STUDIO_DIR, vars);
}

function writeWebEnv(config) {
  heading("Writing web/.env");

  const vars = {
    PUBLIC_SANITY_STUDIO_HOST: config.studioHost,
    PUBLIC_SANITY_PROJECT_ID: config.projectId,
    PUBLIC_SANITY_DATASET: config.dataset,
    PUBLIC_SANITY_API_VERSION: new Date().toISOString().slice(0, 10),
    PUBLIC_SANITY_STUDIO_VIDEO_PROVIDER: config.videoProvider,
    SITE_URL: config.siteUrl,
    PUBLIC_SANITY_PREVIEW: "false",
    SANITY_API_READ_TOKEN: config.apiReadToken,
    SANITY_WEBHOOK_SECRET: config.webhookSecret,
  };

  writeEnv(WEB_DIR, vars);
}

// ── studio build & deploy ────────────────────────────────────────────

function deployStudio() {
  heading("Building & deploying Studio");

  // Build
  console.log("Building the studio…");
  const build = spawnSync("npx", ["sanity", "build"], {
    cwd: STUDIO_DIR,
    stdio: "inherit",
  });
  if (build.status !== 0) {
    console.log("\n  Studio build failed. Skipping deploy.");
    return null;
  }
  success("Studio built");

  // Deploy — capture stdout to extract the appId
  console.log("Deploying the studio…");
  const tmpFile = path.join(os.tmpdir(), `sanity-deploy-${Date.now()}.log`);
  const deploy = spawnSync(
    "script",
    ["-q", tmpFile, "/bin/sh", "-c", `cd "${STUDIO_DIR}" && npx sanity deploy`],
    { stdio: "inherit" },
  );

  let appId = null;

  try {
    const raw = fs.readFileSync(tmpFile, "utf-8");
    fs.unlinkSync(tmpFile);

    // Strip ANSI escape sequences
    const output = raw
      .replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "")
      .replace(/\r/g, "");

    // The deploy command prints a defineCliConfig snippet containing the appId
    const match = output.match(/appId:\s*['"]([a-z0-9]+)['"]/);
    if (match) appId = match[1];
  } catch {}

  if (deploy.status !== 0) {
    console.log("\n  Studio deploy failed.");
    return null;
  }

  success("Studio deployed");
  if (appId) success(`Detected appId: ${appId}`);
  return appId;
}

function updateStudioEnv(key, value) {
  const envPath = path.join(STUDIO_DIR, ".env");
  let content = fs.readFileSync(envPath, "utf-8");
  const regex = new RegExp(`^${key}=.*$`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${key}="${value}"`);
  } else {
    content += `${key}="${value}"\n`;
  }
  fs.writeFileSync(envPath, content, "utf-8");
  success(`Set ${key} in studio/.env`);
}

// ── main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("\x1b[1m");
  console.log("╔══════════════════════════════════════╗");
  console.log("║       🛠  Project Setup Script       ║");
  console.log("╚══════════════════════════════════════╝");
  console.log("\x1b[0m");

  const config = await createSanityProject();

  writeStudioEnv(config);
  writeWebEnv(config);

  // Build & deploy the studio, then persist the appId
  const shouldDeploy = await ask(
    "Build & deploy the Studio now? (yes/no)",
    "yes",
  );

  let appId = null;
  if (shouldDeploy === "yes") {
    appId = deployStudio();
    if (!appId) {
      appId = await ask(
        "Enter the appId manually (or leave blank to skip)",
        "",
      );
    }
    if (appId) {
      updateStudioEnv("SANITY_STUDIO_APP_ID", appId);
    }
  }

  heading("Done!");

  console.log("Next steps:");
  console.log("  1. cd studio && pnpm install && pnpm dev");
  console.log("  2. cd web    && pnpm install && pnpm dev");
  console.log("");
  if (!config.apiReadToken) {
    console.log("  ⚠  Remember to add SANITY_API_READ_TOKEN in web/.env");
    console.log(
      "     Generate one at: https://www.sanity.io/manage → API → Tokens\n",
    );
  } else {
    console.log(
      "  ✨ API read token was created automatically and written to web/.env\n",
    );
  }
  if (appId) {
    console.log(
      `  ✨ Studio deployed — appId ${appId} written to studio/.env\n`,
    );
  }
  console.log(
    "  ⓘ A SANITY_WEBHOOK_SECRET was generated in web/.env.",
  );
  console.log(
    "     Add the same value in Sanity → Manage → API → Webhooks for /api/revalidate.\n",
  );

  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
