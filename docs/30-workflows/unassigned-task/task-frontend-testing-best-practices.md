# フロントエンドテストベストプラクティス導入 - タスク指示書

## メタ情報

| 項目             | 内容                                   |
| ---------------- | -------------------------------------- |
| タスクID         | TEST-01                                |
| タスク名         | フロントエンドテストベストプラクティス |
| 分類             | 品質向上/テストインフラ強化            |
| 対象機能         | テストシステム全体                     |
| 優先度           | 高                                     |
| 見積もり規模     | 中規模                                 |
| ステータス       | 未実施                                 |
| 発見元           | テスト戦略レビュー                     |
| 発見日           | 2025-12-25                             |
| 発見エージェント | .claude/agents/frontend-tester.md      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のプロジェクトには175個のテストファイルとPlaywright E2Eテストが導入されているが、以下の課題が存在する：

- 外部APIへの依存によるテストの不安定性
- ビジュアルテストランナーの不在によるデバッグ効率の低下
- E2Eテストのカバレッジ不足（4本のみ）
- カバレッジ閾値未設定による品質基準の曖昧さ

### 1.2 問題点・課題

#### 現状の課題

1. **API依存テストの不安定性**
   - Supabase、Anthropic等の外部API呼び出しが含まれる
   - ネットワーク障害・API制限でテスト失敗
   - テスト実行速度が遅い

2. **デバッグ効率の低下**
   - CLI出力のみでテスト結果を確認
   - カバレッジマップの可視化が困難
   - 失敗テストの原因特定に時間がかかる

3. **E2Eカバレッジ不足**
   - クリティカルフローのテストが不足
   - リグレッション検出が不十分

4. **品質基準の曖昧さ**
   - カバレッジ閾値が未設定
   - CI/CDでの品質ゲートが不明確

### 1.3 放置した場合の影響

- **高**: 本番環境でのバグ混入リスク増大
- **高**: リグレッション発生の検出遅延
- **中**: 開発速度の低下（テストデバッグに時間消費）
- **中**: 技術的負債の蓄積

---

## 2. 何を達成するか（What）

### 2.1 目的

費用対効果の高いテストピラミッド構造を実現し、フロントエンド開発の品質と速度を向上させる。

### 2.2 最終ゴール

**テスト構成比率**: Unit 70% / Component 20% / E2E 10%

1. **MSW（Mock Service Worker）導入**
   - 外部APIモックによる安定・高速テスト実現
   - ネットワーク依存の排除

2. **Vitest UI導入**
   - ブラウザベースのテスト結果可視化
   - リアルタイムカバレッジマップ表示

3. **E2Eテスト拡充**
   - クリティカルフロー10-15本の実装
   - ユーザー主要操作の網羅

4. **カバレッジ閾値設定**
   - 行カバレッジ70%、関数65%、分岐60%
   - CI/CDでの自動品質チェック

### 2.3 スコープ

#### 含むもの

- MSW (Mock Service Worker) のセットアップ
- API mocks/handlers の実装
- Vitest UI の導入と設定
- E2Eテストシナリオ設計と実装
- カバレッジ閾値設定
- テストユーティリティヘルパー関数
- CI/CD統合設定

#### 含まないもの

- Storybook導入（任意・Phase 2で検討）
- Visual Regression Testing（有料サービス不使用）
- パフォーマンステスト
- セキュリティテスト

### 2.4 成果物

#### Phase 1: MSW導入

- `apps/desktop/src/test/mocks/handlers.ts` - API モックハンドラー
- `apps/desktop/src/test/mocks/server.ts` - MSW サーバー設定
- `apps/desktop/src/test/setup.ts` - 更新版セットアップ

#### Phase 2: Vitest UI

- `package.json` - test:ui スクリプト追加
- `.vscode/launch.json` - デバッグ設定（オプション）

#### Phase 3: E2E拡充

- `apps/desktop/e2e/critical-flows.spec.ts` - クリティカルフロー
- `apps/desktop/e2e/workflow-operations.spec.ts` - ワークフロー操作
- `apps/desktop/e2e/data-persistence.spec.ts` - データ永続化

