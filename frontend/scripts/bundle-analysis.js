#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function analyzeBundle() {
  const buildDir = path.join(process.cwd(), ".next");

  if (!fs.existsSync(buildDir)) {
    console.error("Build directory not found. Run `npm run build` first.");
    process.exit(1);
  }

  const staticDir = path.join(buildDir, "static");

  if (!fs.existsSync(staticDir)) {
    console.error("Static directory not found.");
    process.exit(1);
  }

  function getDirectorySize(dirPath) {
    let totalSize = 0;

    function calculateSize(currentPath) {
      const stats = fs.statSync(currentPath);

      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);
        files.forEach((file) => {
          calculateSize(path.join(currentPath, file));
        });
      } else {
        totalSize += stats.size;
      }
    }

    calculateSize(dirPath);
    return totalSize;
  }

  const totalSize = getDirectorySize(staticDir);
  const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
  const sizeInKB = (totalSize / 1024).toFixed(2);

  console.log("📦 Bundle Analysis Report");
  console.log("========================");
  console.log(`Total bundle size: ${sizeInMB} MB (${sizeInKB} KB)`);

  const targetSizeMB = 250;
  const compressionRatio = 0.3; // Approximate gzip compression
  const compressedSizeMB = (parseFloat(sizeInMB) * compressionRatio).toFixed(2);

  console.log(`Estimated compressed size: ${compressedSizeMB} MB`);
  console.log(`Target size: ${targetSizeMB} KB compressed`);

  if (parseFloat(compressedSizeMB) * 1024 > targetSizeMB) {
    console.log("❌ Bundle size exceeds target!");
    console.log("Consider:");
    console.log("- Code splitting");
    console.log("- Tree shaking unused code");
    console.log("- Optimizing images");
    console.log("- Using dynamic imports");
    process.exit(1);
  } else {
    console.log("✅ Bundle size is within target!");
  }
}

analyzeBundle();
