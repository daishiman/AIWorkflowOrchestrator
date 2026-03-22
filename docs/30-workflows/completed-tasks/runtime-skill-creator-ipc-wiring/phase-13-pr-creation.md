# Phase 13: PR作成 - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 13 - PR作成                                 |
| 関連Issue | #1434                                       |
| 前提Phase | Phase 12（ドキュメント更新）                |
| 作成日    | 2026-03-21                                  |

## 目的

変更サマリーを提示し、ユーザーの明示的な許可を得た後にのみ PR を作成する。
本 workflow ではユーザー許可が出るまで Phase 13 を blocked とみなし、準備情報だけを整える。

## 実行タスク

1. ローカル動作確認依頼: ユーザーにローカルでの確認を依頼する
2. 変更サマリー提示: 変更内容と検証結果をまとめ、PR 作成可否を確認する
3. PR 情報準備: `outputs/phase-13/pr-info.md` にタイトル / 本文要点 / 実行前提を整理する
4. PR 作成（ユーザー許可後のみ）: GitHub PR を作成し CI を確認する

## 参照資料

| 資料名                     | パス                                                                                                | 説明            |
| -------------------------- | --------------------------------------------------------------------------------------------------- | --------------- |
| Phase 2 設計書             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-02-design.md`                             | Phase 2 成果物  |
| Phase 5 実装書             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-05-implementation.md`                     | Phase 5 成果物  |
| Phase 6 テスト拡充書       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-06-test-expansion.md`                     | Phase 6 成果物  |
| Phase 7 カバレッジ書       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-07-coverage.md`                           | Phase 7 成果物  |
| Phase 8 リファクタリング書 | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-08-refactoring.md`                        | Phase 8 成果物  |
| Phase 9 品質検証書         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-09-quality.md`                            | Phase 9 成果物  |
| PR 作成ルール              | `.claude/rules/07-git-and-tooling.md`                                                               | PR 作成ルール   |
| 最終レビュー結果           | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-10/final-review-result.md`        | Phase 10 成果物 |
| 要件充足マトリクス         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-10/requirements-matrix.md`        | Phase 10 成果物 |
| 手動テスト結果             | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/manual-test-result.md`         | Phase 11 成果物 |
| 発見課題一覧               | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-11/discovered-issues.md`          | Phase 11 成果物 |
| 実装ガイド                 | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-12/implementation-guide.md`       | Phase 12 成果物 |
| system spec 更新要約       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-12/system-spec-update-summary.md` | Phase 12 成果物 |
| ドキュメント変更ログ       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-12/documentation-changelog.md`    | Phase 12 成果物 |
| 未タスクレポート           | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-12/unassigned-task-report.md`     | Phase 12 成果物 |
| 未タスク検出               | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-12/unassigned-task-detection.md`  | Phase 12 成果物 |
| スキルフィードバック       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-12/skill-feedback-report.md`      | Phase 12 成果物 |

## 実行手順

### ステップ 1: 変更サマリーと成果物最終確認

#### 仕様書成果物

| Phase | 仕様書パス                              | 確認状態 |
| ----- | --------------------------------------- | -------- |
| 1     | `phase-01-requirements.md`              | -        |
| 2     | `phase-02-design.md`                    | -        |
| 3     | `phase-03-design-review.md`             | -        |
| 10    | `phase-10-final-review.md`              | -        |
| 11    | `phase-11-manual-test.md`               | -        |
| 12    | `phase-12-documentation.md`             | -        |
| 13    | `phase-13-pr-creation.md`（本ファイル） | -        |

#### 実装成果物

| ファイル                                        | 変更内容                                                      | 確認状態 |
| ----------------------------------------------- | ------------------------------------------------------------- | -------- |
| `apps/desktop/src/preload/channels.ts`          | `SKILL_CREATOR_PLAN` 等3チャンネル定数追加                    | -        |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`  | セキュリティ強化 + `IPC_CHANNELS` 参照                        | -        |
| `apps/desktop/src/main/ipc/index.ts`            | `RuntimeSkillCreatorFacade` ハンドラ登録                      | -        |
| `apps/desktop/src/preload/skill-creator-api.ts` | `planSkill` / `executePlan` / `improveSkillWithFeedback` 追加 | -        |
| `apps/desktop/src/preload/types.ts`             | `SkillCreatorAPI` 型拡張                                      | -        |
| `apps/desktop/src/main/ipc/skillHandlers.ts`    | `getSkillExecutorInstance()` export 追加                      | -        |

#### Phase 12 / 13 出力成果物

| 成果物                 | パス                                             | 確認状態 |
| ---------------------- | ------------------------------------------------ | -------- |
| 実装ガイド（Part 1+2） | `outputs/phase-12/implementation-guide.md`       | -        |
| system spec 更新要約   | `outputs/phase-12/system-spec-update-summary.md` | -        |
| ドキュメント変更ログ   | `outputs/phase-12/documentation-changelog.md`    | -        |
| 未タスクレポート       | `outputs/phase-12/unassigned-task-report.md`     | -        |
| 未タスク検出           | `outputs/phase-12/unassigned-task-detection.md`  | -        |
| スキルフィードバック   | `outputs/phase-12/skill-feedback-report.md`      | -        |
| PR 情報                | `outputs/phase-13/pr-info.md`                    | -        |

### ステップ 2: ローカル確認チェック

```bash
# Lint チェック
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/
```

> **絶対禁止**: `--no-verify` オプションは使用しない。

| チェック項目      | 期待結果      | 実測結果 | 判定 |
| ----------------- | ------------- | -------- | ---- |
| `pnpm lint`       | エラー 0 件   | -        | -    |
| `pnpm typecheck`  | 型エラー 0 件 | -        | -    |
| `pnpm vitest run` | 全テスト PASS | -        | -    |

### ステップ 3: PR 情報準備（ユーザー許可待機）

以下の PR 情報を `outputs/phase-13/pr-info.md` に記録し、ユーザーの明示的な許可を待つ。

**ブランチ名**:

```
feat/runtime-skill-creator-ipc-wiring
```

**PR タイトル（70文字以内）**:

```
feat(ipc): RuntimeSkillCreatorFacade を skill-creator:* IPC に統合
```

**PR 本文テンプレート**:

```markdown
## Summary

