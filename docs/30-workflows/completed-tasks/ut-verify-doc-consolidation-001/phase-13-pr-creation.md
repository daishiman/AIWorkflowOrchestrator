# Phase 13: PR作成 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 13                              |
| Phase名    | PR作成                          |
| 前提Phase  | Phase 12                        |
| 後続Phase  | なし（完了）                    |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

変更内容を整理し、**ユーザーの明示的な許可を得た後にのみ**コミットとPull Request作成を行い、CI が正常に通過することを確認する。

---

## ⚠️ PR作成に関する重要な注意【必須確認】

**コミット / push / PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                       | 理由                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| ユーザー確認なしでコミットする | 意図しない差分が履歴に残り、レビュー前の差し戻しが難しくなる |
| ユーザー確認なしでpushする     | 意図しない変更がリモートに反映される                         |
| ユーザー確認なしでPRを作成する | レビュー前の変更がPRとして固定され、運用上の事故になりやすい |

---

## SubAgent分担（並列実行）

ユーザー許可待ちの間に、PR作成に必要な準備を並列化する。

| SubAgent            | 関心ごと         | 担当内容                                          |
| ------------------- | ---------------- | ------------------------------------------------- |
| SubAgent-PR-Summary | 変更要約         | 差分要約（本文・チェックリストの材料）            |
| SubAgent-PR-Draft   | PR本文草案       | PR本文（背景/変更点/検証/残課題）草案             |
| SubAgent-PR-Check   | 最終チェック準備 | PR前チェックリスト（ローカル/整合/リンク/CI観点） |

## 実行タスク

### タスク1: 変更内容の最終確認

**目的**: コミット前に変更ファイルの一覧と差分を確認する

**実行手順**:

1. 変更ファイルの一覧を確認する:

```bash
git status --short
```

2. 各変更ファイルの差分を確認する:

```bash
git diff .claude/skills/aiworkflow-requirements/references/task-workflow.md
git diff .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md
git diff .claude/skills/aiworkflow-requirements/references/task-workflow-active.md
git diff .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md
```

3. 意図しない変更が含まれていないことを確認する

---

### タスク2: コミット

**目的**: 変更内容を適切なメッセージでコミットする

**実行手順**:

0. **ユーザーの明示的な許可を確認する**（許可がない場合、このタスクは実行しない）

1. 変更ファイルをステージングする:

```bash
git add \
  .claude/skills/aiworkflow-requirements/references/task-workflow.md \
  .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md \
  .claude/skills/aiworkflow-requirements/references/task-workflow-active.md \
  .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md \
  docs/30-workflows/unassigned-task/UT-VERIFY-DOC-CONSOLIDATION-001.md \
  docs/30-workflows/ut-verify-doc-consolidation-001/
```

2. コミットを作成する:

```bash
git commit -m "$(cat <<'EOF'
docs(verify): UT-VERIFY-DOC-CONSOLIDATION-001 — verify ドキュメント正本・履歴分離と責務分離明示

- task-workflow.md インデックスに「区分」列（正本/履歴/契約仕様）を追加
- task-workflow-completed.md 冒頭に区分ラベル（履歴記録）を追記
- task-workflow-active.md 冒頭に区分ラベル（正本）を追記
- interfaces-skill-verify-contract.md に区分ラベル（契約仕様）と
  verifySkill()/verifyAndImproveLoop()/verify() の責務分離セクションを追記

Closes #1916
EOF
)"
```

---

### タスク3: PR作成

**目的**: 変更内容を説明する Pull Request を作成する

**実行手順**:

0. **ユーザーの明示的な許可を確認する**（許可がない場合、このタスクは実行しない）

1. 現在のブランチを確認する:

```bash
git branch --show-current
```

2. リモートにプッシュする:

```bash
git push origin $(git branch --show-current)
```

3. PR を作成する:

```bash
gh pr create \
  --title "docs(verify): UT-VERIFY-DOC-CONSOLIDATION-001 — verify ドキュメント正本・履歴分離と責務分離明示" \
  --body "$(cat <<'EOF'
## 変更概要

Issue #1916 の対応として、verify 関連ドキュメントにおける正本・履歴の判別困難と責務分離の未明示を解消する。

## 変更内容

### 役割ラベルの付与

| ファイル | 追記内容 |
| --- | --- |
| `task-workflow.md` | インデックステーブルに「区分」列（正本/履歴/契約仕様）を追加 |
| `task-workflow-completed.md` | 冒頭に `> 区分: 履歴記録（history record）` を追記 |
| `task-workflow-active.md` | 冒頭に `> 区分: 正本（current contract）` を追記 |
| `interfaces-skill-verify-contract.md` | 冒頭に `> 区分: 契約仕様（current contract / Check ID 体系）` を追記 |

### 責務分離セクションの追記

`verifySkill()` / `verifyAndImproveLoop()` / `verify()` の3関数の実装ファイル・責務・返却値を比較表形式で明示。

## テスト

- [ ] TC-001〜TC-008 の目視確認 PASS
- [ ] Prettier チェック PASS
- [ ] Check ID 体系（19件）に影響なし

## 関連

- Closes #1916
- 発見元: TASK-P0-01 Phase 12 skill-feedback-report

🤖 Generated with [Claude Code](https://claude.ai/claude-code)
EOF
)"
```

---

### タスク4: CI確認

**目的**: PR 作成後に CI が正常に通過することを確認する

**実行手順**:

1. CI の実行状況を確認する:

```bash
gh pr checks
```

2. 全てのチェックが PASS であることを確認する
3. FAIL がある場合は原因を調査して修正する

---

## 参照資料

| 参照資料          | パス                                        | 内容               |
| ----------------- | ------------------------------------------- | ------------------ |
| Phase 12 完了記録 | `outputs/phase-12/skill-feedback-report.md` | タスク完了サマリー |
| 手動テスト結果    | `outputs/phase-11/manual-test-report.md`    | 全TC PASS 確認     |

---

## 成果物

| 成果物    | パス        | 内容                                          |
| --------- | ----------- | --------------------------------------------- |
| GitHub PR | GitHub UI   | マージ準備完了の Pull Request                 |
| コミット  | git history | docs(verify): UT-VERIFY-DOC-CONSOLIDATION-001 |

---

## 完了条件

- [ ] 変更ファイルがコミットされている
- [ ] PR が作成されている
- [ ] CI の全チェックが PASS している
- [ ] PR に `Closes #1916` が記載されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: マージ後にタスク完了

---

## タスク完了

本フェーズ完了後、UT-VERIFY-DOC-CONSOLIDATION-001 の全 Phase が完了する。

PR がマージされたら Issue #1916 はクローズ済みとなる（`Closes #1916` により自動クローズ）。
