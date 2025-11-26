#!/usr/bin/env node

/**
 * Docker Image Analyzer
 *
 * Analyzes a Docker image for size, layers, and best practices.
 *
 * Usage:
 *   node analyze-image.mjs myapp:latest
 *   node analyze-image.mjs myapp:latest --verbose
 */

import { execSync } from 'child_process';

const args = process.argv.slice(2);

function parseArgs() {
  const options = {
    imageName: null,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      options.imageName = arg;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
Docker Image Analyzer

Usage:
  node analyze-image.mjs <image-name> [options]

Options:
  --verbose, -v    Show detailed layer information
  --help, -h       Show this help message

Examples:
  node analyze-image.mjs myapp:latest
  node analyze-image.mjs node:20-alpine --verbose
`);
}

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    return null;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getSizeRating(sizeBytes) {
  const sizeMB = sizeBytes / (1024 * 1024);

  if (sizeMB < 100) return { rating: 'Excellent', icon: '🟢', message: 'Very small image' };
  if (sizeMB < 200) return { rating: 'Good', icon: '🟢', message: 'Good size for production' };
  if (sizeMB < 500) return { rating: 'Acceptable', icon: '🟡', message: 'Consider optimization' };
  if (sizeMB < 1000) return { rating: 'Large', icon: '🟠', message: 'Should optimize' };
  return { rating: 'Too Large', icon: '🔴', message: 'Needs optimization' };
}

function getImageInfo(imageName) {
  const inspectJson = exec(`docker inspect ${imageName}`);
  if (!inspectJson) {
    return null;
  }

  const info = JSON.parse(inspectJson)[0];
  return info;
}

function getImageHistory(imageName) {
  const history = exec(`docker history ${imageName} --format "{{.ID}}\t{{.CreatedBy}}\t{{.Size}}" --no-trunc`);
  if (!history) {
    return [];
  }

  return history.split('\n').map(line => {
    const [id, createdBy, size] = line.split('\t');
    return { id, createdBy, size };
  });
}

function analyzeSecurityIssues(imageInfo) {
  const issues = [];

  // Check if running as root
  const user = imageInfo.Config?.User;
  if (!user || user === '' || user === 'root' || user === '0') {
    issues.push({
      severity: 'HIGH',
      issue: 'Running as root user',
      recommendation: 'Create and use a non-root user with USER instruction',
    });
  }

  // Check for exposed ports
  const exposedPorts = imageInfo.Config?.ExposedPorts;
  if (exposedPorts) {
    const ports = Object.keys(exposedPorts);
    if (ports.some(p => p.includes('22'))) {
      issues.push({
        severity: 'MEDIUM',
        issue: 'SSH port (22) is exposed',
        recommendation: 'Avoid exposing SSH in containers',
      });
    }
  }

  // Check for HEALTHCHECK
  const healthcheck = imageInfo.Config?.Healthcheck;
  if (!healthcheck) {
    issues.push({
      severity: 'LOW',
      issue: 'No HEALTHCHECK defined',
      recommendation: 'Add HEALTHCHECK instruction for better orchestration',
    });
  }

  return issues;
}

function analyzeOptimizationOpportunities(imageInfo, history) {
  const opportunities = [];

  // Check base image
  const baseImage = history[history.length - 1]?.createdBy || '';
  if (!baseImage.includes('alpine') && !baseImage.includes('slim') && !baseImage.includes('distroless')) {
    opportunities.push({
      type: 'BASE_IMAGE',
      suggestion: 'Consider using alpine, slim, or distroless base image for smaller size',
    });
  }

  // Check for multiple RUN layers that could be combined
  const runLayers = history.filter(h => h.createdBy.includes('RUN'));
  if (runLayers.length > 5) {
    opportunities.push({
      type: 'LAYER_COUNT',
      suggestion: `Found ${runLayers.length} RUN layers. Consider combining them to reduce layers.`,
    });
  }

  // Check for large layers
  const largeLayers = history.filter(h => {
    const size = h.size.replace(/[^\d.]/g, '');
    const unit = h.size.replace(/[\d.]/g, '').trim().toUpperCase();
    const sizeNum = parseFloat(size);

    if (unit === 'GB') return sizeNum > 0.1;
    if (unit === 'MB') return sizeNum > 100;
    return false;
  });

  if (largeLayers.length > 0) {
    opportunities.push({
      type: 'LARGE_LAYERS',
      suggestion: `Found ${largeLayers.length} large layer(s). Review these for optimization opportunities.`,
    });
  }

  return opportunities;
}

function main() {
  const options = parseArgs();

  if (!options.imageName) {
    console.error('❌ Error: Image name is required\n');
    printUsage();
    process.exit(1);
  }

  console.log(`\n🔍 Analyzing Docker Image: ${options.imageName}`);
  console.log('═'.repeat(60));

  // Check if Docker is available
  const dockerVersion = exec('docker --version');
  if (!dockerVersion) {
    console.error('❌ Docker is not installed or not running');
    process.exit(1);
  }

  // Get image info
  const imageInfo = getImageInfo(options.imageName);
  if (!imageInfo) {
    console.error(`❌ Image "${options.imageName}" not found`);
    console.log('\nTry pulling the image first:');
    console.log(`  docker pull ${options.imageName}`);
    process.exit(1);
  }

  // Get image history
  const history = getImageHistory(options.imageName);

  // Basic Info
  console.log('\n📋 Basic Information');
  console.log('─'.repeat(60));
  console.log(`   Image ID: ${imageInfo.Id.slice(7, 19)}`);
  console.log(`   Created: ${new Date(imageInfo.Created).toLocaleString()}`);
  console.log(`   Architecture: ${imageInfo.Architecture}`);
  console.log(`   OS: ${imageInfo.Os}`);

  // Size Analysis
  console.log('\n📦 Size Analysis');
  console.log('─'.repeat(60));
  const sizeBytes = imageInfo.Size;
  const sizeRating = getSizeRating(sizeBytes);
  console.log(`   Total Size: ${formatBytes(sizeBytes)}`);
  console.log(`   Rating: ${sizeRating.icon} ${sizeRating.rating} - ${sizeRating.message}`);
  console.log(`   Layers: ${history.length}`);

  // Layer Details (verbose)
  if (options.verbose && history.length > 0) {
    console.log('\n📚 Layer Details');
    console.log('─'.repeat(60));
    history.forEach((layer, index) => {
      const instruction = layer.createdBy
        .replace('/bin/sh -c ', '')
        .replace('#(nop) ', '')
        .slice(0, 70);
      console.log(`   ${index + 1}. [${layer.size.padStart(10)}] ${instruction}...`);
    });
  }

  // Configuration
  console.log('\n⚙️  Configuration');
  console.log('─'.repeat(60));
  const config = imageInfo.Config;
  console.log(`   User: ${config.User || 'root (default)'}`);
  console.log(`   Working Dir: ${config.WorkingDir || '/'}`);
  console.log(`   Exposed Ports: ${config.ExposedPorts ? Object.keys(config.ExposedPorts).join(', ') : 'none'}`);
  console.log(`   Entrypoint: ${config.Entrypoint ? config.Entrypoint.join(' ') : 'none'}`);
  console.log(`   CMD: ${config.Cmd ? config.Cmd.join(' ') : 'none'}`);
  console.log(`   Healthcheck: ${config.Healthcheck ? 'defined' : 'not defined'}`);

  // Security Analysis
  const securityIssues = analyzeSecurityIssues(imageInfo);
  console.log('\n🔒 Security Analysis');
  console.log('─'.repeat(60));
  if (securityIssues.length === 0) {
    console.log('   ✅ No major security issues detected');
  } else {
    securityIssues.forEach(issue => {
      const icon = issue.severity === 'HIGH' ? '🔴' : issue.severity === 'MEDIUM' ? '🟠' : '🟡';
      console.log(`   ${icon} [${issue.severity}] ${issue.issue}`);
      console.log(`      → ${issue.recommendation}`);
    });
  }

  // Optimization Opportunities
  const optimizations = analyzeOptimizationOpportunities(imageInfo, history);
  console.log('\n💡 Optimization Opportunities');
  console.log('─'.repeat(60));
  if (optimizations.length === 0) {
    console.log('   ✅ No obvious optimization opportunities detected');
  } else {
    optimizations.forEach(opt => {
      console.log(`   📌 ${opt.suggestion}`);
    });
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Summary');
  console.log('─'.repeat(60));

  const totalIssues = securityIssues.filter(i => i.severity === 'HIGH').length;
  if (totalIssues === 0 && sizeRating.rating !== 'Too Large' && sizeRating.rating !== 'Large') {
    console.log('   ✅ Image looks good for production use');
  } else {
    console.log('   ⚠️  Image needs attention:');
    if (totalIssues > 0) {
      console.log(`      - ${totalIssues} high severity security issue(s)`);
    }
    if (sizeRating.rating === 'Too Large' || sizeRating.rating === 'Large') {
      console.log(`      - Image size is ${sizeRating.rating.toLowerCase()}`);
    }
  }

  console.log('');
}

main();