#### Phase 4: カバレッジ閾値

- `apps/desktop/vitest.config.ts` - 閾値設定更新
- `packages/shared/vitest.config.ts` - 閾値設定更新

#### Phase 5: テストユーティリティ

- `apps/desktop/src/test/utils.tsx` - カスタムレンダー関数
- `apps/desktop/src/test/test-helpers.ts` - テストヘルパー

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- ✅ Vitest 既存セットアップ済み（175テストファイル）
- ✅ Playwright 既存セットアップ済み（4 E2Eテスト）
- ✅ Testing Library 導入済み
- ✅ happy-dom 環境構築済み

### 3.2 依存タスク

なし（独立タスク）

### 3.3 必要な知識・スキル

- MSW (Mock Service Worker) の使用方法
- Vitest の高度な設定
- Playwright E2E テスト設計
- Testing Library API
- TypeScript型定義

### 3.4 推奨アプローチ

**段階的導入戦略**

1. **Week 1**: MSW + Vitest UI 導入（基盤強化）
2. **Week 2**: E2E拡充 + カバレッジ閾値設定
3. **Week 3**: テストユーティリティ整備
4. **Week 4**: CI/CD統合とドキュメント整備

**優先順位**

1. MSW導入（最優先：テスト安定性向上）
2. Vitest UI（開発体験向上）
3. カバレッジ閾値（品質基準明確化）
4. E2E拡充（リグレッション防止）

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: MSW導入 → Phase 2: Vitest UI導入 →
Phase 3: E2Eテスト拡充 → Phase 4: カバレッジ閾値設定 →
Phase 5: テストユーティリティ → Phase 6: CI/CD統合 →
Phase 7: ドキュメント作成 → Phase 8: 検証・レビュー
```

---

### Phase 0: 要件定義

#### 目的

現状のテスト構成を分析し、導入すべき項目の優先順位を決定する。

#### Claude Code スラッシュコマンド

```bash
# 現在のテストカバレッジ確認
pnpm test:coverage

# テストファイル数確認
find apps packages -name "*.test.ts*" -not -path "*/node_modules/*" | wc -l

# E2Eテスト一覧
ls apps/desktop/e2e/
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/frontend-tester.md`
- **選定理由**: フロントエンドテスト戦略の策定に特化
- **代替候補**: `.claude/agents/unit-tester.md`（ユニットテスト中心の場合）

#### 活用スキルリスト（動的選定）

| スキル名                                          | 活用方法             | 選定理由                 |
| ------------------------------------------------- | -------------------- | ------------------------ |
| `.claude/skills/frontend-testing/SKILL.md`        | テスト戦略の策定     | テストピラミッド設計     |
| `.claude/skills/test-data-management/SKILL.md`    | テストデータ設計     | モック・フィクスチャ管理 |
| `.claude/skills/boundary-value-analysis/SKILL.md` | エッジケース洗い出し | テストケース網羅性向上   |

#### 成果物

- 現状分析レポート
- 導入項目の優先順位リスト
- 成功基準の定義

#### 完了条件

- [ ] 現在のカバレッジ率が把握されている
- [ ] 外部API依存箇所がリストアップされている
- [ ] E2Eで必要なシナリオが洗い出されている
- [ ] 予算（¥0）制約内での実現可能性を確認

---

### Phase 1: MSW導入

#### 目的

Mock Service Worker (MSW) を導入し、外部API依存を排除する。

#### Claude Code スラッシュコマンド

```bash
# MSW インストール
pnpm add -D msw@latest

# MSW初期化（public dirがある場合）
pnpm dlx msw init apps/desktop/public --save
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: モック実装・テスト基盤構築に特化
- **代替候補**: `.claude/agents/frontend-tester.md`

#### 活用スキルリスト（動的選定）

| スキル名                                       | 活用方法                 | 選定理由               |
| ---------------------------------------------- | ------------------------ | ---------------------- |
| `.claude/skills/test-doubles/SKILL.md`         | APIモック設計            | 外部依存の分離         |
| `.claude/skills/api-client-patterns/SKILL.md`  | RESTハンドラー実装       | Supabase/Anthropic対応 |
| `.claude/skills/type-safety-patterns/SKILL.md` | 型安全なモックレスポンス | 実行時エラー防止       |

