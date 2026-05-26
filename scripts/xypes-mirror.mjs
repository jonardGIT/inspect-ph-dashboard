import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const defaultMirrorRoot = path.resolve(
  repoRoot,
  "..",
  "..",
  "inspect-ph-mirror",
);
const mirrorRoot = process.env.XYPES_MIRROR_ROOT?.trim()
  ? path.resolve(process.env.XYPES_MIRROR_ROOT)
  : defaultMirrorRoot;
const outputDir = path.join(mirrorRoot, "xypes-inspectph-dashboard");
const standaloneDir = path.join(
  repoRoot,
  ".next",
  "standalone",
  "inspect-ph-dashboard",
);
const staticDir = path.join(repoRoot, ".next", "static");

async function run(command, args, cwd = repoRoot) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      env: process.env,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} failed with exit code ${code ?? 1}`,
        ),
      );
    });
    child.on("error", reject);
  });
}

async function ensureCleanDir(directory) {
  await fs.rm(directory, { force: true, recursive: true });
  await fs.mkdir(directory, { recursive: true });
}

async function copyDirectory(source, destination) {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
      continue;
    }

    await fs.copyFile(sourcePath, destinationPath);
  }
}

async function prepareMirror() {
  await run("npm", ["run", "build"]);
  await ensureCleanDir(outputDir);

  await copyDirectory(standaloneDir, outputDir);
  await copyDirectory(staticDir, path.join(outputDir, ".next", "static"));
  await fs.writeFile(
    path.join(outputDir, ".gitignore"),
    [".env", ".env.*", "npm-debug.log*"].join("\n") + "\n",
  );
}

const mode = process.argv[2] ?? "prepare";

if (mode === "prepare") {
  await prepareMirror();
} else {
  throw new Error(`Unsupported mode: ${mode}`);
}
