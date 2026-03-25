# Phase 13: PR 準備

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 13 - 完了・PR 準備                     |
| Phase名    | PR準備                                 |
| 機能名     | health-policy-unification              |
| タスクID   | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 前提Phase  | Phase 12                               |
| 後続Phase  | なし                                   |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-24                             |

## 目的

成果物の最終確認を行い、PR タイトル・本文・コミットメッセージを準備する。CI チェック項目を確認し、マージ可能な状態にする。

## 背景

全 Phase 完了後の最終ステップとして、PR の作成準備を行う。コミット前チェック（lint, typecheck, test）の完全実行と、PR 本文の構成（変更サマリ・テスト計画・影響範囲）を整備する。

## 前提成果物

| Phase | 成果物                                                   |
| ----- | -------------------------------------------------------- |
| 12    | [phase-12-documentation.md](./phase-12-documentation.md) |

## 参照資料

| 資料名                   | パス / 参照先                                    |
| ------------------------ | ------------------------------------------------ |
| PR 作成ルール            | `CLAUDE.md` Git 規約（PR 作成ルール）            |
| コミット前チェックリスト | `CLAUDE.md` Git 規約（コミット前チェックリスト） |
| Git 操作の禁止事項       | `CLAUDE.md#Git操作の禁止事項`                    |

## 実行タスク

### Task 1: 成果物最終確認

#### 1-1. 新規作成ファイル

| ファイル                                                    | 状態確認 |
| ----------------------------------------------------------- | -------- |
| `packages/shared/src/types/health-policy.ts`                | [ ] 存在 |
| `packages/shared/src/types/__tests__/health-policy.test.ts` | [ ] 存在 |

#### 1-2. 変更ファイル

| ファイル                                                               | 変更内容                        | 状態確認 |
| ---------------------------------------------------------------------- | ------------------------------- | -------- |
| `packages/shared/src/types/execution-capability.ts`                    | @deprecated マーク追加          | [ ] 確認 |
| `packages/shared/src/types/index.ts`                                   | re-export 追加                  | [ ] 確認 |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`      | HealthPolicy DI + degraded 分岐 | [ ] 確認 |
| `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` | HealthPolicy 消費               | [ ] 確認 |

#### 1-3. テストファイル

| テストファイル                                                                                      | 状態確認 |
| --------------------------------------------------------------------------------------------------- | -------- |
| `packages/shared/src/types/__tests__/health-policy.test.ts`                                         | [ ] PASS |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts`      | [ ] PASS |
| `apps/desktop/src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts` | [ ] PASS |

### Task 2: コミット前チェック

```bash
# Lint チェック
pnpm lint

# 型チェック
pnpm typecheck

# 全テスト実行
cd packages/shared && pnpm vitest run
cd apps/desktop && pnpm vitest run
```

- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] 全テストが PASS
- [ ] `--no-verify` を使用していない

### Task 3: PR タイトル・本文テンプレート

#### PR タイトル（70 文字以内）

```
feat(shared): HealthPolicy 統一インターフェース (#TASK-IMP-HEALTH-POLICY-UNIFICATION-001)
```

#### PR 本文

```markdown
## Summary

- HealthPolicy インターフェースを `packages/shared` に定義し、接続状態判定を統一
- RuntimePolicyResolver に HealthPolicy の optional DI を追加し、degraded 分岐を実装
- ExecutionCapabilityInput.apiKeyDegraded に @deprecated マークを付与

## Changes

### 新規作成

- `packages/shared/src/types/health-policy.ts`: HealthPolicy/HealthStatus/HealthPolicyInput 型定義 + resolveHealthPolicy() 純粋関数

### 変更

- `packages/shared/src/types/execution-capability.ts`: apiKeyDegraded に @deprecated マーク
- `packages/shared/src/types/index.ts`: HealthPolicy 関連の re-export 追加
- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`: HealthPolicy optional DI + degraded 分岐
- `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts`: HealthPolicy 消費

## Test Plan