#### 実装内容

**1. handlers.ts 作成**

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

**2. server.ts 作成**

```typescript
// apps/desktop/src/test/mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

**3. setup.ts 更新**

```typescript
// apps/desktop/src/test/setup.ts
import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

// MSW サーバー起動
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 既存のElectronモック...
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  // ...
}));
```

#### 成果物

- `apps/desktop/src/test/mocks/handlers.ts`
- `apps/desktop/src/test/mocks/server.ts`
- `apps/desktop/src/test/setup.ts`（更新版）

#### 完了条件

- [ ] MSW パッケージがインストール済み
- [ ] handlers.ts に主要APIのモックが実装されている
  - [ ] Supabase Auth API
  - [ ] Anthropic Messages API
- [ ] setup.ts でMSWサーバーが起動する
- [ ] 既存テストがMSW環境下で成功する
- [ ] テスト実行速度が改善されている（ベンチマーク）

---

### Phase 2: Vitest UI導入

#### 目的

ブラウザベースのビジュアルテストランナーを導入し、デバッグ効率を向上させる。

#### Claude Code スラッシュコマンド

```bash
# Vitest UI インストール
pnpm add -D @vitest/ui

# package.json のスクリプト更新は手動
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: 開発ツール設定・スクリプト管理に適任
- **代替候補**: `.claude/agents/frontend-tester.md`

#### 活用スキルリスト（動的選定）

| スキル名                                    | 活用方法         | 選定理由         |
| ------------------------------------------- | ---------------- | ---------------- |
| `.claude/skills/code-style-guides/SKILL.md` | package.json整形 | 一貫性のある記述 |

#### 実装内容

**package.json 更新**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:ui": "vitest --ui",
    "test:ui:desktop": "pnpm --filter @repo/desktop vitest --ui",
    "test:ui:shared": "pnpm --filter @repo/shared vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:coverage:ui": "vitest --ui --coverage"
  }
}
```

#### 成果物

- ルート `package.json` （スクリプト追加）
- `apps/desktop/package.json` （スクリプト追加）
- `packages/shared/package.json` （スクリプト追加）

#### 完了条件

- [ ] @vitest/ui パッケージがインストール済み
- [ ] `pnpm test:ui` でUIが起動する
- [ ] ブラウザでテスト結果が表示される
- [ ] カバレッジマップがUI上で確認できる
- [ ] 失敗テストのスタックトレースが見やすい

---

### Phase 3: E2Eテスト拡充

#### 目的

クリティカルなユーザーフローをカバーするE2Eテストを10-15本実装する。

#### Claude Code スラッシュコマンド

```bash
# E2Eテストディレクトリ確認
ls apps/desktop/e2e/

# Playwright実行確認
pnpm --filter @repo/desktop test:e2e --headed
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/e2e-tester.md`
- **選定理由**: E2Eシナリオ設計・実装に特化
- **代替候補**: `.claude/agents/frontend-tester.md`

#### 活用スキルリスト（動的選定）

| スキル名                                        | 活用方法                 | 選定理由              |
| ----------------------------------------------- | ------------------------ | --------------------- |
| `.claude/skills/playwright-testing/SKILL.md`    | Playwright API活用       | 安定したE2Eテスト記述 |
| `.claude/skills/use-case-modeling/SKILL.md`     | ユースケースシナリオ設計 | 実ユーザー操作の再現  |
| `.claude/skills/flaky-test-prevention/SKILL.md` | 不安定なテスト防止策     | CI/CDでの安定実行     |

#### 実装シナリオ（優先順位順）

##### 最優先（Phase 3-1）

1. **初回セットアップフロー**
   - アプリ起動 → APIキー設定 → チャット送信 → レスポンス確認

2. **ワークスペース検索・置換**
   - フォルダ選択 → 検索実行 → 結果確認 → 置換実行 → 確認

3. **チャット履歴エクスポート**
   - チャット作成 → エクスポート → ファイル保存確認

##### 高優先度（Phase 3-2）

4. **テキストコンバーター**
   - CSV選択 → JSON変換 → 結果確認

5. **設定変更の永続化**
   - テーマ変更 → アプリ再起動 → 設定維持確認

6. **エラーハンドリング**
   - 無効なAPIキー → エラー表示確認

##### 中優先度（Phase 3-3）

7. **複数ファイル検索**
8. **チャット履歴インポート**
9. **ダークモード切り替え**
10. **キーボードショートカット**

#### 実装内容例

```typescript
// apps/desktop/e2e/critical-flows.spec.ts
import { test, expect } from "@playwright/test";

