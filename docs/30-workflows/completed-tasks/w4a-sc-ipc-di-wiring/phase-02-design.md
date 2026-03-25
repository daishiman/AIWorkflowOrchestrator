# Phase 2: 設計

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 2                      |
| 機能名   | Skill Creator DI 配線  |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

`RuntimeSkillCreatorFacade` への3依存注入の具体的な実装設計を行う。修正対象ファイルは `apps/desktop/src/main/ipc/index.ts` の1箇所のみ。

## 背景

Phase 1 で特定された3依存（skillFileManager, llmAdapter, resourceLoader）の未注入を解消するための設計を行う。LLMアダプターの非同期取得が設計上の主要課題。

## 実行タスク

### Task 1: LLM アダプター取得戦略の決定

`LLMAdapterFactory.getAdapter(providerId)` は非同期であり、コンストラクタ内では `await` を使えない。以下の3案を評価する。

| 案  | 方式                                                  | メリット                          | デメリット                                   |
| --- | ----------------------------------------------------- | --------------------------------- | -------------------------------------------- |
| A   | `track()` 内を `async` にして事前取得後に注入         | Facade 側の変更不要               | API キー未設定時にハンドラ登録自体が失敗する |
| B   | `LLMAdapterFactory` をそのまま Facade に注入          | 遅延取得で API キー変更に追従可能 | Facade の Deps 型変更が必要                  |
| C   | `track()` 内で try-catch して取得、失敗時は undefined | 既存 Graceful Degradation と整合  | API キー未設定環境では LLM パスに到達しない  |

**推奨: 案C** を採用する。理由:

1. `track()` 内は既に同期/非同期混在パターンが存在する（L885 の `createAuthModeService` 等）
2. `RuntimeSkillCreatorFacadeDeps` の `llmAdapter` は `ILLMAdapter | undefined` として既に定義済み
3. API キー未設定環境では Graceful Degradation が正しい動作であり、P34（遅延初期化 DI）パターンに準拠する
4. Facade クラス側の型定義変更が不要

### Task 2: 修正箇所の設計

**修正対象**: `apps/desktop/src/main/ipc/index.ts` L889-909

**変更前**（L889-909）:

```typescript
track("registerSkillCreatorHandlers", () => {
  const skillCreatorService = new SkillCreatorService();
  const skillExecutor = getSkillExecutorInstance();
  if (!skillExecutor) {
    console.warn(
      "[IPC] SkillExecutor not available, runtime skill creator handlers will stay degraded",
    );
  }
  const runtimeSkillCreatorService = skillExecutor
    ? new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
      })
    : undefined;
  registerSkillCreatorHandlers(
    mainWindow,
    skillCreatorService,
    runtimeSkillCreatorService,
  );
});
```

**変更後の設計**:

```typescript
track("registerSkillCreatorHandlers", async () => {
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

  const runtimeSkillCreatorService = skillExecutor
    ? new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
        llmAdapter,
        resourceLoader,
        skillFileManager, // L701 で既に生成済みのインスタンスを参照
      })
    : undefined;
  registerSkillCreatorHandlers(
    mainWindow,
    skillCreatorService,
    runtimeSkillCreatorService,
  );
});
```

### Task 3: import 追加の設計

以下の import を `apps/desktop/src/main/ipc/index.ts` に追加する:

```typescript
import { LLMAdapterFactory } from "../adapters/llm/LLMAdapterFactory";
import type { ILLMAdapter } from "../adapters/llm/types";
import { ResourceLoader } from "../services/skill/ResourceLoader";
import { DEFAULT_SKILL_CREATOR_PATH } from "../services/skill/constants";
```

### Task 4: skillFileManager スコープの確認

`skillFileManager` は L701 で `const skillFileManager = new SkillFileManager()` として生成されている。この変数は `track("registerSkillFileHandlers", ...)` のクロージャスコープ内に閉じているか、外側スコープで宣言されているかを確認する必要がある。

L700-704 を確認すると:

```typescript
// Skill File handlers (TASK-9A-B)
const skillFileManager = new SkillFileManager();
track("registerSkillFileHandlers", () =>
  registerSkillFileHandlers(mainWindow, skillFileManager, skillService),
);
```

`skillFileManager` は `track()` のコールバック外で宣言されているため、同じ親関数スコープ内の L889-909 からも参照可能。変更不要。

### Task 5: 非同期 track() の互換性確認

`track()` 関数が `async` コールバックを受け入れるか確認する。`track()` は登録成功/失敗のカウントに使用されており、コールバックの戻り値型が `void | Promise<void>` であれば互換性がある。

## 参照資料

- `apps/desktop/src/main/ipc/index.ts` L698-909
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L46-53
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` L109-133
- `apps/desktop/src/main/services/skill/constants.ts` L64
- `.claude/rules/06-known-pitfalls.md` P34（遅延初期化 DI パターン）

## 成果物

- 本仕様書（Phase 2 設計）

## 完了条件

- [ ] LLM アダプター取得戦略を案Cに決定した
- [ ] `apps/desktop/src/main/ipc/index.ts` の変更前/変更後コードを設計した
- [ ] 追加する import 文を列挙した
- [ ] `skillFileManager` が親関数スコープで宣言されていることを確認した
- [ ] `track()` 関数が async コールバックを受け入れることを確認した

## 統合テスト連携

LLM アダプター取得戦略（案C: try-catch）が統合テスト観点で妥当であることを設計に反映。`track()` の async 化が既存テストに影響しないことを設計で確認済み。

## 多角的チェック観点

| 観点           | 適用                                          | 仕様参照先                                          |
| -------------- | --------------------------------------------- | --------------------------------------------------- |
| アーキテクチャ | DI 配線の設計・`track()` async 化             | `aiworkflow-requirements: architecture-*.md`        |
| IPC通信        | `registerSkillCreatorHandlers` ブロックの変更 | `aiworkflow-requirements: api-*.md`                 |
| セキュリティ   | API キーの SecureStorage 経由取得             | `aiworkflow-requirements: security-api-electron.md` |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w4a-sc-ipc-di-wiring --phase 2
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク                                | 結果 | 備考 |
| ------------------------------------- | ---- | ---- |
| Task 1: LLMアダプター取得戦略最終決定 | -    | -    |
| Task 2: 修正箇所の設計                | -    | -    |
| Task 3: import追加の設計              | -    | -    |
| Task 4: skillFileManagerスコープ確認  | -    | -    |
| Task 5: 非同期track()互換性           | -    | -    |

### 発見事項

- 良かった点: -
- 問題点: -
- 改善提案: -

### 次Phaseへの引き継ぎ事項

- -

## 次のPhase

Phase 3: 設計レビュー
