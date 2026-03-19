# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| Phase        | 13                              |
| Phase名      | PR作成                          |
| タスクID     | UT-06-001                       |
| 前提Phase    | Phase 12（ドキュメント）        |
| 後続Phase    | なし                            |
| ステータス   | blocked（ユーザー承認待ち）     |
| 作成日       | 2026-03-16                      |
| 機能名       | tool-risk-config-implementation |
| GitHub Issue | #1251                           |

---

## 目的

PR で説明すべき変更意図・影響範囲・テスト証跡・仕様同期の要点を事前に整理し、ユーザーの明示承認後に実際の PR 作成を実施できる状態にする。

> **重要**: ユーザーの明示的な承認なしに `git push` または `gh pr create` を実行してはならない。本 Phase は PR 説明の準備（下書き整理）のみを行う。

---

## 背景

Phase 12（ドキュメント）で全 Task（Task 1〜5）が完了し、システム仕様書・タスク台帳・変更履歴への同期が完了している。本 Phase では PR 作成の下書きを準備し、ユーザー承認を待つ。

---

## blocked 理由

ユーザーの明示的な PR 作成承認が得られるまで、本 Phase は blocked 状態を維持する。`git push` および `gh pr create` は共有状態に影響するリスクの高い操作であり、ユーザーの確認なしに実行してはならない。

---

## user approval の有無

| 項目          | 状態                         |
| ------------- | ---------------------------- |
| user approval | **未取得**（blocked）        |
| 承認取得方法  | ユーザーへの明示的な確認依頼 |
| 承認後の操作  | `git push` → `gh pr create`  |

---

## Phase 12 までの完了根拠

Phase 13 を実行するための前提条件として、以下の Phase 12 完了根拠を確認する:

- [ ] Phase 12 Task 1: `implementation-guide.md` が生成されている
- [ ] Phase 12 Task 2: `system-spec-update-summary.md` が生成されている
- [ ] Phase 12 Task 2 Step 1-A: `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の2ファイルに完了記録が追記されている
- [ ] Phase 12 Task 3: `documentation-changelog.md` が生成されている
- [ ] Phase 12 Task 4: `unassigned-task-detection.md` が生成されている
- [ ] Phase 12 Task 5: `skill-feedback-report.md` が生成されている
- [ ] Phase 12: `phase12-task-spec-compliance-check.md` が生成されている

---

## 実行タスク

### タスク1: PR サマリー下書きの作成

**目的**: PR レビュアーが変更意図と影響範囲を5分以内で理解できるサマリーを整理する。

**実行手順**:

1. `outputs/phase-13/pr-summary-draft.md` を新規作成する
2. 次の構成で記述する:

   ```markdown
   ## Summary

   - `packages/shared/src/constants/security.ts` に `RiskLevel` 型・`ToolRiskConfigEntry` interface・`TOOL_RISK_CONFIG` 定数を追加する
   - `@repo/shared` からの named export として3シンボルを公開する
   - セキュリティ不変条件として `high` リスクの恒久許可・時間制限許可を禁止する

   ## Background

   GitHub Issue #1251 のクローズ要件として、後続タスク（TASK-SKILL-LIFECYCLE-08、UT-06-004）が参照するリスクレベル定数を `@repo/shared` に配置する必要があった。

   ## Changes

   - `packages/shared/src/constants/security.ts`: `RiskLevel`・`ToolRiskConfigEntry`・`TOOL_RISK_CONFIG` を追加（`ALLOWED_TOOLS_WHITELIST` の直後）
   - `packages/shared/src/constants/index.ts`: 3シンボルの re-export を追加（必要な場合）
   - `packages/shared/src/constants/security.test.ts`: テストケースを追加

   ## Test Plan

   - `pnpm --filter @repo/shared exec vitest run src/constants/security.test.ts` が全テスト PASS
   - `pnpm --filter @repo/shared exec tsc --noEmit` が 0 エラー
   - `pnpm --filter @repo/shared build` が 0 エラー
   - セキュリティ不変条件（`high.allowPermanent === false`・`high.allowTime24h === false`・`high.allowTime7d === false`）がテストで検証済み

   ## Spec Sync

   - `.claude/skills/aiworkflow-requirements/references/security-implementation.md` に `TOOL_RISK_CONFIG` 実装状況を記録済み
   - `aiworkflow-requirements/LOGS.md`・`task-specification-creator/LOGS.md` に完了記録を追記済み
   ```

3. PR タイトル（70文字以内）を記録する:

   ```
   feat(shared): TOOL_RISK_CONFIG 定数を security.ts に追加（Issue #1251）
   ```

**成果物**: `outputs/phase-13/pr-summary-draft.md`

---

### タスク2: ブランチ・コミット状態の確認

**目的**: PR 作成前のブランチ・コミット状態を記録する。

**実行手順**:

1. 次のコマンドで現在のブランチとコミット状態を確認する:

   ```bash
   git status
   git log --oneline -5
   git diff --stat HEAD
   ```

2. 確認結果を `outputs/phase-13/pr-summary-draft.md` に追記する:
   - 現在のブランチ名
   - 変更ファイルの一覧
   - コミットメッセージの案

3. ブランチ名が `feature/` または `fix/` プレフィックスであることを確認する

**注意**: `git push` はこのタスクでは実行しない。ユーザーの承認後に実施する。

---

## 参照資料

| 参照資料                 | パス                                             | 内容                               |
| ------------------------ | ------------------------------------------------ | ---------------------------------- |
| Phase 1（要件定義）      | `phase-1-requirements.md`                        | 背景と受入基準を確認する           |
| Phase 2（設計）          | `phase-2-design.md`                              | 型定義・定数値の設計意図を確認する |
| Phase 9（品質検証）      | `phase-9-quality-assurance.md`                   | 品質確認結果を確認する             |
| Phase 10（最終レビュー） | `phase-10-final-review.md`                       | リリース判断の根拠を確認する       |
| Phase 11（手動テスト）   | `phase-11-manual-test.md`                        | 手動確認証跡を確認する             |
| Phase 12（ドキュメント） | `phase-12-documentation.md`                      | 仕様同期の証跡を確認する           |
| security.ts              | `packages/shared/src/constants/security.ts`      | 変更内容の説明素材を確認する       |
| security.test.ts         | `packages/shared/src/constants/security.test.ts` | テスト証跡の説明素材を確認する     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                           | 内容                                      |
| ---------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| セキュリティ実装 | `.claude/skills/aiworkflow-requirements/references/security-implementation.md` | PR の Spec Sync セクションで参照する正本  |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`     | PR の Background セクションで参照する正本 |