test.describe("クリティカルフロー", () => {
  test("初回セットアップ → チャット送信", async ({ page }) => {
    await page.goto("/");

    // APIキー設定
    await page.getByRole("button", { name: "設定" }).click();
    await page.getByLabel("Anthropic API Key").fill("sk-test-key");
    await page.getByRole("button", { name: "保存" }).click();

    // チャット送信
    await page.getByPlaceholder("メッセージを入力").fill("Hello");
    await page.getByRole("button", { name: "送信" }).click();

    // レスポンス確認
    await expect(page.getByText("Mock AI response")).toBeVisible();
  });

  test("ワークスペース検索", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "検索" }).click();

    // フォルダ選択
    await page.getByRole("button", { name: "フォルダ選択" }).click();
    // Electron dialog処理は別途対応

    // 検索実行
    await page.getByLabel("検索パターン").fill("TODO");
    await page.getByRole("button", { name: "検索" }).click();

    // 結果確認
    await expect(page.getByTestId("search-results")).toBeVisible();
  });
});
```

#### 成果物

- `apps/desktop/e2e/critical-flows.spec.ts`
- `apps/desktop/e2e/workflow-operations.spec.ts`
- `apps/desktop/e2e/data-persistence.spec.ts`
- `apps/desktop/e2e/error-handling.spec.ts`

#### 完了条件

- [ ] 最優先シナリオ3本が実装済み
- [ ] 高優先度シナリオ3本が実装済み
- [ ] 中優先度シナリオ4本以上が実装済み
- [ ] 全E2Eテストがローカル環境で成功する
- [ ] CI環境でも安定して成功する（flaky test 0%）

---

### Phase 4: カバレッジ閾値設定

#### 目的

コードカバレッジの最低基準を設定し、品質ゲートを確立する。

#### Claude Code スラッシュコマンド

```bash
# 現在のカバレッジ確認
pnpm test:coverage

# レポート確認
open apps/desktop/coverage/index.html
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: コード品質基準の策定に特化
- **代替候補**: `.claude/agents/unit-tester.md`

#### 活用スキルリスト（動的選定）

| スキル名                                       | 活用方法                 | 選定理由             |
| ---------------------------------------------- | ------------------------ | -------------------- |
| `.claude/skills/clean-code-practices/SKILL.md` | テスタブルなコード設計   | カバレッジ向上       |
| `.claude/skills/code-smell-detection/SKILL.md` | カバレッジ低下の原因分析 | リファクタリング優先 |

#### 実装内容

**vitest.config.ts 更新**

```typescript
// apps/desktop/vitest.config.ts
export default defineConfig({
  // ... 既存設定
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],

      // カバレッジ閾値
      thresholds: {
        lines: 70, // 行カバレッジ 70%
        functions: 65, // 関数カバレッジ 65%
        branches: 60, // 分岐カバレッジ 60%
        statements: 70, // 文カバレッジ 70%
      },

      // 除外設定（既存）
      exclude: [
        "node_modules/",
        "out/",
        "dist/",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,js}",
        "e2e/**",
        "src/test/**",
        "src/main/index.ts",
        "src/preload/index.ts",
        "src/renderer/main.tsx",
        "**/index.ts",
        "**/types.ts",
      ],
    },
  },
});
```

