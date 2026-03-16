# Phase 13: PR作成 - TASK-SKILL-LIFECYCLE-06「信頼・権限・ガバナンス統合」

## メタ情報

| 項目         | 値                                                                 |
| ------------ | ------------------------------------------------------------------ |
| タスク ID    | TASK-SKILL-LIFECYCLE-06                                            |
| Phase        | 13: PR作成                                                         |
| ステータス   | BLOCKED                                                            |
| 依存成果物   | `phase-12-documentation.md`（Phase 12 完了条件 全項目 CHECKED 後） |
| ブロック理由 | ユーザーの明示的な承認待ち（commit・push・PR作成は自動で行わない） |
| 作成日       | 2026-03-16                                                         |

---

## 目的

TASK-SKILL-LIFECYCLE-06 の設計成果物（型定義仕様・説明責任UIワイヤーフレーム・安全性ゲート契約・承認履歴ポリシー）をレビュー可能な形でプルリクエストにまとめる。

---

## 実行タスク

- 事前検証: Phase 12 完了証跡・差分・lint/typecheck を確認する
- 承認後実行: ユーザー承認後のみ commit/push/PR を実行する
- 証跡保存: PR番号・URL・本文を成果物へ記録する

### Task 1: PR開始前チェック

### Task 2: ユーザー承認後の commit/push/PR 実行

### Task 3: PR証跡の記録

1. Phase 12 の完了証跡と必須成果物の実在を確認する
2. コミット対象差分を確認し、lint/typecheck を通す
3. ユーザー明示承認後のみ commit/push/PR 作成を実行する
4. PR本文に Summary/Test Plan/Reviewer観点を反映する
5. PR作成後に番号とリンクを Phase 13 成果物へ記録する

---

## 参照資料

| 資料名                      | パス                                                                 | 用途                  |
| --------------------------- | -------------------------------------------------------------------- | --------------------- |
| Phase 2 設計文書            | `phase-2-design.md`                                                  | 依存仕様の最終確認    |
| Phase 5 実装成果物          | `outputs/phase-5/`                                                   | 実装対象の最終確認    |
| Phase 6 テスト拡充成果物    | `outputs/phase-6/`                                                   | 追加検証結果の確認    |
| Phase 7 カバレッジ成果物    | `outputs/phase-7/`                                                   | 網羅性確認            |
| Phase 8 リファクタ成果物    | `outputs/phase-8/`                                                   | 仕様統一状態の確認    |
| Phase 9 QA成果物            | `outputs/phase-9/`                                                   | QA判定確認            |
| Phase 10 最終レビュー成果物 | `outputs/phase-10/`                                                  | ゲート判定確認        |
| Phase 11 手動テスト成果物   | `outputs/phase-11/`                                                  | 手動検証結果確認      |
| Phase 12 文書               | `phase-12-documentation.md`                                          | PR開始可否判定        |
| Phase 12 成果物             | `outputs/phase-12/*.md`                                              | 完了証跡の添付元      |
| task-workflow               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | spec_created 記録確認 |
| PRテンプレート              | `.github/pull_request_template.md`                                   | PR本文の必須項目確認  |

---

## ブロック理由と解除条件

### 現在のブロック状態

本 Phase は以下の理由でブロック中である:

1. **commit・push は自動で行わない**: ユーザーが明示的に「PR を作成してください」と指示した場合のみ実行する
2. **ブランチ操作は慎重に扱う**: `git push` は共有リモートに影響するため、ユーザーの確認なしに実行しない
3. **Phase 12 完了確認が必要**: Phase 12 の全 Task 完了条件（25チェックボックス）が全て CHECKED であることを確認してから PR を作成する

### ブロック解除条件

以下が全て満たされた場合のみ PR 作成を開始する:

- [ ] ユーザーから「PR を作成してください」または同等の明示的な承認を受けた
- [ ] `phase-12-documentation.md` の完了条件が全項目 CHECKED であることを確認した
- [ ] Phase 12 の `outputs/phase-12/documentation-changelog.md` に「全 Task 完了」が記録されていることを確認した
- [ ] `git status` を実行し、コミット対象の変更ファイルを確認した
- [ ] `pnpm lint` が通ることを確認した（設計タスクのため主にドキュメントファイル）
- [ ] `pnpm typecheck` が通ることを確認した（型定義ファイルが存在する場合）

---

## 実行手順

### PR 作成手順（ユーザー承認後に実施）

### Step 1: コミット前チェック

```bash
# 変更ファイルの確認
git status

# 変更内容の確認（設計タスクのためコードファイルは最小限のはず）
git diff --stat

# lint チェック（ドキュメントファイルが主）
pnpm lint

# typecheck（新規型定義ファイルが存在する場合）
pnpm typecheck
```

