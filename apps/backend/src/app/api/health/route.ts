import { NextResponse } from "next/server";

export interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
}

const startTime = Date.now();

/**
 * GET /api/health
 * ヘルスチェックエンドポイント
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  const response: HealthResponse = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_API_VERSION || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  return NextResponse.json(response, { status: 200 });
}
