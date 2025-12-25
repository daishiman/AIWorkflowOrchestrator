# 非機能要件

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 1. パフォーマンス要件

### 1.1 レスポンスタイム目標

**UI操作**:

| 操作                            | 目標   | 測定基準 |
| ------------------------------- | ------ | -------- |
| ボタンクリック → フィードバック | <100ms | P50      |
| ページ遷移                      | <200ms | P50      |
| AI応答の初回トークン            | <2秒   | P50      |
| タスク一覧の読み込み            | <300ms | P50      |

**Electron固有**:

| 操作                        | 目標   |
| --------------------------- | ------ |
| アプリ起動時間              | <3秒   |
| Main/Rendererプロセス間通信 | <50ms  |
| ファイルシステム操作        | <500ms |

**測定基準**:

- P50（中央値）: 上記目標値
- P95: 目標値の1.5倍
- P99: 目標値の2倍

```typescript
// パフォーマンス計測の例
performance.mark("operation-start");
// ... 操作実行 ...
performance.mark("operation-end");
performance.measure("operation", "operation-start", "operation-end");
```

### 1.2 メモリ使用量

**目標値**:

- アイドル時: <200MB（デスクトップ版）
- 通常使用時: <500MB
- AI対話中: <800MB
- 長時間稼働: メモリリークなし（24時間で±10%以内）

```typescript
// メモリ使用量監視の例
if (process.memoryUsage().heapUsed > THRESHOLD) {
  logger.warn("High memory usage detected", {
    heapUsed: process.memoryUsage().heapUsed,
  });
}
```

### 1.3 ビルド時間最適化

| ビルド種別             | 目標時間 |
| ---------------------- | -------- |
| 開発ビルド（HMR）      | <5秒     |
| プロダクションビルド   | <2分     |
| Electronパッケージング | <3分     |
| CIビルド全体           | <10分    |

### 1.4 RAG変換システムのパフォーマンス要件

**ファイル変換処理の性能目標**:

| ファイルサイズ | 目標処理時間 | 実測値（2025-12-25） | 状態      |
| -------------- | ------------ | -------------------- | --------- |
| < 10KB         | < 50ms       | 3-12ms               | ✅ 達成   |
| 10KB - 100KB   | < 200ms      | 50-100ms             | ✅ 達成   |
| 100KB - 1MB    | < 1s         | 400ms（Markdown）    | ✅ 達成   |
| 1MB - 10MB     | < 5s         | 未検証               | ⚠️ 要検証 |
| > 10MB         | < 30s        | 未検証               | ⚠️ 要検証 |

**同時実行制御**:

- 最大同時実行数: 5件
- タイムアウト: デフォルト60秒（設定可能）
- メモリ制限: 最大コンテンツ長100,000文字

**性能モニタリング**:

```bash
# 手動パフォーマンステスト
pnpm tsx packages/shared/src/services/conversion/__manual-tests__/run-manual-tests.ts

# 実行時間とメモリ使用量が出力される
```

**性能劣化の検出**:

- 手動テストで処理時間が目標値の2倍を超えたら調査
- メモリ使用量が1GB超えたら最適化検討
- タイムアウトエラーが頻発したら並列度の見直し

---

## 2. テスト戦略（TDD実践ガイド）

### 2.1 Red-Green-Refactor サイクル

**Phase 1: Red（失敗するテストを書く）**

```typescript
// Step 1: テストケースを定義
describe("TaskRepository", () => {
  it("should create a new task with generated ID", () => {
    // Arrange: テストデータ準備
    const repository = new TaskRepository();
    const input = { title: "New Task", status: "pending" };

    // Act: 実行
    const task = repository.create(input);

    // Assert: 期待される結果
    expect(task).toHaveProperty("id");
    expect(task.title).toBe("New Task");
    expect(task.status).toBe("pending");
  });
});
// この時点では実装がないため失敗する
```

**Phase 2: Green（最小限の実装で成功させる）**

```typescript
// Step 2: 最小限の実装
class TaskRepository {
  create(input: { title: string; status: string }) {
    return {
      id: crypto.randomUUID(),
      ...input,
    };
  }
}
// テストが成功することを確認
```

**Phase 3: Refactor（品質向上）**

