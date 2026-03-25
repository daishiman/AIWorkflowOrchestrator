# Phase 5: 実装

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 5                      |
| 機能名   | Skill Creator DI 配線  |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

`apps/desktop/src/main/ipc/index.ts` の1箇所を修正し、`RuntimeSkillCreatorFacade` に `skillFileManager`、`llmAdapter`、`resourceLoader` を注入する。

## 背景

Phase 4 で設計したテストが準備された状態で、実際のDI配線修正を実装する。修正対象は `apps/desktop/src/main/ipc/index.ts` の1ファイルのみ。

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

> **Phase 3 設計レビュー結果**: 当初は3依存の新規注入+track() async化を計画していたが、
> Phase 3 実行時に `resourceLoader` と `llmAdapter` は既に別タスク（TASK-SC-05-IMPROVE-LLM）で
> 注入済みと判明。実際の変更は `skillFileManager` の1行追加のみ。

`apps/desktop/src/main/ipc/index.ts` L910 に `skillFileManager` を追加する:

```typescript
const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
      skillFileManager, // ← 今回追加（improve() / applyImprovement() で SKILL.md 読み書きに使用）
    })
  : undefined;
```

### Task 3: track() 関数の async 対応確認

`track()` 関数がコールバックの `Promise` を正しく処理するか確認する。処理しない場合は、以下の代替パターンを使用する:

```typescript
track("registerSkillCreatorHandlers", () => {
  // 内部で即時実行 async 関数を使用
  void (async () => {
    // ... async ロジック
  })();
});
```

この場合、ハンドラ登録が非同期完了を待たずに `track()` が返る可能性がある。`registerSkillCreatorHandlers` の呼び出しが即時実行 async の内部にある限り、ハンドラ登録完了前に IPC 呼び出しが到達するリスクは低い（Electron の Main Process は起動シーケンス完了後に Renderer を起動するため）。

### Task 4: 実装後の型チェック

```bash
cd apps/desktop && pnpm typecheck
```

### Task 5: 実装後のテスト実行

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

## 成果物

- `apps/desktop/src/main/ipc/index.ts` の修正済みファイル

## 完了条件

> **注**: Phase 3 設計レビューにより、resourceLoader と llmAdapter は既に注入済みと判明。
> 実際の変更は `skillFileManager` の1行追加のみ。以下は修正後の完了条件。

- [x] `RuntimeSkillCreatorFacade` のコンストラクタに `skillFileManager` を注入した（L910）
- [x] `pnpm typecheck` がエラーなしで完了した
- [x] 既存テスト 232件が全て PASS した

## 統合テスト連携

実装後に既存テスト全件 PASS を確認する（回帰テスト）。`pnpm typecheck` と `pnpm vitest run` の両方を実行すること。

## 多角的チェック観点

| 観点           | 適用                                                 | 仕様参照先                                          |
| -------------- | ---------------------------------------------------- | --------------------------------------------------- |
| IPC通信        | `registerSkillCreatorHandlers` ブロックの async 修正 | `aiworkflow-requirements: api-*.md`                 |
| アーキテクチャ | DI 配線の実装・P34 遅延初期化パターン準拠            | `aiworkflow-requirements: architecture-*.md`        |
| セキュリティ   | API キー取得時の try-catch・ログへの機密情報非出力   | `aiworkflow-requirements: security-api-electron.md` |

## TDD検証

```bash
# テスト実行コマンド（Green: テストが成功することを確認）
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorIpc
```

- [ ] 新規テスト（DI-P1、DI-I1）が成功することを確認（Green状態）
- [ ] 既存テスト全件が成功することを確認

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. import 文4行の追加（Task 1）
2. track() ブロックの async 修正（Task 2）
3. track() 関数の async 対応確認（Task 3）
4. 型チェック実行（Task 4）
5. 全テスト PASS 確認（Task 5）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w4a-sc-ipc-di-wiring --phase 5
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク                         | 結果 | 備考 |
| ------------------------------ | ---- | ---- |
| Task 1: import文追加           | -    | -    |
| Task 2: track()ブロック修正    | -    | -    |
| Task 3: 型チェック・テスト実行 | -    | -    |

### 発見事項

- 良かった点: -
- 問題点: -
- 改善提案: -

### 次Phaseへの引き継ぎ事項

- -

## 次のPhase

Phase 6: テスト拡充