- [ ] resolveHealthPolicy() の全 6 導出ルールテストが PASS
- [ ] RuntimePolicyResolver の degraded/healthy/unhealthy/unknown 分岐テストが PASS
- [ ] RuntimePolicyResolver の後方互換テスト（HealthPolicy 未指定）が PASS
- [ ] mainlineAccess の HealthPolicy 消費テストが PASS
- [ ] エッジケーステスト（複合状態）が PASS
- [ ] @deprecated 結果一致テストが PASS
- [ ] カバレッジ基準達成（Line >= 80%, Branch >= 60%, Function >= 80%）
- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS
- [ ] 既存テストに回帰なし
```

### Task 4: コミットメッセージ規約

```
feat(shared): add HealthPolicy unified interface for health check consolidation

- Define HealthPolicy, HealthStatus, HealthPolicyInput types
- Implement resolveHealthPolicy() pure function with 6 derivation rules
- Add @deprecated mark to ExecutionCapabilityInput.apiKeyDegraded
- Integrate HealthPolicy into RuntimePolicyResolver via optional DI
- Add HealthPolicy consumption in mainlineAccess.ts with fallback

Refs: TASK-IMP-HEALTH-POLICY-UNIFICATION-001
Depends-on: TASK-IMP-UISTATE-CONTRACT-EXTENSION-001

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Task 5: CI チェック項目

| チェック項目           | コマンド / 確認方法                         | 状態 |
| ---------------------- | ------------------------------------------- | ---- |
| ESLint                 | `pnpm lint`                                 | [ ]  |
| TypeScript 型チェック  | `pnpm typecheck`                            | [ ]  |
| packages/shared テスト | `cd packages/shared && pnpm vitest run`     | [ ]  |
| apps/desktop テスト    | `cd apps/desktop && pnpm vitest run`        | [ ]  |
| packages/shared ビルド | `cd packages/shared && pnpm build`          | [ ]  |
| カバレッジ基準         | Line >= 80%, Branch >= 60%, Function >= 80% | [ ]  |

### Task 6: ブランチ確認

```bash
# ブランチ名の確認（feature/ プレフィックス）
git branch --show-current

# リモートとの同期確認
git status
```

- [ ] ブランチ名が `feature/` プレフィックスで始まる
- [ ] main ブランチに直接 push していない
- [ ] 全変更がコミット済み

## 成果物

| 成果物              | パス                                  |
| ------------------- | ------------------------------------- |
| PR 準備完了レポート | `outputs/phase-13/pr-ready-report.md` |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## Phase末端アクション【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] 新規作成ファイルが全て存在する
- [ ] 変更ファイルの変更内容が正しい
- [ ] 全テストが PASS
- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] PR タイトルが 70 文字以内
- [ ] PR 本文に Summary + Test Plan が含まれている
- [ ] コミットメッセージが規約に従っている
- [ ] ブランチ名が `feature/` プレフィックスで始まる
- [ ] `--no-verify` を使用していない
- [ ] CI チェック項目が全て PASS
- [ ] ユーザーにローカル動作確認を依頼し、承認を得ている
- [ ] ユーザーから PR 作成の明示的な許可を得ている

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（本タスクの最終 Phase）

## タスク完了

本 Phase の完了をもって、TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の全 Phase が完了となる。

### 全 Phase サマリ

| Phase | 名称             | 状態 |
| ----- | ---------------- | ---- |
| 1     | 要件定義         | 完了 |
| 2     | 設計             | 完了 |
| 3     | 設計レビュー     | 完了 |
| 4     | テスト作成       | 完了 |
| 5     | 実装             | 完了 |
| 6     | テスト拡充       | 完了 |
| 7     | カバレッジ確認   | 完了 |
| 8     | リファクタリング | 完了 |
| 9     | 品質検証         | 完了 |
| 10    | 最終レビュー     | 完了 |
| 11    | 手動テスト       | 完了 |
| 12    | ドキュメント     | 完了 |
| 13    | PR 準備          | 完了 |