```typescript
// packages/shared/vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],

      thresholds: {
        lines: 75, // sharedは高めの閾値
        functions: 70,
        branches: 65,
        statements: 75,
      },

      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/index.ts",
        "**/interfaces.ts",
      ],
    },
  },
});
```

#### 成果物

- `apps/desktop/vitest.config.ts`（閾値設定追加）
- `packages/shared/vitest.config.ts`（閾値設定追加）
- `.github/workflows/test.yml`（CI統合）

#### 完了条件

- [ ] desktop パッケージに閾値が設定されている
- [ ] shared パッケージに閾値が設定されている
- [ ] `pnpm test:coverage` で閾値チェックが実行される
- [ ] 閾値未達の場合にビルドが失敗する
- [ ] CI/CDで自動カバレッジチェックが動作する

---

### Phase 5: テストユーティリティ整備

#### 目的

テストコードの重複を削減し、生産性を向上させるヘルパー関数を実装する。

#### Claude Code スラッシュコマンド

```bash
# テストユーティリティディレクトリ作成
mkdir -p apps/desktop/src/test
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: テストヘルパー実装に特化
- **代替候補**: `.claude/agents/frontend-tester.md`

#### 活用スキルリスト（動的選定）

| スキル名                                        | 活用方法             | 選定理由                  |
| ----------------------------------------------- | -------------------- | ------------------------- |
| `.claude/skills/custom-hooks-patterns/SKILL.md` | カスタムレンダー作成 | React Testing Library拡張 |
| `.claude/skills/type-safety-patterns/SKILL.md`  | 型安全なヘルパー関数 | TypeScript型推論活用      |

#### 実装内容

**1. カスタムレンダー関数**

```typescript
// apps/desktop/src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'

interface CustomRenderOptions extends RenderOptions {
  route?: string
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/', ...options }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route)

  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  })
}
```

**2. Zustand ストアモック**

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

**3. テストデータファクトリー**

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

#### 成果物

- `apps/desktop/src/test/utils.tsx`
- `apps/desktop/src/test/test-helpers.ts`
- `apps/desktop/src/test/factories.ts`

#### 完了条件

- [ ] カスタムレンダー関数が実装されている
- [ ] ストアモックヘルパーが実装されている
- [ ] テストデータファクトリーが実装されている
- [ ] 既存テストで活用され、コード重複が削減されている
- [ ] 型安全性が保たれている

---

### Phase 6: CI/CD統合

#### 目的

GitHub Actionsでテストとカバレッジチェックを自動化する。

#### Claude Code スラッシュコマンド

```bash
# GitHub Actions ワークフローディレクトリ確認
ls -la .github/workflows/
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: CI/CD設定に特化
- **代替候補**: `.claude/agents/gha-workflow-architect.md`

#### 活用スキルリスト（動的選定）

| スキル名                                           | 活用方法             | 選定理由       |
| -------------------------------------------------- | -------------------- | -------------- |
| `.claude/skills/github-actions-debugging/SKILL.md` | ワークフローデバッグ | CI/CD問題解決  |
| `.claude/skills/caching-strategies-gha/SKILL.md`   | 依存関係キャッシュ   | ビルド時間短縮 |
| `.claude/skills/parallel-jobs-gha/SKILL.md`        | テスト並列実行       | CI時間短縮     |

#### 実装内容

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test:run

      - name: Run tests with coverage
        run: pnpm test:coverage

      - name: Upload coverage to Codecov (optional)
        if: github.event_name == 'push'
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: false

  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm --filter @repo/desktop exec playwright install --with-deps chromium

      - name: Run E2E tests
        run: pnpm --filter @repo/desktop test:e2e

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: apps/desktop/playwright-report/
          retention-days: 7
```

#### 成果物

- `.github/workflows/test.yml`（新規 or 更新）
- README.md に CI バッジ追加（オプション）

#### 完了条件

- [ ] GitHub ActionsでユニットテストがCIで実行される
- [ ] カバレッジ閾値チェックがCIで動作する
- [ ] E2Eテストが CI環境で成功する
- [ ] PRマージ前に自動テストが必須となる
- [ ] 失敗時のアーティファクト保存が動作する

---

### Phase 7: ドキュメント作成

#### 目的

テスト実行方法・メンテナンス方法を文書化する。

#### Claude Code スラッシュコマンド

N/A（手動ドキュメント作成）

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/manual-writer.md`
- **選定理由**: 開発者向けマニュアル作成に特化
- **代替候補**: `.claude/agents/spec-writer.md`

