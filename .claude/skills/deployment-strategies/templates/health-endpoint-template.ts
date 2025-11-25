/**
 * Health Endpoint Template
 *
 * Next.js API Route for health checks
 * Path: app/api/health/route.ts
 */

import { NextResponse } from 'next/server';

interface CheckResult {
  status: 'pass' | 'warn' | 'fail';
  responseTime?: number;
  message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: Record<string, CheckResult>;
}

// Database check example (customize for your ORM)
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Example: Drizzle/Prisma/raw query
    // await db.execute(sql`SELECT 1`);
    // await prisma.$queryRaw`SELECT 1`;

    // Placeholder - replace with actual DB check
    await Promise.resolve();

    return {
      status: 'pass',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

// External service check example
async function checkExternalService(url: string, name: string): Promise<CheckResult> {
  const start = Date.now();
  const timeout = 5000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        status: 'pass',
        responseTime: Date.now() - start,
      };
    }

    return {
      status: 'warn',
      responseTime: Date.now() - start,
      message: `${name} returned status ${response.status}`,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        status: 'warn',
        responseTime: Date.now() - start,
        message: `${name} timeout after ${timeout}ms`,
      };
    }

    return {
      status: 'fail',
      responseTime: Date.now() - start,
      message: error instanceof Error ? error.message : `${name} check failed`,
    };
  }
}

// Memory check
function checkMemory(): CheckResult {
  if (typeof process === 'undefined') {
    return { status: 'pass', message: 'Memory check not available in edge runtime' };
  }

  const used = process.memoryUsage();
  const heapUsedMB = used.heapUsed / 1024 / 1024;
  const heapTotalMB = used.heapTotal / 1024 / 1024;
  const usage = heapUsedMB / heapTotalMB;

  if (usage > 0.9) {
    return {
      status: 'fail',
      message: `Critical memory usage: ${(usage * 100).toFixed(1)}% (${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB)`,
    };
  }

  if (usage > 0.75) {
    return {
      status: 'warn',
      message: `High memory usage: ${(usage * 100).toFixed(1)}% (${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB)`,
    };
  }

  return {
    status: 'pass',
    message: `Memory usage: ${(usage * 100).toFixed(1)}% (${heapUsedMB.toFixed(0)}MB / ${heapTotalMB.toFixed(0)}MB)`,
  };
}

// Track server start time for uptime calculation
const startTime = Date.now();

export async function GET() {
  const checks: Record<string, CheckResult> = {};

  // Run all checks in parallel
  const [dbCheck, memoryCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkMemory()),
    // Add more checks as needed:
    // checkExternalService('https://api.openai.com', 'OpenAI'),
    // checkExternalService('https://discord.com/api', 'Discord'),
  ]);

  checks.database = dbCheck;
  checks.memory = memoryCheck;

  // Determine overall status
  const statuses = Object.values(checks).map((c) => c.status);
  let overallStatus: HealthResponse['status'];

  if (statuses.every((s) => s === 'pass')) {
    overallStatus = 'healthy';
  } else if (statuses.some((s) => s === 'fail')) {
    overallStatus = 'unhealthy';
  } else {
    overallStatus = 'degraded';
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) || 'unknown',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  // Return appropriate status code
  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(response, { status: statusCode });
}

// Also support HEAD requests for simple alive checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