### Step 2: コミット

```bash
# ブランチ確認（main または feature ブランチで作業しているか確認）
git branch --show-current

# コミット（--no-verify は絶対に使用しない）
git add docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/
git commit -m "docs(skill-lifecycle): TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合 設計完了"
```

### Step 3: PR 作成

```bash
# push（ユーザーの明示承認後のみ実行）
git push origin HEAD

# PR 作成
gh pr create \
  --title "docs(skill-lifecycle): 信頼・権限・ガバナンス統合 設計仕様 [TASK-SKILL-LIFECYCLE-06]" \
  --body "$(cat << 'EOF'
## Summary

TASK-SKILL-LIFECYCLE-06「信頼・権限・ガバナンス統合」の設計仕様を定義しました。

- **ToolRiskConfig**: リスクレベル4段階（Critical/High/Medium/Low）× 確認スタイル4種（ダイアログ幅・ボタン表示制御・自動拒否）の型定義
- **AllowedToolEntryV2**: 失効ポリシー付き権限エントリ（既存 AllowedToolEntry の後方互換拡張）
- **SafetyGatePort**: TASK-08（スキル公開）への安全性チェック契約インターフェース
- **権限状態4モード**: denied/approved_once/approved/revoked の遷移定義
- **説明責任UI**: INS-01(CTA) / INS-02(実行中) / INS-03(結果) の3挿入点定義
- **拒否fallback**: abort/skip/retry の3フロー定義（abort時4ステップクリーンアップ契約）

## 設計スコープ

本タスクは設計専用タスク（実装コードなし）。
実装は TASK-SKILL-LIFECYCLE-08 等の後続タスクで行う。

## 依存タスク

- 依存: TASK-SKILL-LIFECYCLE-03（Runtime Routing）、TASK-SKILL-LIFECYCLE-05（利用導線）
- ブロック: TASK-SKILL-LIFECYCLE-08（スキル公開・バージョン互換）

## Test Plan

設計タスクのため単体テスト・統合テストなし。
Phase 11 にて設計文書ウォークスルーを実施済み（TC-01〜07 全 PASS）。

- TC-01: 権限確認ダイアログ設計整合性 - PASS
- TC-02: リスクレベル分類網羅性（BASH_COMMANDS 24件・PROTECTED_PATHS 25件）- PASS
- TC-03: 権限状態遷移完全性（16組み合わせ）- PASS
- TC-04: Task-03/05 接続整合性（INS-01〜03）- PASS
- TC-05: Task-08 安全性ゲート契約 - PASS
- TC-06: 承認履歴完全性（7フィールド）- PASS
- TC-07: 拒否fallback安全性 - PASS

## Reviewer 向け確認観点

1. **セキュリティ**: `TOOL_RISK_CONFIG.critical.allowPermanent === false` かつ `allowApproveOnce === false` であること
2. **後方互換**: `AllowedToolEntryV2.expiresAt` が optional のため既存エントリを破壊しないこと
3. **Task-08 接続**: `SafetyGatePort.evaluate()` が async で定義されており非同期チェックを待機できること
4. **設計禁止事項の遵守**: `DEFAULT_TIMEOUT_MS`（300000ms）・`PERMISSION_HISTORY_MAX_ENTRIES`（1000件）の変更なし
EOF
)"
```

---

## PR 情報（作成前に確認する項目）

### PR タイトル規則

```
docs(skill-lifecycle): 信頼・権限・ガバナンス統合 設計仕様 [TASK-SKILL-LIFECYCLE-06]
```

- プレフィックス: `docs` （設計ドキュメントのみの変更）
- スコープ: `skill-lifecycle`
- 70文字以内: 確認済み（58文字）

### コミットに含める成果物一覧

Phase 1〜13 の全成果物が含まれていることを確認する:

| ディレクトリ                 | 内容                                               | ファイル数 |
| ---------------------------- | -------------------------------------------------- | ---------- |
| `outputs/phase-1/`           | 危険操作リスクレベル定義・権限状態フロー等         | 5ファイル  |
| `outputs/phase-2/`           | リスクレベル設計・AllowedToolEntryV2・SafetyGate等 | 5ファイル  |
| `outputs/phase-3/`           | 設計レビュー結果                                   | 1ファイル  |
| `outputs/phase-4/`           | テスト設計（設計検証テスト）                       | 可変       |
| `outputs/phase-5/`           | 実装（型定義ファイルのみ）                         | 可変       |
| `outputs/phase-6/`           | テスト拡充                                         | 可変       |
| `outputs/phase-7/`           | カバレッジ確認結果                                 | 1ファイル  |
| `outputs/phase-8/`           | リファクタリング結果                               | 可変       |
| `outputs/phase-9/`           | 品質検証結果                                       | 1ファイル  |
| `outputs/phase-10/`          | 最終レビュー結果                                   | 1ファイル  |
| `outputs/phase-11/`          | 手動テスト結果・発見事項                           | 2ファイル  |
| `outputs/phase-12/`          | 実装ガイド・仕様書更新サマリー等                   | 5ファイル  |
| 仕様書ファイル（13ファイル） | phase-1 〜 phase-13 の全仕様書                     | 13ファイル |

