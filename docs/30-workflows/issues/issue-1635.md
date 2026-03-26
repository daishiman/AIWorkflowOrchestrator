# [#1635] "[TASK-SC-13] skill-creator:verify チャネル実装"

## メタ情報

```yaml
task_id: TASK-SC-13
task_name: skill-creator:verify チャネル実装
category: 改善
target_feature: SkillCreator
priority: 中
scale: 中規模
status: 未実施
source_phase: "TASK-SC-08-E2E-VALIDATION Phase 1"
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 目的

`skill-creator:verify` IPC チャネルを実装し、生成されたスキルの検証機能（FR-4）を RuntimeSkillCreatorFacade 経由で提供する。

## 背景

`artifacts.json` の `ipcChannels` に `skill-creator:verify` が定義されているが、以下の箇所に未実装:

- `channels.ts`: `SKILL_CREATOR_VERIFY` 定数が未定義
- `creatorHandlers.ts`: verify ハンドラが未登録
- `skill-creator-api.ts`: Preload API に verify メソッドが未公開
- `RuntimeSkillCreatorFacade.ts`: verify() メソッドが未定義

TASK-SC-08-E2E-VALIDATION の E2E テスト実装時に発見された。テストでは verify チャネルをスコープ外とし、実装を本タスクに委譲した。

## 実行タスク

- [ ] `channels.ts` に `SKILL_CREATOR_VERIFY` 定数を追加する
- [ ] `RuntimeSkillCreatorFacade` に `verify(skillName: string, authMode: AuthMode, apiKey: string | null)` メソッドを追加する
- [ ] `creatorHandlers.ts` に verify ハンドラを追加する（validateSender + isBlank バリデーション + sanitizeErrorMessage パターン）
- [ ] `skill-creator-api.ts` に `verifySkill` メソッドを追加する
- [ ] verify レスポンス型を `@repo/shared/types` に定義する
- [ ] verify ハンドラのユニットテストを追加する
- [ ] E2E テスト（`skill-creator-integration.test.ts`）に verify テストケースを追加する
- [ ] `unregisterRuntimeSkillCreatorHandlers` に verify チャネルの removeHandler を追加する

## 完了条件

- [ ] `skill-creator:verify` チャネルが正常に動作すること
- [ ] verify レスポンスが `IpcResult<VerifyResult>` 形式であること
- [ ] エラー時にサニタイズされたエラーメッセージが返ること
- [ ] 既存の plan/execute/improve テストが影響を受けないこと
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 苦戦箇所（TASK-SC-08 実装知見）

| 苦戦箇所                     | 問題                                                                           | 解決策                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| P60 IPC 応答形式             | 仕様書では `error: { code, message }` と想定していたが、実際は `error: string` | `creatorHandlers.ts` の `sanitizeErrorMessage()` パターンに統一する。テストでは `assertIpcError(result, "expected string")` を使用 |
| HandoffGuidance フィールド名 | 仕様書では `suggestedCommand` だが実装は `terminalCommand`                     | `@repo/shared/types/handoff.ts` の `HandoffGuidance` 型を正本とする                                                                |
| esbuild worktree 不一致      | worktree 環境で esbuild バージョン不一致（0.21.5 vs 0.27.4）                   | `pnpm install` で解決。worktree 作成直後に `pnpm install` を実行すること                                                           |

## 参照

- `docs/30-workflows/w5b-sc-e2e-terminal-handoff/artifacts.json` L141: `skill-creator:verify` 定義
- `apps/desktop/src/main/ipc/creatorHandlers.ts`: 既存ハンドラパターン（plan/execute/improve/applyImprovement）
- `apps/desktop/src/test/helpers/skill-creator-test-helpers.ts`: テストヘルパー
- TASK-SC-08-E2E-VALIDATION Phase 10 最終レビューレポート
