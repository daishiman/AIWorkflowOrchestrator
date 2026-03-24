# Phase 13: PR 準備

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 13 - 完了・PR 準備                      |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

成果物の最終確認を行い、PR タイトル・本文を準備し、CI チェック項目を確認する。

## 前提成果物

| Phase | 成果物       | パス                |
| ----- | ------------ | ------------------- |
| 12    | ドキュメント | `outputs/phase-12/` |

## 参照資料

| 資料名                   | パス / 説明                                                    |
| ------------------------ | -------------------------------------------------------------- |
| PR 作成ルール            | `.claude/rules/07-git-and-tooling.md#PR作成ルール`             |
| コミット前チェックリスト | `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト` |
| --no-verify 禁止         | `CLAUDE.md#Git操作の禁止事項`                                  |

## 実行タスク

### Task 1: 成果物最終確認

全 Phase の成果物が揃っていることを確認する。

| Phase | 成果物                       | 状態 |
| ----- | ---------------------------- | ---- |
| 4     | テストファイル 2 件          | -    |
| 5     | execution-capability.ts 更新 | -    |
| 6     | テスト拡充                   | -    |
| 7     | カバレッジレポート           | -    |
| 8     | リファクタリング済み実装     | -    |
| 9     | 品質検証レポート             | -    |
| 10    | 最終レビューレポート         | -    |
| 11    | 手動テストレポート           | -    |
| 12    | 実装ガイド + ドキュメント類  | -    |

### Task 2: PR タイトル・本文テンプレート

**ブランチ名**:

```
feature/uistate-contract-extension
```

**PR タイトル**（70文字以内）:

```
feat(shared): UiState 型 8 値拡張 + Contract Matrix 更新 (#TASK-IMP-UISTATE-CONTRACT-EXTENSION-001)
```

**PR 本文テンプレート**:

```markdown
## Summary

- UiState 型を 3 値から 8 値に拡張（streaming, handoff, terminal-only, guidance-only, degraded を追加）
- resolveUiState() の 8 値分岐ロジックを D-3 優先順位準拠で実装
- Contract Matrix 全 32 セル（8 state x 4 capability）の CTA マッピングを定義（到達不能 13 セル含む）

## Test Plan

- [ ] resolveUiState 8 値テスト全 PASS
- [ ] Contract Matrix 全 32 セルテスト全 PASS
- [ ] 到達不能セルテスト全 PASS
- [ ] handoffGuidance 存在テスト全 PASS
- [ ] 既存テスト CC-1〜CC-5 全 PASS（後方互換）
- [ ] エッジケース・境界値テスト全 PASS
- [ ] Guard 関数テスト全 PASS
- [ ] overload 2 後方互換テスト全 PASS
- [ ] pnpm lint PASS
- [ ] pnpm typecheck PASS
- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%
```

### Task 3: コミットメッセージ規約

Conventional Commits 形式に従う:

```
feat(shared): UiState 型を 8 値に拡張し Contract Matrix を全面更新

- UiState union 型に streaming/handoff/terminal-only/guidance-only/degraded を追加
- resolveUiState() の 8 値分岐ロジック（D-3 優先順位準拠）を実装
- resolveCtaContract() の 8 state x 4 capability マッピングを追加（到達不能 13 セルのガード含む）
- Guard 関数（assertStreamingCtaContract, assertHandoffGuidanceExists）を追加
- overload 2 の後方互換性を維持

Refs: TASK-IMP-UISTATE-CONTRACT-EXTENSION-001
```

### Task 4: CI チェック項目

PR 提出前に以下が全て PASS であることを確認する:

| #   | チェック項目          | コマンド          | 状態 |
| --- | --------------------- | ----------------- | ---- |
| 1   | ESLint                | `pnpm lint`       | -    |
| 2   | TypeScript 型チェック | `pnpm typecheck`  | -    |
| 3   | 全テスト実行          | `pnpm vitest run` | -    |
| 4   | --no-verify 不使用    | コミット履歴確認  | -    |

注意: `--no-verify` は絶対禁止。テスト失敗時は `.skip` + Issue/TODO で対処する。

### Task 5: artifacts.json 最終更新

`artifacts.json` の全 Phase ステータスを最終状態に更新する。

## 成果物

| 成果物                | パス                             |
| --------------------- | -------------------------------- |
| PR 準備完了           | GitHub PR（作成後に URL を記録） |
| artifacts.json 最終版 | `artifacts.json`                 |
| Phase 13 完了レポート | `outputs/phase-13/`              |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## タスク完了処理【必須】

全 Phase 完了後、タスクディレクトリを completed-tasks に移動する:

```bash
mv docs/30-workflows/impl-task-a-uistate-contract-extension/ docs/30-workflows/completed-tasks/
```

移動前に以下を確認:

- [ ] artifacts.json の全 Phase ステータスが最終状態に更新されている
- [ ] ユーザーから PR 作成の明示的な許可を得ている

## 完了条件

- [ ] 全 Phase（4〜12）の成果物が揃っている
- [ ] PR タイトルが 70 文字以内
- [ ] PR 本文に Summary + Test Plan が含まれている
- [ ] コミットメッセージが Conventional Commits 形式
- [ ] CI チェック項目が全て PASS
- [ ] `--no-verify` を使用していない
- [ ] artifacts.json が最終状態に更新されている
- [ ] ブランチ名が `feature/` プレフィックスで始まっている
- [ ] ユーザーにローカル動作確認を依頼し、承認を得ている
- [ ] ユーザーから PR 作成の明示的な許可を得ている