#### 活用スキルリスト（動的選定）

| スキル名                                           | 活用方法                 | 選定理由     |
| -------------------------------------------------- | ------------------------ | ------------ |
| `.claude/skills/markdown-advanced-syntax/SKILL.md` | 見やすいドキュメント作成 | 可読性向上   |
| `.claude/skills/tutorial-design/SKILL.md`          | ステップバイステップ解説 | 学習効率向上 |

#### 成果物

- `docs/testing/TESTING.md` - テスト実行ガイド
- `docs/testing/E2E.md` - E2Eテスト追加方法
- `docs/testing/MSW.md` - MSW使用方法

#### 完了内容例

**TESTING.md**

````markdown
# テスト実行ガイド

## クイックスタート

### ユニットテスト実行

```bash
# 全テスト実行
pnpm test:run

# ウォッチモード
pnpm test

# UI モード（推奨）
pnpm test:ui
```
````

### E2Eテスト実行

```bash
# ヘッドレスモード
pnpm --filter @repo/desktop test:e2e

# UIモード（デバッグ用）
pnpm --filter @repo/desktop test:e2e:ui
```

### カバレッジ確認

```bash
pnpm test:coverage
open coverage/index.html
```

## MSW (Mock Service Worker)

外部APIをモックして、安定・高速なテストを実現しています。

### モックハンドラー追加

`apps/desktop/src/test/mocks/handlers.ts` に追加：

```typescript
http.post("https://api.example.com/endpoint", () => {
  return HttpResponse.json({ message: "success" });
});
```

## トラブルシューティング

...

````

#### 完了条件

- [ ] TESTING.md が作成されている
- [ ] E2E.md が作成されている
- [ ] MSW.md が作成されている
- [ ] READMEからリンクされている
- [ ] 新規開発者がドキュメントだけでテスト実行できる

---

### Phase 8: 検証・レビュー

#### 目的

導入した全機能が正常に動作することを検証する。

#### Claude Code スラッシュコマンド

