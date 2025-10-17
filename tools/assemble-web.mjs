import { cpSync, rmSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const root = process.cwd();
const out = join(root, "web");

console.log("🧹 Cleaning output directory...");
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const apps = [
  ["apps/basic-editor/dist", "basic-editor"],
  ["apps/drama-analyst/dist", "drama-analyst"],
  ["apps/stations/dist", "stations"],
  ["apps/multi-agent-story/dist", "multi-agent-story"]
];

console.log("📦 Assembling web applications...");
for (const [src, name] of apps) {
  const srcPath = join(root, src);
  const destPath = join(out, name);

  if (!existsSync(srcPath)) {
    console.warn(`⚠️  Warning: ${src} does not exist, skipping...`);
    continue;
  }

  console.log(`  ✓ Copying ${name} from ${src}`);
  cpSync(srcPath, destPath, { recursive: true });
}

console.log("✅ Assembled web/ with 4 apps successfully!");