---

## 成果物

| 成果物            | パス                                   | 内容                                       |
| ----------------- | -------------------------------------- | ------------------------------------------ |
| PR サマリー下書き | `outputs/phase-13/pr-summary-draft.md` | PR タイトル・Summary・Test Plan を整理する |

---

## 完了条件

- [ ] PR タイトル（70文字以内）が記録されている
- [ ] Summary（変更意図・影響範囲：1-3箇条書き）が記録されている
- [ ] Test Plan（テスト証跡：ビルド・型チェック・テスト PASS）が記録されている
- [ ] Spec Sync（仕様同期の証跡）が記録されている
- [ ] 現在のブランチ名・変更ファイル一覧が記録されている
- [ ] `git push` は実行していない（ユーザー承認前）

---

## PR 作成手順（ユーザー承認後に実施）

> 以下はユーザーが明示的に承認した後にのみ実行する。

```bash
# 1. コミット（未コミットの変更がある場合）
git add packages/shared/src/constants/security.ts
git add packages/shared/src/constants/security.test.ts
git add packages/shared/src/constants/index.ts  # re-export が追加された場合
git commit -m "feat(shared): TOOL_RISK_CONFIG 定数を security.ts に追加（Issue #1251）"

# 2. プッシュ
git push origin <branch-name>

# 3. PR 作成
gh pr create \
  --title "feat(shared): TOOL_RISK_CONFIG 定数を security.ts に追加（Issue #1251）" \
  --body "$(cat outputs/phase-13/pr-summary-draft.md)" \
  --base main
```

---

## Phase末端アクション【必須】

- [ ] `outputs/phase-13/pr-summary-draft.md` が生成されている
- [ ] PR 作成は実施していない（ユーザーの明示承認を受けるまで blocked 状態を維持する）

---

## 依存関係

- **前提**: Phase 12（ドキュメント）の全Task（Task 1〜5）が完了していること
- **前提**: `aiworkflow-requirements/LOGS.md`・`task-specification-creator/LOGS.md` の2ファイルに完了記録が追記済みであること
- **ブロック条件**: ユーザーの明示的な PR 作成承認

---

## 次のPhase

本タスクは Phase 13 が最終 Phase である。PR 作成承認後、GitHub Issue #1251 がクローズされることを確認する。