### レビュー観点（Reviewer向け）

| 観点            | 確認内容                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| セキュリティ    | Critical ツールに `allowPermanent=false` が適用されており、恒久許可の経路がないことを確認               |
| 後方互換性      | `AllowedToolEntryV2.expiresAt?: number` が optional フィールドのため既存エントリを破壊しないことを確認  |
| Task-08 接続    | `SafetyGatePort.evaluate()` が `Promise<SafetyGateResult>` として定義されており、非同期を待機できること |
| Task-03/05 接続 | INS-01〜INS-03 が既存画面への表示追加のみで、新規画面遷移がないことを確認                               |
| 設計禁止事項    | `DEFAULT_TIMEOUT_MS`・`PERMISSION_HISTORY_MAX_ENTRIES` が変更されていないことを確認                     |
| 曖昧表現        | 曖昧語が成果物に含まれていないことを確認                                                                |

---

## Phase 12 完了根拠の確認方法

PR 作成前に以下を確認して記録する:

```bash
# Phase 12 成果物ファイルの存在確認
ls -la docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-12/

# 期待されるファイル（5ファイル）:
# - implementation-guide.md
# - system-spec-update-summary.md
# - documentation-changelog.md
# - unassigned-task-detection.md
# - skill-feedback-report.md

# LOGS.md 更新確認（2ファイル両方）
grep -n "TASK-SKILL-LIFECYCLE-06" .claude/skills/aiworkflow-requirements/LOGS.md
grep -n "TASK-SKILL-LIFECYCLE-06" .claude/skills/task-specification-creator/LOGS.md

# topic-map.md 更新確認
git log --oneline --follow .claude/skills/aiworkflow-requirements/indexes/topic-map.md | head -3
```

---

## 成果物

| 成果物 ID | ファイルパス                       | 内容                                   |
| --------- | ---------------------------------- | -------------------------------------- |
| OUT-13-1  | `outputs/phase-13/pr-checklist.md` | 事前チェック結果（承認/検証/差分確認） |
| OUT-13-2  | `outputs/phase-13/pr-body.md`      | 実際に投稿した PR 本文                 |
| OUT-13-3  | `outputs/phase-13/pr-metadata.md`  | PR番号、URL、作成日時、最終判定        |

---

## 完了条件

以下のチェックボックスを全て満たすことで Phase 13 完了とする。

- [ ] ユーザーから PR 作成の明示的な承認を受けた
- [ ] `phase-12-documentation.md` の完了条件 全25チェックボックスが CHECKED であることを確認した
- [ ] `outputs/phase-12/documentation-changelog.md` に「全 Task 完了」が記録されていることを確認した
- [ ] `git status` で変更ファイルを確認し、意図しないファイルが含まれていないことを確認した
- [ ] `pnpm lint` が通ることを確認した
- [ ] `pnpm typecheck` が通ることを確認した（型定義ファイルが存在する場合）
- [ ] commit を `--no-verify` なしで実行した（CLAUDE.md: --no-verify 絶対禁止）
- [ ] `git push` を実行した（ユーザー承認後のみ）
- [ ] PR を作成し、PR番号を記録した
- [ ] PR のタイトルが70文字以内であることを確認した
- [ ] PR 本文に Summary（主要成果物）・Test Plan（Phase 11 結果）・Reviewer向け確認観点が含まれていることを確認した

---

## 注意事項

### 自動化禁止事項

以下の操作はユーザーの明示的な指示なしに自動で実行しない:

- `git commit`（変更の確定）
- `git push`（リモートへの反映）
- `gh pr create`（PR の公開）

### 設計タスク特有の注意

本タスクは設計専用タスクのため、以下を PR 説明に明記する:

- 実装コードは含まれない（型定義ファイルのみ）
- `packages/shared/src/constants/security.ts`・`packages/shared/src/types/safety-gate.ts` は Phase 5 で作成された型定義のみ
- 実際のビジネスロジック実装は TASK-SKILL-LIFECYCLE-08 以降で行う
