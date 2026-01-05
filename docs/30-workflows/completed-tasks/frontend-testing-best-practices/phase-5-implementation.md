# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| Phase名    | 実装（TDD: Green）              |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |
| ステータス | 未実施                          |
| 作成日     | 2026-01-04                      |
| 機能名     | frontend-testing-best-practices |

---

## 目的

テストを通すための実装を行う。このPhase完了時点でカバレッジ80%以上を達成する。

## 背景

TDDサイクルのGreenフェーズとして、Phase 4で作成した失敗テストを通す実装を行う。

---

## 使用エージェント

| エージェント | パス                            | 選定理由            |
| ------------ | ------------------------------- | ------------------- |
| unit-tester  | `.claude/agents/unit-tester.md` | テスト実装・TDD実践 |

**代替候補**: `.claude/agents/frontend-tester.md`

---

## 使用スキル

| スキル名                | パス                                              | 活用方法       | 選定理由         |
| ----------------------- | ------------------------------------------------- | -------------- | ---------------- |
| clean-code-practices    | `.claude/skills/clean-code-practices/SKILL.md`    | クリーンな実装 | 保守性確保       |
| error-handling-patterns | `.claude/skills/error-handling-patterns/SKILL.md` | エラー処理実装 | 堅牢性確保       |
| type-safety-patterns    | `.claude/skills/type-safety-patterns/SKILL.md`    | 型安全な実装   | 実行時エラー防止 |

---

## 参照資料

| 参照資料     | パス                                    | 内容          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| テストケース | `outputs/phase-4/test-cases.md`         | Phase 4成果物 |

---

## 実行手順

### ステップ1: MSWセットアップ

```bash
# MSWインストール
pnpm --filter @repo/desktop add -D msw
```

```typescript
// apps/desktop/src/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  // Supabase Auth
  http.post("https://*.supabase.co/auth/v1/token", () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      user: { id: "mock-user-id", email: "test@example.com" },
    });
  }),

  // Anthropic API
  http.post("https://api.anthropic.com/v1/messages", () => {
    return HttpResponse.json({
      id: "msg_mock",
      content: [{ type: "text", text: "Mock AI response" }],
      model: "claude-opus-4-5",
      role: "assistant",
      stop_reason: "end_turn",
      usage: { input_tokens: 10, output_tokens: 20 },
    });
  }),
];
```

```typescript
// apps/desktop/src/test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

### ステップ2: Vitest UIセットアップ

```bash
# Vitest UIインストール
pnpm --filter @repo/desktop add -D @vitest/ui
```

```json
// package.json スクリプト追加
{
  "scripts": {
    "test:ui": "vitest --ui",
    "test:ui:desktop": "pnpm --filter @repo/desktop vitest --ui"
  }
}
```

### ステップ3: テストユーティリティ実装

```typescript
// apps/desktop/src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

interface CustomRenderOptions extends RenderOptions {
  route?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...options }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}
```

```typescript
// apps/desktop/src/test/test-helpers.ts
import { act } from "@testing-library/react";
import type { StoreApi, UseBoundStore } from "zustand";

export function mockStore<T>(
  useStore: UseBoundStore<StoreApi<T>>,
  initialState: Partial<T>,
) {
  act(() => {
    useStore.setState(initialState as T);
  });
}

export function resetStore<T>(useStore: UseBoundStore<StoreApi<T>>) {
  act(() => {
    useStore.setState(useStore.getInitialState());
  });
}
```

```typescript
// apps/desktop/src/test/factories.ts
import type { ChatSession, ChatMessage } from "@repo/shared/types";

export const createMockChatSession = (
  overrides?: Partial<ChatSession>,
): ChatSession => ({
  id: "session-1",
  title: "テストセッション",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockChatMessage = (
  overrides?: Partial<ChatMessage>,
): ChatMessage => ({
  id: "msg-1",
  sessionId: "session-1",
  role: "user",
  content: "テストメッセージ",
  timestamp: new Date().toISOString(),
  ...overrides,
});
```

### ステップ4: カバレッジ閾値設定

```typescript
// apps/desktop/vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 60,
        statements: 80,
      },
      exclude: [
        "node_modules/",
        "out/",
        "dist/",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
        "e2e/**",
        "src/test/**",
      ],
    },
  },
});
```

### ステップ5: E2Eテスト実装

10本以上のE2Eテストを実装：

1. 初回セットアップフロー
2. ワークスペース検索
3. チャット履歴エクスポート
4. テキストコンバーター
5. 設定変更永続化
6. エラーハンドリング
7. 複数ファイル検索
8. チャット履歴インポート
9. ダークモード切り替え
10. キーボードショートカット

### ステップ6: 追加テスト作成（カバレッジ80%達成）

カバレッジ80%を達成するために必要な追加テストを作成：

- 未テストのコンポーネント
- 未テストのユーティリティ関数
- 未テストのストア
- エッジケース・境界値テスト

---

## 成果物

| 成果物               | パス                                      | 内容              |
| -------------------- | ----------------------------------------- | ----------------- |
| MSWハンドラー        | `apps/desktop/src/test/mocks/handlers.ts` | APIモック         |
| MSWサーバー          | `apps/desktop/src/test/mocks/server.ts`   | サーバー設定      |
| テストユーティリティ | `apps/desktop/src/test/utils.tsx`         | カスタムレンダー  |
| テストヘルパー       | `apps/desktop/src/test/test-helpers.ts`   | ストアモック等    |
| ファクトリー         | `apps/desktop/src/test/factories.ts`      | テストデータ生成  |
| E2Eテスト            | `apps/desktop/e2e/*.spec.ts`              | E2Eテストファイル |

---

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] MSWがセットアップされ動作する
- [ ] Vitest UIが起動する
- [ ] テストユーティリティが実装されている
- [ ] E2Eテスト10本以上が実装されている
- [ ] **カバレッジ80%以上を達成している**

### カバレッジ目標

| パッケージ | 行   | 関数 | 分岐 |
| ---------- | ---- | ---- | ---- |
| desktop    | 80%+ | 80%+ | 60%+ |
| shared     | 80%+ | 80%+ | 60%+ |

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## スキルフィードバック記録

| スキル                  | 結果 | 備考 |
| ----------------------- | ---- | ---- |
| clean-code-practices    | -    | -    |
| error-handling-patterns | -    | -    |
| type-safety-patterns    | -    | -    |

---

## 次のPhase

`docs/30-workflows/frontend-testing-best-practices/phase-6-refactoring.md`
