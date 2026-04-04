import { ExternalApiHttpError, ExternalApiTimeoutError } from "@repo/shared";
import type { ExternalApiAuthType, IExternalApiAdapter } from "@repo/shared";

export class HttpExternalApiAdapter implements IExternalApiAdapter {
  private static readonly TIMEOUT_MS = 30_000;

  private authType: Exclude<ExternalApiAuthType, "none"> | null = null;
  private credential: string | null = null;

  setAuth(
    type: Exclude<ExternalApiAuthType, "none">,
    credential: string,
  ): void {
    this.authType = type;
    this.credential = credential;
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    this.warnIfNotHttps(url);
    const mergedHeaders = { ...this.buildAuthHeader(), ...(headers ?? {}) };
    const response = await this.fetchWithTimeout(url, {
      method: "GET",
      headers: mergedHeaders,
    });
    return response.json() as Promise<T>;
  }

  async post<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    this.warnIfNotHttps(url);
    const mergedHeaders = {
      "Content-Type": "application/json",
      ...this.buildAuthHeader(),
      ...(headers ?? {}),
    };
    const response = await this.fetchWithTimeout(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: mergedHeaders,
    });
    return response.json() as Promise<T>;
  }

  private buildAuthHeader(): Record<string, string> {
    if (!this.authType || !this.credential) return {};

    switch (this.authType) {
      case "api-key":
        return { "X-API-Key": this.credential };
      case "bearer":
        return { Authorization: `Bearer ${this.credential}` };
      case "basic":
        return {
          Authorization: `Basic ${Buffer.from(this.credential, "utf8").toString("base64")}`,
        };
    }
  }

  private warnIfNotHttps(url: string): void {
    if (!url.startsWith("https://")) {
      console.warn(
        `[HttpExternalApiAdapter] Warning: non-HTTPS URL detected: ${url}`,
      );
    }
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      HttpExternalApiAdapter.TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new ExternalApiHttpError(url, response.status);
      }

      return response;
    } catch (error) {
      if (error instanceof ExternalApiHttpError) throw error;

      if (error instanceof Error && error.name === "AbortError") {
        throw new ExternalApiTimeoutError(url);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