```typescript
// Step 3: テストを保護にリファクタリング
class TaskRepository {
  create(input: CreateTaskInput): Task {
    if (!input.title.trim()) {
      throw new Error("Title is required");
    }

    return {
      id: this.generateId(),
      title: input.title.trim(),
      status: input.status,
      createdAt: new Date(),
    };
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
// テストが引き続き成功することを確認
```

**サイクル管理**:

- 1サイクル: 5-15分を目安
- 常にグリーン状態を維持
- 1サイクルで1つの振る舞いだけ追加

### 2.2 テストピラミッド（個人開発最適化版）

```
        /\
       /  \  E2E (5%)
      /────\
     /      \  Integration (15%)
    /────────\
   /          \  Unit (80%)
  /────────────\
```

**現実的なカバレッジ目標**:

| レベル      | 目標カバレッジ | 実行頻度     | 投資時間 |
| ----------- | -------------- | ------------ | -------- |
| Unit        | 70-80%         | 毎回コミット | 60%      |
| Integration | 50-60%         | 毎回push     | 25%      |
| E2E         | 主要フロー     | CI/CD        | 15%      |

**優先すべきテスト対象**:

1. **必須（Unit 100%）**:
   - ビジネスロジック（Core Domain）
   - データ変換・計算処理
   - エラーハンドリング

2. **重要（Unit 80%）**:
   - API Gateway層
   - リポジトリ実装
   - カスタムHooks

3. **推奨（Integration 60%）**:
   - React コンポーネント（RTL）
   - IPC 通信
   - 外部API連携

4. **最小限（E2E クリティカルパス）**:
   - タスク作成・編集・削除
   - AI対話の基本フロー

### 2.3 Vitest ユニットテスト構成

**ファイル構成**:

```
src/
  features/
    task/
      core/
        domain/
          Task.ts
        application/
          TaskService.ts
      __tests__/
        unit/
          Task.test.ts           # ドメインモデル
          TaskService.test.ts    # アプリケーションサービス
        integration/
          TaskRepository.test.ts # リポジトリ統合
```

**ベストプラクティス**:

```typescript
// ✅ 良い例: 独立性、明確性、速度
describe("TaskService", () => {
  let service: TaskService;
  let mockRepository: MockTaskRepository;

  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new TaskService(mockRepository);
  });

  describe("createTask", () => {
    it("should generate UUID for new task", () => {
      const input = { title: "Test" };

      const task = service.createTask(input);

      expect(task.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("should throw error when title is empty", () => {
      const input = { title: "" };

      expect(() => service.createTask(input)).toThrow("Title is required");
    });
  });
});
```

**並列実行の最適化**:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    threads: true,
    maxConcurrency: 5,
    isolate: true,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
```

### 2.4 モック戦略

**MSW（Mock Service Worker） - API モック**:

```typescript
// src/shared/testing/msw/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/tasks", () => {
    return HttpResponse.json([
      { id: "1", title: "Task 1" },
      { id: "2", title: "Task 2" },
    ]);
  }),

  http.post("/api/tasks", async ({ request }) => {
    const task = await request.json();
    return HttpResponse.json(
      { id: crypto.randomUUID(), ...task },
      { status: 201 },
    );
  }),
];

// src/shared/testing/msw/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

**vi.mock - モジュールモック**:

```typescript
import { vi } from "vitest";
import { ClaudeClient } from "@/shared/infrastructure/ai/ClaudeClient";

vi.mock("@/shared/infrastructure/ai/ClaudeClient");

describe("AIService", () => {
  it("should send prompt to Claude", async () => {
    const mockSend = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "Response" }],
    });

    vi.mocked(ClaudeClient).mockImplementation(() => ({
      send: mockSend,
    }));

    const service = new AIService();
    await service.ask("Hello");

    expect(mockSend).toHaveBeenCalled();
  });
});
```

**テストダブルの使い分け**:

| ダブル   | 用途                 | 例                                |
| -------- | -------------------- | --------------------------------- |
| **Stub** | 決まった値を返す     | `vi.fn().mockReturnValue(42)`     |
| **Mock** | 呼び出しを検証       | `expect(mock).toHaveBeenCalled()` |
| **Spy**  | 実装を保持しつつ監視 | `vi.spyOn(obj, 'method')`         |
| **Fake** | 軽量な代替実装       | InMemoryRepository                |