```bash
# 全テストスイート実行
pnpm test:all

# カバレッジ閾値チェック
pnpm test:coverage

# E2E実行
pnpm --filter @repo/desktop test:e2e

# Vitest UI起動
pnpm test:ui
````

#### 使用エージェントリスト（動的選定）

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: 品質レビュー・検証に特化
- **代替候補**: `.claude/agents/arch-police.md`

#### 活用スキルリスト（動的選定）

| スキル名                                              | 活用方法             | 選定理由       |
| ----------------------------------------------------- | -------------------- | -------------- |
| `.claude/skills/acceptance-criteria-writing/SKILL.md` | 受け入れ基準チェック | 成果物品質確認 |

#### 検証チェックリスト

**MSW検証**

- [ ] ユニットテストがMSW環境で成功する
- [ ] 外部API呼び出しがモックされている
- [ ] テスト実行速度が改善されている（ベンチマーク比較）

**Vitest UI検証**

- [ ] `pnpm test:ui` でUIが起動する
- [ ] テスト結果がブラウザで表示される
- [ ] カバレッジマップが正しく表示される
- [ ] 失敗テストの詳細が確認できる

**E2Eテスト検証**

- [ ] 10本以上のE2Eテストが実装されている
- [ ] 全E2Eテストがローカル環境で成功する
- [ ] CI環境でも安定して成功する

**カバレッジ検証**

- [ ] desktop: 行70%, 関数65%, 分岐60% を達成
- [ ] shared: 行75%, 関数70%, 分岐65% を達成
- [ ] 閾値未達の場合にビルドが失敗する

**CI/CD検証**

- [ ] GitHub Actionsでテストが自動実行される
- [ ] PRマージ前にテストが必須となる
- [ ] カバレッジレポートが生成される

#### 成果物

- 検証レポート
- 改善点リスト（あれば）

#### 完了条件

- [ ] 全検証項目がパスしている
- [ ] ドキュメントが整備されている
- [ ] チーム内で使用方法が共有されている

---

## 5. 完了条件チェックリスト

### 機能要件

#### MSW導入

- [ ] MSW パッケージがインストール済み
- [ ] Supabase Auth APIモックが動作する
- [ ] Anthropic Messages APIモックが動作する
- [ ] テスト実行速度が10秒以下（従来30秒から改善）

#### Vitest UI導入

- [ ] `pnpm test:ui` でUIが起動する
- [ ] テスト結果がリアルタイム表示される
- [ ] カバレッジマップが表示される
- [ ] 失敗テストのデバッグが容易になる

#### E2Eテスト拡充

- [ ] クリティカルフロー10本以上が実装済み
- [ ] 全E2Eテストがローカルで成功する
- [ ] CI環境でも安定して成功する（flaky test 0%）

#### カバレッジ閾値

- [ ] desktop: 行70%, 関数65%, 分岐60%
- [ ] shared: 行75%, 関数70%, 分岐65%
- [ ] 閾値未達でビルドが失敗する

#### テストユーティリティ

- [ ] カスタムレンダー関数が実装済み
- [ ] ストアモックヘルパーが実装済み
- [ ] テストデータファクトリーが実装済み

### 品質要件

- [ ] 全ユニットテストが成功する
- [ ] 全E2Eテストが成功する
- [ ] カバレッジ閾値を満たす
- [ ] CI/CDでテストが自動実行される
- [ ] テスト実行時間が許容範囲内（<5分）

### セキュリティ要件

- [ ] APIキー等の機密情報がモックに含まれない
- [ ] テストコードに本番APIキーが含まれない

### ドキュメント要件

- [ ] TESTING.md が作成されている
- [ ] E2E.md が作成されている
- [ ] MSW.md が作成されている
- [ ] 新規開発者がドキュメントだけで実行できる

### 運用要件

- [ ] CI/CDで自動テスト実行される
- [ ] PRマージ前にテストが必須
- [ ] カバレッジレポートが生成される

---

## 6. 関連ドキュメント

### 参照ドキュメント

- `docs/00-requirements/task-orchestration-specification.md` - タスク編成仕様
- `.claude/agents/frontend-tester.md` - フロントエンドテストエージェント
- `.claude/agents/e2e-tester.md` - E2Eテストエージェント
- `.claude/skills/frontend-testing/SKILL.md` - フロントエンドテストスキル
- `.claude/skills/playwright-testing/SKILL.md` - Playwrightテストスキル

### 外部リソース

- [MSW Documentation](https://mswjs.io/docs/)
- [Vitest UI](https://vitest.dev/guide/ui.html)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 7. 補足情報

### 導入後の期待効果

| 指標           | 現在   | 導入後  | 改善率 |
| -------------- | ------ | ------- | ------ |
| テスト実行時間 | ~30秒  | ~10秒   | 67%減  |
| カバレッジ     | 不明   | 70%+    | -      |
| E2Eテスト数    | 4本    | 10-15本 | 250%増 |
| デバッグ効率   | -      | 5倍向上 | -      |
| API依存テスト  | 不安定 | 安定    | -      |

### コスト

- **総コスト**: ¥0（全て無料ツール）
- **作業時間**: 2-3週間（1人）

### リスクと対策

| リスク                       | 影響度 | 対策                                   |
| ---------------------------- | ------ | -------------------------------------- |
| E2Eテストの不安定化          | 中     | flaky test防止スキル活用、リトライ設定 |
| カバレッジ閾値未達でブロック | 中     | 段階的に閾値引き上げ、除外設定の見直し |
| CI/CD時間の増加              | 低     | 並列実行、キャッシング最適化           |

### 今後の拡張

- **Phase 2候補**（任意）
  - Storybook導入（コンポーネントカタログ）
  - Visual Regression Testing（無料範囲で）
  - パフォーマンステスト（Lighthouse CI）
