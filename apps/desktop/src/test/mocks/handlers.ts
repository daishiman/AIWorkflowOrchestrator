/**
 * MSW API Handlers
 * Supabase Auth と Anthropic API のモックハンドラー
 */
import { http, HttpResponse } from "msw";

// モックユーザーデータ
export const mockUser = {
  id: "mock-user-id",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export const mockSession = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  user: mockUser,
};

// Supabase Auth ハンドラー
const supabaseAuthHandlers = [
  // サインイン（email/password）
  http.post("https://*.supabase.co/auth/v1/token", async ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get("grant_type");

    if (grantType === "password") {
      const body = (await request.json()) as {
        email?: string;
        password?: string;
      };

      if (body.email === "invalid@example.com") {
        return HttpResponse.json(
          {
            error: "invalid_grant",
            error_description: "Invalid login credentials",
          },
          { status: 400 },
        );
      }

      return HttpResponse.json(mockSession);
    }

    if (grantType === "refresh_token") {
      return HttpResponse.json(mockSession);
    }

    return HttpResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400 },
    );
  }),

  // サインアップ
  http.post("https://*.supabase.co/auth/v1/signup", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        {
          error: "user_already_exists",
          error_description: "User already registered",
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      user: mockUser,
      session: null, // 確認メール送信のため
    });
  }),

  // サインアウト
  http.post("https://*.supabase.co/auth/v1/logout", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // ユーザー情報取得
  http.get("https://*.supabase.co/auth/v1/user", ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-access-token")) {
      return HttpResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    return HttpResponse.json(mockUser);
  }),

  // パスワードリセット
  http.post("https://*.supabase.co/auth/v1/recover", () => {
    return new HttpResponse(null, { status: 200 });
  }),
];

// Anthropic API ハンドラー
const anthropicHandlers = [
  // Messages API
  http.post("https://api.anthropic.com/v1/messages", async ({ request }) => {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey || apiKey === "invalid-key") {
      return HttpResponse.json(
        {
          type: "error",
          error: {
            type: "authentication_error",
            message: "Invalid API key",
          },
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      model?: string;
      messages?: Array<{ role: string; content: string }>;
      stream?: boolean;
    };

    // ストリーミングレスポンス
    if (body.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const events = [
            'event: message_start\ndata: {"type":"message_start","message":{"id":"msg_mock","type":"message","role":"assistant","content":[],"model":"claude-3-opus-20240229","stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":10,"output_tokens":0}}}\n\n',
            'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n',
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}\n\n',
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" from"}}\n\n',
            'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":" MSW!"}}\n\n',
            'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n',
            'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":5}}\n\n',
            'event: message_stop\ndata: {"type":"message_stop"}\n\n',
          ];

          for (const event of events) {
            controller.enqueue(encoder.encode(event));
          }
          controller.close();
        },
      });

      return new HttpResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream",
        },
      });
    }

    // 通常レスポンス
    return HttpResponse.json({
      id: "msg_mock",
      type: "message",
      role: "assistant",
      content: [
        {
          type: "text",
          text: "Hello from MSW mock!",
        },
      ],
      model: body.model || "claude-3-opus-20240229",
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: {
        input_tokens: 10,
        output_tokens: 5,
      },
    });
  }),
];

// 統合エクスポート
export const handlers = [...supabaseAuthHandlers, ...anthropicHandlers];
