#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

/**
 * Script to calculate documentation coverage for TypeScript files
 * Analyzes TSDoc comments and generates coverage report
 */

const DOC_COVERAGE_CONFIG = {
  // Files to analyze
  includePatterns: ['src/**/*.ts', 'src/**/*.tsx'],
  excludePatterns: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
  
  // Coverage thresholds
  minCoverage: 90, // Minimum coverage percentage
  
  // TSDoc tags to check for
  requiredTags: ['@public', '@param', '@returns', '@throws', '@example'],
  
  // Output file
  outputFile: '.reports/doc-coverage.json'
};

/**
 * Recursively find all TypeScript files
 */
function findTsFiles(dir, files = []) {
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (extname(item) === '.ts' || extname(item) === '.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract public exports from TypeScript file
 */
function extractPublicExports(content) {
  const exports = [];
  
  // Match export statements
  const exportRegex = /export\s+(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|enum|const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  let match;
  
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push({
      name: match[1],
      type: match[0].includes('class') ? 'class' : 
            match[0].includes('interface') ? 'interface' :
            match[0].includes('type') ? 'type' :
            match[0].includes('enum') ? 'enum' :
            match[0].includes('function') ? 'function' : 'variable',
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return exports;
}

/**
 * Extract TSDoc comments from TypeScript file
 */
function extractTSDocComments(content) {
  const comments = [];
  const tsdocRegex = /\/\*\*[\s\S]*?\*\//g;
  let match;
  
  while ((match = tsdocRegex.exec(content)) !== null) {
    const comment = match[0];
    const lines = comment.split('\n');
    const startLine = content.substring(0, match.index).split('\n').length;
    
    // Extract tags
    const tags = [];
    const tagRegex = /@(\w+)(?:\s+(.*?))?(?=\n\s*@|\n\s*\*\/|\n\s*\*$)/g;
    let tagMatch;
    
    while ((tagMatch = tagRegex.exec(comment)) !== null) {
      tags.push({
        name: tagMatch[1],
        value: tagMatch[2]?.trim() || ''
      });
    }
    
    comments.push({
      content: comment,
      tags,
      startLine,
      endLine: startLine + lines.length - 1
    });
  }
  
  return comments;
}

/**
 * Check if an export has proper TSDoc documentation
 */
function hasDocumentation(exportItem, comments) {
  // Find comment that appears before the export
  const relevantComment = comments.find(comment => 
    comment.endLine < exportItem.line && 
    comment.endLine >= exportItem.line - 5 // Within 5 lines
  );
  
  if (!relevantComment) {
    return false;
  }
  
  // Check for required tags based on export type
  const requiredTags = ['@public'];
  
  if (exportItem.type === 'function' || exportItem.type === 'class') {
    requiredTags.push('@param', '@returns');
  }
  
  if (exportItem.type === 'interface' || exportItem.type === 'type') {
    requiredTags.push('@property');
  }
  
  // Check if all required tags are present
  const hasRequiredTags = requiredTags.every(tag => 
    relevantComment.tags.some(t => t.name === tag)
  );
  
  return hasRequiredTags;
}

/**
 * Calculate documentation coverage for a file
 */
function calculateFileCoverage(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const exports = extractPublicExports(content);
    const comments = extractTSDocComments(content);
    
    const documentedExports = exports.filter(exportItem => 
      hasDocumentation(exportItem, comments)
    );
    
    const coverage = exports.length > 0 ? 
      (documentedExports.length / exports.length) * 100 : 100;
    
    return {
      file: filePath,
      totalExports: exports.length,
      documentedExports: documentedExports.length,
      coverage: Math.round(coverage * 100) / 100,
      exports: exports.map(exportItem => ({
        ...exportItem,
        documented: hasDocumentation(exportItem, comments)
      }))
    };
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return {
      file: filePath,
      totalExports: 0,
      documentedExports: 0,
      coverage: 0,
      error: error.message
    };
  }
}

/**
 * Generate overall coverage report
 */
function generateCoverageReport() {
  console.log('🔍 Analyzing TypeScript files for documentation coverage...');
  
  const srcDir = 'src';
  const files = findTsFiles(srcDir);
  
  console.log(`📁 Found ${files.length} TypeScript files`);
  
  const fileReports = files.map(calculateFileCoverage);
  
  // Calculate overall coverage
  const totalExports = fileReports.reduce((sum, report) => sum + report.totalExports, 0);
  const totalDocumented = fileReports.reduce((sum, report) => sum + report.documentedExports, 0);
  const overallCoverage = totalExports > 0 ? (totalDocumented / totalExports) * 100 : 100;
  
  const report = {
    timestamp: new Date().toISOString(),
    overall: {
      totalFiles: files.length,
      totalExports,
      documentedExports: totalDocumented,
      coverage: Math.round(overallCoverage * 100) / 100,
      threshold: DOC_COVERAGE_CONFIG.minCoverage,
      passed: overallCoverage >= DOC_COVERAGE_CONFIG.minCoverage
    },
    files: fileReports,
    summary: {
      excellent: fileReports.filter(r => r.coverage >= 95).length,
      good: fileReports.filter(r => r.coverage >= 90 && r.coverage < 95).length,
      needsImprovement: fileReports.filter(r => r.coverage >= 70 && r.coverage < 90).length,
      poor: fileReports.filter(r => r.coverage < 70).length
    }
  };
  
  // Write report to file
  writeFileSync(DOC_COVERAGE_CONFIG.outputFile, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n📊 Documentation Coverage Report');
  console.log('================================');
  console.log(`Overall Coverage: ${report.overall.coverage}%`);
  console.log(`Total Exports: ${report.overall.totalExports}`);
  console.log(`Documented: ${report.overall.documentedExports}`);
  console.log(`Threshold: ${report.overall.threshold}%`);
  console.log(`Status: ${report.overall.passed ? '✅ PASSED' : '❌ FAILED'}`);
  
  console.log('\n📈 Coverage Distribution:');
  console.log(`Excellent (≥95%): ${report.summary.excellent} files`);
  console.log(`Good (90-94%): ${report.summary.good} files`);
  console.log(`Needs Improvement (70-89%): ${report.summary.needsImprovement} files`);
  console.log(`Poor (<70%): ${report.summary.poor} files`);
  
  // Show files that need improvement
  const needsImprovement = fileReports.filter(r => r.coverage < 90 && r.totalExports > 0);
  if (needsImprovement.length > 0) {
    console.log('\n⚠️  Files needing documentation improvement:');
    needsImprovement.forEach(file => {
      console.log(`  ${file.file}: ${file.coverage}% (${file.documentedExports}/${file.totalExports})`);
    });
  }
  
  console.log(`\n📄 Full report saved to: ${DOC_COVERAGE_CONFIG.outputFile}`);
  
  // Exit with error code if coverage is below threshold
  if (!report.overall.passed) {
    console.log('\n❌ Documentation coverage is below the required threshold!');
    process.exit(1);
  }
  
  console.log('\n✅ Documentation coverage meets requirements!');
}

// Run the coverage analysis
generateCoverageReport();