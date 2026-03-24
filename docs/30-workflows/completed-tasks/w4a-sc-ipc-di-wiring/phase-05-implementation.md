# Phase 5: 実装

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 5                      |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

`apps/desktop/src/main/ipc/index.ts` の1箇所を修正し、`RuntimeSkillCreatorFacade` に `skillFileManager`、`llmAdapter`、`resourceLoader` を注入する。

## 実行タスク

### Task 1: import 文の追加

`apps/desktop/src/main/ipc/index.ts` の import セクションに以下を追加する:

```typescript
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import type { ILLMAdapter } from "../adapters/llm/types";
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
```

追加位置: 既存の import 文群の末尾（ただし、同カテゴリの import と近くに配置する）。

### Task 2: track() ブロックの修正

`apps/desktop/src/main/ipc/index.ts` L891-912 を以下のように修正する。

**修正手順**:

1. callback 内部に IIFE パターン（`void (async () => { ... })()`）を追加（Phase 3 M-1 指摘対応: `track()` は `fn: () => void` 型のみ対応）
2. IIFE 内で LLM アダプター取得ロジックを追加
3. `ResourceLoader` のインスタンス化を追加
4. `RuntimeSkillCreatorFacade` のコンストラクタ引数に3依存（`llmAdapter`, `resourceLoader`, `skillFileManager`）を追加

**具体的な変更内容**:

```typescript
track("registerSkillCreatorHandlers", () => {
  void (async () => {
    const skillCreatorService = new SkillCreatorService();
    const skillExecutor = getSkillExecutorInstance();
    if (!skillExecutor) {
      console.warn(
        "[IPC] SkillExecutor not available, runtime skill creator handlers will stay degraded",
      );
    }

    // LLM アダプター取得（API キー未設定時は undefined にフォールバック）
    let llmAdapter: ILLMAdapter | undefined;
    try {
      llmAdapter = await LLMAdapterFactory.getAdapter("anthropic");
    } catch {
      console.warn(
        "[IPC] LLM adapter not available (API key may not be set), skill creator LLM features will be degraded",
      );
    }

    // ResourceLoader: skill-creator リソース読み込み基盤
    const resourceLoader = new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH);

    const skillFileWriter = new SkillFileWriter(skillBasePath);
    const runtimeSkillCreatorService = skillExecutor
      ? new RuntimeSkillCreatorFacade({
          skillExecutor,
          authKeyService,
          skillFileWriter,
          llmAdapter,
          resourceLoader,
          skillFileManager, // L702 で既に生成済みのインスタンスを参照
        })
      : undefined;
    registerSkillCreatorHandlers(
      mainWindow,
      skillCreatorService,
      runtimeSkillCreatorService,
    );
  })();
});
```

**IIFE パターンの技術的根拠**:

- `track()` (L546) は `fn: () => void` 型 — `safeRegister()` は Promise を await しない
- IIFE 内で非同期処理（LLM アダプター取得）を完結させ、その後にハンドラ登録を行う
- `safeRegister` は IIFE 開始時点で `true` を返す（`void (async () => { ... })()` は例外を throw しない）
- race condition リスク: 低い。Electron Main Process は BrowserWindow 作成前にハンドラ登録シーケンスを実行し、`LLMAdapterFactory.getAdapter()` は SecureStorage からの API キー取得（ローカルストレージアクセス）のみのため通常は数ms で完了する

> **注記**: IIFE 採用理由は TypeScript 型制約ではなく、`safeRegister()` が Promise を await しないという意味的同期要件（Phase 3 M-1 で明確化）。

### Task 3: 実装後の型チェック

```bash
cd apps/desktop && pnpm typecheck
```

### Task 4: 実装後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

## 参照資料

- Phase 2 設計（`phase-02-design.md`）
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`
- `apps/desktop/src/main/services/skill/ResourceLoader.ts`
- `apps/desktop/src/main/services/skill/constants.ts`

## 統合テスト連携

以下のコマンドで関連テストを実行し、全て PASS することを確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

## 多角的チェック観点（AIが判断）

IPC 配線タスクとして、以下の観点で実装内容を評価する:

- IPC 通信: `aiworkflow-requirements: api-*.md`, `interfaces-*.md`
- セキュリティ: `aiworkflow-requirements: security-api-electron.md`
- アーキテクチャ: `aiworkflow-requirements: architecture-*.md`

## サブタスク管理

| #   | タスク名               | ステータス |
| --- | ---------------------- | ---------- |
| 1   | import 文の追加        | 未着手     |
| 2   | track() ブロックの修正 | 未着手     |
| 3   | 実装後の型チェック     | 未着手     |
| 4   | 実装後のテスト実行     | 未着手     |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 成果物

- `apps/desktop/src/main/ipc/index.ts` の修正済みファイル

## 完了条件

- [ ] Task 1: import 文を4行追加した（`LLMAdapterFactory`, `ILLMAdapter`, `ResourceLoader`, `DEFAULT_SKILL_CREATOR_PATH`）
- [ ] Task 2: `track("registerSkillCreatorHandlers", ...)` ブロックを IIFE パターンに修正した
- [ ] Task 2: `RuntimeSkillCreatorFacade` のコンストラクタに `llmAdapter`、`resourceLoader`、`skillFileManager` を注入した
- [ ] Task 2: 既存の `skillFileWriter` 注入を維持した
- [ ] Task 3: `pnpm typecheck` がエラーなしで完了した
- [ ] Task 4: 既存テストが全て PASS した

## 次のPhase

Phase 6: テスト拡充