### 2.5 React Testing Library ベストプラクティス

**ユーザー視点テストの具体例**:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  it('should create task when user fills form and submits', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<TaskForm onSubmit={onSubmit} />);

    // ユーザーがラベルでフィールドを見つける
    const titleInput = screen.getByLabelText(/タスク名/i);
    const submitButton = screen.getByRole('button', { name: /作成/i });

    // ユーザーが入力する
    await user.type(titleInput, '新しいタスク');
    await user.click(submitButton);

    // 期待される結果
    expect(onSubmit).toHaveBeenCalledWith({
      title: '新しいタスク',
    });
  });
});
```

**アクセシビリティテストの統合**:

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('TaskList', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TaskList tasks={[{ id: '1', title: 'Task 1', status: 'pending' }]} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 2.6 E2Eテスト（Playwright）効率化

**クリティカルパスの特定**:

```typescript
// tests/e2e/critical-paths.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Critical User Journeys", () => {
  test("should create and complete task", async ({ page }) => {
    await page.goto("/");

    // タスク作成
    await page.getByLabel("タスク名").fill("重要なタスク");
    await page.getByRole("button", { name: "作成" }).click();

    // 作成確認
    await expect(page.getByText("重要なタスク")).toBeVisible();
  });
});
```

**フレーキーテストの防止策**:

```typescript
// ✅ 良い例: 明示的な待機
test("should load tasks", async ({ page }) => {
  await page.goto("/tasks");
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('[data-testid="task-list"]');

  const tasks = await page.getByRole("listitem").count();
  expect(tasks).toBeGreaterThan(0);
});

// ❌ 悪い例: 固定時間待機
test("should load tasks", async ({ page }) => {
  await page.goto("/tasks");
  await page.waitForTimeout(1000); // フレーキー
});
```

**CI/CD統合パターン**:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm build
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### 2.7 Electron アプリテスト

**Main/Renderer プロセステスト戦略**:

```typescript
// IPC通信のモック
export const createIPCMock = () => {
  const handlers = new Map();

  return {
    handle: (channel: string, handler: Function) => {
      handlers.set(channel, handler);
    },
    invoke: async (channel: string, ...args: any[]) => {
      const handler = handlers.get(channel);
      if (!handler) throw new Error(`No handler for ${channel}`);
      return handler({}, ...args);
    },
    clear: () => handlers.clear(),
  };
};
```

**ファイルシステム操作のテスト**:

```typescript
import { vi } from "vitest";
import { vol } from "memfs";

vi.mock("fs/promises");

