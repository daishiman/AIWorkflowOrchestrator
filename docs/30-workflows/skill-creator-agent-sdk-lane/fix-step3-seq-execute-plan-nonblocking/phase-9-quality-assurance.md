# Phase 9: 品質保証

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 9                            |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1h                           |

## 目的

既存のスキル生成フローが修正によって壊れていないことを確認し、全体的な品質を保証する。リグレッションリスクを評価し、PR 作成前の品質ゲートを通過する。

## 実行タスク

1. 既存テストへの影響確認（リグレッションチェック）
2. TypeScript 型チェック（全パッケージ）
3. ESLint チェック（修正ファイル）
4. スキル生成フローの正常動作確認
5. リグレッションリスクの評価

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                      |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | システム全体像            |

## 実行手順

### ステップ 1: 既存テストへの影響確認

```bash
# desktop パッケージの全テスト実行
pnpm --filter @repo/desktop exec vitest run

# creatorHandlers 関連テスト全体
pnpm --filter @repo/desktop exec vitest run src/main/ipc/ --reporter=verbose

# runtime サービスの全テスト
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/ --reporter=verbose
```

### ステップ 2: TypeScript 型チェック

```bash
# desktop パッケージの型チェック
pnpm --filter @repo/desktop typecheck

# shared パッケージの型チェック（影響がないことを確認）
pnpm --filter @repo/shared typecheck
```

### ステップ 3: ESLint チェック

```bash
# 修正ファイルの ESLint
pnpm --filter @repo/desktop lint src/preload/ipc-utils.ts
pnpm --filter @repo/desktop lint src/main/ipc/creatorHandlers.ts
pnpm --filter @repo/desktop lint src/main/services/runtime/SkillCreatorWorkflowEngine.ts
pnpm --filter @repo/desktop lint src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

### ステップ 4: スキル生成フローの正常動作確認

既存のスキル生成フローが壊れていないことを以下の観点で確認する:

| 確認観点                                                         | 方法               | 期待結果                            |
| ---------------------------------------------------------------- | ------------------ | ----------------------------------- |
| `skill-creator:execute-plan` invoke が 100ms 以内に返る          | TC-T2-01           | `{ accepted: true, planId }` が返る |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` が各フェーズで発火する    | TC-T3-02, TC-T4-01 | フェーズ遷移イベントが届く          |
| `skill-creator:execute-plan` 以外の creator ハンドラーに影響なし | 既存テスト PASS    | リグレッションなし                  |
| `safeInvoke` が `CHANNEL_TIMEOUTS` を正しく参照する              | TC-T1-01           | 1_800_000ms が適用される            |

### ステップ 5: リグレッションリスク評価

| リスク                                               | 影響度 | 評価                                                                                         |
| ---------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `creatorHandlers.ts` の execute ハンドラー戻り値変更 | 高     | Renderer 側の `creatorSlice.ts` が `{ accepted, planId }` を正しく処理できるか確認必須       |
| `onPhaseChanged` が未設定時の動作                    | 中     | TC-T3-01 で Optional Chaining を検証済み                                                     |
| `executeAsync` がエラーを飲み込む                    | 中     | TC-T4-01 でエラーが STATE_CHANGED に通知されることを確認済み                                 |
| 並列 planId 実行時の Engine 競合                     | 低     | `workflows: Map<string, SkillCreatorWorkflowState>` が planId ごとに分離されていることを確認 |
| `CHANNEL_TIMEOUTS` の他チャンネルへの影響            | 低     | 追加のみで既存エントリに変更なし                                                             |

### ステップ 6: 品質基準の確認

| 指標                  | 基準               | 確認結果 |
| --------------------- | ------------------ | -------- |
| ユニットテスト        | 全て PASS          | 確認対象 |
| TypeScript 型チェック | エラー 0 件        | 確認対象 |
| ESLint                | エラー 0 件        | 確認対象 |
| 既存テストへの影響    | リグレッションなし | 確認対象 |

## 多角的チェック観点

- Renderer 側の `creatorSlice.ts` が `{ accepted: true, planId }` という戻り値を受け取った際に正しく処理できるか確認したか
- `skill-creator:execute-plan` 以外の `skill-creator:*` ハンドラーに意図しない変更が生じていないか確認したか
- `SkillCreatorWorkflowEngine` の複数 planId 並列実行（`workflows: Map`）が修正後も正常に動作するか確認したか

## 成果物

| 成果物       | パス                                | 説明                                                              |
| ------------ | ----------------------------------- | ----------------------------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | テスト結果、型チェック結果、ESLint 結果、リグレッションリスク評価 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop exec vitest run` が全て PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `pnpm --filter @repo/desktop lint`（修正ファイル）が PASS している
- [ ] Renderer 側（`creatorSlice.ts`）の戻り値変更影響が調査・記録されている
- [ ] リグレッションリスクの「高」項目（戻り値変更）が緩和されている
- [ ] `quality-report.md` に品質基準の全項目が記録されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（`outputs/phase-9/quality-report.md`）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 10: 最終レビュー へ進む
