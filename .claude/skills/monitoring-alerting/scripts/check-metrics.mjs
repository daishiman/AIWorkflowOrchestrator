#!/usr/bin/env node

/**
 * Metrics Check Script
 *
 * Checks various metrics of a service and reports status.
 *
 * Usage:
 *   node check-metrics.mjs https://app.example.com
 *   node check-metrics.mjs https://app.example.com --health-path /api/health
 */

const args = process.argv.slice(2);

function parseArgs() {
  const options = {
    baseUrl: null,
    healthPath: '/api/health',
    timeout: 10,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--health-path' || arg === '-p') {
      options.healthPath = args[++i];
    } else if (arg === '--timeout' || arg === '-t') {
      options.timeout = parseInt(args[++i], 10);
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      options.baseUrl = arg;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
Metrics Check Script

Usage:
  node check-metrics.mjs <base-url> [options]

Options:
  --health-path, -p <path>  Health endpoint path (default: /api/health)
  --timeout, -t <s>         Request timeout in seconds (default: 10)
  --verbose, -v             Show detailed output
  --help, -h                Show this help message

Examples:
  node check-metrics.mjs https://app.example.com
  node check-metrics.mjs https://app.example.com --health-path /health
  node check-metrics.mjs https://app.example.com -v
`);
}

async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    let body = null;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      body = await response.json();
    }

    return {
      success: response.ok,
      status: response.status,
      duration,
      body,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: `Timeout after ${timeout}s`,
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

function getStatusIcon(status) {
  if (status === 'pass' || status === 'healthy') return '✅';
  if (status === 'warn' || status === 'degraded') return '⚠️';
  return '❌';
}

function getLatencyRating(ms) {
  if (ms < 100) return { rating: 'Excellent', icon: '🟢' };
  if (ms < 300) return { rating: 'Good', icon: '🟢' };
  if (ms < 500) return { rating: 'Acceptable', icon: '🟡' };
  if (ms < 1000) return { rating: 'Slow', icon: '🟠' };
  return { rating: 'Critical', icon: '🔴' };
}

async function checkHomepage(baseUrl, timeout) {
  console.log('\n📄 Homepage Check');
  console.log('─'.repeat(40));

  const result = await fetchWithTimeout(baseUrl, timeout);

  if (result.success) {
    const latency = getLatencyRating(result.duration);
    console.log(`   Status: ✅ ${result.status}`);
    console.log(`   Latency: ${formatDuration(result.duration)} ${latency.icon} ${latency.rating}`);
    return { pass: true, latency: result.duration };
  } else {
    console.log(`   Status: ❌ ${result.status || 'Failed'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    return { pass: false };
  }
}

async function checkHealth(baseUrl, healthPath, timeout, verbose) {
  console.log('\n🏥 Health Check');
  console.log('─'.repeat(40));

  const url = `${baseUrl}${healthPath}`;
  const result = await fetchWithTimeout(url, timeout);

  if (result.success && result.body) {
    const health = result.body;
    const icon = getStatusIcon(health.status);

    console.log(`   Status: ${icon} ${health.status}`);
    console.log(`   Latency: ${formatDuration(result.duration)}`);

    if (health.version) {
      console.log(`   Version: ${health.version}`);
    }

    if (health.uptime) {
      const uptimeHours = Math.floor(health.uptime / 3600);
      const uptimeMins = Math.floor((health.uptime % 3600) / 60);
      console.log(`   Uptime: ${uptimeHours}h ${uptimeMins}m`);
    }

    if (health.checks && (verbose || health.status !== 'healthy')) {
      console.log('\n   Checks:');
      for (const [name, check] of Object.entries(health.checks)) {
        const checkIcon = getStatusIcon(check.status);
        let line = `     ${checkIcon} ${name}: ${check.status}`;
        if (check.responseTime) {
          line += ` (${check.responseTime}ms)`;
        }
        if (check.message) {
          line += ` - ${check.message}`;
        }
        console.log(line);
      }
    }

    return {
      pass: health.status === 'healthy',
      degraded: health.status === 'degraded',
      data: health,
    };
  } else {
    console.log(`   Status: ❌ Failed`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    return { pass: false };
  }
}

async function measureLatencyStats(baseUrl, timeout) {
  console.log('\n📊 Latency Statistics');
  console.log('─'.repeat(40));
  console.log('   Running 5 requests...');

  const latencies = [];

  for (let i = 0; i < 5; i++) {
    const result = await fetchWithTimeout(baseUrl, timeout);
    if (result.success) {
      latencies.push(result.duration);
    }
    // Small delay between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  if (latencies.length === 0) {
    console.log('   ❌ All requests failed');
    return { pass: false };
  }

  latencies.sort((a, b) => a - b);

  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const min = latencies[0];
  const max = latencies[latencies.length - 1];
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1];

  console.log(`   Samples: ${latencies.length}/5`);
  console.log(`   Min: ${formatDuration(min)}`);
  console.log(`   Max: ${formatDuration(max)}`);
  console.log(`   Avg: ${formatDuration(Math.round(avg))}`);
  console.log(`   P50: ${formatDuration(p50)}`);
  console.log(`   P95: ${formatDuration(p95)}`);

  const avgRating = getLatencyRating(avg);
  console.log(`   Rating: ${avgRating.icon} ${avgRating.rating}`);

  return {
    pass: avg < 1000,
    stats: { min, max, avg, p50, p95 },
  };
}

async function main() {
  const options = parseArgs();

  if (!options.baseUrl) {
    console.error('❌ Error: Base URL is required\n');
    printUsage();
    process.exit(1);
  }

  console.log(`\n🔍 Metrics Check: ${options.baseUrl}`);
  console.log('═'.repeat(50));

  const results = {
    homepage: await checkHomepage(options.baseUrl, options.timeout),
    health: await checkHealth(options.baseUrl, options.healthPath, options.timeout, options.verbose),
    latency: await measureLatencyStats(options.baseUrl, options.timeout),
  };

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📋 Summary');
  console.log('─'.repeat(50));

  const checks = [
    { name: 'Homepage', result: results.homepage },
    { name: 'Health', result: results.health },
    { name: 'Latency', result: results.latency },
  ];

  let allPassed = true;
  let hasDegraded = false;

  for (const check of checks) {
    const icon = check.result.pass ? '✅' : check.result.degraded ? '⚠️' : '❌';
    const status = check.result.pass ? 'Pass' : check.result.degraded ? 'Degraded' : 'Fail';
    console.log(`   ${icon} ${check.name}: ${status}`);

    if (!check.result.pass) allPassed = false;
    if (check.result.degraded) hasDegraded = true;
  }

  console.log('─'.repeat(50));

  if (allPassed && !hasDegraded) {
    console.log('✅ All checks passed!');
    process.exit(0);
  } else if (allPassed && hasDegraded) {
    console.log('⚠️  Service is degraded');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
