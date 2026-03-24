# Phase 13 成果物: PR 準備メモ

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 13 - PR 作成

---

## 1. BLOCKED 条件（最重要）

**PR はユーザーから明示的な指示があるまで作成しない。**

以下の条件が全て満たされるまで PR 作成は blocked:

| 条件                                                   | 現在の状態  | 充足条件                                          |
| ------------------------------------------------------ | ----------- | ------------------------------------------------- |
| ユーザーから明示的な commit / PR 作成指示がある        | 未受領      | ユーザーの指示を待つ                              |
| Phase 12 の全チェックリストが完了している              | 完了        | phase12-task-spec-compliance-check.md が PASS     |
| documentation-changelog.md の全 Step が事後記録済      | 完了        | outputs/phase-12/documentation-changelog.md 参照  |
| unassigned-task-detection.md の件数と changelog が一致 | 一致（1件） | P59 対策確認済み（UT-WORKTREE-RSYNC-CAUTION-001） |
| ブランチが main から最新の状態か                       | worktree    | PR 作成前に `git fetch origin main` で確認        |

---

## 2. 対象ブランチと成果物

| 項目                       | 値                                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| ブランチ名                 | `docs/canonical-bridge-ledger-governance`（既存）                                                         |
| 作業 worktree              | `.worktrees/task-20260323-182550-wt-3`                                                                    |
| 変更ファイル数             | Phase 1〜3 成果物 8 + Phase 4/8 成果物 4 + Phase 12 成果物 5 + Phase 13 成果物 1 + メタ 2 = 計 20ファイル |
| プロダクションコード変更   | なし（type: design）                                                                                      |
| `.claude/skills/` への変更 | あり（Phase 12 Step E にて LOGS.md x2, SKILL.md x2, indexes/ を更新済み。mirror sync 完了）               |

## 3. PR タイトル案（70文字以内）

```
docs(governance): canonical bridge / workflow ledger governance 設計完了
```

## 4. PR 本文テンプレート

```markdown
## Summary

- canonical bridge / workflow ledger governance の3 Lane 設計（L-1: State Machine / L-2: Canonical Source / L-3: Sync Protocol）を完成させた
- 設計タスク（type: design）のためプロダクションコードの変更なし
- Phase 3 設計レビュー: PASS（MINOR 指摘なし）

## 変更内容

| Phase | 成果物                                 | パス              |
| ----- | -------------------------------------- | ----------------- |
| 1     | requirements-definition.md 等3ファイル | outputs/phase-1/  |
| 2     | design-summary.md 等3ファイル          | outputs/phase-2/  |
| 3     | design-review-report.md 等2ファイル    | outputs/phase-3/  |
| 12    | implementation-guide.md 等5ファイル    | outputs/phase-12/ |
| 13    | pr-preparation.md                      | outputs/phase-13/ |

## Test Plan

> 以下は Phase 12 Step A〜E で実施済み。PR マージ後の追加作業は不要。

- [x] task-workflow-completed.md に完了タスク記録を追加（Step A 実施済み）
- [x] LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）を更新（Step E 実施済み）
- [x] SKILL.md 2ファイルの変更履歴テーブルを更新（Step E 実施済み）
- [x] generate-index.js を実行して topic-map.md を再生成（Step D 実施済み）
- [x] rsync で .agents/skills/ に mirror sync を実施し diff -qr で差分0件を確認（Step E 実施済み）
```

## 5. PR マージ後の同期手順（Same-Wave Sync）

PR マージ後に実施する手順。main ブランチ上で実行する。

### Step A: Workflow Ledger 更新

```bash
# task-workflow.md に完了タスク記録を追加
# task-workflow-backlog.md の follow-up 欄を更新（0件確認済みの記録）
git diff --stat -- .claude/skills/aiworkflow-requirements/references/task-workflow*.md
```

### Step B: Lessons Learned 更新

```bash
# 新規 Pitfall の追加なし（設計タスクで既知 Pitfall の適用のみ）
# lessons-learned-current.md への追記は不要
```

### Step C: System Spec 更新

```bash
# arch-* / api-* 等の更新は不要
# プロダクションコードの変更なしのため
```

### Step D: Index 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
ls -la .claude/skills/aiworkflow-requirements/indexes/
```

### Step E: Mirror Sync + Skill Meta 更新

```bash
# LOGS.md 2ファイルに完了エントリを追加（P1/P25 対策）
# SKILL.md 2ファイルの変更履歴テーブルを更新（P29 対策）

# Mirror Sync
rsync -avz --checksum ./.claude/skills/ ./.agents/skills/

# 差分0件確認
diff -qr ./.claude/skills/ ./.agents/skills/
# 出力が空 = 同期完了
```

## 6. レビュアーへの handover 情報

| 項目                  | 内容                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| 主要設計ドキュメント  | outputs/phase-2/design-summary.md（3 Lane 設計全体像）                                                |
| 契約定義              | outputs/phase-2/contract-matrix.md（State / Action / Ownership 契約）                                 |
| 設計レビュー結果      | outputs/phase-3/design-review-report.md（PASS 判定と根拠）                                            |
| 実装ガイド            | outputs/phase-12/implementation-guide.md（後続実装者への handoff）                                    |
| 既知リスク            | Phase 10 MINOR 2件（M-01: R-15 rsync 注意書き → 未タスク化済み、M-02: NFR-1.1 → Phase 12 で対応済み） |
| PR マージ後の必須作業 | なし（Phase 12 Step A〜E で Same-Wave Sync 実施済み）                                                 |
| 関連 Pitfall          | P1, P2, P3, P4, P25, P29, P38, P43, P51, P56, P57, P58, P59（implementation-guide.md § 2.x 参照）     |

## 7. CI / 品質ゲート確認

| チェック項目                     | 状態   | 備考                              |
| -------------------------------- | ------ | --------------------------------- |
| pnpm lint                        | 不要   | ドキュメントファイルのみの変更    |
| pnpm typecheck                   | 不要   | TypeScript ファイルの変更なし     |
| テスト実行                       | 不要   | プロダクションコードの変更なし    |
| pre-commit フック（lint-staged） | 通過   | markdown ファイルに対してのみ実行 |
| --no-verify 使用禁止             | 確認済 | CLAUDE.md の絶対禁止事項に準拠    |