- `RuntimeSkillCreatorFacade` の plan/execute/improve を public `skill-creator:*` IPC surface に統合
- `channels.ts` に `SKILL_CREATOR_PLAN` / `SKILL_CREATOR_EXECUTE_PLAN` / `SKILL_CREATOR_IMPROVE_SKILL` の3チャンネル定数を追加し `ALLOWED_INVOKE_CHANNELS` に登録
- `skill-creator-api.ts` に `planSkill` / `executePlan` / `improveSkillWithFeedback` を追加、`SkillCreatorAPI` 型を拡張
- `creatorHandlers.ts` に `validateIpcSender` + `sanitizeErrorMessage` + P42 3段バリデーションを追加
- `ipc/index.ts` で `RuntimeSkillCreatorFacade` ベースのハンドラを登録（null ガード付き Graceful Degradation）
- `skillHandlers.ts` に `getSkillExecutorInstance()` export を追加

## Test Plan

- [ ] `creatorHandlers.ts` 正常系・異常系テスト（plan / execute-plan / improve-skill 各チャンネル）
- [ ] P42 バリデーションテスト（空文字列 / トリム空文字列 / 型違反）
- [ ] セキュリティテスト（validateIpcSender 呼び出し確認）
- [ ] 既存 `skillCreatorHandlers` 系 85 テストの回帰確認
- [ ] `pnpm lint` / `pnpm typecheck` PASS
- [ ] Line Coverage 80%+ / Branch Coverage 60%+ / Function Coverage 80%+

## 関連

- Issue: #1434
- 前提タスク: TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001（完了済み）
- 関連タスク: TASK-9B-H（SkillCreator IPC 基盤、完了済み）
```

### ステップ 4: PR 作成（ユーザー許可後のみ）

ユーザーの明示的な許可を受けた後、以下のコマンドで PR を作成する。

```bash
gh pr create \
  --title "feat(ipc): RuntimeSkillCreatorFacade を skill-creator:* IPC に統合" \
  --body-file "docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-13/pr-info.md" \
  --base main
```

PR 作成後:

- [ ] CI/CD パイプラインが PASS したことを確認する
- [ ] レビュアーを設定する

## 成果物

| 成果物          | パス / URL                                                                       | 説明                          |
| --------------- | -------------------------------------------------------------------------------- | ----------------------------- |
| Phase 13 仕様書 | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-13-pr-creation.md`     | 本ファイル                    |
| PR 情報         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-13/pr-info.md` | PR 準備情報と blocked 理由    |
| PR              | GitHub PR URL                                                                    | 提出済み PR（ユーザー許可後） |

## 完了条件

- [ ] ステップ 1: 全 Phase 仕様書（1〜13）の存在が確認されている
- [ ] ステップ 1: 実装6ファイルの変更内容が確認されている
- [ ] ステップ 1: Phase 12 / 13 出力成果物が整合していることが確認されている
- [ ] ステップ 2: `pnpm lint` が PASS である
- [ ] ステップ 2: `pnpm typecheck` が PASS である
- [ ] ステップ 2: 全テストが PASS である
- [ ] `--no-verify` を使用していない
- [ ] PR タイトルが 70 文字以内である
- [ ] PR 本文に Summary と Test Plan が含まれている
- [ ] ユーザーの明示的な PR 作成許可を得るまでは blocked 扱いで待機している
- [ ] `outputs/phase-13/pr-info.md` に blocked 理由と PR 準備情報が記録されている
- [ ] CI/CD パイプラインが PASS である（PR 作成後）
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次のPhase

なし（タスク完了）