describe("FileStorage", () => {
  beforeEach(() => {
    vol.reset();
    vol.fromJSON({
      "/app/data/tasks.json": JSON.stringify([]),
    });
  });

  it("should save tasks to file", async () => {
    const storage = new FileStorage("/app/data");
    await storage.saveTasks([{ id: "1", title: "Task 1" }]);

    const content = vol.readFileSync("/app/data/tasks.json", "utf8");
    expect(JSON.parse(content)).toHaveLength(1);
  });
});
```

---

## 3. セキュリティ

### 3.1 認証・認可

| 項目           | 実装                         |
| -------------- | ---------------------------- |
| 認証方式       | NextAuth.js + Discord OAuth  |
| セッション管理 | セッションCookie（30日有効） |
| API認証        | JWT または API Key           |

### 3.2 データ保護

| 項目           | 実装                 |
| -------------- | -------------------- |
| API キー       | 環境変数管理         |
| ローカルデータ | Electron safeStorage |
| 通信           | HTTPS必須            |

### 3.3 脆弱性対策

| 対策         | ツール                   |
| ------------ | ------------------------ |
| 依存関係監査 | `pnpm audit`、Dependabot |
| CSP設定      | next.config.ts           |
| XSS/CSRF     | React デフォルト保護     |

---

## 4. 可用性

### 4.1 エラーハンドリング

- グローバルエラーバウンダリ
- ユーザーフレンドリーなエラーメッセージ
- 構造化ログ出力

### 4.2 オフライン対応

- ローカルSQLiteへのフォールバック
- 同期キューの実装
- オフライン状態の明示的な表示

---

## 5. 保守性

### 5.1 コード品質

| ツール            | 用途               |
| ----------------- | ------------------ |
| ESLint            | コード品質チェック |
| Prettier          | フォーマット統一   |
| TypeScript strict | 型安全性           |

**RAG変換システムの品質実績（2025-12-25時点）**:

| 指標                   | 結果                               | 評価    |
| ---------------------- | ---------------------------------- | ------- |
| ESLintエラー           | 0                                  | ✅ 完璧 |
| TypeScriptエラー       | 0                                  | ✅ 完璧 |
| ユニットテスト         | 201/201 PASS（100%）               | ✅ 完璧 |
| テストカバレッジ       | 100%（全指標）                     | ✅ 完璧 |
| 手動テスト             | 7/7 PASS（100%）                   | ✅ 完璧 |
| ビルド                 | 成功（1.58s）                      | ✅ 完璧 |
| アーキテクチャレビュー | A+評価（98/100）                   | ✅ 優秀 |
| **総合評価**           | **A+（本番環境デプロイ準備完了）** | ✅ 完璧 |

**品質保証プロセス**:

- Phase 0-4: TDD Red-Green-Refactor
- Phase 5: コードリファクタリング
- Phase 6: 品質ゲート（ESLint/TypeCheck/Test/Build/Coverage）
- Phase 7: 最終アーキテクチャレビュー
- Phase 8: 手動テスト検証
- Phase 9: ドキュメント更新

**新規モジュールに適用する品質基準**:

| 基準                     | 必須レベル                       |
| ------------------------ | -------------------------------- |
| ESLint                   | 0エラー（必須）                  |
| TypeScript型チェック     | 0エラー（必須）                  |
| ユニットテストカバレッジ | 100%（ドメインサービス層は必須） |
| 手動テスト成功率         | 100%（リリース前必須）           |
| アーキテクチャレビュー   | PASS判定（Phase 7で実施）        |

### 5.2 CI/CD

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v4
```

---

## 6. アクセシビリティ

### 6.1 WCAG 2.1 AA 準拠

- キーボード操作完全対応
- スクリーンリーダー対応（ARIA属性）
- コントラスト比 4.5:1 以上

### 6.2 多言語対応

- i18n実装（React i18next）
- 日本語・英語サポート

---

## 7. テストカバレッジ目標

### 7.1 各層の目標値

| 層                 | 目標カバレッジ       | 測定方法          |
| ------------------ | -------------------- | ----------------- |
| ドメイン層         | 90%以上              | Vitest --coverage |
| アプリケーション層 | 80%以上              | Vitest --coverage |
| インフラ層         | 60%以上              | Vitest --coverage |
| UI層（React）      | 70%以上              | RTL + Vitest      |
| E2E                | クリティカルパス100% | Playwright        |

**RAG変換システムの実績（2025-12-25時点）**:

| モジュール            | Statements | Branches | Functions | Lines    | テスト数      |
| --------------------- | ---------- | -------- | --------- | -------- | ------------- |
| base-converter.ts     | 100%       | 100%     | 100%      | 100%     | -             |
| markdown-converter.ts | 100%       | 100%     | 100%      | 100%     | 54ケース      |
| code-converter.ts     | 100%       | 100%     | 100%      | 100%     | 51ケース      |
| yaml-converter.ts     | 100%       | 100%     | 100%      | 100%     | 61ケース      |
| conversion-service.ts | 100%       | 100%     | 100%      | 100%     | -             |
| **総合**              | **100%**   | **100%** | **100%**  | **100%** | **201ケース** |

**達成方法**:

- TDD Red-Green-Refactorサイクルの厳格な実施
- エッジケース、境界値、異常系を網羅
- Phase 6品質ゲートでカバレッジ100%を必須化

**今後の新規コンバーターに適用する基準**:

- ドメインサービス層（services/conversion/）: **100%必須**
- 新規コンバーター実装: **100%必須**（Phase 6でチェック）

### 7.2 測定コマンド

```bash
# ユニットテスト カバレッジ
pnpm vitest --coverage

# カバレッジ閾値チェック（CI用）
pnpm vitest --coverage --coverage.thresholds.lines=70

# E2E カバレッジ
pnpm exec playwright test --reporter=html
```

---

## 関連ドキュメント

- [プロジェクト概要](./01-overview.md)
- [テクノロジースタック](./03-technology-stack.md)
- [エラーハンドリング仕様](./07-error-handling.md)
