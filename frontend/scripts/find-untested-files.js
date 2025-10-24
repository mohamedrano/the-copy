#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const srcDir = path.join(process.cwd(), "src");
const untestedFiles = [];

const ALLOWED_EXCEPTIONS = [
  /\.d\.ts$/,
  /^index\.ts$/,
  /types\.ts$/,
  /__tests__\//,
  /__mocks__\//,
  /\.test\./,
  /\.spec\./,
];

function isSimpleIndexFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").filter((line) => line.trim());

  return lines.every(
    (line) =>
      line.startsWith("export") ||
      line.startsWith("//") ||
      line.startsWith("/*") ||
      line === ""
  );
}

function isSimpleTypeFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const hasLogic = /function |class |const .*=.*=>|if \(|switch \(/.test(
    content
  );
  return !hasLogic;
}

function shouldHaveTests(filePath) {
  const fileName = path.basename(filePath);

  if (ALLOWED_EXCEPTIONS.some((pattern) => pattern.test(filePath))) {
    if (fileName === "index.ts" && !isSimpleIndexFile(filePath)) {
      return true;
    }
    if (fileName.endsWith("types.ts") && !isSimpleTypeFile(filePath)) {
      return true;
    }
    return false;
  }

  return true;
}

function hasTestFile(sourceFile) {
  const dir = path.dirname(sourceFile);
  const baseName = path.basename(sourceFile, path.extname(sourceFile));

  const possibleTestPatterns = [
    path.join(dir, `${baseName}.test.ts`),
    path.join(dir, `${baseName}.test.tsx`),
    path.join(dir, `${baseName}.spec.ts`),
    path.join(dir, `${baseName}.spec.tsx`),
    path.join(dir, "__tests__", `${baseName}.test.ts`),
    path.join(dir, "__tests__", `${baseName}.test.tsx`),
    path.join(dir, "__tests__", `${baseName}.spec.ts`),
    path.join(dir, "__tests__", `${baseName}.spec.tsx`),
  ];

  return possibleTestPatterns.some((pattern) => fs.existsSync(pattern));
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (item.endsWith(".ts") || item.endsWith(".tsx")) {
      if (shouldHaveTests(fullPath) && !hasTestFile(fullPath)) {
        const relativePath = path.relative(srcDir, fullPath);
        untestedFiles.push({
          path: relativePath,
          size: stat.size,
          reason: "No corresponding test file found",
        });
      }
    }
  }
}

console.log("\n🔎 Scanning for untested TypeScript files...\n");
console.log(`📂 Source directory: ${srcDir}\n`);

scanDirectory(srcDir);

if (untestedFiles.length > 0) {
  console.error("❌ ENFORCEMENT FAILED: Found files without tests\n");
  console.error(`🚨 ${untestedFiles.length} file(s) require tests:\n`);

  untestedFiles
    .sort((a, b) => b.size - a.size)
    .forEach(({ path, size, reason }) => {
      console.error(`   ❌ ${path}`);
      console.error(`      Size: ${(size / 1024).toFixed(2)} KB`);
      console.error(`      Reason: ${reason}\n`);
    });

  console.error("=".repeat(80));
  console.error("\n📋 REQUIRED ACTIONS:");
  console.error("1. Create test files for ALL listed files above");
  console.error(
    "2. Follow naming convention: <filename>.test.ts or <filename>.spec.ts"
  );
  console.error("3. Or place in __tests__/ directory");
  console.error(
    "4. Ensure each test file covers all functions/classes/exports"
  );
  console.error("\n⛔ This is MANDATORY - no exceptions allowed.\n");

  process.exit(1);
}

console.log("✅ SUCCESS: All TypeScript files have corresponding tests");
console.log("🎉 No untested files found\n");

process.exit(0);
